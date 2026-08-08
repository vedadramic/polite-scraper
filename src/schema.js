const { z } = require('zod');

const BookSchema = z.object({
  title: z.string().min(1),
  product_url: z.string().url().startsWith('https://'),
  price_text: z.string(),
  price_gbp: z.number().positive(),
  availability_text: z.string(),
  rating_text: z.string(),
  description: z.string().nullable(),
  source_page: z.string().url(),
  fetched_at: z.string().datetime(),
});

module.exports = { BookSchema };