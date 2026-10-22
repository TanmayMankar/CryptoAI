
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


ML_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = ML_DIR / "models" / "xgboost_activity_v2_common.json"
FEATURES_PATH = ML_DIR / "models" / "feature_names_v2.txt"

ALERT_THRESHOLD = 0.20
MIN_CANDLES = 1501
EPSILON = 1e-9


class ActivityPredictor:
    def __init__(self):
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

        if not FEATURES_PATH.exists():
            raise FileNotFoundError(f"Feature file not found: {FEATURES_PATH}")

        import xgboost as xgb

        self.model = xgb.XGBClassifier()
        self.model.load_model(str(MODEL_PATH))
        self.feature_names = [
            line.strip()
            for line in FEATURES_PATH.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]

        expected_features = 16
        if len(self.feature_names) != expected_features:
            raise ValueError(
                f"Expected {expected_features} features, "
                f"found {len(self.feature_names)}"
            )

    @staticmethod
    def _historical_average(series, window):
        # Match training: the current candle is excluded.
        return series.shift(1).rolling(
            window=window, min_periods=window
        ).mean()

    def create_features(self, candles):
        df = pd.DataFrame(candles).copy()

        required = [
            "openTime", "open", "high", "low", "close",
            "volume", "quoteVolume", "trades", "takerBuyBaseVolume"
        ]

        missing = [name for name in required if name not in df.columns]
        if missing:
            raise ValueError(f"Missing candle fields: {missing}")

        df = df[required].copy()
        df["openTime"] = pd.to_numeric(df["openTime"], errors="raise")

        numeric_columns = [
            "open", "high", "low", "close", "volume",
            "quoteVolume", "trades", "takerBuyBaseVolume"
        ]

        for column in numeric_columns:
            df[column] = pd.to_numeric(df[column], errors="raise")

        if df[numeric_columns].isna().any().any():
            raise ValueError("Candle data contains missing numeric values")

        if not np.isfinite(df[numeric_columns].to_numpy(dtype=float)).all():
            raise ValueError("Candle data contains non-finite values")

        df = df.sort_values("openTime").reset_index(drop=True)

        if df["openTime"].duplicated().any():
            raise ValueError("Duplicate candle timestamps detected")

        # Every row must be exactly one minute apart.
        if not (df["openTime"].diff().dropna() == 60_000).all():
            raise ValueError(
                "Missing minutes or irregular timestamps in candle history"
            )

        if len(df) < MIN_CANDLES:
            raise ValueError(
                f"Need at least {MIN_CANDLES} continuous candles; "
                f"received {len(df)}"
            )

        if (df[["open", "high", "low", "close"]] <= 0).any().any():
            raise ValueError("OHLC prices must be positive")

        if (df[["volume", "quoteVolume", "trades"]] < 0).any().any():
            raise ValueError("Volume and trade counts cannot be negative")

        if (df["volume"] <= 0).any():
            raise ValueError("Volume must be positive")

        # Price returns: same formulas as training.
        close = df["close"]
        df["return_1m"] = close.pct_change(1)
        df["return_5m"] = close.pct_change(5)
        df["return_15m"] = close.pct_change(15)
        df["return_60m"] = close.pct_change(60)

        # Buy ratio from Binance taker-buy base volume.
        df["buy_ratio"] = (
            df["takerBuyBaseVolume"] / df["volume"]
        )

        volume_avg_5m = self._historical_average(df["volume"], 5)
        volume_avg_60m = self._historical_average(df["volume"], 60)
        volume_avg_1440m = self._historical_average(df["volume"], 1440)

        quote_avg_60m = self._historical_average(df["quoteVolume"], 60)
        quote_avg_1440m = self._historical_average(df["quoteVolume"], 1440)

        trades_avg_5m = self._historical_average(df["trades"], 5)
        trades_avg_60m = self._historical_average(df["trades"], 60)
        trades_avg_1440m = self._historical_average(df["trades"], 1440)

        # Ratios to the previous 24-hour baseline.
        df["volume_ratio_5m"] = (
            volume_avg_5m / (volume_avg_1440m + EPSILON)
        )
        df["volume_ratio_60m"] = (
            volume_avg_60m / (volume_avg_1440m + EPSILON)
        )
        df["quote_volume_ratio_60m"] = (
            quote_avg_60m / (quote_avg_1440m + EPSILON)
        )
        df["trades_ratio_5m"] = (
            trades_avg_5m / (trades_avg_1440m + EPSILON)
        )
        df["trades_ratio_60m"] = (
            trades_avg_60m / (trades_avg_1440m + EPSILON)
        )

        buy_ratio_hist = df["buy_ratio"].shift(1)

        df["buy_ratio_avg_5m"] = buy_ratio_hist.rolling(
            5, min_periods=5
        ).mean()
        df["buy_ratio_avg_60m"] = buy_ratio_hist.rolling(
            60, min_periods=60
        ).mean()
        df["buy_pressure_change"] = (
            df["buy_ratio_avg_5m"] - df["buy_ratio_avg_60m"]
        )

        df["volatility_15m"] = df["return_1m"].shift(1).rolling(
            15, min_periods=15
        ).std()
        df["volatility_60m"] = df["return_1m"].shift(1).rolling(
            60, min_periods=60
        ).std()

        prev_open = df["open"].shift(1)
        prev_high = df["high"].shift(1)
        prev_low = df["low"].shift(1)
        prev_close = df["close"].shift(1)

        df["candle_range_prev"] = (
            (prev_high - prev_low) / (prev_close.abs() + EPSILON)
        )
        df["candle_body_prev"] = (
            (prev_close - prev_open) / (prev_open.abs() + EPSILON)
        )

        features = df[self.feature_names].replace(
            [np.inf, -np.inf], np.nan
        )
        latest = features.iloc[[-1]]

        if latest.isna().any().any():
            raise ValueError("Unable to calculate all activity features")

        return latest

    def predict(self, candles):
        features = self.create_features(candles)
        probability = float(self.model.predict_proba(features)[0][1])

        return {
            "activity_probability": round(probability, 4),
            "alert_threshold": ALERT_THRESHOLD,
            "high_activity": probability >= ALERT_THRESHOLD,
            "activity_type": "unusually_high_trading_activity",
            "warning": (
                "This predicts unusual trading activity from market candles. "
                "It does not identify individual whales or confirm on-chain transfers."
            )
        }
