const cheerio = require('cheerio');
const { fetchPage } = require('./fetcher');

const BASE_CATALOGUE = 'https://books.toscrape.com/catalogue/page-1.html';
const MAX_PAGES = 3;

async function discoverBookUrls() {
  const allUrls = new Set();
  const cataloguePages = [];
  let currentUrl = BASE_CATALOGUE;
  let pageCount = 0;

  while (currentUrl && pageCount < MAX_PAGES) {
    const { html } = await fetchPage(currentUrl);
    cataloguePages.push(currentUrl);
    pageCount++;

    const $ = cheerio.load(html);

    $('article.product_pod h3 a').each((_, el) => {
      const href = $(el).attr('href');
      const absolute = new URL(href, currentUrl).href;
      allUrls.add(absolute);
    });

    const nextLink = $('li.next a').attr('href');
    if (nextLink && pageCount < MAX_PAGES) {
      currentUrl = new URL(nextLink, currentUrl).href;
    } else {
      currentUrl = null;
    }
  }

  const uniqueUrls = [...allUrls];

  console.log(`catalogue_pages=${pageCount}`);
  console.log(`discovered=${uniqueUrls.length}`);
  console.log(`unique_urls=${uniqueUrls.length}`);
  return { uniqueUrls, cataloguePages };
}

module.exports = { discoverBookUrls };