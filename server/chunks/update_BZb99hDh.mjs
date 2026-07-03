globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { d as decryptField, e as encryptField } from "./stripe_r-RFTlbb.mjs";
import { masterKey, pollHost, APP_VERSION, nowSec } from "./client_F4fksau0.mjs";
const KV_HOOK = "deploy_hook";
const DOMAIN = "deploy-hook";
const KV_AUTO = "auto_update";
const KV_AUTO_LAST = "auto_update_last";
const KV_STATUS = "auto_update_status";
const GRACE_SEC = 30 * 60;
const MAX_ATTEMPTS = 3;
function cmpVersion(a, b) {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}
function isValidHookUrl(u) {
  try {
    const x = new URL(u);
    if (x.protocol !== "https:" || !x.hostname) return false;
    const h = x.hostname.toLowerCase();
    return h === "cloudflare.com" || h.endsWith(".cloudflare.com");
  } catch {
    return false;
  }
}
async function hasDeployHook(env) {
  return await env.LICENSE.get(KV_HOOK) !== null;
}
async function saveDeployHook(env, url) {
  const enc = await encryptField(await masterKey(env), url, DOMAIN);
  await kvPut(env, KV_HOOK, enc);
}
async function getDeployHook(env) {
  const stored = await env.LICENSE.get(KV_HOOK);
  if (!stored) return null;
  return decryptField(await masterKey(env), stored, DOMAIN);
}
async function clearDeployHook(env) {
  await env.LICENSE.delete(KV_HOOK);
}
async function getAutoUpdate(env) {
  return await env.LICENSE.get(KV_AUTO) === "on";
}
async function setAutoUpdate(env, on) {
  if (on) await kvPut(env, KV_AUTO, "on");
  else {
    await env.LICENSE.delete(KV_AUTO);
    await env.LICENSE.delete(KV_AUTO_LAST);
  }
}
function parseLast(raw) {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    if (o && typeof o.v === "string") return { v: o.v, at: Number(o.at) || 0, n: Number(o.n) || 1 };
  } catch {
  }
  return { v: raw, at: 0, n: 1 };
}
async function recordStatus(env, r) {
  try {
    const now = nowSec();
    const prev = await env.LICENSE.get(KV_STATUS);
    if (prev && !r.triggered) {
      const p = JSON.parse(prev);
      if (p.reason === (r.reason ?? null) && p.version === (r.version ?? null) && now - (Number(p.at) || 0) < 1800) return r;
    }
    await kvPut(env, KV_STATUS, JSON.stringify({ triggered: r.triggered, reason: r.reason ?? null, version: r.version ?? null, running: APP_VERSION, at: now }));
  } catch {
  }
  return r;
}
async function getAutoUpdateStatus(env) {
  const raw = await env.LICENSE.get(KV_STATUS);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
async function maybeAutoUpdate(env, deployUrl) {
  if (!await getAutoUpdate(env)) return { triggered: false, reason: "off" };
  const hook = await getDeployHook(env);
  if (!hook) return recordStatus(env, { triggered: false, reason: "no-hook" });
  await pollHost(env, deployUrl).catch(() => null);
  const latest = await env.LICENSE.get("latest_version");
  if (!latest || cmpVersion(latest, APP_VERSION) <= 0) return recordStatus(env, { triggered: false, reason: "up-to-date" });
  const last = parseLast(await env.LICENSE.get(KV_AUTO_LAST));
  if (last && last.v === latest) {
    if (last.n >= MAX_ATTEMPTS) return recordStatus(env, { triggered: false, version: latest, reason: "stalled" });
    if (nowSec() - last.at < GRACE_SEC) return recordStatus(env, { triggered: false, version: latest, reason: "pending" });
  }
  try {
    const r = await fetch(hook, { method: "POST", signal: AbortSignal.timeout(15e3) });
    if (!r.ok) return recordStatus(env, { triggered: false, version: latest, reason: `hook-${r.status}` });
  } catch {
    return recordStatus(env, { triggered: false, version: latest, reason: "hook-error" });
  }
  const n = (last && last.v === latest ? last.n : 0) + 1;
  await kvPut(env, KV_AUTO_LAST, JSON.stringify({ v: latest, at: nowSec(), n }));
  return recordStatus(env, { triggered: true, version: latest, reason: n > 1 ? "retried" : void 0 });
}
export {
  clearDeployHook,
  cmpVersion,
  getAutoUpdate,
  getAutoUpdateStatus,
  getDeployHook,
  hasDeployHook,
  isValidHookUrl,
  maybeAutoUpdate,
  saveDeployHook,
  setAutoUpdate
};
