globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { markRegistrationPaid } from "./events_DvycExYH.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  const b = await request.json().catch(() => ({}));
  if (!b.registrationId) return json({ error: "registrationId が必要" }, 400);
  const reg = await env.DB.prepare("SELECT user_id FROM event_registrations WHERE id=?").bind(b.registrationId).first();
  if (!reg) return json({ error: "申込が見つかりません" }, 404);
  const isOwner = reg.user_id && reg.user_id === ses.uid;
  const isAdmin = ses.role === "admin";
  if (!isOwner && !isAdmin) return json({ error: "この申込を決済する権限がありません" }, 403);
  const r = await markRegistrationPaid(env, b.registrationId);
  return r.ok ? json({ ok: true, amount: r.amount }) : json({ error: r.error }, 400);
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
