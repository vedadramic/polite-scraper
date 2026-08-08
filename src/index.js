const { fetchPage } = require('./fetcher');

const BASE_URL = 'https://books.toscrape.com/catalogue/page-1.html';

async function main() {
  const { html } = await fetchPage(BASE_URL);
  console.log(`Page size: ${html.length} bytes`);
}

main().catch(console.error);