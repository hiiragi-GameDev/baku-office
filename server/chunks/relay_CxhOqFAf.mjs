globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { makeSessionCookie, signPending, sessionExp } from "./auth_DL5yvmzT.mjs";
import { getVerifyJwk, getToken, hostFetch, saveToken } from "./client_F4fksau0.mjs";
import { i as importVerifyKey, v as verifyEnvelope, p as payloadOf } from "./stripe_r-RFTlbb.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const redir = (loc, cookie) => new Response(null, { status: 302, headers: cookie ? { location: loc, "set-cookie": cookie } : { location: loc } });
const GET = async ({ url, request, locals }) => {
  const token = url.searchParams.get("relay");
  const state = url.searchParams.get("state");
  const cookieState = /oauth_state=([^;]+)/.exec(request.headers.get("cookie") ?? "")?.[1];
  if (url.searchParams.get("e")) return redir("/login?e=oauth");
  if (!token || !state || state !== cookieState) return redir("/login?e=state");
  const jwk = await getVerifyJwk(env);
  if (!jwk) return redir("/login?e=oauth");
  let envlp;
  try {
    envlp = JSON.parse(atob(token));
  } catch {
    return redir("/login?e=oauth");
  }
  const pub = await importVerifyKey(jwk);
  if (!await verifyEnvelope(pub, envlp)) return redir("/login?e=oauth");
  const p = payloadOf(envlp);
  if (!p.sub || !p.exp || p.exp < Math.floor(Date.now() / 1e3)) return redir("/login?e=state");
  if (!await getToken(env) && p.email) {
    try {
      const r = await hostFetch(env, "/api/activate-by-email", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ relay: token, deployUrl: url.origin }) });
      const j = await r.json().catch(() => ({}));
      if (j.ok && j.token) await saveToken(env, j.token);
      else return redir("/login?e=noapply");
    } catch {
      return redir("/login?e=oauth");
    }
  }
  const stored = await env.LICENSE.get("org_google_sub");
  if (stored && stored !== p.sub) {
    const idn = await env.DB.prepare("SELECT user_id FROM identities WHERE type='google' AND external_id=?").bind(p.sub).first();
    if (idn) {
      const u = await env.DB.prepare("SELECT id,role,status FROM users WHERE id=?").bind(idn.user_id).first();
      if (u?.status === "active") {
        const c = await makeSessionCookie(env, { uid: u.id, role: u.role, ctx: "personal", name: p.name, exp: sessionExp() });
        return redir("/", c);
      }
      return redir("/login?e=pending");
    }
    const pend = await signPending(env, { provider: "google", externalId: p.sub, name: p.name });
    return redir("/join", `pending_oauth=${pend}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  }
  if (!stored) await kvPut(env, "org_google_sub", p.sub);
  if (p.email) await kvPut(env, "org_google_email", p.email);
  const cookie = await makeSessionCookie(env, { uid: "org", role: "admin", ctx: "org", name: p.name || "組織管理者", exp: sessionExp() });
  return redir("/", cookie);
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
