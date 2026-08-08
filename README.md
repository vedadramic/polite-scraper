# polite-scraper

A polite web scraping pipeline built with Node.js, Cheerio, and Zod.

Downloads the first 3 catalogue pages of Books to Scrape, visits all 60 book pages, turns messy HTML into clean validated JSON, survives broken pages, and produces an honest run report.

---

## Target classification

- **Site:** Books to Scrape (https://books.toscrape.com)
- **What it is:** A sandbox site built specifically for scraping practice — it exists for this purpose
- **Scope:** First 3 catalogue pages only — 60 books total
- **Data collected:** Title, price, availability, rating, description, product URL
- **robots.txt:** 404 not found
- **Why appropriate:** The site explicitly states it is a practice sandbox for scraping

I will not reuse this code on another site without checking its rules and terms first.

---

## How to run

You need Node.js installed. Then:

```bash
git clone https://github.com/vedadramic/polite-scraper.git
cd polite-scraper
npm install
node src/index.js
```

Results appear in `output/books.json` and `output/run-report.json`.

---

## Politeness rules

- **User-agent:** Identifies the scraper with a link to this repo
- **Delay:** 500ms minimum between real requests
- **Timeout:** 10 seconds — never waits forever
- **Cache:** Saves HTML locally — development reads from cache, not the site
- **Status check:** Only processes pages that return 200

---

## Record schema

| Field | Type | Description |
|-------|------|-------------|
| title | string | Book title |
| product_url | string | Absolute URL of the book page |
| price_text | string | Raw price string e.g. "£51.77" |
| price_gbp | number | Cleaned price e.g. 51.77 |
| availability_text | string | Raw availability string |
| rating_text | string | Rating word e.g. "Three" |
| description | string or null | Book description |
| source_page | string | Catalogue page URL this book was found on |
| fetched_at | string | ISO timestamp of when it was fetched |

---

## Ethics note

Use an official API when one exists. Never bypass logins, paywalls, or blocks. Collect only what you need. Respect robots.txt. Always identify yourself with an honest user-agent.

## Sample run report

```json
{
  "start_time": "2026-08-08T17:17:56.666Z",
  "end_time": "2026-08-08T17:17:56.994Z",
  "duration_seconds": "0.33",
  "catalogue_pages": 3,
  "urls_discovered": 60,
  "cache_hits": 60,
  "pages_fetched": 0,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 0
}
```

## Why no browser was needed

The data is already in the HTML the server sends — no JavaScript rendering is needed. A browser would add memory overhead and startup time for no benefit. A plain HTTP request is faster, lighter, and simpler.