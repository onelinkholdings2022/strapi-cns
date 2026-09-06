'use strict';
/**
 * Lấp mọi field Media đang `null` mà site gốc CÓ ảnh — frontend đang fallback
 * về `/images/blog-fallback.png` nên các khối này hiện sai hẳn ảnh:
 *
 *   homepage.whyChooseUs.features[].image        (6)  usp-slider "Why Choose Us"
 *   services-page.process.steps[].image          (6)  "Our Process / How We Source"
 *   services-page.categoryShowcase.tabs[].image   (5)  "Our Products / Explore by Category"
 *   service[].offerings.items[].icon            (18)  cube-01.svg
 *   service[].process.steps[].image             (25)  flow-track từng service
 *   service[].usp.image + usp.items[].icon      (25)  container + star-05-1 (navy)
 *   process-page.usp.items[].icon                (5)  star-05 (xanh)
 *   case-studies-page.usp.items[].icon           (6)  star-05 (xanh) — "What We Do Best"
 *   contact-page.getInTouch.socialLinks[].icon   (3)
 *   contact-page.whatHappensNext.steps[].image   (4)
 *   process-page.timeline.shipImage              (1)  Ship.png (field vừa thêm)
 *
 * Và thay 2 ảnh SAI (không null, nhưng không khớp bản gốc):
 *
 *   service[].cardImage — đang là bản thumbnail 300x168 của WordPress, phóng
 *     lên ~700px trong "Our Core Services" nên vỡ hạt. Site gốc khai srcset
 *     `…-300x168.png 768w, ….png 1024w` nên desktop dùng bản gốc — dùng bản gốc.
 *   resource[].featureImage/cover — đang là `resource-detail-fallback.webp`
 *     (1488x600). Trên site gốc resource KHÔNG có featured image, card rơi về
 *     `blog-fallback.png` của theme ở tỉ lệ 3/2.
 *   testimonial[].image — đang là bản 300x204; card rộng 448px nên site gốc
 *     dùng nhánh 684w của srcset.
 *
 * Ánh xạ tên ảnh: `media-gaps-data.json` (bóc từ HTML thật của từng trang).
 *
 * Idempotent — chạy lại chỉ gán lại đúng media cũ, không upload trùng.
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/fix-media-gaps.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { ensureImage } = require('./media-lib');

const D = require('./media-gaps-data.json');

const HOMEPAGE = 'api::homepage.homepage';
const SERVICES_PAGE = 'api::services-page.services-page';
const PROCESS_PAGE = 'api::process-page.process-page';
const CASE_STUDIES_PAGE = 'api::case-studies-page.case-studies-page';
const CONTACT_PAGE = 'api::contact-page.contact-page';
const SERVICE = 'api::service.service';
const RESOURCE = 'api::resource.resource';
const TESTIMONIAL = 'api::testimonial.testimonial';

/** id media theo tên file trong public/images (upload nếu chưa có). */
async function mediaId(app, filename) {
  const m = await ensureImage(app, filename, { alt: '' });
  if (!m) throw new Error(`không lấy được media cho ${filename}`);
  return m.id;
}

/**
 * Gán media cho từng phần tử của mảng component theo `keyField`.
 * `map` là { [giá trị keyField]: tên file }. Phần tử không có trong map giữ nguyên.
 */
async function attachByKey(app, items, keyField, mediaField, map) {
  const out = [];
  for (const item of items) {
    const filename = map[item[keyField]];
    // Media đã populate là object; ghi lại phải là id, kể cả khi giữ nguyên.
    const current = item[mediaField]?.id ?? item[mediaField] ?? null;
    out.push({ ...item, [mediaField]: filename ? await mediaId(app, filename) : current });
  }
  return out;
}

/** Số phần tử vừa được gán media (để log). */
const counted = (items, field) => items.filter((i) => i[field]).length;

