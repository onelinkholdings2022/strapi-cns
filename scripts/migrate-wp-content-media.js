'use strict';
/**
 * Chuyển ảnh/PDF còn trỏ `https://chinasourcing.co/wp-content/...` sang Media
 * Library của Strapi production, rồi sửa link trong nội dung.
 *
 * ## Vì sao
 *
 * Thân bài blog-post/resource được cào từ WordPress và giữ nguyên URL tuyệt đối
 * tới `chinasourcing.co/wp-content/...`. Tên miền đó giờ là bản Next nên mọi
 * URL ấy trả 404 — ảnh minh hoạ trong ~25 bài và 8 PDF tải về đều hỏng. Bản sao
 * duy nhất nằm ở `chinasourcing-clone/public/wp-content` (do
 * `mirror-wp-assets.mjs` tải về khi WP còn sống).
 *
 * ## Làm gì
 *
 * 1. Gom mọi biến thể WordPress (`-300x198`, `-1024x676`…) về 1 file gốc, chuyển
 *    ảnh sang .webp (như `media-lib.js`), PDF giữ nguyên, upload qua REST API
 *    production — KHÔNG qua createStrapi, vì upload provider là LOCAL: chạy local
 *    thì file nằm trên máy dev chứ không lên VPS.
 * 2. `<img>` trỏ wp-content: viết lại `src` + `srcset` theo các format Strapi tự
 *    sinh, đúng như markup CKEditor chèn ảnh Media Library.
 * 3. Mọi URL wp-content còn lại (link `<a href>`, PDF) → URL file gốc trên CMS.
 * 4. `global.defaultSeo.structuredData`: logo JSON-LD trỏ file WP không còn bản
 *    sao nào → thay bằng PNG 512×512 render từ CNS.svg.
 *
 * Chỉ ghi khi bản nháp TRÙNG bản đã publish (không publish hộ nháp dở của ai).
 *
 * ## Chạy
 *
 *   STRAPI_TOKEN=<api token full-access> node scripts/migrate-wp-content-media.js --dry
 *   STRAPI_TOKEN=<api token full-access> node scripts/migrate-wp-content-media.js
 *
 * Chạy lại được: file đã upload được ghi trong `wp-content-media-map.json` và bỏ
 * qua; nội dung không còn URL wp-content thì không ghi.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const REMOTE = (process.env.STRAPI_REMOTE || 'https://cms.chinasourcing.co').replace(/\/$/, '');
const TOKEN =
  process.env.STRAPI_TOKEN ||
  (fs.existsSync(path.join(__dirname, '..', '.strapi-token'))
    ? fs.readFileSync(path.join(__dirname, '..', '.strapi-token'), 'utf8').trim()
    : undefined);
const DRY = process.argv.includes('--dry');
const LIMIT = Number((process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || Infinity;
const WP_DIR = path.join(__dirname, '..', '..', 'chinasourcing-clone', 'public');
const LOGO_SVG = process.env.LOGO_SVG || path.join(require('os').homedir(), 'Downloads', 'CNS.svg');
const MAP_FILE = path.join(__dirname, 'wp-content-media-map.json');

const WP_URL_RE = /(?:https?:)?\/\/(?:www\.)?chinasourcing\.co(\/wp-content\/[^"'\s)<>\\,]+)/g;
const LOGO_PATH = '/wp-content/uploads/2025/05/Logo_China-Sourcing-01-scaled.png';
const LOGO_SIZE = 512;

/** "/a/b-1024x676.png" -> "/a/b.png" */
const baseOf = (p) => p.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');

