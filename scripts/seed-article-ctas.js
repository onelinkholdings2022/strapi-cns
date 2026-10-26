'use strict';
/**
 * Tạo 2 khung `Article CTA Box` mẫu — đúng hai khung trong thiết kế blog:
 *
 *   • light  "Need these five checks done for you?"  → See Quality Control
 *   • heavy  "Sourcing steel or metal products?"     → Talk To Our Expert
 *
 * Idempotent: slug đã có thì bỏ qua (không ghi đè chỉnh sửa của biên tập viên).
 *
 *   node scripts/seed-article-ctas.js
 *
 * Sau đó vào bài viết, đặt con trỏ ở chỗ muốn chèn, bấm "CTA Box" trên thanh
 * công cụ CKEditor và chọn khung.
 *
 * ⚠️ TẮT `npm run dev` trước khi chạy. DB dùng chung với production.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const UID = 'api::article-cta.article-cta';

const CTAS = [
  {
    name: 'Quality control checks',
    slug: 'quality-control-checks',
    variant: 'light',
    heading: 'Need these five checks done for you?',
    description:
      'Our team verifies steel grades, factory capability and inspection before you place an order.',
    buttonLabel: 'See Quality Control',
    buttonUrl: '/quality-control',
  },
  {
    name: 'Talk to our expert — steel & metal',
    slug: 'talk-to-our-expert-steel',
    variant: 'heavy',
    heading: 'Sourcing steel or metal products?',
    description: 'Get supplier options and landed-cost estimates from our team.',
    buttonLabel: 'Talk To Our Expert',
    buttonUrl: '/contact-us',
  },
];

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    for (const cta of CTAS) {
      const existing = await app.documents(UID).findFirst({ filters: { slug: cta.slug } });
      if (existing) {
        console.log(`  = ${cta.slug} (đã có)`);
        continue;
      }
      await app.documents(UID).create({ data: cta });
      console.log(`  + ${cta.slug}`);
    }
    console.log('\nDone.');
  } finally {
    await app.destroy();
  }
})();
