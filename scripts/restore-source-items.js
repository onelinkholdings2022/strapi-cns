'use strict';
/**
 * KHÔI PHỤC sourceItems (title + image) cho bags-cases / furniture / packaging —
 * bị attach-media.js (bản cũ, thiếu populate) ghi đè thành mảng RỖNG do đọc
 * `found.sourceItems` không populate. Title lấy lại nguyên văn từ
 * scripts/seed-collections.js (PRODUCT_DETAIL), ảnh lấy từ scripts/media-map.json.
 * ⚠️ TẮT `npm run dev` trước khi chạy.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { upsertBySlug } = require('./seed-lib');
const { uploadImage } = require('./media-lib');

const RESTORE = {
  'bags-cases': [
    ['Luggage', 'china-sourcing-luggage.png'],
    ['Business and Laptop Bags', 'china-sourcing-business-and-laptop-bags.png'],
    ['Backpacks', 'china-sourcing-backpack.png'],
    ['Totes and Handbags', 'china-sourcing-tote-handbags.png'],
    ['Specialty Cases', 'china-sourcing-specialty-cases.png'],
    ['Outdoor and Sports Bags', 'china-sourcing-outdoor-and-sports-bags.png'],
    ['Storage and Organization', 'china-sourcing-storage-organization.png'],
    ['Custom and Promotional Bags', 'china-sourcing-custom-and-promotional-bags.png'],
  ],
  furniture: [
    ['Seating Furniture', 'china-sourcing-seating-furniture.png'],
    ['Accent Furniture', 'china-sourcing-accent-furniture.png'],
    ['Storage Furniture', 'china-sourcing-storage-furniture.png'],
    ['Bedroom Furniture', 'china-sourcing-bedroom-furniture.png'],
    ['Outdoor Furniture', 'china-sourcing-outdoor-furniture-1.png'],
    ["Children's Furniture", 'china-sourcing-children-furniture.png'],
    ['Entertainment Furniture', 'china-sourcing-entertainment-furniture.png'],
    ['Office Furniture', 'china-sourcing-office-furniture.png'],
  ],
  packaging: [
    ['Primary Packaging', 'china-sourcing-primary-packaging.png'],
    ['Secondary Packaging', 'china-sourcing-secondary-packaging.png'],
    ['Tertiary Packaging', 'Image-14-1.png'],
    ['Flexible Packaging', 'china-sourcing-flexible-packaging.png'],
    ['Rigid Packaging', 'china-sourcing-rigid-packaging.png'],
    ['Aseptic Packaging', 'china-sourcing-aseptic-packaging.png'],
    ['Vacuum Packaging', 'china-sourcing-vacuum-packaging.png'],
    ['Reclosable Packaging', 'china-sourcing-reclosable-packaging.png'],
    ['Biodegradable and Compostable Packaging', 'china-sourcing-biodegradable-and-compostable-packaging.png'],
    ['Edible Packaging', 'china-sourcing-edible-packaging.png'],
    ['Paperboard Packaging', 'china-sourcing-paperboard-packaging.png'],
    ['Metal Packaging', 'china-sourcing-metal-packaging.png'],
  ],
};

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    for (const [slug, items] of Object.entries(RESTORE)) {
      const sourceItems = [];
      for (const [title, filename] of items) {
        const uploaded = await uploadImage(app, filename, { alt: title });
        sourceItems.push({ title, image: uploaded ? uploaded.id : null });
      }
      await upsertBySlug(app, 'api::product.product', slug, { sourceItems });
      console.log(`  ✓ khôi phục sourceItems: ${slug} (${sourceItems.length} mục)`);
    }
  } finally {
    await app.destroy();
  }
})();