async function single(app, uid, populate) {
  return app.documents(uid).findFirst({ status: 'draft', populate });
}

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== FIX MEDIA GAPS ===');

    // ── 1. homepage.whyChooseUs.features[].image ─────────────────────────────
    console.log('\n[1] homepage.whyChooseUs');
    const home = await single(app, HOMEPAGE, { whyChooseUs: { populate: { features: { populate: ['image'] } } } });
    if (home?.whyChooseUs) {
      const features = await attachByKey(app, home.whyChooseUs.features || [], 'title', 'image', D.homepageWhyChooseUs);
      await app.documents(HOMEPAGE).update({
        documentId: home.documentId,
        data: { whyChooseUs: { ...home.whyChooseUs, features } },
        status: 'published',
      });
      console.log(`  ✓ ${counted(features, 'image')}/${features.length} feature có ảnh`);
    }

    // ── 2. services-page: process steps + category tabs ──────────────────────
    console.log('\n[2] services-page.process + categoryShowcase');
    const svcPage = await single(app, SERVICES_PAGE, {
      process: { populate: { steps: { populate: ['image'] }, tag: true } },
      categoryShowcase: { populate: { tabs: { populate: ['image', 'product'] }, tag: true, button: true } },
    });
    if (svcPage) {
      const steps = await attachByKey(app, svcPage.process?.steps || [], 'title', 'image', D.servicesPageProcess);
      const tabs = [];
      for (const tab of svcPage.categoryShowcase?.tabs || []) {
        const filename = D.servicesPageCategoryTabs[tab.product?.slug];
        tabs.push({
          ...tab,
          product: tab.product?.id ?? null,
          image: filename ? await mediaId(app, filename) : tab.image?.id ?? null,
        });
      }
      await app.documents(SERVICES_PAGE).update({
        documentId: svcPage.documentId,
        data: {
          process: { ...svcPage.process, steps },
          categoryShowcase: { ...svcPage.categoryShowcase, tabs },
        },
        status: 'published',
      });
      console.log(`  ✓ ${counted(steps, 'image')}/${steps.length} process step, ${counted(tabs, 'image')}/${tabs.length} category tab`);
    }

    // ── 3. service[]: cardImage, offerings icon, process image, usp ──────────
    console.log('\n[3] service[] (4 trang dịch vụ)');
    const cube = await mediaId(app, 'cube-01.svg');
    const starNavy = await mediaId(app, 'star-05-1.png');
    const container = await mediaId(app, 'china-sourcing-container.png');
    const services = await app.documents(SERVICE).findMany({
      status: 'draft',
      populate: {
        cardImage: true,
        offerings: { populate: { items: { populate: ['icon'] } } },
        process: { populate: { steps: { populate: ['image'] }, tag: true } },
        usp: { populate: { items: { populate: ['icon'] }, image: true, tag: true } },
      },
    });
    for (const s of services) {
      const offeringItems = (s.offerings?.items || []).map((i) => ({ ...i, icon: cube }));
      const processSteps = await attachByKey(
        app,
        s.process?.steps || [],
        'title',
        'image',
        D.serviceProcessSteps[s.slug] || {}
      );
      const uspItems = (s.usp?.items || []).map((i) => ({ ...i, icon: starNavy }));
      const cardFile = D.serviceCardImages[s.slug];
      await app.documents(SERVICE).update({
        documentId: s.documentId,
        data: {
          ...(cardFile ? { cardImage: await mediaId(app, cardFile) } : {}),
          offerings: { ...s.offerings, items: offeringItems },
          process: { ...s.process, steps: processSteps },
          usp: { ...s.usp, items: uspItems, image: container },
        },
        status: 'published',
      });
      console.log(
        `  ✓ ${s.slug}: card=${cardFile || '—'}, ${offeringItems.length} offering, ` +
          `${counted(processSteps, 'image')}/${processSteps.length} step, ${uspItems.length} usp`
      );
    }

    // ── 4. star xanh: process-page + case-studies-page ("What We Do Best") ───
    console.log('\n[4] usp star (xanh) — process-page + case-studies-page');
    const starBlue = await mediaId(app, 'star-05.png');
    for (const uid of [PROCESS_PAGE, CASE_STUDIES_PAGE]) {
      const page = await single(app, uid, { usp: { populate: { items: { populate: ['icon'] }, image: true, tag: true } } });
      if (!page?.usp) continue;
      const items = (page.usp.items || []).map((i) => ({ ...i, icon: starBlue }));
      await app.documents(uid).update({
        documentId: page.documentId,
        data: { usp: { ...page.usp, items } },
        status: 'published',
      });
      console.log(`  ✓ ${uid}: ${items.length} item`);
    }

    // ── 5. process-page.timeline.shipImage ───────────────────────────────────
    console.log('\n[5] process-page.timeline.shipImage');
    const procPage = await single(app, PROCESS_PAGE, {
      timeline: { populate: { steps: true, tag: true, shipImage: true } },
    });
    if (procPage?.timeline) {
      await app.documents(PROCESS_PAGE).update({
        documentId: procPage.documentId,
        data: { timeline: { ...procPage.timeline, shipImage: await mediaId(app, 'Ship.png') } },
        status: 'published',
      });
      console.log('  ✓ Ship.png');
    }

    // ── 6. contact-page: social icon + "what happens next" ───────────────────
    console.log('\n[6] contact-page');
    const contact = await single(app, CONTACT_PAGE, {
      getInTouch: { populate: { socialLinks: { populate: ['icon'] }, infoItems: { populate: ['icon'] }, tag: true, form: true } },
      whatHappensNext: { populate: { steps: { populate: ['image'] }, tag: true } },
    });
    if (contact) {
      const socialLinks = await attachByKey(app, contact.getInTouch?.socialLinks || [], 'name', 'icon', D.contactSocialIcons);
      const infoItems = (contact.getInTouch?.infoItems || []).map((i) => ({ ...i, icon: i.icon?.id ?? null }));
      const steps = await attachByKey(app, contact.whatHappensNext?.steps || [], 'title', 'image', D.contactWhatHappensNext);
      await app.documents(CONTACT_PAGE).update({
        documentId: contact.documentId,
        data: {
          getInTouch: { ...contact.getInTouch, socialLinks, infoItems },
          whatHappensNext: { ...contact.whatHappensNext, steps },
        },
        status: 'published',
      });
      console.log(`  ✓ ${counted(socialLinks, 'icon')} social, ${counted(steps, 'image')}/${steps.length} step`);
    }

    // ── 7. resource[]: featured image = blog-fallback của theme ──────────────
    console.log('\n[7] resource[].featureImage/cover -> blog-fallback');
    const blogFallback = await mediaId(app, 'blog-fallback.png');
    const resources = await app.documents(RESOURCE).findMany({ status: 'draft', fields: ['slug'] });
    for (const r of resources) {
      await app.documents(RESOURCE).update({
        documentId: r.documentId,
        data: { featureImage: blogFallback, cover: blogFallback },
        status: 'published',
      });
    }
    console.log(`  ✓ ${resources.length} resource`);

    // ── 8. testimonial[].image -> bản 684w ───────────────────────────────────
    console.log('\n[8] testimonial[].image -> bản gốc 684w');
    const testimonials = await app.documents(TESTIMONIAL).findMany({ status: 'draft', populate: ['image'] });
    let done = 0;
    for (const t of testimonials) {
      const filename = D.testimonialImages[(t.authorName || '').trim()];
      if (!filename) {
        console.log(`  ! chưa ánh xạ ảnh cho "${t.authorName}"`);
        continue;
      }
      await app.documents(TESTIMONIAL).update({
        documentId: t.documentId,
        data: { image: await mediaId(app, filename) },
        status: 'published',
      });
      done++;
    }
    console.log(`  ✓ ${done}/${testimonials.length} testimonial`);

    console.log('\nDone.');
  } finally {
    await app.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
