'use strict';
/**
 * Mở quyền đọc PUBLIC cho `api::resource-type.resource-type`.
 *
 * Tạo một content type mới không tự cấp quyền cho role Public. Bảng
 * `PUBLIC_TYPES` trong `seed.js` là nơi khai chuyện đó, nhưng `seed.js` dựng
 * lại toàn bộ nội dung — không chạy được trên site đang sống. Script này chỉ
 * làm đúng một việc, idempotent, chạy bao nhiêu lần cũng được:
 *
 *   node scripts/open-resource-type-permission.js
 *
 * Triệu chứng nếu thiếu: `/api/resource-types` trả **403**, và frontend log
 * `[StrapiClient] 403 Forbidden` mỗi lượt render (`getRouteSlugs` gọi endpoint
 * này trên mọi trang). Rail "Free Resources" vẫn chạy — nó lùi về enum — nhưng
 * bốn URL `/checklists`, `/ebook`, `/others`, `/templates` không phân giải được.
 *
 * ⚠️ TẮT `npm run dev` trước khi chạy. DB dùng chung với production nên quyền
 * cấp ở đây có hiệu lực ngay trên cms.chinasourcing.co.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const UID = 'api::resource-type.resource-type';

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const publicRole = await app.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });
    if (!publicRole) {
      console.log('  ! không tìm thấy Public role');
      return;
    }

    for (const action of ['find', 'findOne']) {
      const permAction = `${UID}.${action}`;
      const existing = await app.db.query('plugin::users-permissions.permission').findOne({
        where: { action: permAction, role: publicRole.id },
      });
      if (existing) {
        console.log(`  = ${permAction} (đã có)`);
        continue;
      }
      await app.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action: permAction, role: publicRole.id } });
      console.log(`  + ${permAction}`);
    }
    console.log('\nDone.');
  } finally {
    await app.destroy();
  }
})();
