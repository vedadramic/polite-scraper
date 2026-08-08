const { discoverBookUrls } = require('./crawler');
const { extractBook } = require('./extractor');

async function main() {
  const { uniqueUrls, cataloguePages } = await discoverBookUrls();

  const rawRecords = [];

  for (const url of uniqueUrls) {
    const sourceIndex = Math.floor(uniqueUrls.indexOf(url) / 20);
    const sourcePage = cataloguePages[sourceIndex] || cataloguePages[0];
    const record = await extractBook(url, sourcePage);
    rawRecords.push(record);
  }

  console.log(`detail_pages=${rawRecords.length}`);
  console.log('Sample record:');
  console.log(JSON.stringify(rawRecords[0], null, 2));
}

main().catch(console.error);