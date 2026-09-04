'use strict';
/** Đếm nhanh số entry đã có media sau khi chạy attach-media.js / seed-gaps.js / seed-blog-posts.js. */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const checks = [
      ['api::product.product', 'cardImage', 15],
      ['api::service.service', 'cardImage', 4],
      ['api::case-study.case-study', 'featureImage', 14],
      ['api::resource.resource', 'featureImage', 8],
      ['api::team-member.team-member', 'photo', 16],
      ['api::testimonial.testimonial', 'image', 30],
      ['api::partner.partner', 'logo', 42],
      ['api::blog-post.blog-post', 'featureImage', 129],
    ];
    console.log('\n--- COLLECTION MEDIA ---');
    for (const [uid, field, expected] of checks) {
      const all = await app.documents(uid).count({ status: 'published' });
      const withMedia = await app.documents(uid).count({
        status: 'published',
        filters: { [field]: { id: { $notNull: true } } },
      });
      console.log(`${uid.padEnd(32)} ${String(all).padStart(3)} entry, ${String(withMedia).padStart(3)} có ${field} (kỳ vọng ${expected})`);
    }

    console.log('\n--- SINGLETON hero/page-hero image ---');
    const singles = [
      ['api::homepage.homepage', 'hero', 'posterImage'],
      ['api::about-us-page.about-us-page', 'hero', 'image'],
      ['api::products-page.products-page', 'hero', 'image'],
      ['api::services-page.services-page', 'hero', 'image'],
      ['api::process-page.process-page', 'hero', 'image'],
      ['api::case-studies-page.case-studies-page', 'hero', 'image'],
      ['api::resources-page.resources-page', 'hero', 'image'],
      ['api::contact-page.contact-page', 'hero', 'image'],
    ];
    for (const [uid, comp, field] of singles) {
      const doc = await app.documents(uid).findFirst({ status: 'published', populate: { [comp]: { populate: [field] } } });
      const has = doc && doc[comp] && doc[comp][field];
      console.log(`${uid.padEnd(42)} ${comp}.${field}: ${has ? '✅ id ' + doc[comp][field].id : '❌ TRỐNG'}`);
    }

    const globalDoc = await app.documents('api::global.global').findFirst({
      status: 'published',
      populate: { footer: { populate: ['socialMedia'] } },
    });
    const socialWithIcon = (globalDoc?.footer?.socialMedia || []).filter((s) => s.icon).length;
    console.log(`global.footer.socialMedia: ${socialWithIcon}/${(globalDoc?.footer?.socialMedia || []).length} có icon`);
  } finally {
    await app.destroy();
  }
})();
