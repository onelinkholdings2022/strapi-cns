'use strict';
/** Xoá dữ liệu HTML còn sót ở các cột rich text để Strapi đổi kiểu cột text → json được.
 *  Chạy 1 lần sau khi gỡ CKEditor, trước khi seed lại. */
require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST, port: +process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME, password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME, ssl: { rejectUnauthorized: true },
  });
  const targets = [
    ['case_studies', ['challenge_content','solution_content']],
    ['resources', ['content']],
    ['components_elements_faq_items', ['answer']],
  ];
  for (const [table, cols] of targets) {
    const [exists] = await conn.query('SHOW TABLES LIKE ?', [table]);
    if (!exists.length) { console.log(`- bỏ qua ${table} (chưa có)`); continue; }
    const [desc] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
    const have = new Set(desc.map(d => d.Field));
    for (const c of cols) {
      if (!have.has(c)) { console.log(`- bỏ qua ${table}.${c} (không có cột)`); continue; }
      const [r] = await conn.query(`UPDATE \`${table}\` SET \`${c}\` = NULL WHERE \`${c}\` IS NOT NULL`);
      console.log(`✔ ${table}.${c}: xoá ${r.affectedRows} dòng HTML`);
    }
  }
  await conn.end();
})();
