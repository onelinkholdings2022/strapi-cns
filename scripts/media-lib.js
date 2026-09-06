'use strict';
/**
 * Helper dùng chung để upload ảnh từ chinasourcing-clone/public/images vào Strapi Media Library.
 * - Tự thử nâng cấp file có đuôi WordPress "-scaled"/"-{w}x{h}" lên bản gốc thật trên site sống
 *   (https://chinasourcing.co) trước khi upload — chỉ dùng nếu tải được và LỚN HƠN file đang có.
 * - Convert sang .webp trước khi đưa vào Strapi.
 * - Cache theo tên file trong 1 lần chạy script để không upload trùng ảnh dùng chung nhiều nơi
 *   (logo, icon, v.v.).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');

const CLONE_IMAGES_DIR = path.join(__dirname, '..', '..', 'chinasourcing-clone', 'public', 'images');
const LIVE_SITE_ORIGIN = 'https://chinasourcing.co';
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'cns-media-'));

const uploadCache = new Map(); // filename -> uploaded Strapi file entity

/** "foo-bar-1024x667.png" / "foo-bar-scaled.jpg" -> "foo-bar.png" / "foo-bar.jpg" (candidate original name) */
function deriveOriginalCandidateName(filename) {
  const ext = path.extname(filename);
  const base = filename.slice(0, -ext.length);
  let candidate = base.replace(/-scaled$/i, '');
  candidate = candidate.replace(/-\d+x\d+$/i, '');
  if (candidate === base) return null;
  return candidate + ext;
}

async function tryFetchLargerOriginal(filename, currentSize) {
  const candidateName = deriveOriginalCandidateName(filename);
  if (!candidateName) return null;
  // WordPress uploads live under /wp-content/uploads/<year>/<month>/<file> — the exact
  // year/month prefix isn't tracked in our local copy, so we can't reconstruct it reliably.
  // Best effort: try the flat guess most of this site's assets resolve to.
  const candidateUrl = `${LIVE_SITE_ORIGIN}/wp-content/uploads/${candidateName}`;
  try {
    const res = await fetch(candidateUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length <= currentSize) return null;
    return buf;
  } catch {
    return null;
  }
}

/**
 * Upload 1 file ảnh (theo tên file trong public/images) lên Strapi, convert webp, cache theo tên file.
 * Trả về Strapi file entity (có .id) hoặc null nếu không tìm thấy file nguồn.
 */
async function uploadImage(strapi, filename, { alt } = {}) {
  if (uploadCache.has(filename)) return uploadCache.get(filename);

  const sourcePath = path.join(CLONE_IMAGES_DIR, filename);
  if (!fs.existsSync(sourcePath)) {
    console.log(`  ! không tìm thấy file nguồn: ${filename}`);
    return null;
  }

  let buffer = fs.readFileSync(sourcePath);
  const upgraded = await tryFetchLargerOriginal(filename, buffer.length);
  if (upgraded) {
    console.log(`  ↑ dùng bản gốc lớn hơn cho ${filename} (${buffer.length} -> ${upgraded.length} bytes)`);
    buffer = upgraded;
  }

  // SVG là vector — convert sang webp sẽ rasterize (icon mất nét khi phóng to).
  // Giữ nguyên file, chỉ đổi mimetype.
  const isSvg = path.extname(filename).toLowerCase() === '.svg';
  const outName = isSvg ? filename : path.basename(filename, path.extname(filename)) + '.webp';
  const outBuffer = isSvg ? buffer : await sharp(buffer).webp({ quality: 90 }).toBuffer();
  const tmpPath = path.join(TMP_DIR, outName);
  fs.writeFileSync(tmpPath, outBuffer);

  const stats = fs.statSync(tmpPath);
  const uploadService = strapi.plugin('upload').service('upload');
  const [uploaded] = await uploadService.upload({
    data: { fileInfo: { alternativeText: alt || null } },
    files: {
      filepath: tmpPath,
      originalFilename: outName,
      mimetype: isSvg ? 'image/svg+xml' : 'image/webp',
      size: stats.size,
    },
  });

  uploadCache.set(filename, uploaded);
  console.log(`  ✓ upload ${filename} -> ${outName} (id ${uploaded.id})`);
  return uploaded;
}

/**
 * Như `uploadImage` nhưng tra Media Library trước: `uploadImage` chỉ dedupe
 * trong 1 lần chạy (Map trong bộ nhớ), nên chạy lại script sẽ tạo bản trùng.
 * Trả về file entity đã có hoặc vừa upload.
 */
async function ensureImage(strapi, filename, { alt } = {}) {
  if (uploadCache.has(filename)) return uploadCache.get(filename);

  const isSvg = path.extname(filename).toLowerCase() === '.svg';
  const storedName = isSvg ? filename : path.basename(filename, path.extname(filename)) + '.webp';
  const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name: storedName } });
  if (existing) {
    uploadCache.set(filename, existing);
    console.log(`  · dùng lại ${storedName} (id ${existing.id})`);
    return existing;
  }
  return uploadImage(strapi, filename, { alt });
}

function cacheStats() {
  return { uploaded: uploadCache.size };
}

module.exports = { uploadImage, ensureImage, cacheStats, CLONE_IMAGES_DIR };
