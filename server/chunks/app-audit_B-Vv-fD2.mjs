globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const GET = async ({ request, url }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const appId = url.searchParams.get("appId") ?? "";
  if (!appId) return json({ error: "appId が必要です" }, 400);
  const { results } = await env.DB.prepare(
    "SELECT owner,op,detail,created_at FROM app_audit_log WHERE app_id=? ORDER BY created_at DESC LIMIT 200"
  ).bind(appId).all();
  return json({ ok: true, entries: results ?? [] });
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
