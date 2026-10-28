import {
  Plugin,
  Widget,
  toWidget,
  createDropdown,
  addListToDropdown,
  Collection,
  UIModel,
  type ListDropdownItemDefinition,
  type ModelElement,
  type ViewDowncastWriter,
} from 'ckeditor5';

/**
 * Nút "CTA Box" trong CKEditor — chèn một khung `Article CTA Box` vào BẤT KỲ chỗ
 * nào trong thân bài.
 *
 * Khung không nằm trong HTML của bài. Bài chỉ giữ một thẻ đánh dấu:
 *
 *     <div class="article-cta" data-cta="see-quality-control"></div>
 *
 * còn nội dung (heading, mô tả, nút, link, variant light/heavy) sống trong
 * collection `article-cta`. Frontend (`chinasourcing-clone`) đọc `data-cta`, gọi
 * `/api/article-ctas` và dựng khung đúng thiết kế tại đúng vị trí đó. Nhờ vậy
 * sửa một khung là mọi bài đang chèn nó đổi theo, và biên tập viên chọn màu
 * bằng một dropdown thay vì gõ HTML.
 *
 * Trong editor, thẻ đánh dấu hiện thành một widget xem trước (màu theo variant)
 * để biết mình đang chèn gì; kéo/xoá/cắt dán như một khối ảnh.
 */

export interface ArticleCta {
  slug: string;
  name: string;
  variant: 'light' | 'heavy';
  heading: string;
  description: string | null;
  buttonLabel: string | null;
}

const MODEL = 'articleCta';
const ATTR = 'ctaSlug';
const STYLE_ID = 'cns-article-cta-editor-style';

/** Bộ nhớ đệm dùng chung cho mọi editor trên trang (một bài có thể có 2 ô CKEditor). */
const cache = new Map<string, ArticleCta>();
/** Dấu vân tay của lần tải gần nhất — để biết danh sách có THẬT SỰ đổi không. */
let signature = '';
let loading: Promise<boolean> | null = null;

/**
 * Mọi khung xem trước đang có trên trang. Tải xong danh sách thì vẽ lại thẳng
 * những DOM này, KHÔNG đi qua `editing.reconvertItem` — hàm đó chạy một
 * `model.change`, bắn `change:data` và đánh dấu bài là "đã sửa" dù không ai sửa gì.
 */
const previews = new Map<HTMLElement, string>();

function rerenderPreviews() {
  for (const [dom, slug] of previews) {
    if (!dom.isConnected) previews.delete(dom);
    else renderPreview(dom, slug);
  }
}

function backendUrl(): string {
  const w = window as unknown as { strapi?: { backendURL?: string } };
  return (w.strapi?.backendURL ?? '').replace(/\/$/, '');
}

