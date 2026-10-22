
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd


class IsolationForestPredictor:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parents[1]
        self.model_path = (
            self.base_dir / "models" / "btc_isolation_forest_logratio.pkl"
        )
        self.config_path = (
            self.base_dir / "models"
            / "btc_isolation_forest_logratio_config.json"
        )

        if not self.model_path.exists():
            raise FileNotFoundError(f"Model not found: {self.model_path}")

        if not self.config_path.exists():
            raise FileNotFoundError(f"Config not found: {self.config_path}")

        self.model = joblib.load(self.model_path)

        with open(self.config_path, "r", encoding="utf-8") as file:
            self.config = json.load(file)

        self.features = self.config.get("features", [
            "return_1m",
            "return_5m",
            "return_15m",
            "high_low_range",
            "candle_body",
            "upper_wick",
            "lower_wick",
            "volume_change",
            "trade_count_change",
            "volatility_5m",
            "volatility_15m",
            "taker_buy_ratio",
        ])

        self.threshold = float(self.config["threshold"])

        print("Isolation Forest model loaded successfully.")
        print(f"Features: {len(self.features)}")
        print(f"Threshold: {self.threshold}")

    @staticmethod
    def _timestamp_step(timestamps):
        """Return the expected one-minute interval in the timestamp's unit."""
        differences = timestamps.diff().dropna()

        if differences.empty:
            return 60_000

        return 60_000 if differences.median() > 1000 else 60

    def create_features(self, df):
        required = [
            "open_time",
            "open",
            "high",
            "low",
            "close",
            "volume",
            "number_of_trades",
            "taker_buy_base_volume",
        ]

        missing = [column for column in required if column not in df.columns]
        if missing:
            raise ValueError(f"Missing input columns: {missing}")

        data = df.copy().reset_index(drop=True)

        for column in required:
            if column != "open_time":
                data[column] = pd.to_numeric(data[column], errors="coerce")

        data["open_time"] = pd.to_numeric(
            data["open_time"], errors="coerce"
        )

        data = data.sort_values("open_time").reset_index(drop=True)

        open_price = data["open"].astype(float)
        high = data["high"].astype(float)
        low = data["low"].astype(float)
        close = data["close"].astype(float)
        volume = data["volume"].astype(float)
        trades = data["number_of_trades"].astype(float)
        taker_buy = data["taker_buy_base_volume"].astype(float)

        features = pd.DataFrame(index=data.index)

        # Price returns
        features["return_1m"] = close.pct_change()
        features["return_5m"] = close.pct_change(5)
        features["return_15m"] = close.pct_change(15)

        # Candle structure
        features["high_low_range"] = (high - low) / close
        features["candle_body"] = (close - open_price) / open_price

        candle_top = pd.concat(
            [open_price, close], axis=1
        ).max(axis=1)

        candle_bottom = pd.concat(
            [open_price, close], axis=1
        ).min(axis=1)

        features["upper_wick"] = (
            high - candle_top
        ) / open_price

        features["lower_wick"] = (
            candle_bottom - low
        ) / open_price

        # Log-ratio features: match the training pipeline.
        eps_volume = 1e-6
        eps_trades = 1.0

        features["volume_change"] = np.log(
            (volume + eps_volume)
            / (volume.shift(1) + eps_volume)
        )

        features["trade_count_change"] = np.log(
            (trades + eps_trades)
            / (trades.shift(1) + eps_trades)
        )

        # Rolling volatility
        features["volatility_5m"] = (
            features["return_1m"].rolling(5).std()
        )

        features["volatility_15m"] = (
            features["return_1m"].rolling(15).std()
        )

        # Taker-buy ratio
        features["taker_buy_ratio"] = (
            taker_buy / volume.replace(0, np.nan)
        )

        # Prevent features from using data across timestamp gaps.
        timestamps = data["open_time"]
        step = self._timestamp_step(timestamps)

        gap = np.zeros(len(data), dtype=bool)

        if len(data):
            gap[0] = True

        if len(data) > 1:
            differences = timestamps.diff().to_numpy()
            gap[1:] = differences[1:] != step

        segment_starts = np.flatnonzero(gap)

        for start in segment_starts:
            features.iloc[start:min(start + 15, len(features)), :] = np.nan

        features = features.replace([np.inf, -np.inf], np.nan)

        return features

    def predict(self, df):
        features = self.create_features(df)

        missing = [
            name for name in self.features
            if name not in features.columns
        ]

        if missing:
            raise ValueError(f"Missing model features: {missing}")

        valid_mask = features[self.features].notna().all(axis=1)

        if not valid_mask.any():
            return {
                "status": "error",
                "message": "Not enough continuous, valid candles to predict.",
            }

        valid_features = features.loc[valid_mask, self.features]
        scores = self.model.decision_function(valid_features)

        # Isolation Forest decision_function: lower scores are more anomalous.
        latest_score = float(scores[-1])
        is_anomaly = latest_score < self.threshold

        if is_anomaly:
            severity = "HIGH"
        else:
            severity = "NORMAL"

        return {
            "status": "ok",
            "model": "Isolation Forest",
            "anomaly": bool(is_anomaly),
            "score": latest_score,
            "threshold": self.threshold,
            "severity": severity,
            "features_used": len(self.features),
        }
