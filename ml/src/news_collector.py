
import feedparser
from datetime import datetime, timezone

RSS_FEEDS = {
    "Cointelegraph": "https://cointelegraph.com/rss",
    "CoinDesk": "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml",
}


def fetch_crypto_headlines(limit_per_source=10):
    """Fetch recent crypto headlines from configured RSS feeds."""
    articles = []

    for source, feed_url in RSS_FEEDS.items():
        try:
            feed = feedparser.parse(feed_url)

            if feed.bozo and not feed.entries:
                print(f"Could not read feed: {source}")
                continue

            for entry in feed.entries[:limit_per_source]:
                title = entry.get("title", "").strip()
                link = entry.get("link", "").strip()

                if not title or not link:
                    continue

                published = entry.get("published", "")

                articles.append({
                    "source": source,
                    "title": title,
                    "url": link,
                    "published": published,
                    "fetched_at": datetime.now(timezone.utc).isoformat(),
                })

        except Exception as exc:
            print(f"Error fetching {source}: {exc}")

    # Remove duplicate article URLs.
    unique_articles = {}
    for article in articles:
        unique_articles[article["url"]] = article

    return list(unique_articles.values())


if __name__ == "__main__":
    headlines = fetch_crypto_headlines()

    print(f"\nFetched {len(headlines)} unique headlines\n")

    for index, article in enumerate(headlines, start=1):
        print(f"{index}. [{article['source']}] {article['title']}")
        print(f"   Published: {article['published']}")
        print(f"   URL: {article['url']}\n")
