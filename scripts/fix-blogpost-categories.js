'use strict';
/**
 * blog-post không có category trên site gốc qua field REST chuẩn, nhưng có 1
 * taxonomy riêng "blog-type" (embed qua `_embed` + `wp:term`) map đúng 1:1 với
 * tên các `api::category.category` đã có sẵn (Manufacturing, Ecommerce,
 * Sourcing Guide, Freight & Logistics, Market insights, Product Guide, Canton
 * Fair, Wholesale Furniture, Basic Blog Functions) — đây chính là tab lọc hiện
 * trên `/resources` phần "Sourcing Insights" mà bản clone đang thiếu (chỉ có
 * "All"). Field `categories` mới thêm vào schema blog-post + reverse `blogPosts`
 * trên schema category (xem git diff cùng lúc với script này).
 *
 * ⚠️ TẮT `npm run dev`/`strapi develop` trước khi chạy:
 *   node scripts/fix-blogpost-categories.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const BLOG_POST_UID = 'api::blog-post.blog-post';
const CATEGORY_UID = 'api::category.category';
const SITE = 'https://chinasourcing.co';

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”');
}

async function fetchAllPosts() {
  let all = [];
  let page = 1;
  for (;;) {
    const res = await fetch(
      `${SITE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed&_fields=slug,_links,_embedded`
    );
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < 100) break;
    page++;
  }
  return all;
}

async function main() {
  console.log('\n=== Fetching blog-type taxonomy from live site ===');
  const livePosts = await fetchAllPosts();
  console.log(`  fetched ${livePosts.length} posts from ${SITE}`);

  const slugToCats = new Map();
  for (const p of livePosts) {
    const terms = (p._embedded && p._embedded['wp:term']) || [];
    const blogTypeGroup = terms.find((t) => t[0] && t[0].taxonomy === 'blog-type') || [];
    const names = blogTypeGroup.map((t) => decodeEntities(t.name));
    if (names.length) slugToCats.set(p.slug, names);
  }
  console.log(`  ${slugToCats.size}/${livePosts.length} posts có blog-type`);

  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== FIX BLOG-POST CATEGORIES ===');
    const categories = await app.documents(CATEGORY_UID).findMany({ pagination: { pageSize: 100 } });
    const categoryIdByName = new Map(categories.map((c) => [c.name, c.documentId]));

    const posts = await app.documents(BLOG_POST_UID).findMany({
      pagination: { pageSize: 200 },
      status: 'draft',
      populate: ['categories'],
    });
    console.log(`  ${posts.length} blog-post trong Strapi`);

    let updated = 0;
    let noMatch = 0;
    for (const post of posts) {
      const wantNames = slugToCats.get(post.slug);
      if (!wantNames || !wantNames.length) continue;

      const wantIds = wantNames
        .map((n) => categoryIdByName.get(n))
        .filter(Boolean);
      if (!wantIds.length) {
        console.log(`  ! không khớp category cho slug=${post.slug} (muốn: ${wantNames.join(', ')})`);
        noMatch++;
        continue;
      }

      const currentIds = (post.categories || []).map((c) => c.documentId);
      const same = currentIds.length === wantIds.length && wantIds.every((id) => currentIds.includes(id));
      if (same) continue;

      await app.documents(BLOG_POST_UID).update({
        documentId: post.documentId,
        data: { categories: { disconnect: currentIds, connect: wantIds } },
        status: 'published',
      });
      updated++;
    }
    console.log(`\nDone. updated: ${updated}, no-match: ${noMatch}, unchanged/no-term: ${posts.length - updated - noMatch}`);
  } finally {
    await app.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
