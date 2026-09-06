'use strict';
/**
 * Khôi phục content đầy đủ (kèm markup ez-toc gốc, để frontend dựng lại Table
 * of Contents) cho 8/12 resource từng bị seed nhầm bằng câu excerpt ngắn thay
 * vì html gốc — nguồn là chinasourcing-clone/src/data/content/article-pages.json
 * (đã lưu sẵn ở /tmp/resource-full-content.json). 4 resource còn lại
 * (pre-production-sample-checklist, sourcing-timeline-template,
 * manufacturer-vetting-checklist, rfq-template) không có trong scrape gốc —
 * giữ nguyên content ngắn hiện có.
 *
 * Đồng thời gán lại category theo đúng chủ đề — trước đó tất cả 12 resource bị
 * gán chung "Logistics Tips" (hoặc rỗng), không phản ánh đúng nội dung.
 *
 * ⚠️ TẮT `npm run dev` trước khi chạy: node scripts/fix-resource-content-categories.js
 */
const fs = require('fs');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const RESOURCE_UID = 'api::resource.resource';
const CATEGORY_UID = 'api::category.category';

const fullContent = JSON.parse(fs.readFileSync('/tmp/resource-full-content.json', 'utf8'));

// slug -> tên category đúng chủ đề (khớp đúng tên category đã có sẵn trong Strapi).
const CATEGORY_BY_SLUG = {
  'pre-production-sample-checklist': 'Product Guide',
  'sourcing-timeline-template': 'Sourcing Guide',
  'manufacturer-vetting-checklist': 'Sourcing Guide',
  'rfq-template': 'Sourcing Guide',
  'the-hidden-profit-leak-most-ecommerce-brands-ignore': 'Ecommerce',
  'incoterms-explained': 'Freight & Logistics',
  'supplier-interview-questions-list': 'Sourcing Guide',
  '8-biggest-mistakes-to-avoid-when-sourcing-from-china': 'Sourcing Guide',
  'china-supplier-outreach-email-scripts': 'Sourcing Guide',
  'custom-manufacturing-requirements-template': 'Manufacturing',
  'quality-control-inspection-checklist': 'Manufacturing',
  'intro-to-china-manufacturing': 'Manufacturing',
};

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== FIX RESOURCE CONTENT + CATEGORIES ===');

    const categories = await app.documents(CATEGORY_UID).findMany({ pagination: { pageSize: 100 } });
    const categoryIdByName = new Map(categories.map((c) => [c.name, c.documentId]));

    const resources = await app.documents(RESOURCE_UID).findMany({
      pagination: { pageSize: 100 },
      status: 'draft',
      populate: ['categories'],
    });

    let contentFixed = 0;
    let categoryFixed = 0;
    for (const r of resources) {
      const data = {};

      if (fullContent[r.slug]) {
        data.content = fullContent[r.slug];
      }

      const wantCategory = CATEGORY_BY_SLUG[r.slug];
      const categoryDocId = wantCategory ? categoryIdByName.get(wantCategory) : null;
      if (wantCategory && !categoryDocId) {
        console.log(`  ! không thấy category "${wantCategory}" cho slug=${r.slug}`);
      }
      if (categoryDocId) {
        const current = (r.categories || []).map((c) => c.documentId).filter((id) => id !== categoryDocId);
        data.categories = { disconnect: current, connect: [categoryDocId] };
      }

      if (Object.keys(data).length === 0) continue;

      await app.documents(RESOURCE_UID).update({ documentId: r.documentId, data, status: 'published' });
      if (data.content) contentFixed++;
      if (data.categories) categoryFixed++;
      console.log(`  • ${r.slug} — content: ${data.content ? 'updated' : 'unchanged'}, category: ${wantCategory ?? '-'}`);
    }

    console.log(`\nDone. content updated: ${contentFixed}/12, category set: ${categoryFixed}/12`);
  } finally {
    await app.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
