
import time

from analyze_crypto_news import analyze_crypto_news

POLL_INTERVAL_SECONDS = 60


def run_live_sentiment():
    seen_urls = set()

    print("Starting live crypto sentiment monitor...")
    print("Checking for new headlines every 60 seconds.")
    print("Press Ctrl+C to stop.\n")

    while True:
        try:
            # Fetch the latest articles and analyze them.
            articles = analyze_crypto_news(limit_per_source=10)

            new_count = 0

            for article in articles:
                url = article["url"]

                if url in seen_urls:
                    continue

                seen_urls.add(url)
                new_count += 1

                print(
                    f"[{article['sentiment'].upper()}] "
                    f"{article['title']}"
                )
                print(
                    f"Confidence: {article['confidence']:.2%}"
                )
                print(f"Source: {article['source']}")
                print(f"URL: {url}\n")

            print(
                f"Check complete. "
                f"{new_count} new headlines analyzed."
            )

        except Exception as exc:
            print(f"News monitoring error: {exc}")

        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        run_live_sentiment()
    except KeyboardInterrupt:
        print("\nLive sentiment monitor stopped.")
