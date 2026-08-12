import type { UserConfig } from 'vite';

/**
 * Strapi 5.51.x loại các plugin kiểu này khỏi Vite dependency pre-bundling → CommonJS trong cây
 * phụ thuộc của plugin bị serve nguyên si, ESM không load được ⇒ ADMIN TRẮNG MÀN
 * ("does not provide an export named 'getter'" từ property-expr).
 * Chỉ ảnh hưởng `strapi develop`, không ảnh hưởng `strapi build`.
 * Upstream: strapi/strapi#27136 (đã merge ở #27264) — XOÁ FILE NÀY khi nâng lên bản Strapi có fix.
 * Bắt buộc đủ CẢ HAI tên package, thiếu cái thứ 2 thì admin load nhưng editor lỗi
 * 'Failed to resolve import "@ckeditor/ckeditor5-react"'.
 */
const KEEP_PREBUNDLED = ['@_sh/strapi-plugin-ckeditor', '@ckeditor/ckeditor5-react'];

export default (config: UserConfig) => {
  config.optimizeDeps = config.optimizeDeps ?? {};
  config.optimizeDeps.exclude = (config.optimizeDeps.exclude ?? []).filter(
    (dep) => !KEEP_PREBUNDLED.includes(dep)
  );

  return config;
};
