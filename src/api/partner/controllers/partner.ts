import { factories } from "@strapi/strapi";
import { applyDeepPopulate } from "../../../utils/deep-populate";

const UID = "api::partner.partner";

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx) {
    applyDeepPopulate(ctx, strapi, UID);
    return super.find(ctx);
  },
  async findOne(ctx) {
    applyDeepPopulate(ctx, strapi, UID);
    return super.findOne(ctx);
  },
}));
