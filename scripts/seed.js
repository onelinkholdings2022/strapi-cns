'use strict';
/**
 * Seed toàn bộ nội dung CNS từ folder setupCns vào Strapi.
 * ⚠️ TẮT `npm run dev` trước khi chạy: node scripts/seed.js
 * Không đụng tới bất kỳ field Media nào (ảnh gắn sau).
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { seedProducts, seedTestimonials } = require('./seed-collections');
const { seedServices, seedCaseStudies, seedResources, seedMisc } = require('./seed-collections2');
const { seedSingles } = require('./seed-singles');
const { seedHomepage, seedAboutUs } = require('./seed-home-about');

const PUBLIC_TYPES = [
  'api::homepage.homepage','api::global.global','api::contact-dialog.contact-dialog',
  'api::about-us-page.about-us-page','api::products-page.products-page','api::product-setting.product-setting',
  'api::services-page.services-page','api::service-setting.service-setting','api::process-page.process-page',
  'api::case-studies-page.case-studies-page','api::case-study-setting.case-study-setting',
  'api::resources-page.resources-page','api::resource-setting.resource-setting','api::contact-page.contact-page',
  'api::privacy-policy-page.privacy-policy-page',
  'api::category.category','api::resource.resource','api::resource-type.resource-type',
  'api::product.product','api::service.service',
  'api::case-study.case-study','api::testimonial.testimonial','api::partner.partner',
  'api::partner-category.partner-category','api::team-member.team-member',
];

async function openPublicPermissions(strapi) {
  const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!publicRole) { console.log('  ! không tìm thấy Public role'); return; }
  let added = 0;
  for (const uid of PUBLIC_TYPES) {
    const isSingle = strapi.contentType(uid).kind === 'singleType';
    const actions = isSingle ? ['find'] : ['find', 'findOne'];
    for (const action of actions) {
      const permAction = `${uid}.${action}`;
      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: { action: permAction, role: publicRole.id } });
      if (!existing) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { action: permAction, role: publicRole.id } });
        added++;
      }
    }
  }
  console.log(`  • quyền Public: thêm ${added} permission`);
}

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== SEED CNS ===');
    const productMap = await seedProducts(app);
    await seedTestimonials(app, productMap);
    const serviceMap = await seedServices(app);
    const caseStudyMap = await seedCaseStudies(app);
    const catMap = await seedResources(app);
    const teamIds = await seedMisc(app);
    await seedSingles(app, { productMap, caseStudyMap, serviceMap, catMap, teamIds });
    const cs3 = ['tag-apparel','prestige-residential','muscle-mat'].map(s => caseStudyMap[s]).filter(Boolean);
    const resDocs = await app.documents('api::resource.resource').findMany({
      filters: { slug: { $in: ['the-hidden-profit-leak-most-ecommerce-brands-ignore','incoterms-explained','intro-to-china-manufacturing'] } }, status: 'draft' });
    const ctx2 = { csRel: { connect: cs3 }, resRel: { connect: resDocs.map(r => r.documentId) }, teamIds };
    await seedHomepage(app, ctx2);
    await seedAboutUs(app, ctx2);
    await openPublicPermissions(app);
    console.log('=== XONG ===\n');
  } catch (e) {
    console.error('❌ SEED LỖI:', e.message);
    if (e.details) console.error(JSON.stringify(e.details, null, 2));
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
