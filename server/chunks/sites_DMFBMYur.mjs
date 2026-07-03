globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { signPending, verifyPending } from "./auth_DL5yvmzT.mjs";
import { pbkdf2Hash, verifyPassword as verifyPassword$1 } from "./users_DArBIlQW.mjs";
async function sha256hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function verifyPassword(plain, stored) {
  if (!stored || !stored.startsWith("pbkdf2$")) return false;
  return verifyPassword$1(stored, plain);
}
async function setSitePassword(env, slug, plain) {
  const hash = plain && plain.trim() ? await pbkdf2Hash(plain.trim()) : null;
  await env.DB.prepare("UPDATE sites SET password=?, updated_at=? WHERE slug=?").bind(hash, nowSec(), slug).run();
}
function unlockCookieName(slug) {
  return "su_" + slug.replace(/[^a-z0-9-]/gi, "");
}
const UNLOCK_TTL = 7 * 86400;
async function pwTag(stored) {
  return (await sha256hex(stored)).slice(0, 16);
}
async function makeUnlockCookie(env, slug, stored) {
  const payload = { slug, exp: Math.floor(Date.now() / 1e3) + UNLOCK_TTL, tag: await pwTag(stored) };
  const token = await signPending(env, payload);
  return `${unlockCookieName(slug)}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${UNLOCK_TTL}`;
}
async function isUnlocked(env, request, slug, stored) {
  const cookie = request.headers.get("cookie") ?? "";
  const m = new RegExp(`(?:^|;\\s*)${unlockCookieName(slug)}=([^;]+)`).exec(cookie);
  if (!m) return false;
  const p = await verifyPending(env, decodeURIComponent(m[1]));
  if (!p || p.slug !== slug) return false;
  if (p.exp < Math.floor(Date.now() / 1e3)) return false;
  return p.tag === await pwTag(stored);
}
async function siteLocked(env, request, site, adminPreview = false) {
  if (adminPreview || !site.password) return false;
  return !await isUnlocked(env, request, site.slug, site.password);
}
async function listSites(env) {
  return (await env.DB.prepare("SELECT * FROM sites ORDER BY (slug='home') DESC, updated_at DESC").all()).results;
}
async function getSite(env, slug) {
  return await env.DB.prepare("SELECT * FROM sites WHERE slug=?").bind(slug).first() ?? null;
}
async function getPublishedSite(env, slug) {
  return await env.DB.prepare("SELECT * FROM sites WHERE slug=? AND published=1").bind(slug).first() ?? null;
}
async function upsertSite(env, a) {
  const now = nowSec();
  await env.DB.prepare(
    "INSERT INTO sites (slug,title,body,published,show_join,created_at,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title,body=excluded.body,published=excluded.published,show_join=excluded.show_join,updated_at=excluded.updated_at"
  ).bind(a.slug, a.title, a.body ?? null, a.published ? 1 : 0, a.show_join ? 1 : 0, now, now).run();
}
async function deleteSite(env, slug) {
  await env.DB.prepare("DELETE FROM sites WHERE slug=?").bind(slug).run();
}
async function saveLayoutDraft(env, slug, layoutJson, title) {
  const now = nowSec();
  await env.DB.prepare("INSERT OR IGNORE INTO sites (slug,title,published,show_join,created_at,updated_at) VALUES (?,?,0,0,?,?)").bind(slug, title && title.trim() || slug, now, now).run();
  if (title && title.trim()) {
    await env.DB.prepare("UPDATE sites SET layout_draft=?, title=?, updated_at=? WHERE slug=?").bind(layoutJson, title.trim(), now, slug).run();
  } else {
    await env.DB.prepare("UPDATE sites SET layout_draft=?, updated_at=? WHERE slug=?").bind(layoutJson, now, slug).run();
  }
}
async function updatePageMeta(env, slug, a) {
  const now = nowSec();
  await env.DB.prepare("INSERT OR IGNORE INTO sites (slug,title,published,show_join,created_at,updated_at) VALUES (?,?,0,0,?,?)").bind(slug, a.title.trim() || slug, now, now).run();
  await env.DB.prepare("UPDATE sites SET title=?, show_join=?, updated_at=? WHERE slug=?").bind(a.title.trim() || slug, a.show_join ? 1 : 0, now, slug).run();
}
async function publishLayout(env, slug, by) {
  const now = nowSec();
  await env.DB.prepare("UPDATE sites SET layout=layout_draft, published=1, updated_at=? WHERE slug=?").bind(now, slug).run();
  const row = await env.DB.prepare("SELECT layout FROM sites WHERE slug=?").bind(slug).first();
  const layout = row?.layout;
  if (!layout) return;
  const max = await env.DB.prepare("SELECT MAX(version_no) AS m FROM site_layout_versions WHERE slug=?").bind(slug).first();
  const versionNo = (max?.m ?? 0) + 1;
  await env.DB.prepare("INSERT INTO site_layout_versions (id,slug,version_no,layout,published_by,published_at) VALUES (?,?,?,?,?,?)").bind(randomId(), slug, versionNo, layout, by ?? null, now).run();
}
async function listLayoutVersions(env, slug) {
  return (await env.DB.prepare("SELECT id,slug,version_no,published_by,published_at FROM site_layout_versions WHERE slug=? ORDER BY version_no DESC").bind(slug).all()).results;
}
async function restoreLayoutVersion(env, slug, versionNo) {
  const row = await env.DB.prepare("SELECT layout FROM site_layout_versions WHERE slug=? AND version_no=?").bind(slug, versionNo).first();
  if (!row) return null;
  await env.DB.prepare("UPDATE sites SET layout_draft=?, updated_at=? WHERE slug=?").bind(row.layout, nowSec(), slug).run();
  return row.layout;
}
async function clearLayout(env, slug) {
  await env.DB.prepare("UPDATE sites SET layout=NULL, layout_draft=NULL, updated_at=? WHERE slug=?").bind(nowSec(), slug).run();
}
export {
  clearLayout,
  deleteSite,
  getPublishedSite,
  getSite,
  listLayoutVersions,
  listSites,
  makeUnlockCookie,
  publishLayout,
  restoreLayoutVersion,
  saveLayoutDraft,
  setSitePassword,
  sha256hex,
  siteLocked,
  unlockCookieName,
  updatePageMeta,
  upsertSite,
  verifyPassword
};
