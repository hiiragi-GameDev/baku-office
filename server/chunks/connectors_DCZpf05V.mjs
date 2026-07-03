globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { l as listConnectors, r as removeConnector, u as upsertConnector } from "./connectors-store_CHWkgRyl.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const CONNECTORS = ["discord", "line", "slack"];
const GET = async ({ request, locals }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  return json({ connectors: await listConnectors(locals.ctx.db) });
};
const POST = async ({ request, locals }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  const id = (b.id ?? "").trim();
  if (b.op === "delete") {
    if (!id) return json({ error: "id が必要です。" }, 400);
    await removeConnector(locals.ctx.db, id);
    return json({ ok: true });
  }
  const label = (b.label ?? "").trim();
  const connector = (b.connector ?? "").trim();
  const address = (b.address ?? "").trim();
  if (!id || !label || !address) return json({ error: "id・ラベル・宛先は必須です。" }, 400);
  if (!CONNECTORS.includes(connector)) return json({ error: `プロバイダは ${CONNECTORS.join(" / ")} のいずれかにしてください。` }, 400);
  await upsertConnector(locals.ctx.db, { id, label, connector, address, enabled: b.enabled !== false, now: nowSec() });
  return json({ ok: true });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
