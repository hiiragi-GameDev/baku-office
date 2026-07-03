globalThis.process ??= {};
globalThis.process.env ??= {};
import { getApiKey } from "./client_F4fksau0.mjs";
const CF = "https://api.cloudflare.com/client/v4";
async function buildCfClient(env, fetchImpl = fetch) {
  const token = await getApiKey(env, "cloudflare_token").catch(() => null);
  const account = await env.LICENSE.get("cf_account_id").catch(() => null) ?? "";
  if (!token) return null;
  return { token, account, fetchImpl };
}
async function cfApi(c, path, init = {}) {
  try {
    const r = await c.fetchImpl(CF + path, { ...init, headers: { authorization: `Bearer ${c.token}`, "content-type": "application/json", ...init.headers || {} } });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok && j.success !== false, status: r.status, result: j.result, errors: j.errors || [] };
  } catch (e) {
    return { ok: false, status: 0, result: null, errors: [{ message: e?.message || "ネットワークエラー" }] };
  }
}
async function findZoneId(c, domain) {
  const r = await cfApi(c, "/zones?name=" + encodeURIComponent(domain));
  const arr = Array.isArray(r.result) ? r.result : [];
  return r.ok && arr[0]?.id ? arr[0].id : null;
}
async function addWorkerDomain(c, zoneId, hostname, service, environment) {
  return cfApi(c, `/accounts/${c.account}/workers/domains`, { method: "PUT", body: JSON.stringify({ zone_id: zoneId, hostname, service, environment }) });
}
const RECOMMENDED_SETTINGS = [
  ["ssl", "strict"],
  ["always_use_https", "on"],
  ["automatic_https_rewrites", "on"],
  ["min_tls_version", "1.2"],
  ["brotli", "on"],
  ["http2", "on"],
  ["http3", "on"],
  ["0rtt", "on"],
  ["early_hints", "on"],
  ["security_level", "medium"],
  ["browser_check", "on"],
  ["email_obfuscation", "on"],
  ["hotlink_protection", "on"]
];
async function applyRecommendedSettings(c, zoneId) {
  const out = [];
  for (const [key, value] of RECOMMENDED_SETTINGS) {
    const r = await cfApi(c, `/zones/${zoneId}/settings/${key}`, { method: "PATCH", body: JSON.stringify({ value }) });
    out.push({ key, ok: r.ok, error: r.ok ? void 0 : r.errors[0]?.message || "HTTP " + r.status });
  }
  return out;
}
async function enableDnssec(c, zoneId) {
  return cfApi(c, `/zones/${zoneId}/dnssec`, { method: "PATCH", body: JSON.stringify({ status: "active" }) });
}
async function provisionCaseA(c, opts) {
  const steps = [];
  const zoneId = await findZoneId(c, opts.domain);
  if (!zoneId) {
    steps.push({ step: "zone", ok: false, detail: `ゾーン「${opts.domain}」が Cloudflare に見つかりません。ドメインを CF に追加（ネームサーバ委任）してから再実行してください。` });
    return { ok: false, steps };
  }
  steps.push({ step: "zone", ok: true, detail: `ゾーン「${opts.domain}」を確認` });
  for (const host of [.../* @__PURE__ */ new Set([opts.publicHost, opts.adminHost])]) {
    const r = await addWorkerDomain(c, zoneId, host, opts.service, opts.environment);
    steps.push({ step: "custom_domain", ok: r.ok, detail: r.ok ? `${host} を Worker に紐付け` : `${host} の紐付け失敗：${r.errors[0]?.message || "HTTP " + r.status}` });
  }
  const sett = await applyRecommendedSettings(c, zoneId);
  const okN = sett.filter((s) => s.ok).length;
  steps.push({ step: "settings", ok: okN === sett.length, detail: `推奨SEO/セキュリティ設定 ${okN}/${sett.length} 適用${okN < sett.length ? "（一部は有料プランや権限が必要）" : ""}` });
  const ds = await enableDnssec(c, zoneId);
  const dsResult = ds.result;
  steps.push({ step: "dnssec", ok: ds.ok, detail: ds.ok ? "DNSSEC を有効化（外部レジストラ取得時は下記 DS レコードをレジストラに登録）" : `DNSSEC：${ds.errors[0]?.message || "HTTP " + ds.status}` });
  return { ok: steps.every((s) => s.ok), steps, dsRecord: ds.ok ? dsResult?.ds : void 0 };
}
export {
  addWorkerDomain,
  applyRecommendedSettings,
  buildCfClient,
  cfApi,
  enableDnssec,
  findZoneId,
  provisionCaseA
};
