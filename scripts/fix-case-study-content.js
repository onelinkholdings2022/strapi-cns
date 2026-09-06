'use strict';
/**
 * 11/14 case study chỉ có `title` + `description` + `featureImage` — thiếu toàn
 * bộ phần thân trang mà site gốc render: `region`/`industry` (2 trong 3 ô meta
 * của hero), khối "What We Do" (tag + mô tả + 4 highlight có icon), và 2 khối
 * "The Challenge"/"The Solution" (tag + rich text kèm ảnh minh hoạ).
 * 3 case study còn lại (prestige-residential, tag-apparel, muscle-mat) có chữ
 * nhưng thiếu `whatWeDoTag` và icon của highlight, và rich text bị bỏ mất ảnh.
 *
 * Nội dung lấy nguyên văn từ trang sống chinasourcing.co/case-study/<slug>/
 * (đã scrape sẵn -> `case-study-content-data.json`).
 *
 * Ảnh trong rich text: site gốc trỏ tới /wp-content/uploads/... Ở đây upload
 * lên Media Library rồi viết lại `src` thành đường dẫn TƯƠNG ĐỐI `/uploads/…`,
 * để frontend tự ghép `NEXT_PUBLIC_STRAPI_URL` (xem `resolveContentMedia()`
 * trong src/lib/views/textUtils.ts) — không hardcode host vào DB.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/fix-case-study-content.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { ensureImage } = require('./media-lib');
const { tag } = require('./seed-lib');

const CASE_STUDY_UID = 'api::case-study.case-study';
const DATA = require('./case-study-content-data.json');

/** `<img src="/images/x.png">` -> `<img src="/uploads/x_hash.webp">`. */
async function rewriteImages(app, html) {
  const names = [...new Set([...html.matchAll(/src="\/images\/([^"]+)"/g)].map((m) => m[1]))];
  let out = html;
  for (const name of names) {
    const media = await ensureImage(app, name, { alt: '' });
    if (!media) throw new Error(`không upload được ${name}`);
    out = out.split(`/images/${name}`).join(media.url);
  }
  return out;
}

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== FIX CASE STUDY CONTENT ===');
    for (const [slug, c] of Object.entries(DATA)) {
      const found = await app.documents(CASE_STUDY_UID).findFirst({
        filters: { slug: { $eq: slug } },
        status: 'draft',
      });
      if (!found) {
        console.log(`  ! không thấy case study slug=${slug}`);
        continue;
      }
      console.log(`\n• ${slug}`);

      const highlights = [];
      for (const h of c.highlights) {
        const icon = await ensureImage(app, h.icon, { alt: '' });
        highlights.push({ title: h.title, description: h.description, icon: icon.id });
      }

      await app.documents(CASE_STUDY_UID).update({
        documentId: found.documentId,
        data: {
          region: c.region,
          industry: c.industry,
          service: c.service,
          whatWeDoTag: tag(c.whatWeDoTag),
          whatWeDoDescription: c.whatWeDoDescription,
          highlights,
          challengeTag: tag(c.challengeTag),
          challengeContent: await rewriteImages(app, c.challengeContent),
          solutionTag: tag(c.solutionTag),
          solutionContent: await rewriteImages(app, c.solutionContent),
        },
        status: 'published',
      });
      console.log(`  ✓ ${highlights.length} highlight, region=${c.region}, industry=${c.industry}`);
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
