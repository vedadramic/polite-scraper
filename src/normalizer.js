const { BookSchema } = require('./schema');

function normalizeRecord(raw) {
  const priceMatch = raw.price_text?.match(/[\d.]+/);
  const price_gbp = priceMatch ? parseFloat(priceMatch[0]) : null;

  const cleaned = {
    ...raw,
    price_gbp,
  };

  const result = BookSchema.safeParse(cleaned);

  if (!result.success) {
    return { valid: false, record: cleaned, errors: result.error.issues };
  }

  return { valid: true, record: result.data };
}

module.exports = { normalizeRecord };