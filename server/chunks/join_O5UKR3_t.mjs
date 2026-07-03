globalThis.process ??= {};
globalThis.process.env ??= {};
import { joinWithInvite } from "./users_DArBIlQW.mjs";
import { verifyPending } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200, headers = {}) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", ...headers } });
const POST = async ({ request, locals }) => {
  const b = await request.json().catch(() => ({}));
  if (!b.code || !b.name) return json({ error: "code と name が必要" }, 400);
  const pendRaw = /pending_oauth=([^;]+)/.exec(request.headers.get("cookie") ?? "")?.[1];
  if (pendRaw) {
    const pend = await verifyPending(env, pendRaw);
    if (pend) {
      const r2 = await joinWithInvite(env, b.code, b.name, { type: pend.provider, externalId: pend.externalId });
      return json(r2, r2.ok ? 200 : 400, { "set-cookie": "pending_oauth=; Path=/; Max-Age=0" });
    }
  }
  if (!b.loginId || !b.password) return json({ error: "loginId と password が必要（または LINE/Discord でログインしてから参加）" }, 400);
  const r = await joinWithInvite(env, b.code, b.name, { type: "local", externalId: b.loginId, password: b.password });
  return json(r, r.ok ? 200 : 400);
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
