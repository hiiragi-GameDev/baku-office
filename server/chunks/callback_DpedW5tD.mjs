globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { exchange } from "./oauth_BlD-15-T.mjs";
import { makeSessionCookie, signPending, sessionExp } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const redir = (loc, cookie) => new Response(null, { status: 302, headers: cookie ? { location: loc, "set-cookie": cookie } : { location: loc } });
const GET = async ({ params, url, request, locals }) => {
  const p = params.provider;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = /oauth_state=([^;]+)/.exec(request.headers.get("cookie") ?? "")?.[1];
  if (!code || !state || state !== cookieState) return redir("/login?e=state");
  const prof = await exchange(env, p, code, url.origin);
  if (!prof) return redir("/login?e=oauth");
  if (p === "google") {
    const stored = await env.LICENSE.get("org_google_sub");
    if (!stored || stored === prof.externalId) {
      if (!stored) await kvPut(env, "org_google_sub", prof.externalId);
      const cookie = await makeSessionCookie(env, { uid: "org", role: "admin", ctx: "org", name: prof.name || "組織管理者", exp: sessionExp() });
      return redir("/", cookie);
    }
  }
  const idn = await env.DB.prepare("SELECT user_id FROM identities WHERE type=? AND external_id=?").bind(p, prof.externalId).first();
  if (idn) {
    const u = await env.DB.prepare("SELECT id,role,status FROM users WHERE id=?").bind(idn.user_id).first();
    if (u?.status === "active") {
      const cookie = await makeSessionCookie(env, { uid: u.id, role: u.role, ctx: "personal", name: prof.name, exp: sessionExp() });
      return redir("/", cookie);
    }
    return redir("/login?e=pending");
  }
  const pend = await signPending(env, { provider: p, externalId: prof.externalId, name: prof.name });
  return redir("/join", `pending_oauth=${pend}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
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
