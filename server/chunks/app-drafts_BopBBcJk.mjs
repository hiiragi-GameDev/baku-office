globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession, canDevelopApps } from "./auth_DL5yvmzT.mjs";
import { l as listDrafts } from "./external-apps_Ltsw3Yx-.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const GET = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || !canDevelopApps(ses.role, ses.ctx)) return json({ drafts: [] });
  const d = await listDrafts(locals.ctx).catch(() => []);
  return json({ drafts: d.map((x) => ({ id: x.id, version: x.version, gate_status: x.gate_status })) });
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
