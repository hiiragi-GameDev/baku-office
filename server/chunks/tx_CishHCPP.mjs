globalThis.process ??= {};
globalThis.process.env ??= {};
import { e as ensureSeed, s as softDeleteTx, i as deleteCategory, c as currentPeriod, f as findOrCreateCategory, a as createTx } from "./accounting_D4tRmfws.mjs";
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  await ensureSeed(env);
  const b = await request.json().catch(() => ({}));
  if (b._action === "delete" && typeof b.id === "string") {
    await softDeleteTx(env, b.id);
    return json({ ok: true });
  }
  if (b._action === "delete_category" && typeof b.id === "string") {
    const r = await deleteCategory(env, b.id);
    return json(r, r.ok ? 200 : 400);
  }
  const period = await currentPeriod(env);
  if (!period) return json({ error: "会計期がありません" }, 400);
  const kind = b.kind;
  const amount = Number(b.amount);
  if (!["income", "expense", "transfer"].includes(kind) || !Number.isFinite(amount) || amount <= 0) {
    return json({ error: "kind と amount(正の整数) が必要" }, 400);
  }
  if (!b.date || !b.wallet_id) return json({ error: "date と wallet_id が必要" }, 400);
  if (kind === "transfer" && !b.counter_wallet_id) return json({ error: "振替は counter_wallet_id が必要" }, 400);
  if (kind === "transfer" && b.wallet_id === b.counter_wallet_id) return json({ error: "振替元と振替先が同じ口座です" }, 400);
  let categoryId = b.category_id ? String(b.category_id) : null;
  if (kind !== "transfer" && !categoryId && typeof b.category_name === "string" && b.category_name.trim()) {
    categoryId = await findOrCreateCategory(env, b.category_name, kind);
  }
  if (kind !== "transfer" && !categoryId) return json({ error: "科目を入力してください" }, 400);
  const id = await createTx(env, {
    fiscal_period_id: period.id,
    date: String(b.date),
    wallet_id: String(b.wallet_id),
    kind,
    category_id: kind === "transfer" ? null : categoryId,
    amount: Math.round(amount),
    description: b.description ? String(b.description) : null,
    counter_wallet_id: kind === "transfer" ? String(b.counter_wallet_id) : null,
    account_item_id: kind !== "transfer" && b.account_item_id ? String(b.account_item_id) : null
  });
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
