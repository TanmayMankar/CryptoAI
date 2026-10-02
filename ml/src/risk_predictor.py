import os
import json
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf


class RiskPredictor:

    def __init__(
        self,
        model_path=None,
        scaler_path=None,
        config_path=None
    ):
        # Project root:
        # models_for_proj/
        BASE_DIR = os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )

        # Absolute paths
        if model_path is None:
            model_path = os.path.join(
                BASE_DIR,
                "models",
                "btc_risk_gru.keras"
            )

        if scaler_path is None:
            scaler_path = os.path.join(
                BASE_DIR,
                "models",
                "btc_risk_scaler.pkl"
            )

        if config_path is None:
            config_path = os.path.join(
                BASE_DIR,
                "models",
                "btc_risk_config.json"
            )

        print("Loading Risk Predictor...")

        # Check files
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Risk model not found:\n{model_path}"
            )

        if not os.path.exists(scaler_path):
            raise FileNotFoundError(
                f"Risk scaler not found:\n{scaler_path}"
            )

        if not os.path.exists(config_path):
            raise FileNotFoundError(
                f"Risk config not found:\n{config_path}"
            )

        # Load model
        self.model = tf.keras.models.load_model(
            model_path
        )

        # Load scaler
        self.scaler = joblib.load(
            scaler_path
        )

        # Load config
        with open(config_path, "r") as f:
            self.config = json.load(f)

        self.sequence_length = self.config[
            "sequence_length"
        ]

        self.features = self.config[
            "features"
        ]

        # Project decision threshold
        self.risk_threshold = 0.70

        print("Risk Predictor loaded successfully.")
        print(
            f"Sequence length: "
            f"{self.sequence_length}"
        )
        print(
            f"Features: "
            f"{len(self.features)}"
        )
        print(
            f"Risk threshold: "
            f"{self.risk_threshold}"
        )

    def create_features(self, df):
        """
        Create the same features used
        during risk model training.
        """

        df = df.copy()

        # Sort chronologically
        if "open_time" in df.columns:
            df = df.sort_values(
                "open_time"
            ).reset_index(drop=True)

        # --------------------------------
        # PRICE RETURNS
        # --------------------------------

        df["return_1m"] = (
            df["close"].pct_change()
        )

        df["return_5m"] = (
            df["close"].pct_change(5)
        )

        df["return_15m"] = (
            df["close"].pct_change(15)
        )

        # --------------------------------
        # CANDLE FEATURES
        # --------------------------------

        df["high_low_range"] = (
            (df["high"] - df["low"])
            / df["close"]
        )

        df["candle_body"] = (
            (df["close"] - df["open"])
            / df["open"]
        )

        df["upper_wick"] = (
            (
                df["high"]
                - df[["open", "close"]].max(
                    axis=1
                )
            )
            / df["open"]
        )

        df["lower_wick"] = (
            (
                df[["open", "close"]].min(
                    axis=1
                )
                - df["low"]
            )
            / df["open"]
        )

        # --------------------------------
        # VOLUME / ACTIVITY
        # --------------------------------

        df["volume_change"] = (
            df["volume"].pct_change()
        )

        df["trade_count_change"] = (
            df["number_of_trades"].pct_change()
        )

        # --------------------------------
        # VOLATILITY
        # --------------------------------

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

        # --------------------------------
        # TAKER BUY PRESSURE
        # --------------------------------

        df["taker_buy_ratio"] = (
            df["taker_buy_base_volume"]
            / df["volume"]
        )

        # Replace infinite values
        df = df.replace(
            [np.inf, -np.inf],
            np.nan
        )

        # Remove rows with missing
        # model features
        df = df.dropna(
            subset=self.features
        ).reset_index(drop=True)

        return df

    def predict(self, df):
        """
        Predict whether the current market
        condition is NORMAL or HIGH RISK.

        df must contain enough recent
        Binance kline rows.
        """

        # Create features
        df_features = self.create_features(
            df
        )

        # Need at least 60 valid rows
        if len(df_features) < self.sequence_length:
            raise ValueError(
                f"Not enough data. Need at least "
                f"{self.sequence_length} valid rows, "
                f"but only "
                f"{len(df_features)} available."
            )

        # Take latest 60 rows
        latest_data = df_features[
            self.features
        ].tail(
            self.sequence_length
        )

        # Convert to numpy
        X = latest_data.values.astype(
            np.float32
        )

        # Scale using training scaler
        X_scaled = self.scaler.transform(
            X
        )

        # Add batch dimension
        X_scaled = np.expand_dims(
            X_scaled,
            axis=0
        )

        # Model prediction
        probability = float(
            self.model.predict(
                X_scaled,
                verbose=0
            )[0][0]
        )

        # Apply project threshold
        if probability >= self.risk_threshold:
            risk_level = "HIGH RISK"
            is_high_risk = True
        else:
            risk_level = "NORMAL"
            is_high_risk = False

        return {
            "high_risk_probability": probability,
            "normal_probability": 1.0 - probability,
            "risk_level": risk_level,
            "is_high_risk": is_high_risk,
            "threshold": self.risk_threshold
        }


if __name__ == "__main__":

    predictor = RiskPredictor()

    print()
    print(
        "Risk Predictor test completed."
    )
    print(
        "Model, scaler and config "
        "loaded successfully."
    )