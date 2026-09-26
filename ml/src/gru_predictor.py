import json
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from pathlib import Path


class GRUPredictor:

    def __init__(
        self,
        model_path=None,
        scaler_path=None,
        config_path=None
    ):
        base_dir = Path(__file__).resolve().parent.parent
        models_dir = base_dir / "models"

        model_path = model_path or models_dir / "btc_direction_gru.keras"
        scaler_path = scaler_path or models_dir / "btc_direction_scaler.pkl"
        config_path = config_path or models_dir / "config.json"

        # Load configuration
        with open(config_path, "r") as f:
            self.config = json.load(f)

        self.feature_columns = self.config["features"]
        self.sequence_length = self.config["sequence_length"]

        # Load scaler
        self.scaler = joblib.load(scaler_path)

        # Load GRU model
        self.model = tf.keras.models.load_model(model_path)

    def create_features(self, df):

        df = df.copy()

        # Make sure data is sorted
        df["open_time"] = pd.to_datetime(
            df["open_time"],
            utc=True
        )

        df = df.sort_values(
            "open_time"
        ).reset_index(drop=True)

        # Numeric columns
        numeric_columns = [
            "open",
            "high",
            "low",
            "close",
            "volume",
            "number_of_trades",
            "taker_buy_base_volume"
        ]

        for column in numeric_columns:
            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

        # Price returns
        df["return_1m"] = (
            df["close"].pct_change(1)
        )

        df["return_5m"] = (
            df["close"].pct_change(5)
        )

        df["return_15m"] = (
            df["close"].pct_change(15)
        )

        df["return_60m"] = (
            df["close"].pct_change(60)
        )

        # Candle features
        df["high_low_range"] = (
            (df["high"] - df["low"])
            / df["close"]
        )

        df["candle_body"] = (
            (df["close"] - df["open"])
            / df["open"]
        )

        df["upper_wick"] = (
            df["high"]
            - df[["open", "close"]].max(axis=1)
        ) / df["open"]

        df["lower_wick"] = (
            df[["open", "close"]].min(axis=1)
            - df["low"]
        ) / df["open"]

        # Volume/activity
        df["volume_change"] = (
            df["volume"].pct_change()
        )

        df["trade_count_change"] = (
            df["number_of_trades"].pct_change()
        )

        # Volatility
        df["volatility_5m"] = (
            df["return_1m"].rolling(5).std()
        )

        df["volatility_15m"] = (
            df["return_1m"].rolling(15).std()
        )

        df["volatility_60m"] = (
            df["return_1m"].rolling(60).std()
        )

        # Buy pressure
        df["taker_buy_ratio"] = (
            df["taker_buy_base_volume"]
            / df["volume"]
        )

        return df

    def predict(self, df):

        # Create features
        df = self.create_features(df)

        # Remove rows where features aren't available
        feature_data = df[
            self.feature_columns
        ].dropna()

        # Need at least 60 rows
        if len(feature_data) < self.sequence_length:
            raise ValueError(
                f"Need at least {self.sequence_length} "
                f"valid rows for prediction."
            )

        # Scale
        scaled = self.scaler.transform(
            feature_data[
                self.feature_columns
            ].values
        ).astype(np.float32)

        # Last 60 minutes
        sequence = scaled[
            -self.sequence_length:
        ]

        # Add batch dimension
        sequence = np.expand_dims(
            sequence,
            axis=0
        )

        # Prediction
        probability_up = float(
            self.model.predict(
                sequence,
                verbose=0
            )[0][0]
        )

        probability_down = (
            1.0 - probability_up
        )

        prediction = (
            "UP"
            if probability_up >= 0.5
            else "DOWN"
        )

        return {
            "prediction": prediction,
            "up_probability": round(
                probability_up,
                4
            ),
            "down_probability": round(
                probability_down,
                4
            )
        }