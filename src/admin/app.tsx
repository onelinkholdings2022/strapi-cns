import type { StrapiApp } from '@strapi/strapi/admin';
import {
  setPluginConfig,
  defaultHtmlPreset,
  defaultMarkdownPreset,
  type Preset,
} from '@_sh/strapi-plugin-ckeditor';
import { ArticleCtaPlugin } from './ckeditor/ArticleCtaPlugin';

/**
 * Preset `defaultHtml` (đang dùng cho `content` của blog-post và resource) cộng
 * thêm nút "CTA Box". Giữ NGUYÊN tên preset — field trong schema trỏ tới preset
 * theo tên, đổi tên là ô Content của 144 bài mất editor.
 */
function withArticleCta(preset: Preset): Preset {
  const cfg = preset.editorConfig;
  const toolbar = Array.isArray(cfg.toolbar) ? [...cfg.toolbar] : cfg.toolbar;
  if (Array.isArray(toolbar)) {
    const at = toolbar.indexOf('htmlEmbed');
    toolbar.splice(at >= 0 ? at + 1 : toolbar.length, 0, 'articleCta');
  }
  return {
    ...preset,
    editorConfig: {
      ...cfg,
      plugins: [...(cfg.plugins ?? []), ArticleCtaPlugin],
      toolbar,
    },
  };
}

export default {
  config: {
    locales: [],
  },
  register() {
    // Phải gọi trong `register` — sau bootstrap cấu hình plugin đã bị khoá.
    setPluginConfig({
      presets: [withArticleCta(defaultHtmlPreset), defaultMarkdownPreset],
    });
  },
  bootstrap(_app: StrapiApp) {},
};
