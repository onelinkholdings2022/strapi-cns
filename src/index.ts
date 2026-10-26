import type { Core } from '@strapi/strapi';

/**
 * Content type mà frontend đọc qua API công khai nhưng dựng SAU lượt seed đầu.
 *
 * Tạo content type không tự cấp quyền cho role Public (xem
 * `scripts/open-resource-type-permission.js`), nên deploy xong endpoint trả 403
 * cho tới khi có người vào Settings bấm tay. Cấp ngay lúc khởi động thì không
 * còn bước nào để quên. Idempotent: quyền đã có thì bỏ qua.
 */
const PUBLIC_READ_UIDS = ['api::article-cta.article-cta'];

async function grantPublicRead(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  for (const uid of PUBLIC_READ_UIDS) {
    for (const action of ['find', 'findOne']) {
      const permAction = `${uid}.${action}`;
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: permAction, role: publicRole.id } });
      if (existing) continue;
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action: permAction, role: publicRole.id } });
      strapi.log.info(`[bootstrap] cấp quyền Public: ${permAction}`);
    }
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await grantPublicRead(strapi);
    } catch (err) {
      strapi.log.error('[bootstrap] không cấp được quyền Public', err);
    }
  },
};
