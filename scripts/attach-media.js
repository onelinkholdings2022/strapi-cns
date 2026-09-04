'use strict';
/**
 * Gắn ảnh (đã tải từ site sống, xem media-lib.js) vào các entry/collection đã seed sẵn
 * TOÀN BỘ nội dung text trong strapi-cns — chỉ còn thiếu Media (xem scripts/seed-lib.js).
 * ⚠️ TẮT `npm run dev` trước khi chạy: node scripts/attach-media.js
 *
 * Nguồn khớp ảnh: scripts/media-map.json (dựng từ chính code/data đã build trong
 * chinasourcing-clone — không đoán theo tên file, xem scripts/media-map-gaps.json cho
 * phần còn thiếu dữ liệu, xử lý riêng ở seed-gaps.js / seed-blog-posts.js).
 *
 * Mọi field Media hiện đang RỖNG (seed cũ cố tình bỏ qua), nên fetch-rồi-ghi-đè-lại-toàn-bộ
 * component ở đây là an toàn — không có dữ liệu media thật nào để mất.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { uploadImage, cacheStats } = require('./media-lib');
const mediaMap = require('./media-map.json');

const SIMPLE_KEY = /^[A-Za-z][A-Za-z0-9]*$/;

async function resolveImageId(strapi, filename, alt) {
  if (!filename) return null;
  const uploaded = await uploadImage(strapi, filename, { alt });
  return uploaded ? uploaded.id : null;
}

function getPath(obj, dottedPath) {
  return dottedPath.split('.').reduce((cur, k) => (cur == null ? undefined : cur[k]), obj);
}

function setPath(obj, dottedPath, value) {
  const parts = dottedPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

/** product / service / case-study / resource / team-member — field media đơn giản ở top-level,
 * cộng case đặc biệt sourceItems[].image theo index (bags-cases / furniture / packaging). */
async function attachFlatEntries(strapi) {
  let ok = 0;
  for (const entry of mediaMap) {
    if (!entry.match) continue; // singleton, xử lý ở attachSingletons()
    const { contentType, match, media } = entry;
    const hasSourceItems = Object.keys(media).some((k) => k.startsWith('sourceItems[]'));
    const found = await strapi.documents(contentType).findFirst({
      filters: { [match.field]: { $eq: match.value } },
      status: 'draft',
      // sourceItems là component lặp lại — PHẢI populate tường minh, không thì
      // found.sourceItems về undefined và bước rebuild bên dưới sẽ ghi đè thành
      // mảng RỖNG, xoá sạch title đã seed (đã xảy ra thật — xem git blame).
      ...(hasSourceItems ? { populate: { sourceItems: { populate: ['image'] } } } : {}),
    });
    if (!found) {
      console.log(`  ! không thấy entry ${contentType} ${match.field}=${match.value}`);
      continue;
    }

    const data = {};
    for (const [key, value] of Object.entries(media)) {
      if (SIMPLE_KEY.test(key) && typeof value === 'string') {
        const id = await resolveImageId(strapi, value, found.title || found.name || found.authorName);
        if (id) data[key] = id;
      }
    }

    const sourceItemsKey = Object.keys(media).find((k) => k.startsWith('sourceItems[]'));
    if (sourceItemsKey) {
      const filenames = media[sourceItemsKey];
      const current = found.sourceItems || [];
      const rebuilt = await Promise.all(
        current.map(async (item, i) => {
          const filename = filenames[i];
          const image = filename ? await resolveImageId(strapi, filename, item.title) : item.image ?? null;
          return { ...item, image };
        })
      );
      data.sourceItems = rebuilt;
    }

    if (Object.keys(data).length === 0) continue;
    await strapi.documents(contentType).update({ documentId: found.documentId, data, status: 'published' });
    ok++;
  }
  console.log(`  • entry (product/service/case-study/resource/team-member): ${ok}`);
}

/**
 * Danh sách thao tác tường minh cho từng Single Type — xác nhận trực tiếp theo
 * schema.json thật (không suy diễn từ key mô tả trong media-map.json).
 *   { path }               -> set 1 field media lồng nhau, giá trị = 1 file
 *   { arrayPath, subfield } -> set field media theo index trong 1 component lặp lại
 *                              (tự tạo item mới nếu component đang rỗng)
 */
