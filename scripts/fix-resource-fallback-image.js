'use strict';
/**
 * 4 resource (pre-production-sample-checklist, sourcing-timeline-template,
 * manufacturer-vetting-checklist, rfq-template) có featureImage/cover null,
 * nên frontend phải rơi về fallback ảnh LOCAL (/images/blog-fallback.png) —
 * vi phạm yêu cầu "100% ảnh lấy từ Strapi". 8 resource còn lại đã dùng chung 1
 * ảnh fallback thật trên Strapi (resource-detail-fallback.webp, media id 90068)
 * — gán media đó cho 4 resource còn thiếu, thay vì bịa ảnh mới không có nguồn.
 *
 * ⚠️ TẮT `npm run dev` trước khi chạy: node scripts/fix-resource-fallback-image.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const RESOURCE_UID = 'api::resource.resource';
const FALLBACK_MEDIA_ID = 90068; // resource-detail-fallback.webp — đã xác nhận tồn tại qua API.
const SLUGS = [
  'pre-production-sample-checklist',
  'sourcing-timeline-template',
  'manufacturer-vetting-checklist',
  'rfq-template',
];

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== FIX RESOURCE FALLBACK IMAGE ===');
    for (const slug of SLUGS) {
      const r = await app.documents(RESOURCE_UID).findFirst({ filters: { slug: { $eq: slug } }, status: 'draft' });
      if (!r) {
        console.log(`  ! không thấy resource slug=${slug}`);
        continue;
      }
      await app.documents(RESOURCE_UID).update({
        documentId: r.documentId,
        data: { featureImage: FALLBACK_MEDIA_ID, cover: FALLBACK_MEDIA_ID },
        status: 'published',
      });
      console.log(`  • ${slug} — featureImage/cover set`);
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
