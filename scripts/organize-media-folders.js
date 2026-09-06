'use strict';
/**
 * Chia Media Library thành folder theo TRANG dùng ảnh đó.
 *
 * Media Library đang phẳng lì 709 ảnh, không tìm nổi ảnh nào của trang nào.
 * Script suy ra chủ sở hữu bằng cách đi theo QUAN HỆ THẬT trong CMS: populate
 * sâu từng content-type rồi gom mọi id media xuất hiện bên dưới nó — chứ không
 * đoán theo tên file, vì tên file không nói lên trang nào dùng.
 *
 * Một ảnh có thể dùng ở nhiều nơi (logo, icon sao, ảnh container...) nhưng
 * folder thì chỉ được một, nên thứ tự trong `OWNERS` chính là thứ tự ưu tiên:
 * trang riêng trước, dùng chung sau. Ảnh không nơi nào tham chiếu rơi vào
 * "Unused".
 *
 * DB dùng chung với production nên chạy ở local là folder hiện luôn trên
 * `cms.chinasourcing.co/admin`. Chỉ đổi cột `folder`/`folderPath` của bản ghi
 * media — KHÔNG đụng file trên đĩa, không đụng url, nên frontend không ảnh
 * hưởng gì.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/organize-media-folders.js [--dry]
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

// `src/utils/deep-populate.ts` là TypeScript — require thẳng không được. Bản
// biên dịch nằm ở `dist/` và `compileStrapi()` làm mới nó lúc khởi động, nên
// phải require SAU khi app load xong (xem `main`).
let buildDeepPopulate;

const DRY = process.argv.includes('--dry');

// Thứ tự = ưu tiên. Ảnh dùng chung nhiều trang thuộc về mục xuất hiện TRƯỚC.
const OWNERS = [
  ['Global', ['api::global.global', 'api::contact-dialog.contact-dialog']],
  ['Home', ['api::homepage.homepage']],
  ['About', ['api::about-us-page.about-us-page', 'api::team-member.team-member']],
  ['Products', ['api::products-page.products-page', 'api::product.product', 'api::product-setting.product-setting']],
  ['Services', ['api::services-page.services-page', 'api::service.service', 'api::service-setting.service-setting']],
  ['Process', ['api::process-page.process-page']],
  [
    'Case Studies',
    ['api::case-studies-page.case-studies-page', 'api::case-study.case-study', 'api::case-study-setting.case-study-setting'],
  ],
  ['Resources', ['api::resources-page.resources-page', 'api::resource.resource', 'api::resource-setting.resource-setting']],
  ['Blog', ['api::blog-post.blog-post']],
  ['Contact', ['api::contact-page.contact-page']],
  ['Testimonials', ['api::testimonial.testimonial']],
  ['Partners', ['api::partner.partner', 'api::partner-category.partner-category']],
];

const UNUSED_FOLDER = 'Unused';

/** Gom mọi id media nằm bất kỳ đâu trong object graph đã populate. */
function collectMediaIds(node, out, seen = new Set()) {
  if (!node || typeof node !== 'object') return;
  if (seen.has(node)) return;
  seen.add(node);

  if (Array.isArray(node)) {
    for (const item of node) collectMediaIds(item, out, seen);
    return;
  }
  // Bản ghi media luôn có đủ 3 field này; component/relation thường thì không.
  if (typeof node.id === 'number' && typeof node.url === 'string' && typeof node.mime === 'string') {
    out.add(node.id);
    return;
  }
  for (const value of Object.values(node)) collectMediaIds(value, out, seen);
}

async function mediaIdsFor(app, uid) {
  const populate = buildDeepPopulate(app, uid);
  const isSingle = app.getModel(uid)?.kind === 'singleType';
  const docs = isSingle
    ? [await app.documents(uid).findFirst({ status: 'draft', populate })].filter(Boolean)
    : await app.documents(uid).findMany({ status: 'draft', pagination: { pageSize: 500 }, populate });
  const ids = new Set();
  for (const doc of docs) collectMediaIds(doc, ids);
  return ids;
}

/** Lấy folder theo tên, tạo mới ở cấp gốc nếu chưa có. */
async function ensureFolder(app, name) {
  const query = app.db.query('plugin::upload.folder');
  const existing = await query.findOne({ where: { name, parent: null } });
  if (existing) return existing;

  // `pathId` là số nguyên duy nhất toàn bảng; `path` của folder gốc là `/<pathId>`.
  const all = await query.findMany({ select: ['pathId'] });
  const pathId = all.reduce((max, f) => Math.max(max, f.pathId || 0), 0) + 1;
  return query.create({ data: { name, pathId, path: `/${pathId}`, parent: null } });
}

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    ({ buildDeepPopulate } = require('../dist/src/utils/deep-populate'));
    console.log('\n=== CHIA FOLDER MEDIA THEO TRANG ===');

    // 1. Ảnh nào thuộc trang nào — quét theo đúng thứ tự ưu tiên.
    const assignment = new Map(); // mediaId -> tên folder
    for (const [folder, uids] of OWNERS) {
      let added = 0;
      for (const uid of uids) {
        let ids;
        try {
          ids = await mediaIdsFor(app, uid);
        } catch (err) {
          console.log(`  ! bỏ qua ${uid}: ${err.message}`);
          continue;
        }
        for (const id of ids) {
          if (!assignment.has(id)) {
            assignment.set(id, folder);
            added++;
          }
        }
      }
      console.log(`  ${folder}: ${added} ảnh`);
    }

    // 2. Ảnh không nơi nào tham chiếu.
    const files = await app.db.query('plugin::upload.file').findMany({
      select: ['id', 'name'],
      populate: { folder: true },
      limit: 5000,
    });
    let unused = 0;
    for (const file of files) {
      if (!assignment.has(file.id)) {
        assignment.set(file.id, UNUSED_FOLDER);
        unused++;
      }
    }
    console.log(`  ${UNUSED_FOLDER}: ${unused} ảnh`);
    console.log(`\n  Tổng ${files.length} bản ghi media.`);

    if (DRY) {
      console.log('\n--dry: dừng ở đây, không ghi gì.');
      return;
    }

    // 3. Tạo folder rồi gán.
    const folderByName = new Map();
    for (const name of new Set(assignment.values())) {
      const folder = await ensureFolder(app, name);
      folderByName.set(name, folder);
      console.log(`  folder "${name}" -> id ${folder.id}, path ${folder.path}`);
    }

    const currentFolderId = new Map(files.map((f) => [f.id, f.folder?.id ?? null]));
    let moved = 0;
    let unchanged = 0;
    for (const [mediaId, folderName] of assignment) {
      const folder = folderByName.get(folderName);
      if (currentFolderId.get(mediaId) === folder.id) {
        unchanged++;
        continue;
      }
      // `folderPath` phải khớp `folder.path` — admin dựng cây từ chuỗi này,
      // lệch nhau là ảnh "mất tích" khỏi folder dù quan hệ vẫn đúng.
      await app.db.query('plugin::upload.file').update({
        where: { id: mediaId },
        data: { folder: folder.id, folderPath: folder.path },
      });
      moved++;
      if (moved % 100 === 0) console.log(`  ... đã chuyển ${moved}`);
    }

    console.log(`\nDone. chuyển: ${moved}, đã đúng sẵn: ${unchanged}`);
  } finally {
    await app.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
