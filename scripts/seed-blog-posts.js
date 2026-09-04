'use strict';
/**
 * Seed 129 bài blog (trong số 141 "article pages" clone đã tải) vào content-type mới
 * `api::blog-post.blog-post` (xem src/api/blog-post/ — tạo mới, KHÔNG có trong seed.js gốc).
 * Nguồn: chinasourcing-clone/src/data/content/posts.json (title/slug/excerpt/date/content
 * đã có sẵn nguyên bản từ WordPress, featuredImage là path cục bộ /images/<file>).
 *
 * ⚠️ TẮT `npm run dev` trước khi chạy: node scripts/seed-blog-posts.js
 * ⚠️ Đây là content-type MỚI (đổi schema) — sau khi chạy xong và ok, phải deploy code này
 *    lên VPS SỚM (strapi-cns dùng chung DB với bản đã deploy) — xem cảnh báo trong plan.
 */
const path = require('path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { upsertBySlug } = require('./seed-lib');
const { uploadImage } = require('./media-lib');

const posts = require(path.join('..', '..', 'chinasourcing-clone', 'src', 'data', 'content', 'posts.json'));

async function openPublicPermissions(strapi) {
  const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!publicRole) return;
  let added = 0;
  for (const action of ['api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne']) {
    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { action, role: publicRole.id } });
    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({ data: { action, role: publicRole.id } });
      added++;
    }
  }
  console.log(`  • quyền Public cho blog-post: thêm ${added} permission`);
}

async function seedBlogPosts(strapi) {
  let ok = 0;
  for (const post of posts) {
    const filename = post.featuredImage ? path.basename(post.featuredImage) : null;
    const uploaded = filename ? await uploadImage(strapi, filename, { alt: post.featuredAlt || post.title }) : null;
    await upsertBySlug(strapi, 'api::blog-post.blog-post', post.slug, {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      publishedDate: post.date ? post.date.slice(0, 10) : null,
      featureImage: uploaded ? uploaded.id : null,
    });
    ok++;
    if (ok % 20 === 0) console.log(`  ... ${ok}/${posts.length}`);
  }
  console.log(`  • blog-post: ${ok}`);
}

module.exports = { seedBlogPosts, openPublicPermissions };

if (require.main === module) {
  (async () => {
    const app = await createStrapi(await compileStrapi()).load();
    try {
      console.log('\n=== SEED BLOG POSTS ===');
      await openPublicPermissions(app);
      await seedBlogPosts(app);
    } finally {
      await app.destroy();
    }
  })();
}
