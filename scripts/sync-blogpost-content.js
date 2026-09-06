'use strict';
/**
 * v2 — sửa lỗi của bản đầu: bản đầu lấy `content` từ REST API
 * (`/wp-json/wp/v2/posts`), nhưng REST API KHÔNG có markup TOC
 * (`ez-toc-section`) — filter đó chỉ chạy khi WordPress render trang thật.
 * Kết quả là bản sync đầu XOÁ MẤT markup TOC của 16 bài từng có đúng, thay vì
 * chỉ bổ sung TOC cho các bài thiếu. Bản này fetch từng trang blog thật
 * (`https://chinasourcing.co/<slug>/`) và bóc khối `.rich-text` bên trong
 * `#post-content-container` — xem `scripts/lib/extract-rich-text.js`.
 *
 * ⚠️ TẮT `npm run dev`/`strapi develop` trước khi chạy:
 *   node scripts/sync-blogpost-content.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { extractRichText } = require('./lib/extract-rich-text');

const BLOG_POST_UID = 'api::blog-post.blog-post';
const SITE = 'https://chinasourcing.co';
const CONCURRENCY = 6;

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== SYNC BLOG-POST CONTENT (rendered page, v2) ===');
    const posts = await app.documents(BLOG_POST_UID).findMany({
      pagination: { pageSize: 200 },
      status: 'draft',
    });
    console.log(`  ${posts.length} blog-post trong Strapi`);

    let updated = 0;
    let failed = 0;
    let unchanged = 0;

    await mapLimit(posts, CONCURRENCY, async (post) => {
      const url = `${SITE}/${post.slug}/`;
      let html;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.log(`  ! HTTP ${res.status} cho ${post.slug}`);
          failed++;
          return;
        }
        html = await res.text();
      } catch (e) {
        console.log(`  ! lỗi fetch ${post.slug}: ${e.message}`);
        failed++;
        return;
      }

      const rich = extractRichText(html);
      if (!rich) {
        console.log(`  ! không bóc được rich-text cho ${post.slug}`);
        failed++;
        return;
      }

      if (rich === post.content) {
        unchanged++;
        return;
      }

      await app.documents(BLOG_POST_UID).update({
        documentId: post.documentId,
        data: { content: rich },
        status: 'published',
      });
      updated++;
    });

    console.log(`\nDone. updated: ${updated}, unchanged: ${unchanged}, failed: ${failed}`);
  } finally {
    await app.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
