globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { deleteCapability, setCapabilityEnabled, createCapability } from "./capabilities_DGQUed42.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  switch (b._action) {
    case "create":
      if (!b.capability) return json({ error: "capability が必要" }, 400);
      return json({ ok: true, id: await createCapability(env, { capability: b.capability, provider: b.provider, endpoint: b.endpoint, model: b.model, api_key: b.api_key }) });
    case "enable":
      if (b.id) await setCapabilityEnabled(env, b.id, !!b.enabled);
      return json({ ok: true });
    case "delete":
      if (b.id) await deleteCapability(env, b.id);
      return json({ ok: true });
    default:
      return json({ error: "不明な操作" }, 400);
  }
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
