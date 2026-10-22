
import numpy as np
import pandas as pd

from src.isolation_forest_predictor import IsolationForestPredictor


def create_synthetic_data(rows=100):
    """Create continuous, synthetic one-minute OHLCV candle data."""

    rng = np.random.default_rng(42)

    timestamps = (
        pd.date_range(
            start="2026-01-01 00:00:00",
            periods=rows,
            freq="min",
        )
        .astype("int64")
        // 10**6
    )

    close = 60000 * np.exp(
        np.cumsum(rng.normal(0, 0.0003, rows))
    )

    open_price = np.concatenate(([close[0]], close[:-1]))

    high = np.maximum(open_price, close) * (
        1 + rng.uniform(0.0001, 0.001, rows)
    )

    low = np.minimum(open_price, close) * (
        1 - rng.uniform(0.0001, 0.001, rows)
    )

    volume = rng.uniform(1, 100, rows)
    trades = rng.integers(50, 1000, rows)
    taker_buy = volume * rng.uniform(0.3, 0.7, rows)

    return pd.DataFrame(
        {
            "open_time": timestamps,
            "open": open_price,
            "high": high,
            "low": low,
            "close": close,
            "volume": volume,
            "number_of_trades": trades,
            "taker_buy_base_volume": taker_buy,
        }
    )


def main():
    print("=== ISOLATION FOREST TEST ===")

    try:
        predictor = IsolationForestPredictor()
        print("Model loaded successfully.")
    except Exception as exc:
        print(f"MODEL LOADING FAILED: {exc}")
        raise

    df = create_synthetic_data()

    print("\n=== TIMESTAMP DIAGNOSTICS ===")

    timestamp_diff = df["open_time"].diff().dropna()
    print("Timestamp differences:")
    print(timestamp_diff.value_counts().head())

    median_diff = timestamp_diff.median()
    expected_step = 60_000 if median_diff > 1000 else 60

    continuous = timestamp_diff.eq(expected_step)

    print(f"Expected interval: {expected_step}")
    print(f"Continuous transitions: {int(continuous.sum())}")
    print(f"Expected transitions: {len(df) - 1}")

    if not continuous.all():
        raise ValueError(
            "Synthetic timestamps are not continuous one-minute intervals."
        )

    print("\n=== FEATURE DIAGNOSTICS ===")

    features = predictor.create_features(df)

    expected_features = list(predictor.features)

    print(f"Rows: {len(features)}")
    print(f"Expected model features: {len(expected_features)}")
    print("Expected feature names:", expected_features)

    missing_columns = [
        name for name in expected_features
        if name not in features.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing model features: {missing_columns}. "
            "Check create_features() in isolation_forest_predictor.py."
        )

    print("\nNon-null values per feature:")
    print(features[expected_features].notna().sum())

    valid_rows = features[expected_features].notna().all(axis=1).sum()
    print(f"\nRows with all required features: {valid_rows}")

    if valid_rows == 0:
        raise ValueError("No rows have all required features.")

    print("\nLast five feature rows:")
    print(features[expected_features].tail().to_string())

    print("\n=== PREDICTION TEST ===")

    try:
        result = predictor.predict(df)
        print("Prediction result:")
        print(result)

        if not isinstance(result, dict):
            raise TypeError("Expected predict() to return a dictionary.")

        print("\nSMOKE TEST PASSED.")
        print(
            "Note: Synthetic data verifies execution only; "
            "it does not establish real-world anomaly-detection accuracy."
        )

    except Exception as exc:
        print(f"PREDICTION FAILED: {exc}")
        raise


if __name__ == "__main__":
    main()
