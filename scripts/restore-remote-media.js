'use strict';
/**
 * Khôi phục FILE ẢNH cho Strapi production (`cms.chinasourcing.co`).
 *
 * ## Vì sao ảnh hỏng
 *
 * `strapi-cns` dùng local upload provider (file nằm trong `public/uploads` của
 * tiến trình Strapi) nhưng `DATABASE_CLIENT=mysql` trỏ vào TiDB Cloud DÙNG
 * CHUNG. Nên máy dev và server đọc cùng một database: bản ghi media (id, url,
 * hash, kích thước) có đủ ở cả hai nơi, còn FILE THẬT thì chỉ có trên máy dev.
 * Kết quả: Media Library hiện icon vỡ, `/uploads/...` trả 404 (nginx trả, không
 * phải Strapi).
 *
 * Đã kiểm chứng: file upload QUA API thì ra được URL công khai ngay (200), tức
 * nginx trỏ đúng thư mục — chỉ thiếu file.
 *
 * ## Vì sao KHÔNG upload thành file mới
 *
 * Mọi quan hệ nội dung trỏ tới media theo ID. Upload 644 file mới sẽ tạo 644
 * bản ghi TRÙNG, còn quan hệ cũ vẫn trỏ vào bản ghi hỏng → frontend vẫn vỡ ảnh
 * y như cũ, mà Media Library thì gấp đôi số ảnh.
 *
 * Script dùng `POST /api/upload?id=<id>` — THAY FILE cho bản ghi đã có. Đã kiểm
 * chứng trên 2 bản ghi thật: giữ nguyên id, giữ nguyên url/hash, và Strapi tự
 * sinh lại đủ 4 biến thể (thumbnail/small/medium/large). Quan hệ nội dung không
 * bị đụng tới.
 *
 * ## Chạy
 *
 *   STRAPI_TOKEN=<api token full-access> node scripts/restore-remote-media.js
 *
 * Token tạo bằng `node scripts/create-api-token.js` (DB dùng chung nên token
 * tạo ở local dùng được cho production).
 *
 * An toàn khi chạy lại: bản ghi nào đã tải được (HEAD 200) thì bỏ qua, nên
 * đứt mạng giữa chừng chỉ cần chạy lại.
 *
 * Cờ:
 *   --dry            chỉ liệt kê, không upload
 *   --concurrency=N  mặc định 4
 */
const fs = require('fs');
const path = require('path');

const REMOTE = (process.env.STRAPI_REMOTE || 'https://cms.chinasourcing.co').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_TOKEN;
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

const DRY = process.argv.includes('--dry');
const CONCURRENCY = Number((process.argv.find((a) => a.startsWith('--concurrency=')) || '').split('=')[1]) || 4;

const MIME = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
};

async function listRemoteFiles() {
  const res = await fetch(`${REMOTE}/api/upload/files?pagination[pageSize]=2000`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Không liệt kê được media: HTTP ${res.status}`);
  const body = await res.json();
  return Array.isArray(body) ? body : body.results ?? [];
}

/** File đã có trên server chưa (kể cả biến thể) — dùng để bỏ qua khi chạy lại. */
async function isReachable(url) {
  try {
    const res = await fetch(`${REMOTE}${url}`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function replaceFile(record, localPath) {
  const ext = path.extname(localPath).toLowerCase();
  const buffer = fs.readFileSync(localPath);
  const form = new FormData();
  form.append('files', new Blob([buffer], { type: MIME[ext] || 'application/octet-stream' }), record.name);

  const res = await fetch(`${REMOTE}/api/upload?id=${record.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
  return res.json();
}

async function mapLimit(items, limit, fn) {
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const index = i++;
      await fn(items[index], index);
    }
  });
  await Promise.all(workers);
}

async function main() {
  if (!TOKEN) {
    console.error('Thiếu STRAPI_TOKEN. Tạo bằng: node scripts/create-api-token.js');
    process.exit(1);
  }

  console.log(`\n=== KHÔI PHỤC MEDIA -> ${REMOTE} ===`);
  const records = await listRemoteFiles();
  console.log(`  ${records.length} bản ghi media trên server`);

  const withLocal = [];
  const noLocal = [];
  for (const record of records) {
    const local = path.join(UPLOADS_DIR, path.basename(record.url));
    (fs.existsSync(local) ? withLocal : noLocal).push({ record, local });
  }
  console.log(`  ${withLocal.length} có file ở máy này, ${noLocal.length} không có`);

  if (noLocal.length) {
    console.log('\n  Không có file local (bỏ qua — bản ghi cũ từ lần seed trước):');
    for (const { record } of noLocal.slice(0, 10)) console.log(`    #${record.id} ${record.url}`);
    if (noLocal.length > 10) console.log(`    ... và ${noLocal.length - 10} bản ghi nữa`);
  }

  if (DRY) {
    console.log('\n--dry: dừng ở đây, không upload gì.');
    return;
  }

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];
  let done = 0;

  await mapLimit(withLocal, CONCURRENCY, async ({ record, local }) => {
    done++;
    if (await isReachable(record.url)) {
      skipped++;
      return;
    }
    try {
      await replaceFile(record, local);
      uploaded++;
      if (uploaded % 25 === 0) console.log(`  ... ${done}/${withLocal.length} (đã upload ${uploaded})`);
    } catch (err) {
      failed++;
      failures.push(`#${record.id} ${record.url} — ${err.message}`);
    }
  });

  console.log(`\nDone. upload: ${uploaded}, đã có sẵn: ${skipped}, lỗi: ${failed}`);
  if (failures.length) {
    console.log('\nLỗi:');
    for (const f of failures.slice(0, 20)) console.log(`  ${f}`);
    if (failures.length > 20) console.log(`  ... và ${failures.length - 20} lỗi nữa`);
    console.log('\nChạy lại script để thử lại những file lỗi (file đã xong sẽ tự bỏ qua).');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
