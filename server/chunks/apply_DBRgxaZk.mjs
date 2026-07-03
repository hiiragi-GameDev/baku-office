globalThis.process ??= {};
globalThis.process.env ??= {};
import { registerForEvent } from "./events_DvycExYH.mjs";
import { makeSessionCookie, sessionExp } from "./auth_DL5yvmzT.mjs";
import { r as rateLimited } from "./rate-limit_B3Jlq_2x.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200, headers = {}) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", ...headers } });
const POST = async ({ request }) => {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (await rateLimited(env, `event:${ip}`, 10, 3600)) return json({ error: "短時間に申込が集中しています。時間をおいて再度お試しください。" }, 429);
  const b = await request.json().catch(() => ({}));
  const r = await registerForEvent(env, {
    slug: String(b.slug ?? ""),
    name: String(b.name ?? ""),
    contact: b.contact != null ? String(b.contact) : void 0,
    loginId: String(b.loginId ?? ""),
    password: String(b.password ?? ""),
    planId: b.planId != null ? String(b.planId) : void 0,
    headcount: b.headcount
  });
  if (!r.ok) return json({ error: r.error }, 400);
  const cookie = await makeSessionCookie(env, { uid: r.userId, role: "guest", ctx: "personal", name: String(b.name ?? ""), exp: sessionExp() });
  return json({ ok: true, registrationId: r.registrationId, amount: r.amount }, 200, { "set-cookie": cookie });
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
