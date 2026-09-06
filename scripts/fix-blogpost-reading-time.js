'use strict';
/**
 * Điền `readingTime` cho mọi blog post.
 *
 * Trước đây frontend tính thời gian đọc từ `content`, nên MỌI trang có thẻ bài
 * (trang chủ, `/resources`, khối "Our Resources") đều phải tải nguyên văn 131
 * bài — 18 MB cho một danh sách chỉ cần tiêu đề, ảnh và ngày. Next cũng không
 * cache nổi response đó (trần 2 MB/entry) nên mỗi lần F5 là tải lại từ đầu.
 *
 * Lưu sẵn chuỗi "N min read" ở đây cho phép list query bỏ hẳn `content` khỏi
 * `fields`. Công thức PHẢI khớp `estimateReadTime()` trong
 * `chinasourcing-clone/src/lib/views/textUtils.ts` — số cũ và số mới lệch nhau
 * là người dùng thấy thời gian đọc nhảy khi chuyển trang.
 *
 * ⚠️ TẮT `npm run dev` (strapi develop) trước khi chạy:
 *   node scripts/fix-blogpost-reading-time.js
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const BLOG_POST_UID = 'api::blog-post.blog-post';

/** Bản sao 1:1 của `stripHtml` + `estimateReadTime` phía frontend. */
function estimateReadTime(html) {
  const text = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/\s+/g, ' ')
    .trim();
  const words = text.split(' ').filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    console.log('\n=== FIX BLOG-POST READING TIME ===');
    const posts = await app.documents(BLOG_POST_UID).findMany({
      status: 'draft',
      pagination: { pageSize: 500 },
    });
    let done = 0;
    let skipped = 0;
    for (const post of posts) {
      const value = estimateReadTime(post.content);
      if (post.readingTime === value) {
        skipped++;
        continue;
      }
      await app.documents(BLOG_POST_UID).update({
        documentId: post.documentId,
        data: { readingTime: value },
        status: 'published',
      });
      done++;
      if (done % 20 === 0) console.log(`  ... ${done}`);
    }
    console.log(`\nDone. cập nhật: ${done}, đã đúng sẵn: ${skipped}, tổng: ${posts.length}`);
  } finally {
    await app.destroy();
  }
})();