async function api(method, url, body, isForm) {
  const res = await fetch(`${REMOTE}${url}`, {
    method,
    headers: {
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

async function fetchAll(ep, status) {
  const out = [];
  for (let page = 1; ; page++) {
    const qs = `pagination[pageSize]=100&pagination[page]=${page}&status=${status}&populate=`;
    const j = await api('GET', `/api/${ep}?${qs}`);
    out.push(...j.data);
    if (page >= (j.meta?.pagination?.pageCount ?? 1)) return out;
  }
}

/** alt đầu tiên gặp cho mỗi file gốc — để điền alternativeText trên Media Library. */
function collectAlts(htmls) {
  const alts = {};
  for (const html of htmls) {
    for (const tag of html.match(/<img\b[^>]*>/g) || []) {
      const src = /\ssrc="([^"]*)"/.exec(tag)?.[1] || '';
      const m = src.match(/\/wp-content\/[^"]+/);
      const alt = /\salt="([^"]*)"/.exec(tag)?.[1];
      if (m && alt && !alts[baseOf(m[0])]) alts[baseOf(m[0])] = alt;
    }
  }
  return alts;
}

/** Chọn file nguồn local: bản gốc nếu có, không thì biến thể lớn nhất. */
function pickSource(base, variants) {
  if (fs.existsSync(path.join(WP_DIR, base))) return path.join(WP_DIR, base);
  const found = variants
    .map((v) => path.join(WP_DIR, v))
    .filter((f) => fs.existsSync(f))
    .sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
  return found[0] || null;
}

async function prepareBuffer(base, source) {
  if (base === LOGO_PATH) {
    const buf = await sharp(fs.readFileSync(LOGO_SVG), { density: 1200 })
      .resize(LOGO_SIZE, LOGO_SIZE)
      .png()
      .toBuffer();
    return { buf, name: 'china-sourcing-co-logo.png', mime: 'image/png' };
  }
  const ext = path.extname(base).toLowerCase();
  const stem = path.basename(base, path.extname(base));
  if (ext === '.pdf') return { buf: fs.readFileSync(source), name: stem + '.pdf', mime: 'application/pdf' };
  const buf = await sharp(fs.readFileSync(source)).webp({ quality: 90 }).toBuffer();
  return { buf, name: stem + '.webp', mime: 'image/webp' };
}

async function upload(base, source, alt) {
  const { buf, name, mime } = await prepareBuffer(base, source);
  const q = `filters[name][$eq]=${encodeURIComponent(name)}`;
  const existing = await api('GET', `/api/upload/files?${q}`);
  if (Array.isArray(existing) && existing.length) return { file: existing[0], reused: true };
  const form = new FormData();
  form.append('files', new Blob([buf], { type: mime }), name);
  form.append('fileInfo', JSON.stringify({ name, alternativeText: alt || null }));
  const [file] = await api('POST', '/api/upload', form, true);
  return { file, reused: false };
}

const abs = (u) => (u.startsWith('http') ? u : REMOTE + u);

/** srcset theo format Strapi, cùng thứ tự/kiểu CKEditor chèn ảnh Media Library. */
function srcsetOf(file) {
  const order = ['thumbnail', 'small', 'medium', 'large'];
  const parts = order
    .filter((k) => file.formats?.[k])
    .map((k) => `${abs(file.formats[k].url)} ${file.formats[k].width}w`);
  if (file.width) parts.push(`${abs(file.url)} ${file.width}w`);
  return parts.join(',');
}

function setAttr(tag, name, value) {
  const re = new RegExp(`\\s${name}="[^"]*"`);
  if (value == null) return tag.replace(re, '');
  return re.test(tag) ? tag.replace(re, ` ${name}="${value}"`) : tag.replace(/^<img\b/, `<img ${name}="${value}"`);
}

function rewriteHtml(html, map) {
  let out = html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = /\ssrc="([^"]*)"/.exec(tag)?.[1] || '';
    const m = src.match(/\/wp-content\/[^"]+/);
    if (!m || !/chinasourcing\.co/.test(src)) return tag;
    const file = map[baseOf(m[0])];
    if (!file) return tag;
    let t = setAttr(tag, 'src', abs(file.url));
    const srcset = srcsetOf(file);
    t = setAttr(t, 'srcset', srcset || null);
    t = setAttr(t, 'sizes', srcset ? '100vw' : null);
    return t;
  });
  out = out.replace(WP_URL_RE, (whole, p) => (map[baseOf(p)] ? abs(map[baseOf(p)].url) : whole));
  return out;
}

