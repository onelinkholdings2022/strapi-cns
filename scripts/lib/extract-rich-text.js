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
/**
 * Site gốc dùng lazy-load (plugin LiteSpeed/`lozad`): `<img>` thật trong bài
 * viết có `src="data:image/gif;base64,...."` (placeholder rỗng, chỉ đổi
 * thành ảnh thật bằng JS khi cuộn tới) và URL thật nằm ở `data-src`/
 * `data-srcset`/`data-sizes`. `dangerouslySetInnerHTML` không chạy JS của họ
 * nên ảnh nội dung hiện trống trơn nếu giữ nguyên — phải tự thay `src` bằng
 * giá trị `data-src` (và `srcset`/`sizes` tương ứng) trước khi lưu vào Strapi.
 */
function fixLazyImages(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const dataSrc = tag.match(/\sdata-src="([^"]*)"/i);
    if (!dataSrc || !/\ssrc="data:image\/gif;base64,/i.test(tag)) return tag;

    let fixed = tag.replace(/\ssrc="data:image\/gif;base64,[^"]*"/i, ` src="${dataSrc[1]}"`);

    const dataSrcset = fixed.match(/\sdata-srcset="([^"]*)"/i);
    if (dataSrcset) {
      fixed = /\ssrcset="/i.test(fixed)
        ? fixed.replace(/\ssrcset="[^"]*"/i, ` srcset="${dataSrcset[1]}"`)
        : fixed.replace(/\sdata-srcset="/i, ` srcset="${dataSrcset[1]}" data-srcset="`);
    }

    return fixed;
  });
}

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
  return fixLazyImages(html.slice(contentStart, i));
}

module.exports = { extractRichText };
