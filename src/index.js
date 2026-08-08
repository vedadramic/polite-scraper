const fs = require('fs');
const path = require('path');
const { discoverBookUrls } = require('./crawler');
const { extractBook } = require('./extractor');
const { normalizeRecord } = require('./normalizer');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const { uniqueUrls, cataloguePages } = await discoverBookUrls();

  const validRecords = [];
  const errorRecords = [];

  for (const url of uniqueUrls) {
    const sourceIndex = Math.floor(uniqueUrls.indexOf(url) / 20);
    const sourcePage = cataloguePages[sourceIndex] || cataloguePages[0];
    const raw = await extractBook(url, sourcePage);
    const { valid, record, errors } = normalizeRecord(raw);

    if (valid) {
      validRecords.push(record);
    } else {
      errorRecords.push({ url, errors });
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

  console.log(`valid=${uniqueRecords.length}`);
  console.log(`errors=${errorRecords.length}`);
  console.log('Written to output/books.json');
}

main().catch(console.error);