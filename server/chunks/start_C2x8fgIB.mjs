globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { getLicenseId, hostFetch } from "./client_F4fksau0.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (!["plus", "pro"].includes(b.plan ?? "")) return json({ error: "plan(plus/pro)が必要" }, 400);
  const licenseId = await getLicenseId(env);
  if (!licenseId) return json({ error: "ライセンス未取得" }, 400);
  const returnUrl = new URL(request.url).origin + "/billing";
  const r = await hostFetch(env, "/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ licenseId, plan: b.plan, returnUrl })
  });
  const j = await r.json().catch(() => ({}));
  return json(j, r.ok ? 200 : 400);
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
