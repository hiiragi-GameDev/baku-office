globalThis.process ??= {};
globalThis.process.env ??= {};
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { cachedEntitlement } from "./client_F4fksau0.mjs";
import { b as listAccountItems } from "./accounting_D4tRmfws.mjs";
import { s as suggestAccountItem } from "./ctx_D9xObGWH.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  if (!atLeast(await cachedEntitlement(env).catch(() => "free"), "plus")) {
    return json({ error: "AI勘定科目推定は Plus 以上で利用できます" }, 402);
  }
  const b = await request.json().catch(() => ({}));
  const items = await listAccountItems(env, { enabledOnly: true });
  const expense = items.filter((a) => a.major === "expense");
  const candidates = (expense.length ? expense : items).map((a) => ({ code: a.code, name: a.name }));
  const sug = await suggestAccountItem(env, { vendor: b.vendor, description: b.description, amount: b.amount }, candidates);
  if (!sug) return json({ ok: true, suggestion: null });
  const hit = items.find((a) => a.code === sug.code);
  return json({ ok: true, suggestion: hit ? { id: hit.id, code: hit.code, name: hit.name, reason: sug.reason } : null });
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
