globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,47}$/;
function normalizeSlug(input) {
  const s = (input || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return s || "n" + Math.abs([...input || String(nowSec())].reduce((h, c) => Math.imul(h, 31) + c.charCodeAt(0) | 0, 7)).toString(36).slice(0, 8);
}
async function listPublishedPosts(env, limit = 50) {
  const { results } = await env.DB.prepare("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT ?").bind(limit).all();
  return results ?? [];
}
async function getPublishedPost(env, slug) {
  return await env.DB.prepare("SELECT * FROM posts WHERE slug=? AND published=1").bind(slug).first() ?? null;
}
async function listAllPosts(env) {
  const { results } = await env.DB.prepare("SELECT * FROM posts ORDER BY created_at DESC LIMIT 200").all();
  return results ?? [];
}
async function upsertPost(env, a) {
  const slug = SLUG_RE.test(a.slug) ? a.slug : normalizeSlug(a.slug || a.title);
  const dup = await env.DB.prepare("SELECT id FROM posts WHERE slug=? AND id<>?").bind(slug, a.id ?? "").first();
  if (dup) return { ok: false, error: "この URL（slug）は既に使われています。" };
  const now = nowSec();
  if (a.id) {
    await env.DB.prepare("UPDATE posts SET slug=?, title=?, body=?, published=?, updated_at=? WHERE id=?").bind(slug, a.title.slice(0, 200), (a.body ?? "").slice(0, 1e5), a.published ? 1 : 0, now, a.id).run();
  } else {
    await env.DB.prepare("INSERT INTO posts (id,slug,title,body,published,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").bind(randomId(), slug, a.title.slice(0, 200), (a.body ?? "").slice(0, 1e5), a.published ? 1 : 0, now, now).run();
  }
  return { ok: true };
}
async function deletePost(env, id) {
  await env.DB.prepare("DELETE FROM posts WHERE id=?").bind(id).run();
}
export {
  deletePost,
  getPublishedPost,
  listAllPosts,
  listPublishedPosts,
  normalizeSlug,
  upsertPost
};
