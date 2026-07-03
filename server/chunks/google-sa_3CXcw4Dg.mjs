globalThis.process ??= {};
globalThis.process.env ??= {};
import { saveApiKey, hasApiKey, deleteApiKey, getApiKey } from "./client_F4fksau0.mjs";
import { kvPut } from "./kv_JIFmI05h.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { e as ensureOidcKey, s as signOidcJwt } from "./oidc-idp_7nfWEyN-.mjs";
const SA_KEY = "google_sa_key";
const SA_SUBJECT = "google_sa_subject";
const SA_TOKEN = "google_sa_token";
const SA_MODE = "google_sa_mode";
const WIF_CONFIG = "google_wif_config";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const enc = new TextEncoder();
const b64url = (buf) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64urlStr = (s) => b64url(enc.encode(s));
function pemToDer(pem) {
  const body = pem.replace(/-----BEGIN [^-]+-----/, "").replace(/-----END [^-]+-----/, "").replace(/\s+/g, "");
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
async function signJwt(privateKeyPem, claims) {
  const key = await crypto.subtle.importKey("pkcs8", pemToDer(privateKeyPem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const header = b64urlStr(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64urlStr(JSON.stringify(claims));
  const data = `${header}.${payload}`;
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(data));
  return `${data}.${b64url(sig)}`;
}
async function mintSaToken(key, subject, scope) {
  if (!key.client_email || !key.private_key) return { ok: false, error: "SA鍵に client_email / private_key がありません" };
  const iat = nowSec();
  const assertion = await signJwt(key.private_key, {
    iss: key.client_email,
    sub: subject,
    scope,
    aud: key.token_uri || TOKEN_URL,
    iat,
    exp: iat + 3600
  });
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion })
  });
  if (!r.ok) return { ok: false, error: `トークン取得に失敗（${r.status}）：${(await r.text()).slice(0, 200)}` };
  const t = await r.json();
  if (!t.access_token) return { ok: false, error: "access_token が返りませんでした" };
  return { ok: true, token: t.access_token, expiresIn: t.expires_in ?? 3600 };
}
const STS_URL = "https://sts.googleapis.com/v1/token";
async function mintSaTokenWif(cfg, subject, scope, signOidc) {
  if (!cfg.sa_email || !cfg.project_number || !cfg.pool || !cfg.provider || !cfg.issuer) {
    return { ok: false, error: "WIF設定（sa_email/project_number/pool/provider/issuer）が不足しています" };
  }
  const providerResource = `projects/${cfg.project_number}/locations/global/workloadIdentityPools/${cfg.pool}/providers/${cfg.provider}`;
  const iat = nowSec();
  const oidcJwt = await signOidc({ iss: cfg.issuer, sub: "baku-office", aud: `https://iam.googleapis.com/${providerResource}`, iat, exp: iat + 300 });
  const sts = await fetch(STS_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      audience: `//iam.googleapis.com/${providerResource}`,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      requested_token_type: "urn:ietf:params:oauth:token-type:access_token",
      subject_token: oidcJwt,
      subject_token_type: "urn:ietf:params:oauth:token-type:id_token"
    })
  });
  if (!sts.ok) return { ok: false, error: `STS交換に失敗（${sts.status}）：${(await sts.text()).slice(0, 200)}` };
  const federated = (await sts.json()).access_token;
  if (!federated) return { ok: false, error: "STSがaccess_tokenを返しませんでした" };
  const dwdClaims = { iss: cfg.sa_email, sub: subject, scope, aud: TOKEN_URL, iat, exp: iat + 3600 };
  const sj = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(cfg.sa_email)}:signJwt`, {
    method: "POST",
    headers: { authorization: `Bearer ${federated}`, "content-type": "application/json" },
    body: JSON.stringify({ payload: JSON.stringify(dwdClaims) })
  });
  if (!sj.ok) return { ok: false, error: `signJwtに失敗（${sj.status}）：${(await sj.text()).slice(0, 200)}` };
  const signedJwt = (await sj.json()).signedJwt;
  if (!signedJwt) return { ok: false, error: "signJwtがsignedJwtを返しませんでした" };
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: signedJwt })
  });
  if (!r.ok) return { ok: false, error: `DWDトークン取得に失敗（${r.status}）：${(await r.text()).slice(0, 200)}` };
  const t = await r.json();
  if (!t.access_token) return { ok: false, error: "access_token が返りませんでした" };
  return { ok: true, token: t.access_token, expiresIn: t.expires_in ?? 3600 };
}
async function loadKey(env) {
  const raw = await getApiKey(env, SA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
async function loadWif(env) {
  const raw = await env.LICENSE.get(WIF_CONFIG);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
async function saMode(env) {
  const m = await env.LICENSE.get(SA_MODE);
  if (m === "key" || m === "wif") return m;
  if (await env.LICENSE.get(WIF_CONFIG)) return "wif";
  if (await hasApiKey(env, SA_KEY)) return "key";
  return null;
}
async function mintForMode(env, subject, scope) {
  const mode = await saMode(env);
  if (mode === "wif") {
    const cfg = await loadWif(env);
    if (!cfg) return { ok: false, error: "WIF設定が見つかりません" };
    return mintSaTokenWif(cfg, subject, scope, (claims) => signOidcJwt(env, claims));
  }
  if (mode === "key") {
    const key = await loadKey(env);
    if (!key) return { ok: false, error: "サービスアカウント鍵が見つかりません" };
    return mintSaToken(key, subject, scope);
  }
  return { ok: false, error: "サービスアカウントが未設定です" };
}
async function saveWifConfig(env, cfg, subject) {
  const sub = subject.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sub)) return { ok: false, error: "代理するユーザーのメールアドレスを正しく入力してください" };
  if (!cfg.sa_email || !cfg.client_id || !cfg.project_number || !cfg.pool || !cfg.provider) {
    return { ok: false, error: "WIF設定（sa_email / client_id / project_number / pool / provider）が不足しています" };
  }
  if (!/^\d+$/.test(String(cfg.project_number))) return { ok: false, error: "project_number は数値（プロジェクト番号）を指定してください" };
  await ensureOidcKey(env);
  const clean = {
    sa_email: cfg.sa_email.trim(),
    client_id: String(cfg.client_id).trim(),
    project_number: String(cfg.project_number).trim(),
    pool: cfg.pool.trim(),
    provider: cfg.provider.trim(),
    issuer: cfg.issuer.replace(/\/$/, "")
  };
  await kvPut(env, WIF_CONFIG, JSON.stringify(clean));
  await kvPut(env, SA_MODE, "wif");
  await kvPut(env, SA_SUBJECT, sub);
  await env.LICENSE.delete(SA_TOKEN);
  return { ok: true };
}
async function saveServiceAccount(env, keyJson, subject) {
  let key;
  try {
    key = JSON.parse(keyJson);
  } catch {
    return { ok: false, error: "鍵ファイルが JSON として読み込めません" };
  }
  if (!key.client_email || !key.private_key || !key.client_id) return { ok: false, error: "サービスアカウント鍵（client_email / private_key / client_id を含む JSON）を指定してください" };
  const sub = subject.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sub)) return { ok: false, error: "代理するユーザーのメールアドレスを正しく入力してください" };
  await saveApiKey(env, SA_KEY, JSON.stringify(key));
  await kvPut(env, SA_MODE, "key");
  await kvPut(env, SA_SUBJECT, sub);
  await env.LICENSE.delete(SA_TOKEN);
  return { ok: true };
}
async function serviceAccountConfigured(env) {
  if (!await env.LICENSE.get(SA_SUBJECT)) return false;
  const mode = await saMode(env);
  if (mode === "wif") return !!await env.LICENSE.get(WIF_CONFIG);
  if (mode === "key") return await hasApiKey(env, SA_KEY);
  return false;
}
async function getServiceAccountInfo(env) {
  const subject = await env.LICENSE.get(SA_SUBJECT);
  if (!subject) return null;
  const mode = await saMode(env);
  if (mode === "wif") {
    const cfg = await loadWif(env);
    if (!cfg?.sa_email || !cfg.client_id) return null;
    return { mode, clientEmail: cfg.sa_email, clientId: cfg.client_id, subject };
  }
  if (mode === "key") {
    const key = await loadKey(env);
    if (!key?.client_email || !key.client_id) return null;
    return { mode, clientEmail: key.client_email, clientId: key.client_id, subject };
  }
  return null;
}
async function clearServiceAccount(env) {
  await deleteApiKey(env, SA_KEY);
  await env.LICENSE.delete(WIF_CONFIG);
  await env.LICENSE.delete(SA_MODE);
  await env.LICENSE.delete(SA_SUBJECT);
  await env.LICENSE.delete(SA_TOKEN);
}
async function serviceAccountAccessToken(env, scope) {
  const subject = await env.LICENSE.get(SA_SUBJECT);
  if (!subject) return null;
  try {
    const cached = JSON.parse(await env.LICENSE.get(SA_TOKEN) ?? "null");
    if (cached && cached.scope === scope && cached.exp > nowSec() + 60) return cached.token;
  } catch {
  }
  const res = await mintForMode(env, subject, scope);
  if (!res.ok || !res.token) return null;
  await kvPut(env, SA_TOKEN, JSON.stringify({ token: res.token, exp: nowSec() + (res.expiresIn ?? 3600), scope }));
  return res.token;
}
async function testServiceAccount(env, scope) {
  const subject = await env.LICENSE.get(SA_SUBJECT);
  if (!subject) return { ok: false, error: "サービスアカウントが未設定です" };
  const res = await mintForMode(env, subject, scope);
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}
export {
  clearServiceAccount,
  getServiceAccountInfo,
  mintSaToken,
  mintSaTokenWif,
  saveServiceAccount,
  saveWifConfig,
  serviceAccountAccessToken,
  serviceAccountConfigured,
  signJwt,
  testServiceAccount
};
