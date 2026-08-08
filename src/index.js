const { discoverBookUrls } = require('./crawler');

async function main() {
  const { uniqueUrls, cataloguePages } = await discoverBookUrls();
}

main().catch(console.error);