const SINGLETON_OPS = {
  'api::homepage.homepage': [
    { path: 'hero.posterImage', file: 'Screenshot-2025-05-15-at-11.11.34.png' },
    {
      arrayPath: 'sourcingServices.tabs.0.cards',
      subfield: 'icon', // elements.service-card chỉ có field `icon`, không có `image`
      files: [
        'china-sourcing-product-sourcing.png', 'china-sourcing-quality-control.png',
        'freight-and-logistics.png', 'warehousing-and-fulfillment.png',
        'china-sourcing-product-research.png', 'graphic-design.png',
        'photo-videography.png', 'china-sourcing-content-creation.png',
      ],
    },
    {
      arrayPath: 'sourcingServices.tabs.1.cards',
      subfield: 'icon', // elements.service-card chỉ có field `icon`, không có `image`
      files: [
        'factory-supplier-audit.png', 'ip-protection.png', 'sourcing-procurement.png',
        'Image-20.png', 'Image-21.png', 'Image-22.png', 'china-sourcing-custom-manufacturing-1.png',
      ],
    },
    {
      arrayPath: 'whyChooseUs.features',
      subfield: 'icon',
      files: [
        'china-sourcing-team-300x300.png', 'china-sourcing-team-3-300x300.png',
        'china-sourcing-team-4-300x300.png', 'china-sourcing-team-2-300x300.png',
        'china-sourcing-trusted-factories-1-300x300.png', 'china-sourcing-team-1-300x300.png',
      ],
    },
  ],
  'api::about-us-page.about-us-page': [
    { path: 'hero.image', file: 'china-sourcing-about-us.png' },
    { path: 'timeline.shipImage', file: 'Ship.png' },
    { path: 'founderQuote.photo', file: 'Images.png' },
    {
      arrayPath: 'logoMarquee.logos',
      subfield: 'logo',
      files: ['image-85.png', 'image-88.png', 'image-91.png', 'image-93.png', 'image-89.png', 'image-86.png', 'image-87.png'],
    },
    { path: 'visionMissionValues.visionIcon', file: 'Vision.png' },
    { path: 'visionMissionValues.missionIcon', file: 'Mission.png' },
    { path: 'visionMissionValues.valuesIcon', file: 'Values.png' },
    { path: 'benefits.sideImage', file: 'china-sourcing-container.png' },
    {
      arrayPath: 'benefits.items',
      subfield: 'icon',
      files: ['star-05.png', 'star-05.png', 'star-05.png', 'star-05.png', 'star-05.png', 'star-05.png'],
    },
    {
      arrayPath: 'locations.items',
      subfield: 'icon',
      files: ['CN.png', 'Hong-Kong-flag-1.png', 'VN.png', 'AU.png'],
    },
    {
      arrayPath: 'brandCulture.tabs',
      subfield: 'image',
      files: ['china-sourcing-culture.png', 'china-sourcing-community.png', 'china-sourcing-community-1024x797.jpg'],
    },
  ],
  'api::products-page.products-page': [
    { path: 'hero.image', file: 'china-sourcing-warehouse.png' },
    {
      arrayPath: 'certifications.logos',
      subfield: 'logo',
      files: ['image-85.png', 'image-88.png', 'image-91.png', 'image-93.png', 'image-89.png', 'image-86.png', 'image-87.png'],
    },
  ],
  'api::services-page.services-page': [
    { path: 'hero.image', file: 'china-sourcing-service.png' },
    { path: 'usp.image', file: 'china-sourcing-container.png' },
  ],
  'api::process-page.process-page': [
    { path: 'hero.image', file: 'china-sourcing-process.png' },
    { path: 'timeline.shipImage', file: 'Ship.png' },
    { path: 'usp.image', file: 'china-sourcing-process-1.png' },
  ],
  'api::case-studies-page.case-studies-page': [
    { path: 'hero.image', file: 'china-sourcing-case-studies.png' },
    { path: 'usp.image', file: 'china-sourcing-container.png' },
  ],
  'api::resources-page.resources-page': [
    { path: 'hero.image', file: 'Frame-4947-1-1.png' },
    { path: 'downloadCta.image', file: 'china-sourcing-document.png' },
  ],
  'api::contact-page.contact-page': [
    { path: 'hero.image', file: 'china-sourcing-contact-us.png' },
    {
      arrayPath: 'getInTouch.infoItems',
      subfield: 'icon',
      files: ['mail.svg', 'phone.svg', 'pin.svg'],
    },
  ],
  'api::global.global': [
    {
      arrayPath: 'footer.socialMedia',
      subfield: 'icon',
      files: ['facebook-logo.png', 'linkedin-logo.png', 'instagram-logo-1.png'],
    },
  ],
};

