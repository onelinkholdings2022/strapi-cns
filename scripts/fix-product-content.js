'use strict';
/**
 * Điền heroDescription / sourceTag / sourceHeading / sourceDescription /
 * testimonialsHeading / uspHeading / faqItems / ctaBanner / heroButton còn
 * TRỐNG cho 12/15 product (chỉ furniture, packaging, bags-cases có sẵn).
 * Nội dung lấy nguyên văn từ trang sống chinasourcing.co/product/<slug>/.
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { upsertBySlug, p, tag, btn } = require('./seed-lib');

const DATA = require('./product-content-fix-data.json');

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    for (const [slug, c] of Object.entries(DATA)) {
      const data = {
        heroDescription: c.heroDescription,
        heroButton: btn(c.heroButton.label, c.heroButton.url, c.heroButton.variant),
        sourceTag: tag(c.sourceTag),
        sourceHeading: c.sourceHeading,
        sourceDescription: c.sourceDescription,
        testimonialsHeading: c.testimonialsHeading,
        uspHeading: c.uspHeading,
        faqItems: c.faqItems.map(([question, answer]) => ({ question, answer: p(answer) })),
        ctaBanner: {
          tag: tag(c.ctaBanner.tag),
          heading: c.ctaBanner.heading,
          subheading: c.ctaBanner.subheading,
          button: btn(c.ctaBanner.button.label, c.ctaBanner.button.url, c.ctaBanner.button.variant),
        },
      };
      await upsertBySlug(app, 'api::product.product', slug, data);
      console.log(`  ✓ ${slug}`);
    }
    console.log('\nXong.');
  } finally {
    await app.destroy();
  }
})();
