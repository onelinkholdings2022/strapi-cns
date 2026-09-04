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
}

interface SchemaLike {
  attributes?: Record<string, SchemaAttribute>;
}

export function buildDeepPopulate(strapi: Core.Strapi, uid: string, depth = 0): unknown {
  if (depth > 6) return true; // chặn đệ quy vô hạn nếu có component tự tham chiếu
  const schema = (strapi.getModel as (uid: string) => SchemaLike | undefined)(uid);
  if (!schema?.attributes) return true;

  const populate: Record<string, unknown> = {};
  for (const [key, attr] of Object.entries(schema.attributes)) {
    if (attr.type === 'component' && attr.component) {
      const nested = buildDeepPopulate(strapi, attr.component, depth + 1);
      // Component chỉ chứa field vô hướng (vd shared.tag/shared.button) đệ quy ra
      // populate rỗng {} — Koa `ctx.query = {...}` dùng qs.stringify để build lại
      // querystring, và qs BỎ LUÔN key có giá trị là object rỗng lồng nhau. Nếu để
      // `{ populate: {} }` thì `heroButton`/`sourceTag`/`faqItems` biến mất khỏi
      // query thật gửi đi, API trả 200 nhưng field đó lặng lẽ không populate nữa
      // (đã bắt được lỗi này khi test /api/products — heroButton/faqItems mất tích).
      const isEmpty = typeof nested === 'object' && nested !== null && Object.keys(nested).length === 0;
      populate[key] = isEmpty ? true : { populate: nested };
    } else if (attr.type === 'dynamiczone' || attr.type === 'media') {
      populate[key] = true;
    }
  }
  return populate;
}
