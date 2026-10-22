
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_NAME = "ProsusAI/finbert"

_tokenizer = None
_model = None
_device = torch.device("cpu")


def load_model():
    """Load FinBERT once and reuse it for subsequent predictions."""
    global _tokenizer, _model

    if _model is None:
        print(f"Loading sentiment model: {MODEL_NAME}")

        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME
        )
        _model.to(_device)
        _model.eval()

        print("FinBERT loaded successfully.")

    return _tokenizer, _model


def analyze_headline(headline):
    """Classify a headline as positive, negative, or neutral."""
    if not isinstance(headline, str) or not headline.strip():
        raise ValueError("Headline must be a non-empty string.")

    tokenizer, model = load_model()

    inputs = tokenizer(
        headline,
        return_tensors="pt",
        truncation=True,
        max_length=512,
    )

    with torch.inference_mode():
        outputs = model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=-1)[0]

    predicted_id = int(torch.argmax(probabilities).item())
    raw_label = model.config.id2label[predicted_id].lower()

    # Normalize model labels for consistent API responses.
    if "positive" in raw_label:
        sentiment = "positive"
    elif "negative" in raw_label:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    confidence = float(probabilities[predicted_id].item())

    return {
        "headline": headline,
        "sentiment": sentiment,
        "confidence": round(confidence, 4),
        "scores": {
            model.config.id2label[i].lower(): round(
                float(probabilities[i].item()), 4
            )
            for i in range(len(probabilities))
        },
    }


if __name__ == "__main__":
    samples = [
        "Bitcoin surges as investors show strong buying interest",
        "Bitcoin crashes amid fears of a major market sell-off",
        "Bitcoin trades near $85,000 as markets await new data",
    ]

    for headline in samples:
        result = analyze_headline(headline)
        print(f"\nHeadline: {result['headline']}")
        print(f"Sentiment: {result['sentiment']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Scores: {result['scores']}")
