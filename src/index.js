const fs = require('fs');
const path = require('path');
const { discoverBookUrls } = require('./crawler');
const { extractBook } = require('./extractor');
const { normalizeRecord } = require('./normalizer');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const CACHE_DIR = path.join(__dirname, '..', 'cache');

async function main() {
  const startTime = new Date();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const { uniqueUrls, cataloguePages } = await discoverBookUrls();

  const validRecords = [];
  const errorRecords = [];
  let cacheHits = 0;
  let fetchCount = 0;
  let failedPages = 0;

  for (const url of uniqueUrls) {
    try {
      const sourceIndex = Math.floor(uniqueUrls.indexOf(url) / 20);
      const sourcePage = cataloguePages[sourceIndex] || cataloguePages[0];

      const raw = await extractBook(url, sourcePage);

      const safeName = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '_') + '.html';
      const fromCache = fs.existsSync(path.join(CACHE_DIR, safeName));
      if (fromCache) cacheHits++; else fetchCount++;

      const { valid, record, errors } = normalizeRecord(raw);

      if (valid) {
        validRecords.push(record);
      } else {
        errorRecords.push({ url, errors });
      }
    } catch (err) {
      console.error(`FAILED     ${url} — ${err.message}`);
      failedPages++;
      errorRecords.push({ url, errors: [err.message] });
    }
  }

  const seen = new Set();
  const uniqueRecords = validRecords.filter(r => {
    if (seen.has(r.product_url)) return false;
    seen.add(r.product_url);
    return true;
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'books.json'),
    JSON.stringify(uniqueRecords, null, 2)
  );

  if (errorRecords.length > 0) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'errors.json'),
      JSON.stringify(errorRecords, null, 2)
    );
  }

  const endTime = new Date();
  const report = {
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    duration_seconds: ((endTime - startTime) / 1000).toFixed(2),
    catalogue_pages: cataloguePages.length,
    urls_discovered: uniqueUrls.length,
    cache_hits: cacheHits,
    pages_fetched: fetchCount,
    valid_records: uniqueRecords.length,
    invalid_records: errorRecords.filter(e => !e.errors.includes('fetch failed')).length,
    failed_pages: failedPages,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'run-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n--- Run Report ---');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(console.error);