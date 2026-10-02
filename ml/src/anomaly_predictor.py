import os
import json
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from pathlib import Path


class AnomalyPredictor:

    def __init__(
        self,
        model_path=None,
        scaler_path=None,
        config_path=None
    ):
        # Project root:
        # models_for_proj/
        base_dir = Path(__file__).resolve().parent.parent
        models_dir = base_dir / "models"

        if model_path is None:
            model_path = models_dir / "btc_anomaly_gru.keras"

        if scaler_path is None:
            scaler_path = models_dir / "btc_anomaly_scaler.pkl"

        if config_path is None:
            config_path = models_dir / "btc_anomaly_config.json"

        print("Loading Anomaly Predictor...")

        # Check files exist
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Anomaly model not found:\n{model_path}"
            )

        if not os.path.exists(scaler_path):
            raise FileNotFoundError(
                f"Anomaly scaler not found:\n{scaler_path}"
            )

        if not os.path.exists(config_path):
            raise FileNotFoundError(
                f"Anomaly config not found:\n{config_path}"
            )

        # Load model
        self.model = tf.keras.models.load_model(model_path)

        # Load scaler
        self.scaler = joblib.load(scaler_path)

        # Load config
        with open(config_path, "r") as f:
            self.config = json.load(f)

        self.sequence_length = self.config["sequence_length"]
        self.features = self.config["features"]
        self.anomaly_threshold = self.config["anomaly_threshold"]

        print("Anomaly Predictor loaded successfully.")
        print(f"Sequence length: {self.sequence_length}")
        print(f"Features: {len(self.features)}")
        print(f"Anomaly threshold: {self.anomaly_threshold}")

    def create_features(self, df):
        """
        Create the exact features used during anomaly model training.
        """

        df = df.copy()

        # Make sure data is sorted chronologically
        if "open_time" in df.columns:
            df = df.sort_values("open_time").reset_index(drop=True)

        # Price returns
        df["return_1m"] = df["close"].pct_change()

        df["return_5m"] = (
            df["close"].pct_change(5)
        )

        df["return_15m"] = (
            df["close"].pct_change(15)
        )

        # Candle features
        df["high_low_range"] = (
            (df["high"] - df["low"]) / df["close"]
        )

        df["candle_body"] = (
            (df["close"] - df["open"]) / df["open"]
        )

        df["upper_wick"] = (
            (
                df["high"]
                - df[["open", "close"]].max(axis=1)
            )
            / df["open"]
        )

        df["lower_wick"] = (
            (
                df[["open", "close"]].min(axis=1)
                - df["low"]
            )
            / df["open"]
        )

        # Volume/activity features
        df["volume_change"] = (
            df["volume"].pct_change()
        )

        df["trade_count_change"] = (
            df["number_of_trades"].pct_change()
        )

        # Volatility
        df["volatility_5m"] = (
            df["return_1m"]
            .rolling(5)
            .std()
        )

        df["volatility_15m"] = (
            df["return_1m"]
            .rolling(15)
            .std()
        )

        # Taker buy pressure
        df["taker_buy_ratio"] = (
            df["taker_buy_base_volume"]
            / df["volume"]
        )

        # Keep only model features
        df = df.replace(
            [np.inf, -np.inf],
            np.nan
        )

        df = df.dropna(
            subset=self.features
        ).reset_index(drop=True)

        return df

    def predict(self, df):
        """
        Predict anomaly score and severity.

        df must contain enough recent Binance kline rows.
        """

        # Create features
        df_features = self.create_features(df)

        # Need at least 60 rows
        if len(df_features) < self.sequence_length:
            raise ValueError(
                f"Not enough data. Need at least "
                f"{self.sequence_length} valid rows, "
                f"but only {len(df_features)} available."
            )

        # Get latest sequence
        latest_data = df_features[
            self.features
        ].tail(self.sequence_length)

        # Convert to numpy
        X = latest_data.values.astype(
            np.float32
        )

        # Scale using training scaler
        X_scaled = self.scaler.transform(X)

        # Add batch dimension
        X_scaled = np.expand_dims(
            X_scaled,
            axis=0
        )

        # GRU autoencoder reconstruction
        reconstructed = self.model.predict(
            X_scaled,
            verbose=0
        )

        # Mean squared reconstruction error
        anomaly_score = float(
            np.mean(
                np.square(
                    X_scaled - reconstructed
                )
            )
        )

        # Determine severity
        if anomaly_score < self.anomaly_threshold:

            severity = "NORMAL"

        elif anomaly_score < 1.0:

            severity = "MODERATE"

        elif anomaly_score < 1.3:

            severity = "HIGH"

        else:

            severity = "EXTREME"

        return {
            "anomaly_score": anomaly_score,
            "threshold": float(
                self.anomaly_threshold
            ),
            "severity": severity,
            "is_anomaly": bool(
                anomaly_score >= self.anomaly_threshold
            )
        }


if __name__ == "__main__":

    predictor = AnomalyPredictor()

    print()
    print("Anomaly Predictor test completed.")
    print("Model, scaler and config loaded successfully.")