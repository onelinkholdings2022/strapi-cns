'use strict';
/**
 * v2 — cùng lý do với sync-blogpost-content.js: REST API không có markup TOC,
 * phải fetch trang `/resource/<slug>/` thật và bóc `.rich-text`.
 * 4 slug tự thêm trong Strapi (không tồn tại trên site gốc) sẽ 404 và bị bỏ
 * qua — đúng như kỳ vọng.
 *
 * ⚠️ TẮT `npm run dev`/`strapi develop` trước khi chạy:
 *   node scripts/sync-resource-content.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { extractRichText } = require('./lib/extract-rich-text');

const RESOURCE_UID = 'api::resource.resource';
const SITE = 'https://chinasourcing.co';

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== SYNC RESOURCE CONTENT (rendered page, v2) ===');
    const resources = await app.documents(RESOURCE_UID).findMany({
      pagination: { pageSize: 100 },
      status: 'draft',
    });
    console.log(`  ${resources.length} resource trong Strapi`);

    let updated = 0;
    let notFound = 0;
    let unchanged = 0;

    for (const r of resources) {
      const url = `${SITE}/resource/${r.slug}/`;
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`  - ${r.slug}: HTTP ${res.status} (không tồn tại trên site gốc, bỏ qua)`);
        notFound++;
        continue;
      }
      const html = await res.text();
      const rich = extractRichText(html);
      if (!rich) {
        console.log(`  ! không bóc được rich-text cho ${r.slug}`);
        continue;
      }
      if (rich === r.content) {
        unchanged++;
        continue;
      }
      await app.documents(RESOURCE_UID).update({
        documentId: r.documentId,
        data: { content: rich },
        status: 'published',
      });
      updated++;
      console.log(`  • ${r.slug} — content updated`);
    }
    console.log(`\nDone. updated: ${updated}, not on live site: ${notFound}, unchanged: ${unchanged}`);
  } finally {
    await app.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
