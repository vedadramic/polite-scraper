const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', 'cache');
const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/vedadramic/polite-scraper)';
const TIMEOUT_MS = 10000;
const DELAY_MS = 500;

function getCachePath(url) {
  const safe = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '_');
  return path.join(CACHE_DIR, safe + '.html');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url, useCache = true) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const cachePath = getCachePath(url);

  if (useCache && fs.existsSync(cachePath)) {
    const html = fs.readFileSync(cachePath, 'utf8');
    console.log(`CACHE HIT  ${url} (${html.length} bytes)`);
    return { html, fromCache: true, status: 200 };
  }

  await sleep(DELAY_MS);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });
  } finally {
    clearTimeout(timer);
  }

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const html = await response.text();
  fs.writeFileSync(cachePath, html, 'utf8');
  console.log(`FETCH      ${url} (${html.length} bytes)`);

  return { html, fromCache: false, status: response.status };
}

module.exports = { fetchPage, sleep };