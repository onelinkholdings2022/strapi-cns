'use strict';
/**
 * `api::category.category` là content type DUY NHẤT có URL/nội dung riêng mà
 * thiếu component `shared.seo` — 8 collection/single type còn lại (blog-post,
 * resource, case-study, product, service và các trang) đều đã có. Các type
 * không có là `*-setting`, `global`, `contact-dialog`, `partner`,
 * `partner-category`, `team-member`, `testimonial`: chúng chỉ là cấu hình hoặc
 * thực thể nhúng, không tự đứng thành trang, nên đúng là không cần.
 *
 * Script này lấp phần thiếu đó:
 *   1. `schema.json` của category đã thêm `seo` (component `shared.seo`) —
 *      Strapi tự tạo bảng liên kết `categories_cmps` khi boot, nên chỉ cần
 *      chạy script là schema được đồng bộ luôn.
 *   2. Điền `metaTitle` / `metaDescription` / `keywords` cho cả 10 category.
 *
 * Nội dung dưới đây viết theo đúng những bài đang thuộc từng category (đếm tại
 * thời điểm 2026-09-07), không phải copy từ site gốc: chinasourcing.co dùng
 * Rank Math và **loại trang category archive khỏi sitemap**, danh sách category
 * WordPress cũng khác hẳn 10 cái ở đây (chỉ 4/10 slug tồn tại bên đó), nên
 * không có meta gốc để bê sang.
 *
 * `canonicalURL` và `shareImage` cố tình để trống: clone chưa có route
 * `/category/<slug>` nào — tab lọc trên `/resources` là client-side thuần, không
 * đổi URL — nên trỏ canonical vào một địa chỉ không tồn tại sẽ hại hơn là không
 * khai báo. Khi nào có route thật thì điền sau.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/fix-category-seo.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const CATEGORY_UID = 'api::category.category';

// slug -> { metaTitle, metaDescription, keywords }
const SEO = {
  'basic-blog-functions': {
    metaTitle: 'China Sourcing Basics | China Sourcing Co',
    metaDescription:
      'Start-here guides to sourcing from China: how to find and vet factories, build a wholesale supplier list, pick the right manufacturing hub and choose a sourcing agent.',
    keywords:
      'sourcing from china, china manufacturers, wholesale suppliers china, sourcing hubs china, china sourcing agent',
  },
  'canton-fair': {
    metaTitle: 'Canton Fair Guides | China Sourcing Co',
    metaDescription:
      'Everything importers need for the Canton Fair: registration, visas, what each of the three phases covers, and how to work the complex without wasting a day.',
    keywords:
      'canton fair, canton fair 2026, canton fair registration, canton fair phases, guangzhou trade show',
  },
  ecommerce: {
    metaTitle: 'Ecommerce Sourcing | China Sourcing Co',
    metaDescription:
      'Sourcing, shipping and fulfilment advice for online sellers — platform choices, international supplier trade-offs and getting stock to customers on time.',
    keywords:
      'ecommerce sourcing, ecommerce fulfilment, dropshipping alternatives, online store suppliers, product sourcing ecommerce',
  },
  'freight-logistics': {
    metaTitle: 'Freight & Logistics | China Sourcing Co',
    metaDescription:
      'How freight out of Asia actually prices and moves: what makes up a rate, which mistakes cost importers the most, and how to plan a shipment that lands on schedule.',
    keywords:
      'freight rates, china freight forwarding, sea freight asia, air freight china, import logistics',
  },
  'logistics-tips': {
    metaTitle: 'Sourcing Templates & Checklists | China Sourcing Co',
    metaDescription:
      'Free downloads for importers — RFQ and requirements templates, supplier outreach scripts, factory vetting and QC inspection checklists, Incoterms and timeline guides.',
    keywords:
      'rfq template, supplier checklist, qc inspection checklist, incoterms guide, sourcing timeline template',
  },
  manufacturing: {
    metaTitle: 'China Manufacturing | China Sourcing Co',
    metaDescription:
      "Inside China's manufacturing base: the infrastructure behind it, how to work with factories day to day, sustainable production, and the mistakes that derail a first order.",
    keywords:
      'china manufacturing, chinese factories, sustainable manufacturing, product manufacturing china, working with manufacturers',
  },
  'market-insights': {
    metaTitle: 'Market Insights | China Sourcing Co',
    metaDescription:
      'Where Asian manufacturing is heading — output data, tariff and trade-tension fallout, and the shifts in supply chains that change what buyers should be doing now.',
    keywords:
      'china manufacturing outlook, us china trade, supply chain trends asia, sourcing market insights, manufacturing data china',
  },
  'product-guide': {
    metaTitle: 'Product Guides | China Sourcing Co',
    metaDescription:
      'Category-by-category buying guides, with packaging covered in depth: choosing materials and solutions, meeting compliance, and keeping quality consistent at volume.',
    keywords:
      'wholesale packaging china, packaging materials, packaging compliance, product sourcing guide, packaging quality control',
  },
  'sourcing-guide': {
    metaTitle: 'Sourcing Guides by Category | China Sourcing Co',
    metaDescription:
      'How to source a specific category from China — electronics, packaging, building materials and furniture — including supplier vetting, IP risk and getting the price right.',
    keywords:
      'electronics sourcing china, packaging sourcing, building materials china, furniture sourcing agent, supplier vetting',
  },
  'wholesale-furniture': {
    metaTitle: 'Wholesale Furniture Sourcing | China Sourcing Co',
    metaDescription:
      'The deepest section on the blog: furniture manufacturing hubs beyond Foshan, factory audits, FSC and CARB P2 certification, landed-cost maths and container planning.',
    keywords:
      'wholesale furniture china, furniture sourcing, foshan furniture, furniture factory audit, carb p2 fsc certification, landed cost furniture',
  },
};

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const cats = await app.documents(CATEGORY_UID).findMany({
      status: 'draft',
      pagination: { pageSize: 200 },
      populate: ['seo'],
    });
    console.log(`  ${cats.length} category trong CMS\n`);

    let written = 0;
    for (const cat of cats) {
      const seo = SEO[cat.slug];
      if (!seo) {
        console.log(`  ! bỏ qua "${cat.name}" (${cat.slug}) — chưa có nội dung SEO`);
        continue;
      }
      await app.documents(CATEGORY_UID).update({
        documentId: cat.documentId,
        // Ghi đè hẳn component thay vì merge: seo hiện đang null ở cả 10 bản ghi.
        data: { seo: { ...seo, shareImage: null, canonicalURL: null, structuredData: null } },
        status: 'published',
      });
      console.log(`  ✓ ${cat.name.padEnd(22)} ${seo.metaTitle}`);
      written++;
    }

    const missing = Object.keys(SEO).filter((s) => !cats.some((c) => c.slug === s));
    if (missing.length) console.log(`\n  ! slug có trong script nhưng không có trong CMS: ${missing.join(', ')}`);

    console.log(`\nDone — ${written}/${cats.length} category đã có SEO.`);
  } finally {
    await app.destroy();
  }
})();
