globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { d as decryptField, e as encryptField, g as generateMasterKey } from "./stripe_r-RFTlbb.mjs";
import { logDiag } from "./diag_CY3PJnOM.mjs";
import { AppError, INFRA } from "./errors_Cz86HmdL.mjs";
const KV_TOKEN = "license_token";
const KV_ENTITLEMENT = "entitlement";
const KV_ENTITLEMENT_AT = "entitlement_at";
const KV_DISABLED_BUILTINS = "host_disabled_builtins";
const KEY_PREFIX = "apikey:";
const nowSec = () => Math.floor(Date.now() / 1e3);
function hostFetch(env, path, init) {
  if (env.HOST) return env.HOST.fetch(new Request("https://host.internal" + path, init));
  return fetch(env.HOST_BASE_URL.replace(/\/$/, "") + path, init);
}
async function getToken(env) {
  return env.LICENSE.get(KV_TOKEN);
}
async function saveToken(env, token) {
  await kvPut(env, KV_TOKEN, token);
}
const APP_VERSION = "0.2.158";
async function pollHost(env, deployUrl, apps) {
  const token = await getToken(env);
  if (!token) return null;
  const qs = new URLSearchParams({ version: APP_VERSION });
  if (deployUrl) qs.set("deploy_url", deployUrl);
  if (apps?.length) qs.set("apps", apps.map((a) => `${a.id}:${a.version}`).join(","));
  try {
    const r = await hostFetch(env, "/api/check?" + qs.toString(), { headers: { "x-bo-license": token } });
    if (!r.ok) return null;
    const data = await r.json();
    if (data.entitlement === "nonprofit" || data.entitlement === "enterprise") {
      const notified = await env.LICENSE.get("entitlement_notified").catch(() => null);
      if (notified !== data.entitlement) {
        await kvPut(env, "entitlement_notified", data.entitlement).catch(() => {
        });
        try {
          const label = data.entitlement === "nonprofit" ? "非営利団体（全機能無料）" : "エンタープライズ（全機能解放）";
          const [{ buildCtx }, notif] = await Promise.all([import("./ctx_D9xObGWH.mjs").then((n) => n.U), import("./notifications_DKh03i2Y.mjs")]);
          await notif.addNotification(buildCtx(env), { owner: "org", kind: "billing", body: `🎉 申込が承認され「${label}」が有効になりました。`, link: "/billing" }).catch(() => {
          });
          await notif.notifyHook(env, `🎉 申込が承認され「${label}」が有効になりました。`).catch(() => {
          });
        } catch {
        }
      }
    }
    await kvPut(env, KV_ENTITLEMENT, data.entitlement).catch(() => {
    });
    await kvPut(env, KV_ENTITLEMENT_AT, String(nowSec())).catch(() => {
    });
    if (data.latestVersion) await kvPut(env, "latest_version", data.latestVersion).catch(() => {
    });
    await kvPut(env, "notices_cache", JSON.stringify(data.notices ?? [])).catch(() => {
    });
    await (await import("./ctx_D9xObGWH.mjs").then((n) => n.Q)).cacheAiKnowledge(env, data.knowledge).catch(() => {
    });
    await (await import("./ctx_D9xObGWH.mjs").then((n) => n.L)).cacheProviderRegistry(env, data.providerRegistry).catch(() => {
    });
    if (Array.isArray(data.revokedApps) && data.revokedApps.length) {
      const ph = data.revokedApps.map(() => "?").join(",");
      await env.DB.prepare(`DELETE FROM external_apps WHERE id IN (${ph})`).bind(...data.revokedApps).run().catch(() => {
      });
      await env.DB.prepare(`UPDATE app_drafts SET gate_status='blocked' WHERE id IN (${ph}) AND status='submitted'`).bind(...data.revokedApps).run().catch(() => {
      });
    }
    if (Array.isArray(data.disabledBuiltins)) {
      await kvPut(env, KV_DISABLED_BUILTINS, JSON.stringify(data.disabledBuiltins)).catch(() => {
      });
    }
    if (Array.isArray(data.reportUpdates) && data.reportUpdates.length) {
      const { applyReportUpdates } = await import("./reports_CwNccJnM.mjs");
      await applyReportUpdates(env, data.reportUpdates).catch(() => {
      });
    }
    return data;
  } catch {
    return null;
  }
}
async function getLicenseId(env) {
  const token = await getToken(env);
  if (!token) return null;
  try {
    const env2 = JSON.parse(atob(token));
    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(env2.body), (c) => c.charCodeAt(0))));
    return payload.licenseId;
  } catch {
    return null;
  }
}
async function cachedEntitlement(env) {
  return await env.LICENSE.get(KV_ENTITLEMENT) ?? "free";
}
async function disabledBuiltins(env) {
  try {
    const raw = await env.LICENSE?.get(KV_DISABLED_BUILTINS);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
async function entitlementForGate(env, maxAgeSec = 6 * 3600) {
  const at = Number(await env.LICENSE.get(KV_ENTITLEMENT_AT));
  if (!Number.isFinite(at) || nowSec() - at > maxAgeSec) {
    await pollHost(env).catch(() => null);
  }
  return cachedEntitlement(env);
}
function kvOf(ns) {
  return {
    get: (k) => ns.get(k),
    put: (k, v, o) => ns.put(k, v, o),
    delete: (k) => ns.delete(k),
    list: async (p) => (await ns.list({ prefix: p })).keys.map((x) => x.name)
  };
}
function isProduction(env) {
  return env.ENVIRONMENT === "production";
}
class MasterKeyMissingError extends AppError {
  constructor() {
    super(INFRA.MASTER_KEY_MISSING, "暗号化の初期設定が完了していないため、この操作を実行できません。管理者にお問い合わせください。", 503);
    this.name = "MasterKeyMissingError";
  }
}
async function resolveMasterKey(env, kv) {
  let k = await kv.get("master_key");
  if (!k) {
    if (isProduction(env)) {
      await logDiag(env, "error", "security", "MASTER_KEY が本番で未設定です。暗号処理をブロックしました。Worker Secret(MASTER_KEY)を投入してください（§10.1）。");
      throw new MasterKeyMissingError();
    }
    k = generateMasterKey();
    await kv.put("master_key", k);
    await kv.put("master_key_source", "kv-autogen");
    await logDiag(env, "warn", "security", "MASTER_KEY 未設定のため KV に自動生成しました（ゼロ設定の既定・§3-1）。鍵は団体の Cloudflare アカウント内 KV に保管されます。自社本番のみ Worker Secret(MASTER_KEY) の投入が必須です。");
  }
  return k;
}
async function masterKey(env) {
  if (env.MASTER_KEY) return env.MASTER_KEY;
  return resolveMasterKey(env, kvOf(env.LICENSE));
}
async function masterKeyCtx(ctx) {
  if (ctx.env.MASTER_KEY) return ctx.env.MASTER_KEY;
  return resolveMasterKey(ctx.env, ctx.storage.kv);
}
async function masterKeySource(env) {
  if (env.MASTER_KEY) return "secret";
  const stored = await env.LICENSE.get("master_key_source");
  if (stored) return stored;
  if (isProduction(env)) return "missing-prod";
  return "unknown";
}
async function getVerifyJwk(env) {
  const parse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };
  if (env.VERIFY_PUBLIC_JWK) return parse(env.VERIFY_PUBLIC_JWK);
  const cached = await env.LICENSE.get("verify_jwk");
  if (cached) return parse(cached);
  try {
    const r = await hostFetch(env, "/api/pubkey");
    if (r.ok) {
      const t = await r.text();
      if (parse(t)) {
        await kvPut(env, "verify_jwk", t);
        return parse(t);
      }
    }
  } catch {
  }
  return null;
}
async function saveApiKey(env, name, value) {
  const enc = await encryptField(await masterKey(env), value, "api-keys");
  await kvPut(env, KEY_PREFIX + name, enc);
}
async function getApiKey(env, name) {
  const stored = await env.LICENSE.get(KEY_PREFIX + name);
  if (!stored) return null;
  return decryptField(await masterKey(env), stored, "api-keys");
}
async function hasApiKey(env, name) {
  return await env.LICENSE.get(KEY_PREFIX + name) !== null;
}
async function listApiKeyNames(env) {
  try {
    const res = await env.LICENSE.list({ prefix: KEY_PREFIX });
    return (res.keys || []).map((k) => k.name.slice(KEY_PREFIX.length)).filter(Boolean);
  } catch {
    return [];
  }
}
async function deleteApiKey(env, name) {
  await env.LICENSE.delete(KEY_PREFIX + name);
}
async function validateApiKey(name, value) {
  try {
    if (name === "gemini") {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(value)}`);
      return r.ok ? { ok: true } : { ok: false, detail: `Gemini ${r.status}` };
    }
    if (name === "claude") {
      const r = await fetch("https://api.anthropic.com/v1/models", {
        headers: { "x-api-key": value, "anthropic-version": "2023-06-01" }
      });
      return r.ok ? { ok: true } : { ok: false, detail: `Claude ${r.status}` };
    }
    if (name === "openai") {
      const r = await fetch("https://api.openai.com/v1/models", { headers: { authorization: `Bearer ${value}` } });
      return r.ok ? { ok: true } : { ok: false, detail: `OpenAI ${r.status}` };
    }
    if (name === "grok") {
      const r = await fetch("https://api.x.ai/v1/models", { headers: { authorization: `Bearer ${value}` } });
      return r.ok ? { ok: true } : { ok: false, detail: `Grok ${r.status}` };
    }
    if (name === "github_models") {
      const r = await fetch("https://models.github.ai/inference/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${value}` },
        body: JSON.stringify({ model: "openai/gpt-4o-mini", messages: [{ role: "user", content: "hi" }], max_tokens: 1 })
      });
      return r.ok ? { ok: true } : { ok: false, detail: `GitHub Models ${r.status}` };
    }
    if (name === "groq") {
      const r = await fetch("https://api.groq.com/openai/v1/models", { headers: { authorization: `Bearer ${value}` } });
      return r.ok ? { ok: true } : { ok: false, detail: `Groq ${r.status}` };
    }
    if (name === "cerebras") {
      const r = await fetch("https://api.cerebras.ai/v1/models", { headers: { authorization: `Bearer ${value}` } });
      return r.ok ? { ok: true } : { ok: false, detail: `Cerebras ${r.status}` };
    }
    if (name === "notion") {
      const r = await fetch("https://api.notion.com/v1/users/me", {
        headers: { authorization: `Bearer ${value}`, "Notion-Version": "2022-06-28" }
      });
      return r.ok ? { ok: true } : { ok: false, detail: `Notion ${r.status}` };
    }
    return value.length > 0 ? { ok: true } : { ok: false, detail: "空" };
  } catch (e) {
    return { ok: false, detail: e.message };
  }
}
export {
  APP_VERSION,
  MasterKeyMissingError,
  cachedEntitlement,
  deleteApiKey,
  disabledBuiltins,
  entitlementForGate,
  getApiKey,
  getLicenseId,
  getToken,
  getVerifyJwk,
  hasApiKey,
  hostFetch,
  isProduction,
  listApiKeyNames,
  masterKey,
  masterKeyCtx,
  masterKeySource,
  nowSec,
  pollHost,
  saveApiKey,
  saveToken,
  validateApiKey
};
