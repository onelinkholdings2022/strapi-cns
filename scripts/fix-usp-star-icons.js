'use strict';
/**
 * `product-setting.defaultUsps` (dùng cho 14/15 product không có usps riêng)
 * và `bags-cases.usps` (product duy nhất có usps riêng) đều có `icon: null`
 * — component `UspList` fallback về `FALLBACK_IMAGE` (`/images/blog-fallback.png`,
 * ảnh blog chung), không phải icon ngôi sao như site gốc.
 *
 * Site gốc dùng 2 icon ngôi sao KHÁC MÀU tuỳ trang (đã xác nhận bằng cách tải
 * HTML thật + so hash 2 file đã scrape trước đó, `public/images/star-05*.png`):
 *   - About + Services: `star-05.png` — xanh cyan-400. Strapi đã có sẵn
 *     (`star-05.webp`, dùng cho About's `benefits.items` — đúng rồi, không đụng).
 *   - Products (mọi trang): `star-05-1.png` — xanh navy đậm. CHƯA có trong
 *     Strapi — script này upload (qua `media-lib.js`, tự convert webp) rồi gán
 *     cho `product-setting.defaultUsps` + `bags-cases.usps`.
 *   - Services' `usp.items` cũng đang `icon: null` — gán lại bằng đúng
 *     `star-05.webp` đã có sẵn (không upload thêm).
 *
 * ⚠️ TẮT `npm run dev`/`strapi develop` trước khi chạy:
 *   node scripts/fix-usp-star-icons.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { uploadImage } = require('./media-lib');

const PRODUCT_SETTING_UID = 'api::product-setting.product-setting';
const SERVICES_PAGE_UID = 'api::services-page.services-page';
const PRODUCT_UID = 'api::product.product';

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== FIX USP STAR ICONS ===');

    // `media-lib.js` dedupe theo tên file chỉ trong 1 lần chạy script (Map trong
    // bộ nhớ) — "star-05.webp" đã được upload từ 1 lần chạy TRƯỚC (cho About's
    // benefits.items), nên phải tự kiểm tra DB trước để khỏi tạo bản trùng.
    const existingBlue = await app.db.query('plugin::upload.file').findOne({ where: { name: 'star-05.webp' } });
    const starBlue = existingBlue || (await uploadImage(app, 'star-05.png', { alt: '' }));
    console.log(`  star-05.png (blue)${existingBlue ? ' — dùng lại đã có' : ''} -> media id ${starBlue.id}`);

    const existingNavy = await app.db.query('plugin::upload.file').findOne({ where: { name: 'star-05-1.webp' } });
    const starNavy = existingNavy || (await uploadImage(app, 'star-05-1.png', { alt: '' }));
    console.log(`  star-05-1.png (navy)${existingNavy ? ' — dùng lại đã có' : ''} -> media id ${starNavy.id}`);

    // 1) product-setting.defaultUsps
    const setting = await app.documents(PRODUCT_SETTING_UID).findFirst({
      status: 'draft',
      populate: { defaultUsps: { populate: ['icon'] } },
    });
    if (setting) {
      const items = (setting.defaultUsps || []).map((it) => ({ ...it, icon: starNavy.id }));
      await app.documents(PRODUCT_SETTING_UID).update({
        documentId: setting.documentId,
        data: { defaultUsps: items },
        status: 'published',
      });
      console.log(`  product-setting.defaultUsps: gán navy cho ${items.length} item`);
    } else {
      console.log('  ! không thấy product-setting');
    }

    // 2) bags-cases.usps
    const bagsCases = await app.documents(PRODUCT_UID).findFirst({
      filters: { slug: { $eq: 'bags-cases' } },
      status: 'draft',
      populate: { usps: { populate: ['icon'] } },
    });
    if (bagsCases) {
      const items = (bagsCases.usps || []).map((it) => ({ ...it, icon: starNavy.id }));
      await app.documents(PRODUCT_UID).update({
        documentId: bagsCases.documentId,
        data: { usps: items },
        status: 'published',
      });
      console.log(`  bags-cases.usps: gán navy cho ${items.length} item`);
    } else {
      console.log('  ! không thấy product slug=bags-cases');
    }

    // 3) services-page.usp.items — component non-repeatable chứa mảng con.
    const servicesPage = await app.documents(SERVICES_PAGE_UID).findFirst({
      status: 'draft',
      populate: { usp: { populate: { items: { populate: ['icon'] } } } },
    });
    if (servicesPage?.usp) {
      const items = (servicesPage.usp.items || []).map((it) => ({ ...it, icon: starBlue.id }));
      await app.documents(SERVICES_PAGE_UID).update({
        documentId: servicesPage.documentId,
        data: { usp: { ...servicesPage.usp, items } },
        status: 'published',
      });
      console.log(`  services-page.usp.items: gán blue cho ${items.length} item`);
    } else {
      console.log('  ! không thấy services-page.usp');
    }

    console.log('\nDone.');
  } finally {
    await app.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
