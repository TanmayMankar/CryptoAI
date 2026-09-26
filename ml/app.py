from flask import Flask, jsonify, request
import pandas as pd

from src.gru_predictor import GRUPredictor

app = Flask(__name__)

predictor = GRUPredictor()


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


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )