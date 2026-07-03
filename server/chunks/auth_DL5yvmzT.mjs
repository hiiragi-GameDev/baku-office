globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { masterKey } from "./client_F4fksau0.mjs";
const COOKIE = "bo_session";
const ENC = new TextEncoder();
const b64url = (b) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64urlToBytes = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
async function hmacKey(env) {
  const raw = Uint8Array.from(atob(await masterKey(env)), (c) => c.charCodeAt(0));
  const ikm = await crypto.subtle.importKey("raw", raw, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: ENC.encode("bo-session-v1"), info: ENC.encode("session-hmac") },
    ikm,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign", "verify"]
  );
}
const SESSION_MAX_AGE = 604800;
async function makeSessionCookie(env, s) {
  const iat = s.iat ?? Math.floor(Date.now() / 1e3);
  const full = { ...s, iat, exp: s.exp ?? iat + SESSION_MAX_AGE };
  const payload = b64url(ENC.encode(JSON.stringify(full)));
  const sig = b64url(await crypto.subtle.sign("HMAC", await hmacKey(env), ENC.encode(payload)));
  const value = `${payload}.${sig}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}
function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
async function signPending(env, data) {
  const payload = b64url(ENC.encode(JSON.stringify(data)));
  const sig = b64url(await crypto.subtle.sign("HMAC", await hmacKey(env), ENC.encode(payload)));
  return `${payload}.${sig}`;
}
async function verifyPending(env, value) {
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(env), b64urlToBytes(sig), ENC.encode(payload));
  if (!ok) return null;
  try {
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
  } catch {
    return null;
  }
}
async function getSession(env, request) {
  const cookie = request.headers.get("cookie") ?? "";
  const m = new RegExp(`${COOKIE}=([^;]+)`).exec(cookie);
  if (!m) return null;
  const [payload, sig] = m[1].split(".");
  if (!payload || !sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(env), b64urlToBytes(sig), ENC.encode(payload));
  if (!ok) return null;
  try {
    const s = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
    if (typeof s.exp !== "number" || s.exp < Math.floor(Date.now() / 1e3)) return null;
    if (typeof s.iat === "number") {
      const cut = await env.LICENSE.get(`${REVOKE_PREFIX}${s.uid}`);
      if (cut && s.iat < Number(cut)) return null;
    }
    return s;
  } catch {
    return null;
  }
}
const REVOKE_PREFIX = "revoke:";
async function revokedSince(env, uid, sinceSec) {
  try {
    const cut = await env.LICENSE.get(`${REVOKE_PREFIX}${uid}`);
    return !!cut && sinceSec <= Number(cut);
  } catch {
    return true;
  }
}
async function currentAuthState(env, owner) {
  if (owner.includes(":")) return { kind: "external" };
  try {
    const u = await env.DB.prepare("SELECT role,status FROM users WHERE id=?").bind(owner).first();
    if (!u) return { kind: "user", active: false, role: null };
    return { kind: "user", active: u.status === "active", role: u.role };
  } catch {
    return { kind: "error" };
  }
}
async function revokeSessions(env, uid) {
  try {
    await kvPut(env, `${REVOKE_PREFIX}${uid}`, String(Math.floor(Date.now() / 1e3)), {
      expirationTtl: SESSION_DAYS * 86400
    });
  } catch (e) {
    console.warn("revokeSessions: KV put failed (quota?):", e?.message);
  }
}
function sameOrigin(request) {
  const sfs = request.headers.get("sec-fetch-site");
  if (sfs) return sfs === "same-origin" || sfs === "none";
  const o = request.headers.get("origin");
  if (!o) return false;
  try {
    return new URL(o).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
async function requireOrgAdmin(env, request) {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return null;
  return ses;
}
function canDevelopApps(role, _ctx) {
  return role === "admin" || role === "developer";
}
function canAccess(role, section) {
  if (role === "admin") return true;
  switch (section) {
    case "accounting":
      return role === "accounting";
    case "review_accounting":
      return role === "accounting";
    case "documents":
      return role === "clerical";
    case "review_documents":
      return role === "clerical";
    case "members":
      return false;
    case "billing":
      return false;
    default:
      return false;
  }
}
const SESSION_DAYS = 7;
const sessionExp = () => Math.floor(Date.now() / 1e3) + SESSION_DAYS * 86400;
export {
  SESSION_DAYS,
  canAccess,
  canDevelopApps,
  clearSessionCookie,
  currentAuthState,
  getSession,
  makeSessionCookie,
  requireOrgAdmin,
  revokeSessions,
  revokedSince,
  sameOrigin,
  sessionExp,
  signPending,
  verifyPending
};
