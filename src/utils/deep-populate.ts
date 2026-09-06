import type { Core } from '@strapi/strapi';

/**
 * Dựng populate SÂU TOÀN BỘ cho 1 content-type/component, tự đọc từ schema thay vì
 * chép tay từng field media như cách strapi-olco đang làm (`PAGE_POPULATE` viết tay
 * trong mỗi controller — dễ quên 1 field media lồng sâu, API vẫn trả 200 nhưng field
 * đó lặng lẽ rỗng, không có lỗi nào báo).
 *
 * Strapi v5 chỉ populate component Ở CẤP 1 theo mặc định — component/media nằm bên
 * trong 1 component khác luôn cần populate tường minh. Hàm này đệ quy theo đúng
 * schema thật nên không bao giờ bỏ sót, kể cả khi content-type đổi field sau này.
 */
interface SchemaAttribute {
  type: string;
  component?: string;
  target?: string;
}

interface SchemaLike {
  attributes?: Record<string, SchemaAttribute>;
}

// Field ẩn Strapi tự gắn lên MỌI content-type (i18n, admin audit) — không phải
// nội dung thật, và `localizations` tự trỏ về chính content-type đó nên đệ quy
// vào là vòng lặp ngay lập tức.
const SKIP_RELATION_KEYS = new Set(['createdBy', 'updatedBy', 'localizations']);

export function buildDeepPopulate(
  strapi: Core.Strapi,
  uid: string,
  depth = 0,
  visiting: ReadonlySet<string> = new Set()
): unknown {
  if (depth > 6) return true; // chặn đệ quy vô hạn nếu có component tự tham chiếu
  if (visiting.has(uid)) return true; // đã đi qua uid này trong nhánh hiện tại — dừng, tránh vòng lặp
  const schema = (strapi.getModel as (uid: string) => SchemaLike | undefined)(uid);
  if (!schema?.attributes) return true;

  const nextVisiting = new Set(visiting);
  nextVisiting.add(uid);

  // `nested` suy biến về `true` khi đệ quy chạm trần độ sâu hoặc gặp lại 1 uid
  // đã đi qua (`visiting`), hoặc về `{}` khi component/relation đó chỉ toàn field
  // vô hướng. Cả 2 trường hợp phải gộp thành `populate[key] = true` — KHÔNG được
  // bọc thêm 1 lớp `{ populate: true }`, vì Strapi validate populate lồng phải là
  // object/mảng/`"*"`, không nhận `true` làm giá trị populate lồng (400 "Invalid
  // key true"). `{ populate: {} }` thì qs lại tự bỏ mất key rỗng lồng nhau, nên
  // vẫn phải quy về `true` — không phải bỏ qua.
  function toPopulateValue(nested: unknown): unknown {
    if (nested === true) return true;
    const isEmpty = typeof nested === 'object' && nested !== null && Object.keys(nested).length === 0;
    return isEmpty ? true : { populate: nested };
  }

  const populate: Record<string, unknown> = {};
  for (const [key, attr] of Object.entries(schema.attributes)) {
    if (attr.type === 'component' && attr.component) {
      populate[key] = toPopulateValue(buildDeepPopulate(strapi, attr.component, depth + 1, nextVisiting));
    } else if (attr.type === 'dynamiczone' || attr.type === 'media') {
      populate[key] = true;
    } else if (
      attr.type === 'relation' &&
      attr.target?.startsWith('api::') &&
      !SKIP_RELATION_KEYS.has(key)
    ) {
      // Trước đây bỏ sót nhánh này: 1 relation nằm TRONG 1 component (vd
      // `sections.testimonial-carousel.testimonials`, hay relation ngay trên
      // content-type như `partner.category`) không bao giờ được populate —
      // Strapi trả 200 nhưng field đó vắng mặt hoàn toàn khỏi response, không
      // báo lỗi gì (đúng kiểu lỗi mà toàn bộ file này được viết ra để tránh,
      // nhưng lại chừa relation ra ngoài). Đệ quy y hệt nhánh component; chỉ
      // theo relation trỏ tới content-type của mình (`api::…`, không phải
      // `admin::`/`plugin::`) — quan hệ qua lại (vd resource.categories <->
      // category.resources) tự dừng nhờ `visiting`, không đợi tới depth 6.
      populate[key] = toPopulateValue(buildDeepPopulate(strapi, attr.target, depth + 1, nextVisiting));
    }
  }
  return populate;
}

/**
 * Gắn deep populate vào `ctx.query` — NHƯNG chỉ khi client chưa tự khai
 * `populate`.
 *
 * Bản trước ghi đè vô điều kiện, nên không có cách nào xin một response gọn:
 * `/api/blog-posts` luôn trả kèm `content` đầy đủ của 131 bài, và vì
 * `categories` được populate ngược lại thành `category.blogPosts` nên mỗi bài
 * còn kéo theo content của mọi bài cùng category — 18 MB cho một trang danh
 * sách chỉ cần tiêu đề và ảnh. Next cũng không cache nổi (trần 2 MB/entry), nên
 * mỗi lần F5 là tải lại toàn bộ.
 *
 * Deep populate vẫn là mặc định (đó là lý do nó tồn tại: không bỏ sót media lồng
 * sâu); client nào biết mình cần gì thì tự khai `populate` và `fields`.
 */
export function applyDeepPopulate(
  ctx: { query?: Record<string, unknown> },
  strapi: Core.Strapi,
  uid: string
): void {
  const query = ctx.query ?? {};
  if (query.populate !== undefined) return;
  ctx.query = { ...query, populate: buildDeepPopulate(strapi, uid) };
}
