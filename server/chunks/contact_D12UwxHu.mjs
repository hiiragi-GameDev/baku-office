globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";
import { rateLimited, honeypotTripped } from "./public-pages_DHQdIiIX.mjs";
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (await rateLimited(env, ip)) return json({ error: "短時間に送信が集中しています。時間をおいて再度お試しください。" }, 429);
  const b = await request.json().catch(() => ({}));
  if (honeypotTripped(b)) return json({ ok: true });
  const message = String(b.message ?? "").trim();
  if (!message) return json({ error: "内容を入力してください。" }, 400);
  await env.DB.prepare("INSERT INTO contact_messages (id,name,email,message,page,status,created_at) VALUES (?,?,?,?,?, 'new', ?)").bind(randomId(), String(b.name ?? "").slice(0, 200) || null, String(b.email ?? "").slice(0, 200) || null, message.slice(0, 5e3), String(b.page ?? "").slice(0, 300) || null, nowSec()).run();
  await locals.ctx.notify.inapp("org", `お問い合わせが届きました：${message.slice(0, 60)}`, "/settings/inbox").catch(() => void 0);
  return json({ ok: true });
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
