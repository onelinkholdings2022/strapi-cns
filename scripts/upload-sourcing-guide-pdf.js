'use strict';
/**
 * Upload the "Intro to China Manufacturing" PDF to the Media Library.
 *
 * The original site's `/resources` page has a "Download" button
 * (`#downloadBtnCta`) whose inline script builds a temporary `<a download>`
 * pointing at a static file under `/wp-content/uploads/2025/06/`:
 *
 *   const fileUrl = "https://chinasourcing.co/wp-content/uploads/2025/06/intro-to-china-manufacturing.pdf"
 *
 * There is no CMS field for it — the clone's `downloadCta` doesn't model a
 * file relation, and adding one is a bigger content-type change than this
 * needs. This script just gets the PDF into Strapi's Media Library so it has
 * a stable, CDN-served URL; the frontend fix (chinasourcing-clone) points the
 * button at that URL via an env var instead of `/contact-us`.
 *
 * ⚠️ TẮT `npm run dev`/`strapi develop` trước khi chạy:
 *   node scripts/upload-sourcing-guide-pdf.js
 */
const fs = require('fs');
const path = require('path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const SOURCE_PATH = '/Users/tuananhtran/Downloads/intro-to-china-manufacturing.pdf';
const STORED_NAME = 'intro-to-china-manufacturing.pdf';

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== UPLOAD SOURCING GUIDE PDF ===');

    const existing = await app.db
      .query('plugin::upload.file')
      .findOne({ where: { name: STORED_NAME } });
    if (existing) {
      console.log(`  · đã có sẵn: ${STORED_NAME} (id ${existing.id})`);
      console.log(`  url: ${existing.url}`);
      return;
    }

    if (!fs.existsSync(SOURCE_PATH)) {
      throw new Error(`không tìm thấy file nguồn: ${SOURCE_PATH}`);
    }

    const stats = fs.statSync(SOURCE_PATH);
    const uploadService = app.plugin('upload').service('upload');
    const [uploaded] = await uploadService.upload({
      data: {
        fileInfo: {
          name: STORED_NAME,
          alternativeText: 'Intro to China Manufacturing — sourcing guide PDF',
        },
      },
      files: {
        filepath: SOURCE_PATH,
        originalFilename: STORED_NAME,
        mimetype: 'application/pdf',
        size: stats.size,
      },
    });

    console.log(`  ✓ upload ${STORED_NAME} -> id ${uploaded.id}`);
    console.log(`  url: ${uploaded.url}`);
  } finally {
    await app.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
