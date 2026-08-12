'use strict';
/** Kiểm tra nhanh số lượng entry + single type sau khi seed. Chạy khi dev server ĐANG TẮT. */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const COLLECTIONS = ['product','service','case-study','resource','category','testimonial','team-member','partner-category','partner'];
const SINGLES = ['homepage','global','contact-dialog','about-us-page','products-page','product-setting',
 'services-page','service-setting','process-page','case-studies-page','case-study-setting','resources-page',
 'resource-setting','contact-page'];
(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n--- COLLECTION ---');
    for (const n of COLLECTIONS) {
      const uid = `api::${n}.${n}`;
      const all = await app.documents(uid).count({ status: 'draft' });
      const pub = await app.documents(uid).count({ status: 'published' });
      console.log(`${n.padEnd(18)} ${String(all).padStart(3)} entry (published: ${pub})`);
    }
    console.log('\n--- SINGLE TYPE ---');
    for (const n of SINGLES) {
      const uid = `api::${n}.${n}`;
      const d = await app.documents(uid).findFirst({ status: 'published' });
      console.log(`${n.padEnd(20)} ${d ? '✅ có dữ liệu (published)' : '❌ TRỐNG'}`);
    }
    const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
    const perms = await app.db.query('plugin::users-permissions.permission').count({ where: { role: role.id } });
    console.log(`\nPublic role: ${perms} permission`);
  } finally { await app.destroy(); }
})();
