import { factories } from "@strapi/strapi";
import { applyDeepPopulate } from "../../../utils/deep-populate";

const UID = "api::resources-page.resources-page";

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx) {
    applyDeepPopulate(ctx, strapi, UID);
    return super.find(ctx);
  },
}));