/** Trả `true` khi danh sách khác lần trước (lần đầu tải thành công cũng tính). */
async function loadCtas(force = false): Promise<boolean> {
  if (loading && !force) return loading;
  loading = (async () => {
    try {
      const res = await fetch(
        `${backendUrl()}/api/article-ctas?pagination[pageSize]=200&sort=name:asc`,
        { credentials: 'omit' }
      );
      if (!res.ok) return false;
      const json = (await res.json()) as { data?: ArticleCta[] };
      const rows = (json.data ?? []).filter((row) => row.slug);
      const next = JSON.stringify(
        rows.map((r) => [r.slug, r.name, r.variant, r.heading, r.description, r.buttonLabel])
      );
      if (next === signature) return false;
      signature = next;
      cache.clear();
      for (const row of rows) cache.set(row.slug, row);
      rerenderPreviews();
      return true;
    } catch {
      // Mất mạng / chưa cấp quyền Public: widget vẫn hiện slug, chỉ thiếu xem trước.
      return false;
    }
  })();
  return loading;
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.ck-content .cns-cta{margin:1em 0;font-family:Poppins,system-ui,sans-serif}
.cns-cta__box{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;border-radius:12px;padding:18px 22px}
.cns-cta__box[data-variant="light"]{background:#F4F7FD;border:1px solid #DCE4F7;color:#27308D}
.cns-cta__box[data-variant="heavy"]{background:#27308D;color:#fff;border-radius:16px}
.cns-cta__text{flex:1 1 240px;min-width:0}
.cns-cta__badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 8px;border-radius:999px;margin-bottom:6px;background:rgba(37,107,232,.12);color:#256BE8}
.cns-cta__box[data-variant="heavy"] .cns-cta__badge{background:rgba(255,255,255,.16);color:#fff}
.cns-cta__heading{font-size:16px;font-weight:600;line-height:1.4}
.cns-cta__desc{margin-top:4px;font-size:13px;line-height:1.55;color:#3A4060}
.cns-cta__box[data-variant="heavy"] .cns-cta__desc{color:#D5DAF5}
.cns-cta__btn{flex-shrink:0;font-size:13px;font-weight:600;padding:9px 16px;border-radius:8px;background:#256BE8;color:#fff;white-space:nowrap}
.cns-cta__box[data-variant="heavy"] .cns-cta__btn{background:#fff;color:#27308D}
.cns-cta__box[data-variant="missing"]{background:#FFF4F2;border:1px dashed #E0A497;color:#8A2E1C;font-size:13px}
`;
  document.head.appendChild(style);
}

/** Dựng phần xem trước bằng DOM API (textContent) — không bao giờ nhét HTML thô. */
function renderPreview(dom: HTMLElement, slug: string) {
  dom.textContent = '';
  const cta = cache.get(slug);
  const box = document.createElement('div');
  box.className = 'cns-cta__box';

  if (!cta) {
    box.dataset.variant = 'missing';
    box.textContent = `CTA Box "${slug}" — không tìm thấy (đã bị xoá, hoặc danh sách chưa tải xong).`;
    dom.appendChild(box);
    return;
  }

  box.dataset.variant = cta.variant === 'heavy' ? 'heavy' : 'light';
  const text = document.createElement('div');
  text.className = 'cns-cta__text';

  const badge = document.createElement('div');
  badge.className = 'cns-cta__badge';
  badge.textContent = `CTA Box · ${cta.variant === 'heavy' ? 'Heavy color' : 'Light color'}`;
  const heading = document.createElement('div');
  heading.className = 'cns-cta__heading';
  heading.textContent = cta.heading;
  text.append(badge, heading);

  if (cta.description) {
    const desc = document.createElement('div');
    desc.className = 'cns-cta__desc';
    desc.textContent = cta.description;
    text.appendChild(desc);
  }
  box.appendChild(text);

  if (cta.buttonLabel) {
    const btn = document.createElement('span');
    btn.className = 'cns-cta__btn';
    btn.textContent = `${cta.buttonLabel} →`;
    box.appendChild(btn);
  }
  dom.appendChild(box);
}

export class ArticleCtaPlugin extends Plugin {
  static get requires() {
    return [Widget] as const;
  }

  static get pluginName() {
    return 'ArticleCta' as const;
  }

  init() {
    const editor = this.editor;
    injectStyles();

    editor.model.schema.register(MODEL, {
      inheritAllFrom: '$blockObject',
      allowAttributes: [ATTR],
    });

    // HTML → model. `high` để thắng General HTML Support (preset cho phép mọi
    // thẻ div), không thì GHS nuốt thẻ thành một div thường.
    editor.conversion.for('upcast').elementToElement({
      view: { name: 'div', attributes: { 'data-cta': true } },
      model: (viewEl, { writer }) =>
        writer.createElement(MODEL, { [ATTR]: String(viewEl.getAttribute('data-cta') ?? '') }),
      converterPriority: 'high',
    });

    // Model → HTML lưu vào DB: chỉ thẻ đánh dấu.
    editor.conversion.for('dataDowncast').elementToElement({
      model: { name: MODEL, attributes: [ATTR] },
      view: (modelEl: ModelElement, { writer }: { writer: ViewDowncastWriter }) =>
        writer.createContainerElement('div', {
          class: 'article-cta',
          'data-cta': String(modelEl.getAttribute(ATTR) ?? ''),
        }),
    });

    // Model → vùng soạn thảo: widget có xem trước.
    editor.conversion.for('editingDowncast').elementToElement({
      model: { name: MODEL, attributes: [ATTR] },
      view: (modelEl: ModelElement, { writer }: { writer: ViewDowncastWriter }) => {
        const slug = String(modelEl.getAttribute(ATTR) ?? '');
        const container = writer.createContainerElement('div', { class: 'cns-cta' });
        const raw = writer.createRawElement('div', {}, (dom) => {
          previews.set(dom, slug);
          renderPreview(dom, slug);
        });
        writer.insert(writer.createPositionAt(container, 0), raw);
        return toWidget(container, writer, { label: 'CTA Box' });
      },
    });

    // Tải danh sách; xong thì `loadCtas` tự vẽ lại các khung xem trước.
    void loadCtas();

    editor.ui.componentFactory.add('articleCta', (locale) => {
      const dropdown = createDropdown(locale);
      dropdown.buttonView.set({
        label: 'CTA Box',
        withText: true,
        tooltip: 'Chèn khung CTA (tạo khung ở Content Manager › Article CTA Box)',
      });

      const items = new Collection<ListDropdownItemDefinition>();
      /** Danh sách đang hiển thị được dựng từ phiên bản dữ liệu nào. */
      let filledFrom: string | null = null;
      const fill = () => {
        filledFrom = signature;
        items.clear();
        if (cache.size === 0) {
          items.add({
            type: 'button',
            model: new UIModel({
              label: 'Chưa có khung nào — tạo ở Content Manager › Article CTA Box',
              withText: true,
              isEnabled: false,
            }),
          });
          return;
        }
        for (const cta of cache.values()) {
          items.add({
            type: 'button',
            model: new UIModel({
              label: `${cta.name}  ·  ${cta.variant === 'heavy' ? 'Heavy' : 'Light'}`,
              withText: true,
              ctaSlug: cta.slug,
            }),
          });
        }
      };
      fill();
      addListToDropdown(dropdown, items);

      // Mỗi lần mở dropdown thì tải lại — khung vừa tạo ở tab khác hiện ra ngay.
      //
      // Chỉ dựng lại danh sách khi nó THẬT SỰ đổi. Lúc mở, CKEditor đặt focus vào
      // mục đầu tiên; `items.clear()` gỡ đúng mục đó khỏi DOM, focus rơi ra
      // ngoài và `closeDropdownOnBlur` đóng dropdown ngay — người dùng chưa kịp
      // chọn gì. Khi buộc phải dựng lại thì trả focus về danh sách.
      dropdown.on('change:isOpen', (_evt, _name, isOpen) => {
        if (!isOpen) return;
        // Dữ liệu đã tải từ trước nhưng danh sách dựng khi còn rỗng: dựng lại
        // NGAY, đồng bộ — handler này chạy trước bước focus mục đầu của CKEditor
        // (priority low - 10) nên chưa có gì bị gỡ khỏi tay người dùng.
        if (filledFrom !== signature) fill();
        void loadCtas(true).then(() => {
          if (filledFrom === signature) return;
          fill();
          if (dropdown.isOpen) dropdown.listView?.focus();
        });
      });

      dropdown.on('execute', (evt) => {
        const slug = (evt.source as UIModel & { ctaSlug?: string }).ctaSlug;
        if (!slug) return;
        editor.model.change((writer) => {
          const el = writer.createElement(MODEL, { [ATTR]: slug });
          editor.model.insertObject(el, null, null, { setSelection: 'on' });
        });
        editor.editing.view.focus();
      });

      dropdown.bind('isEnabled').to(editor, 'isReadOnly', (ro) => !ro);
      return dropdown;
    });
  }
}
