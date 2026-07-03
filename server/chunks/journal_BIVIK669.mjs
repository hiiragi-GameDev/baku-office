globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { e as ensureSeed, c as currentPeriod } from "./accounting_D4tRmfws.mjs";
import { softDeleteJournalEntry, createJournalEntry } from "./journal_CPKMU7C_.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  await ensureSeed(env);
  const b = await request.json().catch(() => ({}));
  if (b._action === "delete" && typeof b.id === "string") {
    await softDeleteJournalEntry(env, b.id);
    return json({ ok: true });
  }
  const period = await currentPeriod(env);
  if (!period) return json({ error: "会計期がありません" }, 400);
  if (!b.date) return json({ error: "date が必要" }, 400);
  const rawLines = Array.isArray(b.lines) ? b.lines : [];
  const lines = rawLines.map((l) => l).filter((l) => (l.side === "debit" || l.side === "credit") && l.account_item_id && Number(l.amount) > 0).map((l) => ({ side: l.side, account_item_id: String(l.account_item_id), amount: Math.round(Number(l.amount)), memo: l.memo ? String(l.memo) : null }));
  if (lines.length < 2) return json({ error: "借方・貸方の2行以上が必要" }, 400);
  try {
    const id = await createJournalEntry(env, {
      fiscal_period_id: period.id,
      date: String(b.date),
      description: b.description ? String(b.description) : null,
      source: "manual",
      lines
    });
    return json({ ok: true, id });
  } catch (e) {
    return json({ error: e.message || "仕訳の保存に失敗しました" }, 400);
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
