globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";
import { v as verifyApiToken } from "./api-tokens_BRmtJYri.mjs";
import { f as runInstalledApp } from "./app-runtime_CwwWS9oK.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, params, locals, url }) => {
  const bearer = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const token = bearer || url.searchParams.get("token") || "";
  const t = await verifyApiToken(env, token);
  if (!t) return json({ error: "invalid or missing token" }, 401);
  const appId = String(params.appId ?? "");
  if (t.app_id !== appId) return json({ error: "token does not match this app" }, 403);
  const b = await request.json().catch(() => ({}));
  const inputs = b.inputs && typeof b.inputs === "object" ? b.inputs : b;
  const res = await runInstalledApp(locals.ctx, appId, inputs, t.owner, typeof b.screenId === "string" ? b.screenId : void 0);
  return json(res, res.ok ? 200 : 400);
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
