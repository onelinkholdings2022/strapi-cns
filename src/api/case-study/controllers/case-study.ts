import { factories } from "@strapi/strapi";
import { buildDeepPopulate } from "../../../utils/deep-populate";

const UID = "api::case-study.case-study";

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, populate: buildDeepPopulate(strapi, UID) };
    return super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query = { ...ctx.query, populate: buildDeepPopulate(strapi, UID) };
    return super.findOne(ctx);
  },
}));
