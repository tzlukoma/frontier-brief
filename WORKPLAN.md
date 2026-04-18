# Frontier Brief — Work Plan
# Created: 2026-04-18

## PHASE 1 — Foundation (Do Now)

### 1.1 Fix expert index
- [ ] Add Lenny's YouTube channel ID: UC6t1O76G0jYXOAoYCm153dA
- [ ] Replace Josh Woodward YouTube with blog feed: https://blog.google/authors/josh-woodward/
- [ ] Fix Josh Woodward feed in index.yaml

### 1.2 Test worker end-to-end
- [ ] Run worker on 1 newsletter item (low risk, no transcript needed)
- [ ] Confirm Claude generates output
- [ ] Confirm signal extracted and written to signals.json
- [ ] Confirm publisher commits and pushes to GitHub
- [ ] Confirm site updates on Netlify
- [ ] Run worker on 1 video item
- [ ] Confirm transcript fetch works
- [ ] Confirm 8-section deep dive generated

---

## PHASE 2 — Site Features

### 2.1 Domain filtering
- [ ] Add filter bar to signals feed (All / AI × Product / UX × AI / Fintech / Product Leadership)
- [ ] Filter logic in JS — no page reload
- [ ] Active filter state styling
- [ ] Filter persists on scroll (sticky below header)

### 2.2 90-day archive concept
- [ ] Signals feed shows only last 90 days by default
- [ ] "Archive" link/section shows everything older
- [ ] Expert card signal count = 90-day only
- [ ] Sidebar signal list = 90-day only
- [ ] Expert staleness alert: if no signals from an expert in 90 days → flag in digest email
  - Daily digest shows "⚠️ No signals in 90 days: [expert names]"

### 2.3 About page
- [ ] Draft content (Thomas to approve)
- [ ] Build about.html with same design system
- [ ] Reverse-chronological blog posts section below bio

### 2.4 Deep dives archive page (/dives)
- [ ] Index of all processed deep dives
- [ ] Filterable by expert / domain / date
- [ ] Links to full markdown files

### 2.5 Search / filter on signals feed
- [ ] Text search across title + lens + quote
- [ ] Combines with domain filter

---

## PHASE 3 — Content & Automation

### 3.1 Friday blog post draft
- [ ] Script: every Friday, gather that week's signals
- [ ] Prompt Thomas via Telegram for his reflections (simple reply)
- [ ] Generate draft blog post from signals + reflections via Claude
- [ ] Send draft to Thomas via email for editing
- [ ] Once approved, Thomas triggers publish → post added to about.html
- [ ] Posts stored in frontier-brief/posts/ as markdown

---

## ABOUT PAGE DRAFT — For Thomas's Review

---

**About This Site**

The Frontier Brief is my public intelligence feed — a living record of what I'm reading, watching, and thinking as I work through one of the more interesting career questions I've faced: what does it mean to lead product in the age of AI?

I've spent over two decades in financial technology. I started as a UX designer, became a front-end engineer, moved into product management, and for the past several years I've led payments technology at J.P. Morgan. That intersection — design thinking, technical fluency, and product leadership at scale in a regulated industry — feels like exactly the right vantage point for what's coming next.

AI isn't just changing the tools. It's changing what product leaders need to be good at. The execution layer is being commoditized. Judgment, taste, and the ability to ask the right questions are becoming the scarce resource. I'm trying to get sharper on all three.

This site is how I do that in public.

**What you'll find here:**

- **Signals** — synthesis of articles, newsletters, talks, and videos from the people I think are seeing clearly. Every signal includes my own lens: why it matters specifically for someone navigating the intersection of AI, product leadership, and enterprise financial services.

- **Experts** — the thinkers I'm tracking. Not a list of famous names, but a deliberately curated set of people whose work is actually changing how I think.

- **Posts** — weekly reflections. Every Friday I read back through what surfaced that week and write something. It won't always be polished. That's the point.

**A note on sourcing:**

Everything here is attributed. The ideas belong to the people I'm reading. My contribution is the synthesis, the lens, and the connections I draw across sources. This is a learning practice made visible — not original research, and not the views of my employer.

If something here resonates, I'd love to hear from you.

— Thomas Lukoma
[LinkedIn](https://www.linkedin.com/in/tzlukoma/)

---
