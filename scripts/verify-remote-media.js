'use strict';
/**
 * Kiểm tra MỌI file media trên `cms.chinasourcing.co` có tải được không —
 * cả ảnh gốc lẫn 4 biến thể (thumbnail/small/medium/large) mà Strapi sinh ra.
 *
 * Dùng sau `restore-remote-media.js` để chốt lại: HEAD của script khôi phục
 * chạy song song nên thỉnh thoảng bị nghẽn và báo nhầm là "chưa có"; ở đây gọi
 * tuần tự có retry nên con số là thật.
 *
 *   STRAPI_TOKEN=<token> node scripts/verify-remote-media.js
 */
const REMOTE = (process.env.STRAPI_REMOTE || 'https://cms.chinasourcing.co').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_TOKEN;
const CONCURRENCY = 6;

async function head(url, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${REMOTE}${url}`, { method: 'HEAD' });
      if (res.ok) return true;
      if (res.status === 404) return false;
    } catch {
      /* mạng chập chờn — thử lại */
    }
    await new Promise((r) => setTimeout(r, 400 * (i + 1)));
  }
  return false;
}

async function mapLimit(items, limit, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) await fn(items[i++]);
    })
  );
}

(async () => {
  if (!TOKEN) {
    console.error('Thiếu STRAPI_TOKEN.');
    process.exit(1);
  }
  const res = await fetch(`${REMOTE}/api/upload/files?pagination[pageSize]=2000`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const body = await res.json();
  const records = Array.isArray(body) ? body : body.results ?? [];

  const targets = [];
  for (const r of records) {
    targets.push({ id: r.id, url: r.url, kind: 'gốc' });
    for (const [name, f] of Object.entries(r.formats || {})) {
      targets.push({ id: r.id, url: f.url, kind: name });
    }
  }

  console.log(`\n=== KIỂM TRA ${targets.length} file (${records.length} bản ghi) ===`);
  const broken = [];
  let checked = 0;
  await mapLimit(targets, CONCURRENCY, async (t) => {
    if (!(await head(t.url))) broken.push(t);
    if (++checked % 250 === 0) console.log(`  ... ${checked}/${targets.length}`);
  });

  console.log(`\nOK: ${targets.length - broken.length}/${targets.length}`);
  if (broken.length) {
    const byRecord = new Map();
    for (const b of broken) byRecord.set(b.id, (byRecord.get(b.id) || 0) + 1);
    console.log(`Hỏng: ${broken.length} file thuộc ${byRecord.size} bản ghi`);
    for (const b of broken.slice(0, 25)) console.log(`  #${b.id} [${b.kind}] ${b.url}`);
    if (broken.length > 25) console.log(`  ... và ${broken.length - 25} file nữa`);
  } else {
    console.log('Không còn file nào 404.');
  }
})();
