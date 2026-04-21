#!/usr/bin/env python3
"""
Generate RSS 2.0 feed for Frontier Brief signals and posts.

Run: python3 generate_frontier_rss.py
Output: frontier-brief/feed.xml

Feed includes:
- All signals (reverse chronological)
- Weekly posts
- Expert attribution
- Thomas's lens as description
- Link to signal on site
"""

import json
import os
import sys
from datetime import datetime, timezone
from urllib.parse import urljoin

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTIER_DIR = os.path.dirname(SCRIPTS_DIR)  # Parent of scripts/ = frontier-brief root

SIGNALS_FILE = os.path.join(FRONTIER_DIR, "data", "signals.json")
POSTS_FILE = os.path.join(FRONTIER_DIR, "data", "posts.json")
OUTPUT_FILE = os.path.join(FRONTIER_DIR, "feed.xml")

SITE_URL = "https://frontier-brief.netlify.app"
SITE_TITLE = "The Frontier Brief"
SITE_DESC = "Signals, synthesis, and thinking at the intersection of AI, product leadership, and enterprise fintech."
SITE_AUTHOR = "Thomas Lukoma"

# RFC 822 format for RSS pubDate
def format_rfc822(iso_date_str):
    """Convert ISO date (YYYY-MM-DD) to RFC 822 format."""
    try:
        dt = datetime.fromisoformat(iso_date_str)
        # RFC 822: "Mon, 06 Sep 2009 00:01:00 +0000"
        return dt.strftime("%a, %d %b %Y 00:00:00 +0000")
    except:
        return datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")

def escape_xml(text):
    """Escape XML special characters."""
    if not text:
        return ""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )

def generate_signal_item(signal):
    """Generate RSS <item> for a signal."""
    title = escape_xml(signal.get("title", "Untitled"))
    expert = escape_xml(signal.get("expert", "Unknown"))
    lens = escape_xml(signal.get("thomas_lens", ""))
    quote = escape_xml(signal.get("key_quote", ""))
    source_url = signal.get("source_url", "")
    published = signal.get("published", "")
    signal_id = signal.get("id", "")
    
    # Build description: lens + quote + source
    description_parts = []
    if lens:
        description_parts.append(f"<p><strong>Thomas's lens:</strong> {lens}</p>")
    if quote:
        description_parts.append(f"<blockquote><p>{quote}</p></blockquote>")
    if source_url:
        description_parts.append(f"<p><a href=\"{escape_xml(source_url)}\">Read original →</a></p>")
    
    description = "".join(description_parts) if description_parts else f"<p>From {expert}</p>"
    
    # Link to signal on Frontier Brief
    item_link = urljoin(SITE_URL, f"?signal={signal_id}")
    
    item = f"""  <item>
    <title>{title}</title>
    <author>{expert}</author>
    <link>{escape_xml(item_link)}</link>
    <guid isPermaLink="false">{escape_xml(signal_id)}</guid>
    <pubDate>{format_rfc822(published)}</pubDate>
    <description>{description}</description>
    <category>Signal</category>
  </item>
"""
    return item

def generate_post_item(post):
    """Generate RSS <item> for a blog post."""
    title = escape_xml(post.get("title", "Untitled"))
    slug = post.get("slug", "")
    published = post.get("published", "")
    excerpt = escape_xml(post.get("excerpt", ""))
    
    # Link to post on Frontier Brief
    post_link = urljoin(SITE_URL, f"posts/{slug}.html")
    
    item = f"""  <item>
    <title>{title}</title>
    <author>{SITE_AUTHOR}</author>
    <link>{escape_xml(post_link)}</link>
    <guid isPermaLink="false">post-{escape_xml(slug)}</guid>
    <pubDate>{format_rfc822(published)}</pubDate>
    <description>{excerpt}</description>
    <category>Post</category>
  </item>
"""
    return item

def main():
    # Load signals
    if not os.path.exists(SIGNALS_FILE):
        print(f"❌ Signals file not found: {SIGNALS_FILE}", file=sys.stderr)
        sys.exit(1)
    
    with open(SIGNALS_FILE) as f:
        signals = json.load(f)
    
    # Load posts
    posts = []
    if os.path.exists(POSTS_FILE):
        with open(POSTS_FILE) as f:
            posts = json.load(f)
    
    # Sort signals by published date (newest first)
    signals = sorted(signals, key=lambda s: s.get("published", ""), reverse=True)
    
    # Sort posts by published date (newest first)
    posts = sorted(posts, key=lambda p: p.get("published", ""), reverse=True)
    
    # Generate RSS
    now = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
    
    items = []
    
    # Add posts first (more recent content)
    for post in posts:
        items.append(generate_post_item(post))
    
    # Add signals
    for signal in signals:
        items.append(generate_signal_item(signal))
    
    items_xml = "\n".join(items)
    
    rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{escape_xml(SITE_TITLE)}</title>
    <link>{escape_xml(SITE_URL)}</link>
    <description>{escape_xml(SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>{now}</lastBuildDate>
    <ttl>240</ttl>
    <managingEditor>{SITE_AUTHOR}</managingEditor>
    <webMaster>{SITE_AUTHOR}</webMaster>
{items_xml}
  </channel>
</rss>
"""
    
    # Write output
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        f.write(rss)
    
    print(f"✅ Generated RSS feed: {OUTPUT_FILE}")
    print(f"   Posts: {len(posts)}")
    print(f"   Signals: {len(signals)}")
    print(f"   Total items: {len(posts) + len(signals)}")
    print(f"\n📡 Feed URL: {SITE_URL}/feed.xml")

if __name__ == "__main__":
    main()
