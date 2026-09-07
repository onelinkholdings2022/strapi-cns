'use strict';
/**
 * `category` và `partner-category` là hai content type thiếu component
 * `shared.seo`. Những type còn lại không có (`*-setting`, `global`,
 * `contact-dialog`, `partner`, `team-member`, `testimonial`) chỉ là cấu hình
 * hoặc thực thể nhúng, không tự đứng thành trang, nên đúng là không cần.
 *
 * Script này lấp phần thiếu đó:
 *   1. `schema.json` của cả hai đã thêm `seo` (component `shared.seo`) —
 *      Strapi tự tạo bảng liên kết `*_cmps` khi boot, nên chỉ cần chạy script
 *      là schema được đồng bộ luôn.
 *   2. Điền `metaTitle` / `metaDescription` / `keywords` cho 10 category và
 *      7 partner-category.
 *
 * Nội dung dưới đây viết theo đúng những bài / nhóm nhà máy đang thuộc từng
 * mục (đếm tại thời điểm 2026-09-07), không phải copy từ site gốc:
 * chinasourcing.co dùng Rank Math và **loại trang category archive khỏi
 * sitemap**, danh sách category WordPress cũng khác hẳn 10 cái ở đây (chỉ 4/10
 * slug tồn tại bên đó), nên không có meta gốc để bê sang.
 *
 * `canonicalURL` và `shareImage` để trống: canonical do `src/lib/seo/metadata.ts`
 * bên frontend tự dựng từ URL phẳng, điền tay ở đây chỉ tổ lệch nhau. Điền vào
 * CMS khi nào cần trỏ sang một địa chỉ KHÁC với URL thật của trang.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/fix-category-seo.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const CATEGORY_UID = 'api::category.category';
const PARTNER_CATEGORY_UID = 'api::partner-category.partner-category';

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

// `partner-category` chỉ là tab lọc của dải logo "Our Factory Partners" (trang
// chủ + About) — không có trang riêng, không có route. SEO ở đây thuần để đủ bộ
// và để sẵn cho lúc dải logo tách thành trang thật; hiện chưa nơi nào đọc.
//
// ⚠️ 4/7 slug TRÙNG slug product (`gym-fitness`, `point-of-sale`,
// `hospitality-items`, `household-appliances`). Không sao vì partner-category
// không tham gia định tuyến — nhưng nếu sau này cho nó URL riêng thì phải đặt
// dưới tiền tố, đừng thả ra gốc.
const PARTNER_SEO = {
  'furniture-interior': {
    metaTitle: 'Furniture & Interior Factory Partners | China Sourcing Co',
    metaDescription:
      'Audited furniture and interior-fitout factories in our partner network — case goods, upholstery, joinery and hospitality interiors built to spec.',
    keywords: 'furniture factories china, interior fitout manufacturing, upholstery suppliers, joinery china',
  },
  'promotional-products': {
    metaTitle: 'Promotional Products Factory Partners | China Sourcing Co',
    metaDescription:
      'Factories in our network producing branded merchandise and corporate gifts — decoration methods, tooling and pack-out handled end to end.',
    keywords: 'promotional products china, corporate gifts manufacturing, branded merchandise suppliers',
  },
  'gym-fitness': {
    metaTitle: 'Gym & Fitness Factory Partners | China Sourcing Co',
    metaDescription:
      'Vetted manufacturers of gym and fitness equipment — racks, free weights, matting and studio fit-out, made to commercial load ratings.',
    keywords: 'gym equipment manufacturers china, fitness equipment suppliers, commercial gym fit out',
  },
  'point-of-sale': {
    metaTitle: 'Point of Sale Factory Partners | China Sourcing Co',
    metaDescription:
      'Partner factories for retail display and point-of-sale — counters, stands, shelving and in-store fixtures, prototyped and rolled out at scale.',
    keywords: 'point of sale displays china, retail display manufacturing, pos fixtures suppliers',
  },
  machinery: {
    metaTitle: 'Machinery Factory Partners | China Sourcing Co',
    metaDescription:
      'Industrial machinery and equipment makers in our partner network, vetted for build quality, certification and after-sales support.',
    keywords: 'machinery manufacturers china, industrial equipment suppliers, oem machinery sourcing',
  },
  'hospitality-items': {
    metaTitle: 'Hospitality Factory Partners | China Sourcing Co',
    metaDescription:
      'Suppliers for hotel, restaurant and venue fit-out — furniture, tableware, textiles and back-of-house equipment built for commercial use.',
    keywords: 'hospitality suppliers china, hotel furniture manufacturing, horeca sourcing',
  },
  'household-appliances': {
    metaTitle: 'Household Appliance Factory Partners | China Sourcing Co',
    metaDescription:
      'Appliance manufacturers in our network, vetted for electrical safety and market certification across the small and large appliance range.',
    keywords: 'appliance manufacturers china, small appliance oem, home appliance sourcing',
  },
};

/** Ghi SEO cho một collection, khớp theo slug. Trả về số bản ghi đã ghi. */
async function writeSeo(app, uid, table, label) {
  const rows = await app.documents(uid).findMany({
    status: 'draft',
    pagination: { pageSize: 200 },
    populate: ['seo'],
  });
  console.log(`\n${label} — ${rows.length} bản ghi`);

  let written = 0;
  for (const row of rows) {
    const seo = table[row.slug];
    if (!seo) {
      console.log(`  ! bỏ qua "${row.name}" (${row.slug}) — chưa có nội dung SEO`);
      continue;
    }
    await app.documents(uid).update({
      documentId: row.documentId,
      // Ghi đè hẳn component thay vì merge: seo đang null ở mọi bản ghi.
      data: { seo: { ...seo, shareImage: null, canonicalURL: null, structuredData: null } },
      status: 'published',
    });
    console.log(`  ✓ ${row.name.padEnd(22)} ${seo.metaTitle}`);
    written++;
  }

  const missing = Object.keys(table).filter((s) => !rows.some((r) => r.slug === s));
  if (missing.length) console.log(`  ! slug có trong script nhưng không có trong CMS: ${missing.join(', ')}`);
  return { written, total: rows.length };
}

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const a = await writeSeo(app, CATEGORY_UID, SEO, 'Category');
    const b = await writeSeo(app, PARTNER_CATEGORY_UID, PARTNER_SEO, 'Partner Category');
    console.log(`\nDone — category ${a.written}/${a.total}, partner-category ${b.written}/${b.total}.`);
  } finally {
    await app.destroy();
  }
})();
