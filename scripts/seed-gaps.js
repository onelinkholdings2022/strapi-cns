'use strict';
/**
 * Bù các khoảng trống nội dung mà scripts/seed.js chưa từng seed (không phải thiếu ảnh —
 * thiếu hẳn dữ liệu), lấy nguyên dữ liệu đã có sẵn trong chinasourcing-clone
 * (xem scripts/media-map-gaps.json để đối chiếu):
 *   1. sourceItems cho 12 product chưa có (chỉ 3/15 product có PRODUCT_DETAIL đầy đủ)
 *   2. testimonial cho 6 product chưa có testimonial nào
 *   3. 42 partner (7 category cũ đã seed sẵn, chỉ thiếu entry Partner + logo)
 * ⚠️ TẮT `npm run dev` trước khi chạy: node scripts/seed-gaps.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { upsertBySlug, upsertByField } = require('./seed-lib');
const { uploadImage } = require('./media-lib');

// ---------- 1. sourceItems cho 12 product ----------
const PRODUCT_SOURCE_ITEMS_GAPS = {
  'automotive-machinery': [
    ['Replacement Parts', 'china-sourcing-replacement-parts.png'],
    ['Electrical Components', 'china-sourcing-electrical-components.png'],
    ['Fluids and Lubricants', 'china-sourcing-fluids-and-lubricants.png'],
    ['Filters', 'china-sourcing-filters.png'],
    ['Tires and Wheels', 'china-sourcing-tires-and-wheels.png'],
    ['Auto Body Parts', 'china-sourcing-auto-body-parts.png'],
    ['Interior Accessories', 'china-sourcing-interior-accessories.png'],
    ['Performance Parts', 'china-sourcing-performance-parts.png'],
    ['Maintenance Tools', 'china-sourcing-maintenance-tools.png'],
    ['Car Care Products', 'china-sourcing-car-care-products.png'],
    ['OEM Parts', 'china-sourcing-oem-parts.png'],
    ['Aftermarket Parts', 'china-sourcing-aftermarket-parts.png'],
  ],
  'bedding-home': [
    ['Bedding Sets', 'china-sourcing-bedding-sets.png'],
    ['Pillows', 'china-sourcing-pillows.png'],
    ['Blankets and Throws', 'china-sourcing-blankets-and-throws.png'],
    ['Mattress Toppers and Protectors', 'china-sourcing-mattress-toppers-and-protectors.png'],
    ['Bedspreads and Coverlets', 'china-sourcing-bedspreads-and-coverlets.png'],
    ['Bedroom Furniture', 'china-sourcing-bedroom-furniture-1.png'],
    ['Bath Linens', 'china-sourcing-bath-linens.png'],
    ['Home Decor', 'china-sourcing-home-decor.png'],
    ['Table Linens', 'china-sourcing-table-linens.png'],
    ['Kitchen Linens', 'china-sourcing-kitchen-linens.png'],
    ['Outdoor and Patio Accessories', 'china-sourcing-outdoor-and-patio-accessories.png'],
    ['Baby and Kids Bedding', 'china-sourcing-baby-and-kids-bedding.png'],
  ],
  'building-materials': [
    ['Structural Materials', 'china-sourcing-structural-materials.png'],
    ['Roofing Materials', 'china-sourcing-roofing-materials.png'],
    ['Exterior Finishing Materials', 'china-sourcing-exterior-finishing-materials.png'],
    ['Windows and Doors', 'china-sourcing-windows-and-doors.png'],
    ['Floor Tiles', 'china-sourcing-floor-tiles.png'],
    ['Hardwood Flooring', 'china-sourcing-hardwood-flooring.png'],
    ['Plumbing and Electrical Materials', 'china-sourcing-plumbing-and-electrical-materials.png'],
    ['Specialty Construction Materials', 'china-sourcing-specialty-construction-materials.png'],
  ],
  'chemicals-cleaning': [
    ['Cleaning Chemicals', 'china-sourcing-cleaning-chemicals.png'],
    ['Sanitizing and Hand Hygiene', 'china-sourcing-sanitizing-and-hand-hygiene.png'],
    ['Industrial and Specialized Cleaning', 'china-sourcing-industrial-and-specialized-cleaning.png'],
    ['Specialty Cleaning Products', 'china-sourcing-specialty-cleaning-products.png'],
  ],
  'corporate-promotional-products': [
    ['Branded Apparel', 'china-sourcing-branded-apparel.png'],
    ['Travel Accessories', 'china-sourcing-travel-accessories.png'],
    ['Writing Instruments', 'china-sourcing-writing-instruments.png'],
    ['Drinkware', 'china-sourcing-drinkware.png'],
    ['Tech Gadgets', 'china-sourcing-tech-gadgets.png'],
    ['Office Supplies', 'china-sourcing-office-supplies.png'],
    ['Bags and Totes', 'china-sourcing-bags-and-totes.png'],
    ['Keychains', 'china-sourcing-keychains.png'],
    ['Calendars and Planners', 'china-sourcing-calendars-and-planners.png'],
    ['Umbrellas', 'china-sourcing-umbrellas.png'],
    ['Health and Wellness Products', 'china-sourcing-health-and-wellness-products.png'],
    ['Environmental and Sustainable Products', 'china-sourcing-environmental-and-sustainable-products.png'],
  ],
  'food-drinks': [
    ['Rice and commodities', 'china-sourcing-rice-and-commodities.png'],
    ['Frozen fruit', 'china-sourcing-frozen-fruit.png'],
    ['Canned fruit', 'china-sourcing-canned-fruit.png'],
    ['Dried fruits', 'china-sourcing-dried-fruits.png'],
    ['Frozen meat and seafood', 'china-sourcing-frozen-meat-and-seafood.png'],
    ['Canned meat and seafood', 'china-sourcing-canned-meat-and-seafood.png'],
    ['Ready-to-eat', 'china-sourcing-ready-to-eat.png'],
    ['Organic products', 'china-sourcing-organic-products.png'],
    ['Condiments', 'china-sourcing-condiments.png'],
    ['Snacks', 'china-sourcing-snacks.png'],
    ['Beverages', 'china-sourcing-beverages.png'],
    ['Seasonal items', 'china-sourcing-seasonal-items.png'],
  ],
  'gym-fitness': [
    ['Exercise Equipment', 'china-sourcing-exercise-equipment.png'],
    ['Strength Training', 'china-sourcing-strength-training.png'],
    ['Functional Fitness', 'china-sourcing-functional-fitness.png'],
    ['Yoga and Pilates', 'china-sourcing-yoga-and-pilates.png'],
    ['Recovery and Wellness', 'china-sourcing-recovery-and-wellness.png'],
    ['Accessories', 'china-sourcing-accessories.png'],
    ['Cardio Machines', 'china-sourcing-cardio-machines.png'],
    ['Custom Branding', 'china-sourcing-custom-branding.png'],
  ],
  'hardware-tools': [
    ['Power Tools', 'china-sourcing-power-tools.png'],
    ['Hand Tools', 'china-sourcing-hand-tools.png'],
    ['Cutting Tools', 'china-sourcing-cutting-tools.png'],
    ['Fasteners and Hardware', 'china-sourcing-fasteners-and-hardware.png'],
    ['Measuring and Layout Tools', 'china-sourcing-measuring-and-layout-tools.png'],
    ['Painting and Finishing Tools', 'china-sourcing-painting-and-finishing-tools.png'],
    ['Safety Equipment', 'china-sourcing-safety-equipment.png'],
    ['Storage and Organization', 'china-sourcing-storage-and-organization.png'],
  ],
  'hospitality-items': [
    ['Bedroom Items', 'china-sourcing-bedroom-items.png'],
    ['Bathroom Items', 'china-sourcing-bathroom-items.png'],
    ['In-Room Electronics', 'china-sourcing-in-room-electronics.png'],
    ['Room Amenities', 'china-sourcing-room-amenities.png'],
    ['Conference/Meeting Room Items', 'china-sourcing-conference-meeting-room-items.png'],
    ['Hotel Linens and Uniforms', 'china-sourcing-hotel-linens-and-uniforms.png'],
    ['Outdoor Furnishings', 'china-sourcing-outdoor-furnishings.png'],
    ['Guest Services', 'china-sourcing-guest-services.png'],
  ],
  'household-appliances': [
    ['Kitchen Appliances', 'china-sourcing-kitchen-appliances.png'],
    ['Laundry Appliances', 'china-sourcing-laundry-appliances.png'],
    ['Cleaning Appliances', 'china-sourcing-cleaning-appliances.png'],
    ['Climate Control Appliances', 'china-sourcing-climate-control-appliances.png'],
    ['Personal Care Appliances', 'china-sourcing-personal-care-appliances.png'],
    ['Entertainment and Communication Appliances', 'china-sourcing-entertainment-and-communication-appliances.png'],
    ['Small Kitchen Appliances', 'china-sourcing-small-kitchen-appliances.png'],
    ['Smart Home Appliances', 'china-sourcing-smart-home-appliances.png'],
  ],
  'point-of-sale': [
    ['Signage', 'china-sourcing-signage.png'],
    ['Display Stands', 'china-sourcing-display-stands.png'],
    ['Interactive Displays', 'china-sourcing-interactive-displays.png'],
    ['Packaging Enhancements', 'china-sourcing-packaging-enhancements.png'],
    ['In-Store Audio', 'china-sourcing-in-store-audio.png'],
    ['Floor Graphics', 'china-sourcing-floor-graphics.png'],
    ['Cash Register Displays', 'china-sourcing-cash-register-displays.png'],
    ['Screens or Displays at Checkout', 'china-sourcing-screens-or-displays-at-checkout.png'],
    ['Sampling Stations', 'china-sourcing-sampling-stations.png'],
    ['Lighting Enhancements', 'china-sourcing-lighting-enhancements.png'],
    ['Interactive Kiosks', 'china-sourcing-interactive-kiosks.png'],
    ['Queue Management', 'china-sourcing-queue-management.png'],
    ['Product Dispensers', 'china-sourcing-product-dispensers.png'],
  ],
  'textiles-garments': [
    ['Active Wear', 'china-sourcing-active-wear.png'],
    ['Sleep Wear', 'china-sourcing-sleep-wear.png'],
    ['Work Wear', 'china-sourcing-work-wear.png'],
    ['Leisure Wear', 'china-sourcing-leisure-wear.png'],
    ['Casual Wear', 'china-sourcing-casual-wear.png'],
    ['Formal Wear', 'china-sourcing-formal-wear.png'],
  ],
};

async function seedProductSourceItemGaps(strapi) {
  for (const [slug, items] of Object.entries(PRODUCT_SOURCE_ITEMS_GAPS)) {
    const sourceItems = [];
    for (const [title, filename] of items) {
      const uploaded = await uploadImage(strapi, filename, { alt: title });
      sourceItems.push({ title, image: uploaded ? uploaded.id : null });
    }
    await upsertBySlug(strapi, 'api::product.product', slug, { sourceItems });
  }
  console.log(`  • sourceItems bù thêm cho: ${Object.keys(PRODUCT_SOURCE_ITEMS_GAPS).length} product`);
}

// ---------- 2. testimonial cho 6 product chưa có ----------
const TESTIMONIAL_GAPS = [
  ['bedding-home', 'Ella Thompson', 'Sourcing Lead, Haven Stays (Australia)',
    'We source premium linen sets for boutique hotels in Australia. China Sourcing Co helped us find OEKO-TEX certified suppliers who could customize thread count, color palettes, and packaging. The consistency in quality and their ability to manage small-batch orders set them apart.',
    'china-sourcing-testimonial-bedding-home-300x204.png', 'customer-testimonials-25.png', 1],
  ['bedding-home', 'Rechael Ortiz', 'Co-Founder, Luno Living (Spain)',
    'Our homeware brand needed private label duvet covers and cushion sets with strict sustainability standards. China Sourcing Co not only audited the factories but also proposed eco-friendly materials we hadn’t considered. Their team thinks ahead and that’s invaluable in retail.',
    'china-sourcing-testimonial-bedding-home-1-300x204.png', 'customer-testimonials-26.png', 2],
  ['building-materials', 'Tez Zayed', 'Head of Procurement, Horizon Construction Group (UAE)',
    'During the procurement of facade panels for a commercial complex in Dubai, China Sourcing Co\'s comprehensive handling of technical specifications, fire rating certifications, and long-distance shipping packaging was particularly commendable. The shipment arrived punctually, meeting all requirements without incident.',
    'china-sourcing-testimonial-building-materials-1-300x204.png', 'customer-testimonials-3.png', 1],
  ['building-materials', 'Lorenzo Bianchi', 'Director of Operations, CasaLinea Projects (Italy)',
    'Previously, the acquisition of large-scale tile supplies presented significant challenges. Through collaboration with China Sourcing Co, the sourcing of three distinct product lines: porcelain, mosaic, and wood-look tiles, was consolidated into a unified project. This initiative resulted in a 15% reduction in total landed costs and a substantial decrease in coordination time.',
    'china-sourcing-testimonial-building-materials-1-1-300x204.png', 'customer-testimonials-4.png', 2],
  ['chemicals-cleaning', 'Hana Ferretti', 'Supply Chain Lead, VitaNova Stores (Italy)',
    'Acquiring regulatory-compliant cleaning agents for our EU retail expansion presented significant challenges until our collaboration with China Sourcing Co. They furnished comprehensive Safety Data Sheets, REACH and CLP documentation for each product and facilitated labeling adjustments for customs adherence.',
    'china-sourcing-testimonial-chemicals-cleaning-1-300x204.png', 'customer-testimonials-5.png', 1],
  ['chemicals-cleaning', 'Peter Wang', 'Operations Supervisor, Long Side Logistics (Singapore)',
    'A transition to a range of environmentally sustainable industrial degreasers procured through China Sourcing Co resulted in an 18% cost reduction. Notably, the product quality surpassed that of our former German supplier. The procurement process was transparent and devoid of unexpected complications.',
    'china-sourcing-testimonial-chemicals-cleaning-300x204.png', 'customer-testimonials-6.png', 2],
  ['food-drinks', 'Naomi Tanaka', 'Founder, Midori & Co. (Korea)',
    'When procuring artisanal snacks for our Japanese-style gift baskets, China Sourcing Co facilitated the identification of authentic Original Equipment Manufacturer (OEM) producers and provided valuable assistance with shelf-life testing and bilingual labeling.',
    'china-sourcing-testimonial-food-drink-products-300x204.png', 'customer-testimonials-12.png', 1],
  ['food-drinks', 'Jacob Linwood', 'CEO, Drip District (Australia)',
    'For our startup endeavoring to launch cold brew in aluminum cans, both reliability and expediency were paramount. They facilitated an introduction to a Hazard Analysis Critical Control Point (HACCP)-certified co-packer located in Fujian, who possessed the capability to manage both formulation and export-ready packaging.',
    'china-sourcing-testimonial-food-drink-products-1-300x204.png', 'customer-testimonials-11.png', 2],
  ['hardware-tools', 'Kady Kenedy', 'Procurement Manager, StrucWerk GmbH (Germany)',
    'StrucWerk GmbH required a substantial quantity of industrial-grade fasteners. Local pricing structures were significantly impacting profit margins. China Sourcing Co facilitated the identification of a supplier based in Zhejiang, who was already servicing European Original Equipment Manufacturers. After six months of import, no quality discrepancies have been noted.',
    'china-sourcing-testimonial-hardware-tools-300x204.png', 'customer-testimonials-15.png', 1],
  ['hardware-tools', 'Isabella Chen', 'Founder, TeknoFix Tools (Australia)',
    'TeknoFix Tools required various tools, including custom wrenches and precision screwdriver sets. All items were delivered punctually, featuring laser-etched logos and packaging compliant with European Union market regulations. The on-site quality control reports were comprehensive and delivered promptly.',
    'china-sourcing-testimonial-hardware-tools-1-300x204.png', 'customer-testimonials-16.png', 2],
  ['textiles-garments', 'Amanda Liu', 'Product Director, TerraFit (USA)',
    'We were developing a sustainable activewear line and needed a supplier who could deliver both performance and eco-friendly materials. China Sourcing Co connected us with a factory specializing in recycled nylon and handled all the fit samples and compliance checks. The results matched exactly what we designed.',
    'china-sourcing-testimonial-textiles-garments-300x204.png', 'customer-testimonials-27.png', 1],
  ['textiles-garments', 'Julien Morel', 'Sourcing Manager, Voie Blanche (France)',
    'As a fast-growing fashion brand, lead time and consistency are everything. China Sourcing Co helped us diversify our supplier base in Guangzhou and monitored production weekly. They caught fabric shade issues before shipping which saved our launch schedule.',
    'china-sourcing-testimonial-textiles-garments-1-300x204.png', 'customer-testimonials-28.png', 2],
];

async function seedTestimonialGaps(strapi, productMap) {
  for (const [pslug, authorName, authorRole, quote, imageFile, avatarFile, order] of TESTIMONIAL_GAPS) {
    const image = await uploadImage(strapi, imageFile, { alt: authorName });
    const authorAvatar = await uploadImage(strapi, avatarFile, { alt: authorName });
    await upsertByField(strapi, 'api::testimonial.testimonial', 'authorName', authorName, {
      authorName, authorRole, quote, order,
      image: image ? image.id : null,
      authorAvatar: authorAvatar ? authorAvatar.id : null,
      product: productMap[pslug] ? { connect: [productMap[pslug]] } : undefined,
    });
  }
  console.log(`  • testimonial bù thêm: ${TESTIMONIAL_GAPS.length}`);
}

// ---------- 3. 42 partner (7 category x 6 logo) ----------
const PARTNER_CATEGORY_SLUGS = {
  'Furniture & Interior': 'furniture-interior',
  'Promotional Products': 'promotional-products',
  'Gym & Fitness': 'gym-fitness',
  'Point of Sale': 'point-of-sale',
  'Machinery': 'machinery',
  'Hospitality Items': 'hospitality-items',
  'Household Appliances': 'household-appliances',
};

const PARTNER_LOGOS = {
  'Furniture & Interior': ['furniture-factory-logo-1-1-300x82.png', 'furniture-factory-logo-300x82.png', 'furniture-factory-logo-5-2-300x82.png', 'furniture-factory-logo-3-300x82.png', 'furniture-factory-logo-4-300x82.png', 'furniture-factory-logo-2-1-300x82.png'],
  'Promotional Products': ['promotional-products-factory-logo-1-300x82.png', 'promotional-products-factory-logo-2-300x82.png', 'promotional-products-factory-logo-3-300x82.png', 'promotional-products-factory-logo-4-300x82.png', 'promotional-products-factory-logo-5-300x82.png', 'promotional-products-factory-logo-6-300x82.png'],
  'Gym & Fitness': ['gym-fitness-factory-logo-1-300x82.png', 'gym-fitness-factory-logo-2-300x82.png', 'gym-fitness-factory-logo-3-300x82.png', 'gym-fitness-factory-logo-4-300x82.png', 'gym-fitness-factory-logo-5-300x82.png', 'gym-fitness-factory-logo-6-300x82.png'],
  'Point of Sale': ['point-of-sale-factory-logo-1-300x82.png', 'point-of-sale-factory-logo-2-300x82.png', 'point-of-sale-factory-logo-3-300x82.png', 'point-of-sale-factory-logo-4-300x82.png', 'point-of-sale-factory-logo-5-300x82.png', 'point-of-sale-factory-logo-6-300x82.png'],
  'Machinery': ['machinery-factory-logo-1-300x82.png', 'machinery-factory-logo-2-300x82.png', 'machinery-factory-logo-3-300x82.png', 'machinery-factory-logo-4-300x82.png', 'machinery-factory-logo-5-300x82.png', 'machinery-factory-logo-6-300x82.png'],
  'Hospitality Items': ['hospitality-factory-logo-1-300x82.png', 'hospitality-factory-logo-2-300x82.png', 'hospitality-factory-logo-3-300x82.png', 'hospitality-factory-logo-4-300x82.png', 'hospitality-factory-logo-5-300x82.png', 'hospitality-factory-logo-6-300x82.png'],
  'Household Appliances': ['household-appliances-logo-1-300x82.png', 'household-appliances-logo-2-300x82.png', 'household-appliances-logo-3-300x82.png', 'household-appliances-logo-4-300x82.png', 'household-appliances-logo-5-300x82.png', 'household-appliances-logo-6-300x82.png'],
};

async function seedPartners(strapi) {
  let count = 0;
  for (const [categoryName, logos] of Object.entries(PARTNER_LOGOS)) {
    const categorySlug = PARTNER_CATEGORY_SLUGS[categoryName];
    const category = await strapi.documents('api::partner-category.partner-category').findFirst({
      filters: { slug: { $eq: categorySlug } }, status: 'draft',
    });
    if (!category) {
      console.log(`  ! không thấy partner-category slug=${categorySlug}`);
      continue;
    }
    for (let i = 0; i < logos.length; i++) {
      const name = `${categoryName} Partner ${i + 1}`;
      const uploaded = await uploadImage(strapi, logos[i], { alt: name });
      await upsertByField(strapi, 'api::partner.partner', 'name', name, {
        name, order: i + 1,
        logo: uploaded ? uploaded.id : null,
        category: { connect: [category.documentId] },
      });
      count++;
    }
  }
  console.log(`  • partner: ${count} (tên là placeholder theo category — site gốc không công khai tên đối tác thật)`);
}

module.exports = { seedProductSourceItemGaps, seedTestimonialGaps, seedPartners };

if (require.main === module) {
  (async () => {
    const app = await createStrapi(await compileStrapi()).load();
    try {
      console.log('\n=== SEED GAPS ===');
      await seedProductSourceItemGaps(app);

      const productMap = {};
      for (const slug of Object.keys(TESTIMONIAL_GAPS.reduce((m, [s]) => ((m[s] = 1), m), {}))) {
        const p = await app.documents('api::product.product').findFirst({ filters: { slug: { $eq: slug } }, status: 'draft' });
        if (p) productMap[slug] = p.documentId;
      }
      await seedTestimonialGaps(app, productMap);

      await seedPartners(app);
    } finally {
      await app.destroy();
    }
  })();
}
