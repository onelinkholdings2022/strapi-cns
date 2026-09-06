'use strict';
/**
 * 12/131 blog post không có `featureImage` trong Strapi, nên thẻ bài trên
 * `/resources` (và khối "Our Resources" ở các trang khác) rơi về ảnh fallback
 * cục bộ.
 *
 * Đối chiếu với listing thật (`/resources`): đúng 9 bài KHÔNG có ảnh — và thẻ
 * của chúng trên site gốc không render `<img>` nào cả, chứ không phải hiện ảnh
 * thay thế. 3 bài còn lại (nhóm furniture) có ảnh thật nhưng chưa import.
 *
 * Script này tải ảnh thật về `chinasourcing-clone/public/images` rồi upload vào
 * Media Library, và ĐỂ NULL cho 9 bài kia (component đã sửa để bỏ hẳn ảnh khi
 * không có, giống trang gốc).
 *
 * `/wp-json/wp/v2/media/<id>` trả `rest_forbidden` cho các bài này (và `_embed`
 * vì thế cũng rỗng), nên URL ảnh phải lấy từ `og:image` trên trang render — rồi
 * bỏ hậu tố `-{w}x{h}` để lên bản gốc nếu bản đó tồn tại. Lưu ý og:image rơi về
 * ảnh share mặc định của site khi bài KHÔNG có featured image, nên chỉ tin nó
 * cho những slug không nằm trong `NO_FEATURED_IMAGE`.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/fix-blogpost-feature-images.js
 */
const fs = require('fs');
const path = require('path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { ensureImage, CLONE_IMAGES_DIR } = require('./media-lib');

const BLOG_POST_UID = 'api::blog-post.blog-post';
const SITE = 'https://chinasourcing.co';

/** 9 slug mà listing gốc render thẻ KHÔNG có ảnh (đối chiếu HTML `/resources`). */
const NO_FEATURED_IMAGE = new Set([
  'strategic-sourcing-wholesale-office-furniture',
  'why-choosing-the-right-supply-chain-management-company-is-critical-for-businesses-onelink-holdings',
  'sourcing-and-manufacturing-products-in-asia-what-you-need-to-know-one-link-holdings',
  'the-rise-of-the-hm-empire-one-link-holdings',
  'manufacturing-in-vietnam-the-new-china-onelink-holdings',
  '5-tips-for-sourcing-products-for-your-business-onelink-holdings',
  'how-to-import-from-china-a-guide-for-australian-businesses-onelink-holdings',
  'the-benefits-of-working-with-a-freight-and-logistics-company-onelink-holdings',
  'onelink-holdings-guide-to-exporting-from-vietnam-to-australia-tariffs-and-charges-included',
]);

async function fetchLivePosts() {
  const all = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${SITE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed`);
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

/**
 * URL featured image: ưu tiên `_embed`, nếu WordPress chặn thì đọc `og:image`
 * trên trang render và thử nâng lên bản gốc (bỏ hậu tố `-{w}x{h}`).
 */
async function featuredImageUrl(post, slug) {
  const embedded = post?._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (embedded) return embedded;
  if (!post?.featured_media) return null;

  const res = await fetch(`${SITE}/${slug}/`);
  if (!res.ok) return null;
  const html = await res.text();
  const og = html.match(/<meta property="og:image" content="([^"]+)"/i);
  if (!og) return null;

  const full = og[1].replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  if (full !== og[1]) {
    const head = await fetch(full, { method: 'HEAD' });
    if (head.ok) return full;
  }
  return og[1];
}

/** Tải 1 URL về public/images nếu chưa có, trả về tên file. */
async function download(url) {
  const filename = decodeURIComponent(url.split('/').pop());
  const dest = path.join(CLONE_IMAGES_DIR, filename);
  if (!fs.existsSync(dest)) {
    const res = await fetch(url);
    if (!res.ok) return null;
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`  ↓ ${filename}`);
  }
  return filename;
}

async function main() {
  console.log('\n=== Fetching live posts ===');
  const live = await fetchLivePosts();
  const bySlug = new Map(live.map((p) => [p.slug, p]));
  console.log(`  ${live.length} post`);

  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== FIX BLOG-POST FEATURE IMAGES ===');
    const posts = await app.documents(BLOG_POST_UID).findMany({
      status: 'draft',
      pagination: { pageSize: 500 },
      populate: ['featureImage'],
    });
    // Gồm cả bài đã bị gán nhầm ảnh thay thế ở lần chạy trước (og:image rơi về
    // ảnh share mặc định của site) — chúng phải được trả về null.
    const missing = posts.filter(
      (p) => !p.featureImage || p.featureImage.name === 'blog-fallback.webp' || NO_FEATURED_IMAGE.has(p.slug)
    );
    console.log(`  ${posts.length} post, ${missing.length} cần xử lý`);

    let fixed = 0;
    let cleared = 0;

    for (const post of missing) {
      if (NO_FEATURED_IMAGE.has(post.slug)) {
        if (post.featureImage) {
          await app.documents(BLOG_POST_UID).update({
            documentId: post.documentId,
            data: { featureImage: null },
            status: 'published',
          });
          console.log(`  ∅ ${post.slug} — site gốc không có ảnh`);
        }
        cleared++;
        continue;
      }
      const url = await featuredImageUrl(bySlug.get(post.slug), post.slug);
      const filename = url ? await download(url) : null;
      const uploaded = filename ? await ensureImage(app, filename, { alt: post.title }) : null;
      if (!uploaded) {
        console.log(`  ! không lấy được ảnh cho ${post.slug}`);
        continue;
      }
      await app.documents(BLOG_POST_UID).update({
        documentId: post.documentId,
        data: { featureImage: uploaded.id },
        status: 'published',
      });
      fixed++;
      console.log(`  ✓ ${post.slug}`);
    }
    console.log(`\nDone. ảnh thật: ${fixed}, để trống đúng bản gốc: ${cleared}`);
  } finally {
    await app.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
