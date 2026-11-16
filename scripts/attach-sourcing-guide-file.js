'use strict';
/**
 * Gắn PDF "Intro to China Manufacturing" vào `resources-page.downloadCta.file`
 * (khối Download cuối trang /resources) rồi publish.
 *
 * Trước đây field này để TRỐNG và FE lấy link PDF cứng từ env
 * `NEXT_PUBLIC_SOURCING_GUIDE_PATH`. Giờ FE đọc file từ CMS và tải qua route
 * cùng domain `/api/sourcing-guide` (chinasourcing-clone) — đổi file chỉ cần
 * thay ở Admin, không sửa env.
 *
 * File đã có sẵn trong Media Library, script KHÔNG upload gì mới.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/attach-sourcing-guide-file.js           # xem trước, KHÔNG ghi
 *   node scripts/attach-sourcing-guide-file.js --write   # ghi + publish
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const WRITE = process.argv.includes('--write');
const UID = 'api::resources-page.resources-page';
const FILE_URL = '/uploads/intro_to_china_manufacturing_e9b336107a.pdf';

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const pdf = await app.query('plugin::upload.file').findOne({ where: { url: FILE_URL } });
    if (!pdf) throw new Error(`Không thấy file ${FILE_URL} trong Media Library.`);
    console.log(`  file: #${pdf.id} ${pdf.name} (${pdf.mime}, ${pdf.size} KB)`);

    const page = await app.documents(UID).findFirst({
      status: 'draft',
      populate: { downloadCta: { populate: ['tag', 'file', 'image'] } },
    });
    if (!page?.downloadCta) throw new Error('Không thấy resources-page.downloadCta.');
    const cta = page.downloadCta;
    console.log(`  downloadCta.file hiện tại: ${cta.file ? `#${cta.file.id} ${cta.file.name}` : '(trống)'}`);

    if (!WRITE) {
      console.log('\n(xem trước — chạy lại với --write để ghi thật)');
      return;
    }

    // Component ghi đè cả khối: phải gửi lại đủ field cũ, không là mất chữ/ảnh.
    const data = {
      downloadCta: {
        tag: cta.tag ? { label: cta.tag.label } : null,
        heading: cta.heading,
        description: cta.description,
        buttonLabel: cta.buttonLabel,
        image: cta.image?.id ?? null,
        file: pdf.id,
      },
    };
    await app.documents(UID).update({ documentId: page.documentId, status: 'draft', data });
    await app.documents(UID).publish({ documentId: page.documentId });

    const pub = await app.documents(UID).findFirst({
      status: 'published',
      populate: { downloadCta: { populate: ['tag', 'file', 'image'] } },
    });
    const c = pub?.downloadCta;
    console.log('\nXong: đã ghi + publish.');
    console.log(`  tag=${c?.tag?.label} | heading=${c?.heading} | button=${c?.buttonLabel}`);
    console.log(`  image=${c?.image?.name ?? 'THIẾU'} | file=${c?.file?.name ?? 'THIẾU'}`);
  } finally {
    await new Promise((r) => setTimeout(r, 2000));
    await app.destroy();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
