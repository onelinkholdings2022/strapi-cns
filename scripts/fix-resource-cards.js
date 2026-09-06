'use strict';
/**
 * Khối `.resource-card` ("Our Resources — Resources to Get Started" trên
 * `/services`, "Our Resources — Related Resource" trên trang service) đang trỏ
 * SAI bài.
 *
 * Site gốc trộn 2 loại bài trong một hàng ba thẻ:
 *   `/services`        -> 3 blog post (không có resource nào)
 *   `/service/<slug>`  -> 2 resource + 1 blog post (giống nhau cả 4 trang)
 * còn Strapi mới chỉ có quan hệ tới `resource`, nên cả hai chỗ đều đang render
 * 3 resource — sai bài, sai luôn dòng "Blog" + ngày + thời gian đọc.
 *
 * Script này:
 *   1. Import các blog post site gốc đã đăng mà Strapi còn thiếu (nội dung lấy
 *      từ trang render thật, không phải REST — xem lib/extract-rich-text.js).
 *   2. Nối `featuredBlogPosts` (quan hệ vừa thêm vào `sections.featured-resources`)
 *      và chỉnh lại `featuredResources` cho khớp trang gốc.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/fix-resource-cards.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { extractRichText } = require('./lib/extract-rich-text');
const { ensureImage } = require('./media-lib');

const BLOG_POST_UID = 'api::blog-post.blog-post';
const CATEGORY_UID = 'api::category.category';
const SERVICES_PAGE_UID = 'api::services-page.services-page';
const SERVICE_SETTING_UID = 'api::service-setting.service-setting';
const RESOURCE_UID = 'api::resource.resource';
const SITE = 'https://chinasourcing.co';

// Đúng thứ tự site gốc render (xem HTML của từng trang).
const SERVICES_PAGE_POSTS = [
  'how-to-choose-best-china-sourcing-agent',
  '10-best-e-commerce-platforms-for-small-businesses-onelink-holdings',
  '10-common-mistakes-to-avoid-in-product-sourcing-and-manufacturing',
];
const SERVICE_DETAIL_RESOURCES = ['the-hidden-profit-leak-most-ecommerce-brands-ignore', 'incoterms-explained'];
const SERVICE_DETAIL_POSTS = ['building-agile-supply-chains-optimizing-global-sourcing-for-a-resilient-future'];

function decodeEntities(s) {
  return String(s || '')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ');
}

const stripTags = (s) => decodeEntities(String(s || '').replace(/<[^>]+>/g, '')).trim();

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

/** Tải ảnh featured của WordPress về Media Library (qua public/images như mọi ảnh khác). */
async function importFeaturedImage(app, post, fs, path, CLONE_IMAGES_DIR) {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const url = media?.source_url;
  if (!url) return null;
  const filename = url.split('/').pop();
  const dest = path.join(CLONE_IMAGES_DIR, filename);
  if (!fs.existsSync(dest)) {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  ! không tải được ảnh ${url}`);
      return null;
    }
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`  ↓ tải ${filename} về public/images`);
  }
  const uploaded = await ensureImage(app, filename, { alt: stripTags(post.title?.rendered) });
  return uploaded?.id ?? null;
}

async function main() {
  const fs = require('fs');
  const path = require('path');
  const { CLONE_IMAGES_DIR } = require('./media-lib');

  console.log('\n=== Fetching live posts ===');
  const livePosts = await fetchLivePosts();
  console.log(`  ${livePosts.length} post trên site gốc`);

  const app = await createStrapi(await compileStrapi()).load();
  try {
    // ── 1. Import blog post còn thiếu ────────────────────────────────────────
    console.log('\n[1] Blog post còn thiếu');
    const existing = await app.documents(BLOG_POST_UID).findMany({
      fields: ['slug'],
      status: 'draft',
      pagination: { pageSize: 500 },
    });
    const haveSlugs = new Set(existing.map((p) => p.slug));
    const missing = livePosts.filter((p) => !haveSlugs.has(p.slug));
    console.log(`  ${existing.length} có sẵn, ${missing.length} thiếu`);

    const categories = await app.documents(CATEGORY_UID).findMany({ pagination: { pageSize: 100 } });
    const categoryIdByName = new Map(categories.map((c) => [c.name, c.documentId]));

    for (const post of missing) {
      const pageRes = await fetch(`${SITE}/${post.slug}/`);
      const rich = pageRes.ok ? extractRichText(await pageRes.text()) : null;
      if (!rich) {
        console.log(`  ! không bóc được nội dung cho ${post.slug} — bỏ qua`);
        continue;
      }
      const terms = post._embedded?.['wp:term'] || [];
      const blogType = terms.find((t) => t[0] && t[0].taxonomy === 'blog-type') || [];
      const categoryIds = blogType.map((t) => categoryIdByName.get(decodeEntities(t.name))).filter(Boolean);

      await app.documents(BLOG_POST_UID).create({
        data: {
          title: stripTags(post.title?.rendered),
          slug: post.slug,
          excerpt: stripTags(post.excerpt?.rendered),
          content: rich,
          publishedDate: post.date?.slice(0, 10) ?? null,
          gated: true, // đồng bộ với set-blogpost-gated.js
          featureImage: await importFeaturedImage(app, post, fs, path, CLONE_IMAGES_DIR),
          ...(categoryIds.length ? { categories: categoryIds } : {}),
        },
        status: 'published',
      });
      console.log(`  ✓ import ${post.slug}`);
    }

    // ── 2. Nối lại khối resource-card ────────────────────────────────────────
    const byBlogSlug = new Map(
      (
        await app.documents(BLOG_POST_UID).findMany({
          fields: ['slug'],
          status: 'draft',
          pagination: { pageSize: 500 },
        })
      ).map((p) => [p.slug, p.documentId])
    );
    const byResourceSlug = new Map(
      (
        await app.documents(RESOURCE_UID).findMany({ fields: ['slug'], status: 'draft', pagination: { pageSize: 100 } })
      ).map((r) => [r.slug, r.documentId])
    );

    const ids = (map, slugs, label) =>
      slugs.map((s) => {
        const id = map.get(s);
        if (!id) throw new Error(`không thấy ${label} slug=${s}`);
        return id;
      });

    console.log('\n[2] services-page.resources -> 3 blog post');
    const svcPage = await app.documents(SERVICES_PAGE_UID).findFirst({
      status: 'draft',
      populate: { resources: { populate: ['tag', 'viewAllButton'] } },
    });
    if (svcPage?.resources) {
      await app.documents(SERVICES_PAGE_UID).update({
        documentId: svcPage.documentId,
        data: {
          resources: {
            ...svcPage.resources,
            featuredResources: [],
            featuredBlogPosts: ids(byBlogSlug, SERVICES_PAGE_POSTS, 'blog-post'),
          },
        },
        status: 'published',
      });
      console.log(`  ✓ ${SERVICES_PAGE_POSTS.length} blog post`);
    }

    console.log('\n[3] service-setting.relatedResources -> 2 resource + 1 blog post');
    const setting = await app.documents(SERVICE_SETTING_UID).findFirst({
      status: 'draft',
      populate: { relatedResources: { populate: ['tag', 'viewAllButton'] } },
    });
    if (setting?.relatedResources) {
      await app.documents(SERVICE_SETTING_UID).update({
        documentId: setting.documentId,
        data: {
          relatedResources: {
            ...setting.relatedResources,
            featuredResources: ids(byResourceSlug, SERVICE_DETAIL_RESOURCES, 'resource'),
            featuredBlogPosts: ids(byBlogSlug, SERVICE_DETAIL_POSTS, 'blog-post'),
          },
        },
        status: 'published',
      });
      console.log('  ✓ 2 resource + 1 blog post');
    }

    console.log('\nDone.');
  } finally {
    await app.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
