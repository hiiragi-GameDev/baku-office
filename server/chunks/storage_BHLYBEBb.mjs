globalThis.process ??= {};
globalThis.process.env ??= {};
import { recordKvWrite, kvPut } from "./kv_JIFmI05h.mjs";
import { r as randomId, a as encryptBytes, b as decryptBytes } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { masterKey } from "./client_F4fksau0.mjs";
function scopeClause(ses) {
  if (ses.role === "admin") return { clause: "1=1", binds: [] };
  if (ses.ctx === "org") return { clause: "(ctx = 'org' OR ctx IS NULL OR created_by = ?)", binds: [ses.uid] };
  return { clause: "created_by = ?", binds: [ses.uid] };
}
const KV_HARD_MAX_MB = 25;
const KV_DEFAULT_MB = 25;
function storageMode(env) {
  return env.MEDIA_R2 ? "r2" : "kv";
}
function mediaKv(env) {
  return env.MEDIA ?? env.LICENSE;
}
async function maxUploadMb(env) {
  const v = Number(await env.LICENSE.get("max_upload_mb"));
  if (!Number.isFinite(v) || v <= 0) return KV_DEFAULT_MB;
  return Math.min(KV_HARD_MAX_MB, Math.max(1, Math.round(v)));
}
async function setMaxUploadMb(env, mb) {
  const clamped = Math.min(KV_HARD_MAX_MB, Math.max(1, Math.round(mb)));
  await kvPut(env, "max_upload_mb", String(clamped));
  return clamped;
}
async function inboundFileLimitBytes(env) {
  if (env.MEDIA_R2) return 50 * 1024 * 1024;
  return await maxUploadMb(env) * 1024 * 1024;
}
async function getRetentionDays(env) {
  const v = Number(await env.LICENSE.get("file_retention_days"));
  return Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
}
async function setRetentionDays(env, days) {
  const v = Number.isFinite(days) && days > 0 ? Math.round(days) : 0;
  await kvPut(env, "file_retention_days", String(v));
  return v;
}
async function saveFile(env, file, createdBy, ctx = "org") {
  const id = randomId();
  const plain = await file.arrayBuffer();
  const size = plain.byteLength;
  const buf = await encryptBytes(await masterKey(env), plain, "files");
  let ref;
  const mode = storageMode(env);
  if (env.MEDIA_R2) {
    const key = `f/${id}`;
    await env.MEDIA_R2.put(key, buf, { httpMetadata: { contentType: "application/octet-stream" } });
    ref = `r2:${key}`;
  } else {
    const mb = await maxUploadMb(env);
    const limit = mb * 1024 * 1024;
    if (size > limit) throw new Error(`標準モード（KV）は1ファイル最大 ${mb}MB までです。高度なオプションで上限を変更するか、R2 を有効化すると大きいファイルも扱えます。`);
    const key = `f/${id}`;
    await mediaKv(env).put(key, buf, { metadata: { contentType: "application/octet-stream" } });
    if (!env.MEDIA) await recordKvWrite(env);
    ref = `kv:${key}`;
  }
  const days = await getRetentionDays(env);
  const expires = days > 0 ? nowSec() + days * 86400 : null;
  await env.DB.prepare("INSERT INTO files (id,name,size,mime,ref,created_by,created_at,enc,expires_at,ctx) VALUES (?,?,?,?,?,?,?,1,?,?)").bind(id, file.name || "file", size, file.type || null, ref, createdBy, nowSec(), expires, ctx).run();
  return { id, mode };
}
const ATTACH_MAX_BYTES = 8 * 1024 * 1024;
function isTextAttachmentMime(mime) {
  const m = (mime || "").toLowerCase();
  return m.startsWith("text/") || m === "application/json" || m === "application/xml" || m === "application/csv" || m === "application/x-ndjson" || m === "application/yaml" || m === "application/x-yaml";
}
async function saveChatAttachment(env, img, createdBy, ctx) {
  const mime = (img.mimeType ?? "").toLowerCase();
  if (!mime || !(mime.startsWith("image/") || mime === "application/pdf" || isTextAttachmentMime(mime))) {
    return { ok: false, status: 400, error: "添付は画像・PDF・テキスト系ファイル（txt/csv/json/md 等）に対応しています。" };
  }
  let view;
  try {
    const bin = atob(img.dataB64 ?? "");
    const buf = new ArrayBuffer(bin.length);
    view = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  } catch {
    return { ok: false, status: 400, error: "添付ファイルの形式が不正です（読み込めませんでした）。" };
  }
  if (view.byteLength === 0) return { ok: false, status: 400, error: "添付ファイルが空です。" };
  if (view.byteLength > ATTACH_MAX_BYTES) return { ok: false, status: 413, error: "添付ファイルが大きすぎます（上限 8MB）。" };
  const ext = mime === "application/pdf" ? "pdf" : mime.split("/")[1] || "bin";
  const file = new File([view], `upload-${nowSec()}.${ext}`, { type: mime });
  try {
    const saved = await saveFile(env, file, createdBy, ctx);
    return { ok: true, id: saved.id };
  } catch {
    return { ok: false, status: 500, error: "添付ファイルの保存に失敗しました。お手数ですが、もう一度お試しください。" };
  }
}
async function readBlob(env, ref, enc) {
  let raw = null;
  if (ref.startsWith("r2:") && env.MEDIA_R2) {
    const obj = await env.MEDIA_R2.get(ref.slice(3));
    raw = obj ? await obj.arrayBuffer() : null;
  } else {
    raw = await mediaKv(env).get(ref.replace(/^kv:/, ""), { type: "arrayBuffer" });
  }
  if (!raw) return null;
  return enc ? decryptBytes(await masterKey(env), raw, "files") : raw;
}
async function getFile(env, id) {
  const row = await env.DB.prepare("SELECT name,mime,ref,enc FROM files WHERE id=? AND deleted_at IS NULL").bind(id).first();
  if (!row) return null;
  const buf = await readBlob(env, row.ref, row.enc);
  if (!buf) return null;
  return { buf, mime: row.mime ?? "application/octet-stream", name: row.name };
}
async function fileBelongsTo(env, id, owner) {
  const row = await env.DB.prepare("SELECT created_by FROM files WHERE id=? AND deleted_at IS NULL").bind(id).first();
  return !!row && row.created_by === owner;
}
async function listFiles(env) {
  return (await env.DB.prepare("SELECT id,name,size,mime,ref,created_at FROM files WHERE deleted_at IS NULL ORDER BY created_at DESC").all()).results;
}
async function softDeleteFile(env, id) {
  await env.DB.prepare("UPDATE files SET deleted_at=? WHERE id=?").bind(nowSec(), id).run();
}
async function getFileForSession(env, id, ses) {
  const { clause, binds } = scopeClause(ses);
  const row = await env.DB.prepare(`SELECT name,mime,ref,enc FROM files WHERE id=? AND deleted_at IS NULL AND ${clause}`).bind(id, ...binds).first();
  if (!row) return null;
  const buf = await readBlob(env, row.ref, row.enc);
  if (!buf) return null;
  return { buf, mime: row.mime ?? "application/octet-stream", name: row.name };
}
async function listFilesForSession(env, ses) {
  const { clause, binds } = scopeClause(ses);
  return (await env.DB.prepare(`SELECT id,name,size,mime,ref,created_at FROM files WHERE deleted_at IS NULL AND ${clause} ORDER BY created_at DESC`).bind(...binds).all()).results;
}
async function softDeleteFileForSession(env, id, ses) {
  const { clause, binds } = scopeClause(ses);
  const r = await env.DB.prepare(`UPDATE files SET deleted_at=? WHERE id=? AND deleted_at IS NULL AND ${clause}`).bind(nowSec(), id, ...binds).run();
  return (r.meta?.changes ?? 0) > 0;
}
async function deleteBlob(env, ref) {
  if (ref.startsWith("r2:") && env.MEDIA_R2) {
    await env.MEDIA_R2.delete(ref.slice(3));
    return;
  }
  await mediaKv(env).delete(ref.replace(/^kv:/, ""));
}
async function readRawBlob(env, ref) {
  return readBlob(env, ref, 0);
}
async function putRawBlob(env, ref, buf) {
  if (ref.startsWith("r2:") && env.MEDIA_R2) {
    await env.MEDIA_R2.put(ref.slice(3), buf, { httpMetadata: { contentType: "application/octet-stream" } });
    return;
  }
  await mediaKv(env).put(ref.replace(/^kv:/, ""), buf, { metadata: { contentType: "application/octet-stream" } });
  if (!env.MEDIA) await recordKvWrite(env);
}
async function purgeFiles(env, limit = 50, graceDays = 30) {
  const now = nowSec();
  let expired = 0, purged = 0;
  const exp = (await env.DB.prepare("SELECT id,ref FROM files WHERE deleted_at IS NULL AND expires_at IS NOT NULL AND expires_at < ? LIMIT ?").bind(now, limit).all()).results;
  for (const f of exp) {
    await deleteBlob(env, f.ref).catch(() => {
    });
    await env.DB.prepare("UPDATE files SET deleted_at=? WHERE id=?").bind(now, f.id).run();
    expired++;
  }
  const cutoff = now - graceDays * 86400;
  const old = (await env.DB.prepare("SELECT id,ref FROM files WHERE deleted_at IS NOT NULL AND deleted_at < ? AND ref <> '' LIMIT ?").bind(cutoff, limit).all()).results;
  for (const f of old) {
    await deleteBlob(env, f.ref).catch(() => {
    });
    await env.DB.prepare("UPDATE files SET ref='' WHERE id=?").bind(f.id).run();
    purged++;
  }
  return { expired, purged };
}
async function audit(env, actor, action, target) {
  await env.DB.prepare("INSERT INTO audit_log (id,actor,action,target,timestamp) VALUES (?,?,?,?,?)").bind(randomId(), actor, action, target, nowSec()).run();
}
export {
  audit,
  fileBelongsTo,
  getFile,
  getFileForSession,
  getRetentionDays,
  inboundFileLimitBytes,
  isTextAttachmentMime,
  listFiles,
  listFilesForSession,
  maxUploadMb,
  purgeFiles,
  putRawBlob,
  readRawBlob,
  saveChatAttachment,
  saveFile,
  setMaxUploadMb,
  setRetentionDays,
  softDeleteFile,
  softDeleteFileForSession,
  storageMode
};
