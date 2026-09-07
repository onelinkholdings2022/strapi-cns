'use strict';
/**
 * Điền `shared.seo` cho TOÀN BỘ nội dung: `global.defaultSeo`, 8 single type
 * trang, 15 product, 4 service, 14 case study, 12 resource, 131 blog post.
 *
 * Trước script này mọi field `seo` trong CMS đều `null`, nên frontend không có
 * gì để đọc và phải suy `<title>` từ nội dung. Giờ CMS là nguồn thật:
 * `src/lib/seo/metadata.ts` bên chinasourcing-clone đọc trang → `global.defaultSeo`
 * → mới đến suy từ nội dung.
 *
 * ## Nguồn dữ liệu
 *
 * `seo-import-data.json` là bản cào `<title>` + `<meta description>` của chính
 * chinasourcing.co (Rank Math), 180/184 URL trả 200. Bốn URL 404 là resource
 * site gốc chưa từng đăng.
 *
 * ## Vì sao phần lớn `metaDescription` là null trong file đó
 *
 * Site gốc để nguyên **mặc định của Rank Math cho từng post type** ở hầu hết
 * trang chi tiết — nguyên văn, kể cả lỗi chính tả:
 *
 *   "This is the meta descrtiption for the Products"   (15/15 product)
 *   "This is the meta descrtiption for the Services"   (4/4 service)
 *   "This is the meta descrtiption for the Resources"  (8/8 resource)
 *   "Dummy case study 6"                               (14/14 case study)
 *   "This is the default meta description for the Posts" (68/131 blog)
 *
 * Bê nguyên sang là tự tay đặt một chuỗi placeholder có lỗi chính tả làm mô tả
 * tìm kiếm cho 45 trang. Nên chúng bị LOẠI khi dựng file, và script tự suy mô tả
 * từ nội dung thật của bản ghi (hero/card description, excerpt, đoạn đầu bài).
 * `<title>` thì ngược lại — 180/180 đều là chuỗi thật, lấy hết.
 *
 * 72 mô tả THẬT (8 trang + 63 blog post + 1 product) được giữ nguyên văn.
 *
 * ## shareImage / keywords / canonicalURL
 *
 * Không đụng tới:
 *   • `shareImage` — `og:image` của site gốc trỏ vào uploads của WordPress, ảnh
 *     đó không có trong Media Library. Bỏ trống thì `buildMetadata` bên frontend
 *     tự lùi về ảnh của chính bản ghi (featureImage/heroImage) — đúng ảnh, và
 *     không phải nhân đôi 180 file.
 *   • `keywords` — site gốc không phát `<meta name="keywords">` ở đâu cả.
 *   • `canonicalURL` — frontend dựng từ URL phẳng. Chỉ điền khi cần trỏ sang
 *     một địa chỉ KHÁC với URL thật của trang.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/import-seo.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const DATA = require('./seo-import-data.json');

/** Độ dài mô tả tìm kiếm. Google cắt quanh 155-160 ký tự. */
const DESC_LIMIT = 155;

