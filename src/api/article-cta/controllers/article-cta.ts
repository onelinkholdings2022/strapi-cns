import { factories } from '@strapi/strapi';

// Không gắn deep populate: content type này chỉ có field vô hướng.
export default factories.createCoreController('api::article-cta.article-cta');
