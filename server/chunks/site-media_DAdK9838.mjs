globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
const kv = (env) => env.MEDIA ?? env.LICENSE;
const cleanId = (id) => String(id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);
function sanitizeSvg(input) {
  let s = String(input || "");
  if (!/<svg[\s>]/i.test(s)) return null;
  s = s.replace(/<\?xml[\s\S]*?\?>/gi, "");
  s = s.replace(/<!DOCTYPE[\s\S]*?>/gi, "");
  s = s.replace(/<!ENTITY[\s\S]*?>/gi, "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
  s = s.replace(/(href|xlink:href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "");
  s = s.replace(/(href|xlink:href|src)\s*=\s*("|')\s*https?:[^"']*\2/gi, "");
  return s.trim() || null;
}
const KV_MAX = 20 * 1024 * 1024;
async function storeMedia(env, buf, ct, opts = {}) {
  const kind = opts.kind ?? (/^image\/svg/.test(ct) ? "svg" : /^video\//.test(ct) ? "video" : "image");
  const id = randomId(12);
  const size = buf.byteLength;
  const useR2 = kind === "video" || size > KV_MAX;
  let backend;
  if (useR2) {
    if (!env.MEDIA_R2) return { ok: false, error: "動画や大きいファイルには R2 の有効化（高度なオプション・カード必要）が必要です。" };
    await env.MEDIA_R2.put("media:" + id, buf, { httpMetadata: { contentType: ct } });
    backend = "r2";
  } else {
    await kv(env).put("media:" + id, buf, { metadata: { ct } });
    backend = "kv";
  }
  try {
    await env.DB.prepare("INSERT INTO media_assets (id,name,kind,mime,size,backend,created_by,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(id, (opts.name || "").slice(0, 120) || kind, kind, ct, size, backend, opts.createdBy ?? null, nowSec()).run();
  } catch {
  }
  return { ok: true, id, url: "/api/site-media/" + id, backend, kind };
}
async function getMediaMeta(env, id) {
  const r = await env.DB.prepare("SELECT backend,mime,kind FROM media_assets WHERE id=?").bind(cleanId(id)).first().catch(() => null);
  return r ?? null;
}
async function getMedia(env, id) {
  const r = await kv(env).getWithMetadata("media:" + cleanId(id), { type: "arrayBuffer" });
  if (!r || !r.value) return null;
  const ct = r.metadata?.ct || "application/octet-stream";
  return { buf: r.value, ct };
}
async function listMediaAssets(env, limit = 200) {
  const { results } = await env.DB.prepare("SELECT id,name,kind,mime,size,backend,created_at FROM media_assets ORDER BY created_at DESC LIMIT ?").bind(limit).all();
  return (results || []).map((r) => ({ ...r, url: "/api/site-media/" + r.id }));
}
async function deleteMediaAsset(env, id) {
  const cid = cleanId(id);
  const meta = await getMediaMeta(env, cid);
  try {
    if (meta?.backend === "r2" && env.MEDIA_R2) await env.MEDIA_R2.delete("media:" + cid);
    else await kv(env).delete("media:" + cid);
  } catch {
  }
  await env.DB.prepare("DELETE FROM media_assets WHERE id=?").bind(cid).run().catch(() => {
  });
}
export {
  getMedia as a,
  storeMedia as b,
  deleteMediaAsset as d,
  getMediaMeta as g,
  listMediaAssets as l,
  sanitizeSvg as s
};
