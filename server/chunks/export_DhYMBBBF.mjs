globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as currentPeriod } from "./accounting_D4tRmfws.mjs";
import { getSession, canAccess } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const GET = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || !canAccess(ses.role, "accounting")) {
    return new Response("forbidden", { status: 403 });
  }
  const period = await currentPeriod(env);
  if (!period) return new Response("会計期がありません", { status: 400 });
  const { results } = await env.DB.prepare(
    `SELECT t.date, w.name AS wallet, t.kind, c.name AS category, t.amount, t.description, w2.name AS counter
     FROM transactions t
     JOIN wallets w ON w.id=t.wallet_id
     LEFT JOIN categories c ON c.id=t.category_id
     LEFT JOIN wallets w2 ON w2.id=t.counter_wallet_id
     WHERE t.fiscal_period_id=? AND t.deleted_at IS NULL ORDER BY t.date, t.created_at`
  ).bind(period.id).all();
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const signed = (kind, amount) => kind === "income" ? amount : -amount;
  const header = ["日付", "口座", "種別", "科目", "金額", "符号付金額", "摘要", "振替先"];
  const lines = [header.map(esc).join(",")];
  for (const r of results) {
    lines.push([r.date, r.wallet, r.kind, r.category ?? "", r.amount, signed(r.kind, r.amount), r.description ?? "", r.counter ?? ""].map(esc).join(","));
  }
  const csv = "\uFEFF" + lines.join("\r\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="transactions_${period.name}.csv"`
    }
  });
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