/**
 * Component (kể cả lồng nhau) chỉ được Strapi populate MẶC ĐỊNH ở cấp 1 — component
 * lặp lại nằm bên trong 1 component khác (vd. sourcingServices.tabs[].cards) sẽ KHÔNG
 * được trả về nếu không populate tường minh. Dựng populate sâu tự động từ schema để
 * đọc đúng toàn bộ dữ liệu hiện có trước khi merge + ghi lại.
 */
function buildDeepPopulate(strapi, uid, depth = 0) {
  if (depth > 5) return true;
  const schema = strapi.getModel(uid);
  if (!schema || !schema.attributes) return true;
  const populate = {};
  for (const [key, attr] of Object.entries(schema.attributes)) {
    if (attr.type === 'component') {
      populate[key] = { populate: buildDeepPopulate(strapi, attr.component, depth + 1) };
    } else if (attr.type === 'dynamiczone') {
      populate[key] = true;
    } else if (attr.type === 'media') {
      populate[key] = true;
    }
  }
  return populate;
}

async function attachSingletons(strapi, onlyUids = null) {
  let ok = 0;
  for (const [uid, ops] of Object.entries(SINGLETON_OPS)) {
    if (onlyUids && !onlyUids.includes(uid)) continue;
    const populate = buildDeepPopulate(strapi, uid);
    const current = await strapi.documents(uid).findFirst({ status: 'draft', populate });
    if (!current) {
      console.log(`  ! không thấy singleton ${uid}`);
      continue;
    }

    const data = {};
    const touchedTop = new Set();
    const ensureTop = (topKey) => {
      if (!touchedTop.has(topKey)) {
        data[topKey] = current[topKey] ? { ...current[topKey] } : {};
        touchedTop.add(topKey);
      }
    };

    for (const op of ops) {
      if (op.path) {
        ensureTop(op.path.split('.')[0]);
        const id = await resolveImageId(strapi, op.file);
        if (id != null) setPath(data, op.path, id);
      } else if (op.arrayPath) {
        ensureTop(op.arrayPath.split('.')[0]);
        const currentArr = getPath(data, op.arrayPath) || [];
        const rebuilt = [];
        for (let i = 0; i < op.files.length; i++) {
          const id = await resolveImageId(strapi, op.files[i]);
          const base = currentArr[i] ? { ...currentArr[i] } : {};
          if (id != null) base[op.subfield] = id;
          rebuilt.push(base);
        }
        setPath(data, op.arrayPath, rebuilt);
      }
    }

    await strapi.documents(uid).update({ documentId: current.documentId, data, status: 'published' });
    ok++;
    console.log(`  ✓ ${uid}`);
  }
  console.log(`  • singleton đã gắn media: ${ok}`);
}

module.exports = { attachFlatEntries, attachSingletons, resolveImageId, getPath, setPath, cacheStats };

if (require.main === module) {
  (async () => {
    const app = await createStrapi(await compileStrapi()).load();
    try {
      console.log('\n=== ATTACH MEDIA ===');
      await attachFlatEntries(app);
      await attachSingletons(app);
      console.log(`  • tổng ảnh đã upload (không trùng): ${cacheStats().uploaded}`);
    } finally {
      await app.destroy();
    }
  })();
}
