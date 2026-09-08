'use strict';
/**
 * Dựng collection `resource-type` và gán vào 12 resource.
 *
 * ## Vì sao cần một content type mới
 *
 * Tab lọc của khối "Free Resources" trên `/resources` (All / Checklists /
 * eBook / Others / Templates) trước nay lấy từ `resource.resourceType` — một
 * **enum**. Enum thì không có slug, không có bản ghi, không có chỗ nhập SEO,
 * nên không thể cho mỗi loại một URL riêng `/<slug>` giống category blog: ghi
 * cứng 4 slug trong code là thứ vừa không sửa được từ CMS, vừa không có
 * `<title>`/`description` riêng.
 *
 * Nên mỗi loại giờ là một bản ghi thật: `name` + `slug` + `order` + `seo`.
 *
 * ## Enum cũ được GIỮ LẠI
 *
 * `resource.resourceType` không bị xoá. Nó vẫn là thứ script này đọc để suy ra
 * loại của từng resource, và là lưới đỡ nếu quan hệ mới bị bỏ trống ở đâu đó —
 * `buildFreeResourcesView` bên frontend lùi về enum khi `resource.type` null.
 * Xoá enum là mất luôn đường suy ngược, mà chẳng được gì.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/seed-resource-types.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const TYPE_UID = 'api::resource-type.resource-type';
const RESOURCE_UID = 'api::resource.resource';

/**
 * Giá trị enum -> bản ghi.
 *
 * `slug` là số nhiều vì nó thành URL và đọc như một trang danh sách
 * (`/checklists`), trừ `ebook` — theme gốc viết nhãn tab là "eBook" số ít.
 * Nhãn giữ nguyên chữ của theme.
 *
 * SEO viết theo đúng thứ từng loại đang chứa (đếm 2026-09-07): Other 4,
 * Template 4, Checklist 3, eBook 1.
 */
const TYPES = [
  {
    enumValue: 'Checklist',
    name: 'Checklists',
    slug: 'checklists',
    order: 1,
    seo: {
      metaTitle: 'Sourcing Checklists | China Sourcing Co',
      metaDescription:
        'Free checklists for importers — factory vetting criteria, QC inspection points and the pre-production sample checks to clear before you approve a golden sample.',
      keywords: 'sourcing checklist, factory audit checklist, qc inspection checklist, pre production sample',
    },
  },
  {
    enumValue: 'eBook',
    name: 'eBook',
    slug: 'ebook',
    order: 2,
    seo: {
      metaTitle: 'Sourcing eBooks | China Sourcing Co',
      metaDescription:
        'Long-form guides to sourcing from China, from finding suppliers to understanding MOQs, tooling costs and protecting your IP.',
      keywords: 'china sourcing ebook, china manufacturing guide, importing from china guide, moq ip protection',
    },
  },
  {
    enumValue: 'Other',
    name: 'Others',
    slug: 'others',
    order: 3,
    seo: {
      metaTitle: 'Sourcing Guides & References | China Sourcing Co',
      metaDescription:
        'Reference material for importers — Incoterms explained, supplier interview questions, and the sourcing mistakes that cost the most to undo.',
      keywords: 'incoterms guide, supplier interview questions, china sourcing mistakes, importer reference',
    },
  },
  {
    enumValue: 'Template',
    name: 'Templates',
    slug: 'templates',
    order: 4,
    seo: {
      metaTitle: 'Sourcing Templates | China Sourcing Co',
      metaDescription:
        'Copy-and-use templates for importers — RFQ forms, supplier outreach emails, custom manufacturing requirement briefs and a project timeline you can plan against.',
      keywords: 'rfq template, supplier outreach email template, manufacturing requirements template, sourcing timeline',
    },
  },
];

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    // ── 1. Bản ghi loại ───────────────────────────────────────────────────
    const byEnum = {};
    for (const t of TYPES) {
      const existing = await app.documents(TYPE_UID).findFirst({
        filters: { slug: { $eq: t.slug } },
        status: 'draft',
      });
      const data = {
        name: t.name,
        slug: t.slug,
        order: t.order,
        seo: { ...t.seo, shareImage: null, canonicalURL: null, structuredData: null },
      };
      const doc = existing
        ? await app.documents(TYPE_UID).update({ documentId: existing.documentId, data, status: 'published' })
        : await app.documents(TYPE_UID).create({ data, status: 'published' });
      byEnum[t.enumValue] = doc.documentId;
      console.log(`  ${existing ? '↻' : '+'} ${t.name.padEnd(12)} /${t.slug}`);
    }

    // ── 2. Gán vào từng resource, suy từ enum cũ ──────────────────────────
    const resources = await app.documents(RESOURCE_UID).findMany({
      status: 'draft',
      pagination: { pageSize: 200 },
      populate: ['type'],
    });
    console.log(`\n${resources.length} resource`);

    const tally = {};
    for (const r of resources) {
      const target = byEnum[r.resourceType];
      if (!target) {
        console.log(`  ! ${r.slug} — resourceType lạ: ${r.resourceType}`);
        continue;
      }
      await app.documents(RESOURCE_UID).update({
        documentId: r.documentId,
        data: { type: { set: [target] } },
        status: 'published',
      });
      tally[r.resourceType] = (tally[r.resourceType] || 0) + 1;
    }
    console.log('  gán xong:', JSON.stringify(tally));
    console.log('\nDone.');
  } finally {
    await app.destroy();
  }
})();
