'use strict';
/**
 * Tạo 1 API token full-access để script có thể gọi REST API của Strapi.
 *
 * Máy dev và server production dùng CHUNG database (TiDB Cloud, xem
 * `config/database.ts` + `.env`), nên token tạo ở đây dùng được cho
 * `cms.chinasourcing.co` — VỚI ĐIỀU KIỆN `API_TOKEN_SALT` hai bên giống nhau,
 * vì Strapi băm access key bằng `HMAC-SHA512(salt)` rồi so hash. Script tự in
 * ra hướng dẫn kiểm tra điều đó.
 *
 * Access key chỉ hiện MỘT LẦN (Strapi chỉ lưu hash). Chạy lại sẽ tạo token mới
 * chứ không đọc lại được token cũ.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/create-api-token.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const NAME = process.argv[2] || 'media-restore-script';

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const service = app.service('admin::api-token');
    const existing = await service.getByName(NAME);
    if (existing) {
      console.log(`! Đã có token tên "${NAME}" (id ${existing.id}).`);
      console.log('  Access key KHÔNG đọc lại được — xoá token cũ trong admin rồi chạy lại,');
      console.log('  hoặc chạy: node scripts/create-api-token.js <tên-khác>');
      return;
    }
    const token = await service.create({
      name: NAME,
      description: 'Tạo bằng scripts/create-api-token.js để khôi phục media.',
      type: 'full-access',
      lifespan: null,
    });
    console.log('\n=== API TOKEN (chỉ hiện 1 lần) ===');
    console.log(token.accessKey);
    console.log('\nKiểm tra trên server thật:');
    console.log(`  curl -H "Authorization: Bearer ${token.accessKey}" \\`);
    console.log('    "https://cms.chinasourcing.co/api/upload/files?pagination[pageSize]=1"');
    console.log('\n401 = API_TOKEN_SALT hai bên khác nhau, token này chỉ dùng được ở local.');
  } finally {
    await app.destroy();
  }
})();
