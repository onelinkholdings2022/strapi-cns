'use strict';
// Helpers dùng chung cho seed — KHÔNG đụng tới field Media (ảnh sẽ gắn sau).
// Rich text = Rich text (Blocks) mặc định của Strapi → JSON Blocks.
// (Đã thử CKEditor 5 ngày 2026-08-11: build sạch nhưng admin TRẮNG MÀN → đã gỡ, quay lại Blocks.)
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const p = (text) => `<p>${esc(text)}</p>`;
const blocks = (...texts) => texts.map(p).join('');
const html = blocks;
const tag = (label) => (label ? { label } : null);
const btn = (label, url, variant = 'primary') => ({ label, url: url || null, variant, openInNewTab: false });

async function upsertSingle(strapi, uid, data) {
  const existing = await strapi.documents(uid).findFirst({ status: 'draft' });
  if (existing) {
    await strapi.documents(uid).update({ documentId: existing.documentId, data, status: 'published' });
    return existing.documentId;
  }
  const created = await strapi.documents(uid).create({ data, status: 'published' });
  return created.documentId;
}

async function upsertBySlug(strapi, uid, slug, data) {
  const found = await strapi.documents(uid).findFirst({ filters: { slug: { $eq: slug } }, status: 'draft' });
  if (found) {
    const doc = await strapi.documents(uid).update({ documentId: found.documentId, data, status: 'published' });
    return doc.documentId;
  }
  const doc = await strapi.documents(uid).create({ data, status: 'published' });
  return doc.documentId;
}

async function upsertByField(strapi, uid, field, value, data) {
  const found = await strapi.documents(uid).findFirst({ filters: { [field]: { $eq: value } }, status: 'draft' });
  if (found) {
    const doc = await strapi.documents(uid).update({ documentId: found.documentId, data, status: 'published' });
    return doc.documentId;
  }
  const doc = await strapi.documents(uid).create({ data, status: 'published' });
  return doc.documentId;
}

module.exports = { p, blocks, html, tag, btn, upsertSingle, upsertBySlug, upsertByField };