async function main() {
  if (!TOKEN && !DRY) throw new Error('Thiếu STRAPI_TOKEN');
  const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};

  // ---- 1. Đọc nội dung (draft + published) ----
  const targets = [];
  for (const ep of ['blog-posts', 'resources']) {
    const pub = new Map((await fetchAll(ep, 'published')).map((d) => [d.documentId, d]));
    for (const d of await fetchAll(ep, 'draft')) {
      if (!WP_URL_RE.test(d.content || '')) continue;
      WP_URL_RE.lastIndex = 0;
      const p = pub.get(d.documentId);
      targets.push({ ep, documentId: d.documentId, slug: d.slug, content: d.content, inSync: p && p.content === d.content });
    }
  }
  const gDraft = (await api('GET', '/api/global?status=draft&populate[defaultSeo][populate]=shareImage')).data;
  const gPub = (await api('GET', '/api/global?populate[defaultSeo]=true')).data;
  const sd = gDraft.defaultSeo?.structuredData;
  const globalInSync = JSON.stringify(sd) === JSON.stringify(gPub.defaultSeo?.structuredData);

  // ---- 2. Gom file gốc ----
  const groups = {};
  const scan = (s) => {
    for (const m of s.matchAll(WP_URL_RE)) (groups[baseOf(m[1])] ??= new Set()).add(m[1]);
  };
  targets.forEach((t) => scan(t.content));
  if (sd) scan(JSON.stringify(sd));
  const alts = collectAlts(targets.map((t) => t.content));

  console.log(`\n${targets.length} bài cần sửa, ${Object.keys(groups).length} file gốc`);
  targets.filter((t) => !t.inSync).forEach((t) => console.log(`  ! nháp lệch bản publish, BỎ QUA: ${t.ep}/${t.slug}`));
  if (!globalInSync) console.log('  ! global: nháp lệch bản publish, BỎ QUA');

  // ---- 3. Upload ----
  let missing = 0;
  for (const [base, variants] of Object.entries(groups)) {
    if (map[base]) continue;
    const source = base === LOGO_PATH ? LOGO_SVG : pickSource(base, [...variants]);
    if (!source || !fs.existsSync(source)) {
      console.log(`  ! KHÔNG có file nguồn: ${base}`);
      missing++;
      continue;
    }
    if (DRY) {
      console.log(`  [dry] upload ${base}  <- ${path.relative(process.cwd(), source)}`);
      continue;
    }
    const { file, reused } = await upload(base, source, alts[base]);
    map[base] = { id: file.id, url: file.url, width: file.width, height: file.height, formats: file.formats };
    fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 1));
    console.log(`  ${reused ? '=' : '✓'} ${base} -> ${file.url} (id ${file.id})`);
  }
  if (missing) throw new Error(`${missing} file thiếu nguồn — dừng, chưa sửa nội dung`);
  if (DRY) return;

  // ---- 4. Sửa nội dung ----
  for (const t of targets.filter((x) => x.inSync).slice(0, LIMIT)) {
    const next = rewriteHtml(t.content, map);
    const left = next.match(WP_URL_RE) || [];
    WP_URL_RE.lastIndex = 0;
    if (left.length) throw new Error(`${t.slug}: còn ${left.length} URL wp-content sau khi thay`);
    await api('PUT', `/api/${t.ep}/${t.documentId}?status=published`, { data: { content: next } });
    console.log(`  ✓ ${t.ep}/${t.slug}`);
  }

  if (LIMIT === Infinity && sd && globalInSync && JSON.stringify(sd).includes(LOGO_PATH)) {
    const logo = map[LOGO_PATH];
    const next = JSON.parse(
      JSON.stringify(sd).replace(WP_URL_RE, (w, p) => (map[baseOf(p)] ? abs(map[baseOf(p)].url) : w)),
    );
    for (const node of next['@graph'] || []) {
      if (node.logo?.url === abs(logo.url)) Object.assign(node.logo, { width: logo.width, height: logo.height });
    }
    const { id, ...seo } = gDraft.defaultSeo;
    await api('PUT', '/api/global?status=published', {
      data: { defaultSeo: { id, ...seo, shareImage: seo.shareImage?.id ?? null, structuredData: next } },
    });
    console.log('  ✓ global.defaultSeo.structuredData (logo)');
  }
  console.log('\nXong.');
}

main().catch((e) => {
  console.error('\n✗', e.message);
  process.exit(1);
});
