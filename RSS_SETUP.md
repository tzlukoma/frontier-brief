# Frontier Brief RSS Feed

## Overview
Your Frontier Brief site now has a fully functional RSS feed at:
```
https://frontier-brief.netlify.app/feed.xml
```

## How it works

**Script:** `scripts/generate_frontier_rss.py`
- Reads from `frontier-brief/data/signals.json` and `frontier-brief/data/posts.json`
- Generates a valid RSS 2.0 feed
- Runs automatically as part of the daily heartbeat (every hour during waking hours)
- Output: `frontier-brief/feed.xml`

## Feed content

Each RSS item includes:
- **Title** — signal or post title
- **Author** — expert name (for signals) or "Thomas Lukoma" (for posts)
- **Link** — direct link back to the item on Frontier Brief
- **Description** — Your lens + key quote + link to original source
- **Publication date** — when the signal was published
- **Category** — "Signal" or "Post"

Posts appear first (most recent), then signals.

## Automation

The feed regenerates automatically during your daily heartbeat:
```bash
# Run manually anytime:
python3 scripts/generate_frontier_rss.py
```

No additional setup needed. Every time a new signal is added to `signals.json`, the next heartbeat will regenerate the feed.

## Testing

To test the feed:
1. Add a test signal to `frontier-brief/data/signals.json`
2. Run `python3 scripts/generate_frontier_rss.py`
3. Open `frontier-brief/feed.xml` in a text editor to verify
4. Paste the feed URL into an RSS reader (Feedly, Apple News, etc.) to confirm it works

## Feed subscribers

Once published to Netlify, users can subscribe at:
```
https://frontier-brief.netlify.app/feed.xml
```

The feed updates every time the heartbeat runs (default: hourly during waking hours).
