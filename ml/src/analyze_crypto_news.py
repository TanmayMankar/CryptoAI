from .news_collector import fetch_crypto_headlines
from .sentiment_analyzer import analyze_headline


def analyze_crypto_news(limit_per_source=10):
    articles = fetch_crypto_headlines(limit_per_source=limit_per_source)
    results = []

    for article in articles:
        try:
            sentiment_result = analyze_headline(article["title"])

            results.append({
                **article,
                "sentiment": sentiment_result["sentiment"],
                "confidence": sentiment_result["confidence"],
                "sentiment_scores": sentiment_result["scores"],
            })

        except Exception as exc:
            print(f"Could not analyze headline: {article['title']}")
            print(f"Reason: {exc}")

    return results


if __name__ == "__main__":
    results = analyze_crypto_news()

    print(f"\nAnalyzed {len(results)} headlines\n")

    counts = {
        "positive": 0,
        "negative": 0,
        "neutral": 0,
    }

    for article in results:
        sentiment = article["sentiment"]
        counts[sentiment] += 1

        print(f"[{sentiment.upper()}] {article['title']}")
        print(f"Confidence: {article['confidence']:.2%}")
        print(f"Source: {article['source']}")
        print(f"URL: {article['url']}\n")

    print("Sentiment summary:")
    print(counts)
