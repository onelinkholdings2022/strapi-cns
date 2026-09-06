'use strict';
/**
 * Site gốc chèn markup TOC (`ez-toc-section`) qua filter chỉ chạy khi render
 * TRANG THẬT (`the_content` trên page load) — REST API (`/wp-json/wp/v2/posts`,
 * `.../resource`) trả `content.rendered` KHÔNG có markup này dù cùng 1 bài.
 * Field `.content` trong Strapi phải khớp với thứ hiển thị trên trang thật
 * (kèm TOC), nên phải fetch trang đã render rồi bóc đúng khối
 * `<div class=" rich-text">…</div>` bên trong `#post-content-container`,
 * thay vì gọi REST API.
 */
function extractRichText(html) {
  const marker = '<div class=" rich-text">';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const contentStart = start + marker.length;

  let depth = 1;
  let i = contentStart;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = contentStart;
  let match;
  while ((match = tagRe.exec(html))) {
    if (match[0].startsWith('</')) depth--;
    else depth++;
    if (depth === 0) {
      i = match.index;
      break;
    }
  }
  if (depth !== 0) return null;
  return html.slice(contentStart, i);
}

module.exports = { extractRichText };
