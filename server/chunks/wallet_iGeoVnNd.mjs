globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { e as ensureSeed, d as softDeleteWallet, h as createWallet } from "./accounting_D4tRmfws.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  await ensureSeed(env);
  const b = await request.json().catch(() => ({}));
  if (b._action === "delete" && typeof b.id === "string") {
    const used = await env.DB.prepare("SELECT 1 FROM transactions WHERE (wallet_id=? OR counter_wallet_id=?) AND deleted_at IS NULL LIMIT 1").bind(b.id, b.id).first();
    if (used) return json({ error: "この口座には取引があるため削除できません" }, 400);
    await softDeleteWallet(env, b.id);
    return json({ ok: true });
  }
  if (!b.name || !b.type) return json({ error: "名称と種類が必要" }, 400);
  const id = await createWallet(env, { name: String(b.name), type: String(b.type), opening_balance: Number(b.opening_balance) || 0 });
  return json({ ok: true, id });
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