function decodeEntities(s) {
  return String(s || '')
    .replace(/&#0?38;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Rich text của Strapi ở đây là chuỗi HTML; blocks thì là mảng node. */
function toText(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    return decodeEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
  }
  if (Array.isArray(value)) {
    return value
      .map((node) => (node?.children || []).map((c) => c?.text || '').join(''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return '';
}

/** Cắt ở khoảng trắng gần nhất, không cắt giữa từ. */
function clamp(text, limit = DESC_LIMIT) {
  const t = toText(text);
  if (!t) return null;
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  const space = cut.lastIndexOf(' ');
  return (space > 40 ? cut.slice(0, space) : cut).replace(/[,;:.\s]+$/, '') + '...';
}

/**
 * Mô tả suy từ nội dung, theo thứ tự "câu nào mô tả bản ghi này rõ nhất".
 *
 * Mỗi loại có một chuỗi field khác nhau vì mô hình nội dung khác nhau — product
 * và service có sẵn câu giới thiệu ngắn ở hero, case study có `description`,
 * còn resource/blog thì phải lấy từ excerpt hoặc thân bài.
 */
const DERIVE = {
  product: (r) => r.heroDescription || r.cardDescription || r.sourceDescription,
  service: (r) => r.heroDescription || r.cardDescription,
  'case-study': (r) => r.description || r.whatWeDoDescription,
  resource: (r) => r.content,
  blog: (r) => r.excerpt || r.content,
};

const SINGLE_UID = DATA._uid.singles;
const COLLECTION_UID = DATA._uid.collections;

/** Ghi `seo`, giữ nguyên các field script này không quản. */
async function writeSeo(app, uid, doc, metaTitle, metaDescription) {
  await app.documents(uid).update({
    documentId: doc.documentId,
    data: {
      seo: {
        ...(doc.seo || {}),
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    },
    status: 'published',
  });
}

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  const tally = { written: 0, scrapedDesc: 0, derivedDesc: 0, noDesc: 0, skipped: [] };
  try {
    // ── global.defaultSeo — lấy từ chính trang chủ ────────────────────────────
    // Đây là tầng đỡ cho bất kỳ trang nào bỏ trống `seo`, nên nó phải là câu mô
    // tả cả site chứ không phải của một trang con.
    const home = DATA.singles.homepage;
    const global = await app.documents('api::global.global').findFirst({
      status: 'draft',
      populate: ['defaultSeo'],
    });
    if (global && home) {
      await app.documents('api::global.global').update({
        documentId: global.documentId,
        data: {
          defaultSeo: {
            ...(global.defaultSeo || {}),
            metaTitle: home.metaTitle,
            metaDescription: home.metaDescription,
          },
        },
        status: 'published',
      });
      console.log(`✓ global.defaultSeo  ${home.metaTitle}`);
    }

    // ── 8 single type trang ───────────────────────────────────────────────────
    console.log('\nSingle type');
    for (const [key, uid] of Object.entries(SINGLE_UID)) {
      const entry = DATA.singles[key];
      if (!entry) continue;
      const doc = await app.documents(uid).findFirst({ status: 'draft', populate: ['seo'] });
      if (!doc) {
        tally.skipped.push(key);
        continue;
      }
      await writeSeo(app, uid, doc, entry.metaTitle, entry.metaDescription);
      if (entry.metaDescription) tally.scrapedDesc++;
      else tally.noDesc++;
      tally.written++;
      console.log(`  ✓ ${key.padEnd(20)} ${entry.metaTitle}`);
    }

    // ── Collection type ───────────────────────────────────────────────────────
    for (const [kind, uid] of Object.entries(COLLECTION_UID)) {
      const table = DATA.collections[kind] || {};
      const rows = await app.documents(uid).findMany({
        status: 'draft',
        pagination: { pageSize: 500 },
        populate: ['seo'],
      });
      console.log(`\n${kind} — ${rows.length} bản ghi`);

      let scraped = 0;
      let derived = 0;
      let none = 0;
      for (const row of rows) {
        const entry = table[row.slug] || {};
        const title = entry.metaTitle || `${row.title} - China Sourcing Co`;

        let description = entry.metaDescription;
        if (description) scraped++;
        else {
          description = clamp(DERIVE[kind]?.(row));
          if (description) derived++;
          else none++;
        }

        await writeSeo(app, uid, row, title, description);
        tally.written++;
      }
      tally.scrapedDesc += scraped;
      tally.derivedDesc += derived;
      tally.noDesc += none;
      console.log(`  mô tả: ${scraped} từ site gốc, ${derived} suy từ nội dung, ${none} không có`);
    }

    console.log(
      `\nDone — ${tally.written} bản ghi.` +
        `\n  metaDescription: ${tally.scrapedDesc} nguyên văn site gốc, ` +
        `${tally.derivedDesc} suy từ nội dung, ${tally.noDesc} bỏ trống.`,
    );
    if (tally.skipped.length) console.log(`  ! không thấy: ${tally.skipped.join(', ')}`);
  } finally {
    await app.destroy();
  }
})();
