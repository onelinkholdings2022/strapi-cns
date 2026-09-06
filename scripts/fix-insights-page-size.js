'use strict';
/**
 * Hai listing đang để `pageSize = 12` trong khi trang gốc chỉ hiện 6 thẻ mỗi
 * trang:
 *   `resources-page.insights`  — theme phân trang client-side cho `.blog-item`
 *                                với `n = 6` (xem `main-*.js`); `/resources`
 *                                đang cao dư ~1500px.
 *   `case-studies-page.list`   — trang gốc render sẵn 6 thẻ và pager 3 trang cho
 *                                14 case study; `/case-studies` đang cao dư
 *                                ~1266px.
 *
 * (`.resource-item` là `n = 3`, không có field CMS tương ứng nên để trong
 * `resourceView.ts`.)
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/fix-insights-page-size.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const RESOURCES_PAGE_UID = 'api::resources-page.resources-page';
const CASE_STUDIES_PAGE_UID = 'api::case-studies-page.case-studies-page';

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const page = await app.documents(RESOURCES_PAGE_UID).findFirst({
      status: 'draft',
      populate: { insights: { populate: ['tag'] } },
    });
    if (!page?.insights) {
      console.log('! không thấy resources-page.insights');
      return;
    }
    console.log(`  pageSize: ${page.insights.pageSize} -> 6`);
    await app.documents(RESOURCES_PAGE_UID).update({
      documentId: page.documentId,
      data: { insights: { ...page.insights, pageSize: 6 } },
      status: 'published',
    });
    const cases = await app.documents(CASE_STUDIES_PAGE_UID).findFirst({
      status: 'draft',
      populate: { list: { populate: ['tag'] } },
    });
    if (cases?.list) {
      console.log(`  case-studies pageSize: ${cases.list.pageSize} -> 6`);
      await app.documents(CASE_STUDIES_PAGE_UID).update({
        documentId: cases.documentId,
        data: { list: { ...cases.list, pageSize: 6 } },
        status: 'published',
      });
    } else {
      console.log('! không thấy case-studies-page.list');
    }

    console.log('Done.');
  } finally {
    await app.destroy();
  }
})();
