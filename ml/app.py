from flask import Flask, jsonify, request
import pandas as pd

from src.gru_predictor import GRUPredictor
from src.anomaly_predictor import AnomalyPredictor
from src.risk_predictor import RiskPredictor

app = Flask(__name__)

predictor = GRUPredictor()
anomaly_predictor = AnomalyPredictor()
risk_predictor = RiskPredictor()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "ml"
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data or "candles" not in data:
            return jsonify({
                "message": "candles data is required"
            }), 400

        df = pd.DataFrame(data["candles"])

        result = predictor.predict(df)

        return jsonify(result)

    except Exception as error:
        print("Prediction error:", error)

        return jsonify({
            "message": "Prediction failed",
            "error": str(error)
        }), 500



@app.route("/anomaly", methods=["POST"])
def anomaly():
    try:
        data = request.get_json()

        if not data or "candles" not in data:
            return jsonify({
                "message": "candles data is required"
            }), 400

        df = pd.DataFrame(data["candles"])

        result = anomaly_predictor.predict(df)

        return jsonify(result)

    except Exception as error:
        print("Anomaly prediction error:", error)

        return jsonify({
            "message": "Anomaly prediction failed",
            "error": str(error)
        }), 500

@app.route("/risk", methods=["POST"])
def risk():
    try:
        data = request.get_json()

        if not data or "candles" not in data:
            return jsonify({
                "message": "candles data is required"
            }), 400

        df = pd.DataFrame(data["candles"])

        result = risk_predictor.predict(df)

        return jsonify(result)

    except Exception as error:
        print("Risk prediction error:", error)

        return jsonify({
            "message": "Risk prediction failed",
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )