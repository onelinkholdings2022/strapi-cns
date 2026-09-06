'use strict';
/**
 * Backfill `gated=true` cho toàn bộ blog-post hiện có — field mới thêm vào
 * schema không tự điền default cho các bản ghi cũ (Strapi chỉ áp default cho
 * bản ghi tạo MỚI). 12 resource giữ nguyên gated=false, không đụng tới.
 * ⚠️ TẮT `npm run dev` trước khi chạy.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const uid = 'api::blog-post.blog-post';
    const all = await app.documents(uid).findMany({ fields: ['slug'], status: 'draft', pagination: { pageSize: 500 } });
    console.log(`Tổng ${all.length} blog post.`);
    let done = 0;
    for (const post of all) {
      await app.documents(uid).update({ documentId: post.documentId, data: { gated: true }, status: 'published' });
      done++;
      if (done % 20 === 0) console.log(`  ... ${done}/${all.length}`);
    }
    console.log(`✓ Đã set gated=true cho ${done} blog post.`);
  } finally {
    await app.destroy();
  }
})();
