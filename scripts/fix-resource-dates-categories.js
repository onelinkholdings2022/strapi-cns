'use strict';
/**
 * Thẻ resource trên `/resources` hiện ngày = `publishedAt` của Strapi (tức ngày
 * seed, "06/09/2026" cho tất cả) thay vì ngày đăng thật của site gốc. Thêm
 * field `publishedDate` (giống blog-post) và điền theo đúng ngày listing gốc in
 * ra — xem HTML `/resources`, khối `.resource-listing`.
 *
 * Đồng thời sửa category: listing gốc gắn "Logistics Tips" cho 11/12 resource,
 * riêng `the-hidden-profit-leak-most-ecommerce-brands-ignore` KHÔNG có category
 * nào (thẻ của nó không render dòng category) — bản clone đang gắn "Ecommerce",
 * làm thẻ cao dư 32px so với bản gốc.
 *
 * 4 slug cuối là bản đổi tên của `dummy-resource-1..4` trên site gốc (khớp theo
 * tiêu đề, xem chú thích từng dòng).
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/fix-resource-dates-categories.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const RESOURCE_UID = 'api::resource.resource';
const CATEGORY_UID = 'api::category.category';

const LOGISTICS = 'Logistics Tips';

// slug -> [ngày đăng trên site gốc, tên category ('' = không có)]
const DATA = {
  'the-hidden-profit-leak-most-ecommerce-brands-ignore': ['2026-05-19', ''],
  'incoterms-explained': ['2025-06-19', LOGISTICS],
  'supplier-interview-questions-list': ['2025-06-19', LOGISTICS],
  '8-biggest-mistakes-to-avoid-when-sourcing-from-china': ['2025-06-19', LOGISTICS],
  'china-supplier-outreach-email-scripts': ['2025-06-19', LOGISTICS],
  'custom-manufacturing-requirements-template': ['2025-06-19', LOGISTICS],
  'quality-control-inspection-checklist': ['2025-06-19', LOGISTICS],
  'intro-to-china-manufacturing': ['2025-06-19', LOGISTICS],
  'pre-production-sample-checklist': ['2025-04-17', LOGISTICS], // dummy-resource-4
  'sourcing-timeline-template': ['2025-04-17', LOGISTICS], // dummy-resource-3
  'manufacturer-vetting-checklist': ['2025-04-17', LOGISTICS], // dummy-resource-2
  'rfq-template': ['2025-04-10', LOGISTICS], // dummy-resource-1
};

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== FIX RESOURCE DATES + CATEGORIES ===');
    const categories = await app.documents(CATEGORY_UID).findMany({ pagination: { pageSize: 100 } });
    const catId = new Map(categories.map((c) => [c.name, c.documentId]));

    for (const [slug, [date, catName]] of Object.entries(DATA)) {
      const r = await app.documents(RESOURCE_UID).findFirst({
        filters: { slug: { $eq: slug } },
        status: 'draft',
        populate: ['categories'],
      });
      if (!r) {
        console.log(`  ! không thấy resource slug=${slug}`);
        continue;
      }
      const currentIds = (r.categories || []).map((c) => c.documentId);
      const wantIds = catName && catId.get(catName) ? [catId.get(catName)] : [];
      await app.documents(RESOURCE_UID).update({
        documentId: r.documentId,
        data: {
          publishedDate: date,
          categories: { disconnect: currentIds, connect: wantIds },
        },
        status: 'published',
      });
      console.log(`  ✓ ${slug} — ${date}, category: ${catName || '(không có)'}`);
    }
    console.log('\nDone.');
  } finally {
    await app.destroy();
  }
})();
