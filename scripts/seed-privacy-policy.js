'use strict';
/**
 * Seed Single Type `privacy-policy-page` + mở quyền đọc PUBLIC cho nó.
 *
 *   node scripts/seed-privacy-policy.js
 *
 * Nội dung lấy nguyên văn từ https://chinasourcing.co/privacy-policy/ và nằm
 * trong `scripts/privacy-policy-content.json` (bóc bằng script, không gõ tay).
 * Site gốc vẫn đang để copy mẫu ("Short description about what this service…",
 * một đoạn lorem) — clone giữ đúng như vậy, không tự viết chính sách thay.
 *
 * ⚠️ TẮT `npm run dev` trước khi chạy. DB dùng chung với production nên nội
 * dung ghi ở đây có hiệu lực ngay trên cms.chinasourcing.co.
 *
 * Idempotent: chạy lại bao nhiêu lần cũng cho cùng một kết quả.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { upsertSingle } = require('./seed-lib');
const content = require('./privacy-policy-content.json');

const UID = 'api::privacy-policy-page.privacy-policy-page';

const esc = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = (paragraphs) => paragraphs.map((t) => `<p>${esc(t)}</p>`).join('');

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    await upsertSingle(app, UID, {
      title: content.title,
      intro: content.intro,
      sections: content.sections.map((s) => ({
        heading: s.heading,
        body: html(s.paragraphs),
      })),
      seo: {
        // Nguyên văn thẻ meta của site gốc — kể cả lỗi chính tả
        // "descrtiption" trong description. Không sửa: đây là bản clone.
        metaTitle: 'Privacy Policy - China Sourcing Co',
        metaDescription: 'This is the meta descrtiption for the Pages',
        canonicalURL: 'https://chinasourcing.co/privacy-policy/',
      },
    });
    console.log(`  + ${UID} (${content.sections.length} sections)`);

    const publicRole = await app.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });
    if (!publicRole) {
      console.log('  ! không tìm thấy Public role');
      return;
    }
    // Single type chỉ có action `find`.
    const permAction = `${UID}.find`;
    const existing = await app.db.query('plugin::users-permissions.permission').findOne({
      where: { action: permAction, role: publicRole.id },
    });
    if (existing) {
      console.log(`  = ${permAction} (đã có)`);
    } else {
      await app.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action: permAction, role: publicRole.id } });
      console.log(`  + ${permAction}`);
    }

    console.log('\nDone.');
  } finally {
    await app.destroy();
  }
})();
