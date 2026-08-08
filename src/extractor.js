const cheerio = require('cheerio');
const { fetchPage } = require('./fetcher');

async function extractBook(url, sourcePage) {
  const { html, fromCache } = await fetchPage(url);
  const $ = cheerio.load(html);

  const title = $('div.product_main h1').text().trim() || null;
  const price_text = $('div.product_main p.price_color').text().trim() || null;
  const availability_text = $('div.product_main p.availability').text().trim() || null;
  const rating_text = $('div.product_main p.star-rating').attr('class')?.replace('star-rating ', '') || null;

  const descriptionEl = $('#product_description ~ p');
  const description = descriptionEl.length ? descriptionEl.text().trim() : null;

  return {
    title,
    product_url: url,
    price_text,
    availability_text,
    rating_text,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString(),
  };
}

module.exports = { extractBook };