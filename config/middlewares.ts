import type { Core } from '@strapi/strapi';

// PUBLIC_URL (vd: https://cms.chinasourcing.co) phải nằm trong img-src/media-src,
// nếu không Media Library admin sẽ hiện icon ảnh vỡ dù ảnh vẫn tải được ở public site.
export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  const publicUrl = env('PUBLIC_URL', '');
  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', publicUrl, 'market-assets.strapi.io'].filter(Boolean),
            'media-src': ["'self'", 'data:', 'blob:', publicUrl, 'market-assets.strapi.io'].filter(Boolean),
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
