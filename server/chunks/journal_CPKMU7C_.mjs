globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec, b as listAccountItems } from "./accounting_D4tRmfws.mjs";
async function createJournalEntry(env, e) {
  const debit = e.lines.filter((l) => l.side === "debit").reduce((s, l) => s + l.amount, 0);
  const credit = e.lines.filter((l) => l.side === "credit").reduce((s, l) => s + l.amount, 0);
  if (e.lines.length < 2 || debit <= 0 || debit !== credit) {
    throw new Error(`仕訳の借方(${debit})と貸方(${credit})が一致しません`);
  }
  const id = randomId();
  const now = nowSec();
  await env.DB.prepare(
    "INSERT INTO journal_entries (id,fiscal_period_id,date,description,source,source_ref,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)"
  ).bind(id, e.fiscal_period_id, e.date, e.description ?? null, e.source ?? "manual", e.source_ref ?? null, e.created_by ?? null, now, now).run();
  let i = 0;
  for (const l of e.lines) {
    await env.DB.prepare(
      "INSERT INTO journal_lines (id,entry_id,side,account_item_id,amount,memo,sort_order) VALUES (?,?,?,?,?,?,?)"
    ).bind(randomId(), id, l.side, l.account_item_id, l.amount, l.memo ?? null, i++).run();
  }
  return id;
}
async function softDeleteJournalEntry(env, id) {
  await env.DB.prepare("UPDATE journal_entries SET deleted_at=? WHERE id=?").bind(nowSec(), id).run();
}
function txToJournalLines(tx, acc) {
  const amt = tx.amount;
  if (tx.kind === "income") return [{ side: "debit", account_item_id: acc.walletAccId, amount: amt }, { side: "credit", account_item_id: acc.categoryAccId || acc.walletAccId, amount: amt }];
  if (tx.kind === "expense") return [{ side: "debit", account_item_id: acc.categoryAccId || acc.walletAccId, amount: amt }, { side: "credit", account_item_id: acc.walletAccId, amount: amt }];
  return [{ side: "debit", account_item_id: acc.counterAccId || acc.walletAccId, amount: amt }, { side: "credit", account_item_id: acc.walletAccId, amount: amt }];
}
async function loadMaps(env) {
  const items = await listAccountItems(env);
  const byId = new Map(items.map((a) => [a.id, a]));
  const byCode = new Map(items.map((a) => [a.code, a]));
  const wallets = (await env.DB.prepare("SELECT id,account_item_id FROM wallets").all()).results;
  const cats = (await env.DB.prepare("SELECT id,account_item_id FROM categories").all()).results;
  return { items: byId, byCode, walletAcc: new Map(wallets.map((w) => [w.id, w.account_item_id])), catAcc: new Map(cats.map((c) => [c.id, c.account_item_id])) };
}
const toLedgerLines = (lines, items) => lines.map((l) => {
  const a = items.get(l.account_item_id);
  return { side: l.side, account_item_id: l.account_item_id, code: a?.code ?? "", name: a?.name ?? "(不明)", amount: l.amount, memo: l.memo ?? null };
});
async function buildEntriesForPeriod(env, periodId) {
  const m = await loadMaps(env);
  const fallbackWallet = m.byCode.get("111")?.id ?? "";
  const fallbackIncome = m.byCode.get("501")?.id ?? fallbackWallet;
  const fallbackExpense = m.byCode.get("690")?.id ?? fallbackWallet;
  const out = [];
  const txs = (await env.DB.prepare(
    "SELECT id,kind,amount,date,description,wallet_id,counter_wallet_id,category_id,account_item_id FROM transactions WHERE fiscal_period_id=? AND deleted_at IS NULL ORDER BY date, created_at"
  ).bind(periodId).all()).results;
  for (const t of txs) {
    const walletAccId = (m.walletAcc.get(t.wallet_id) ?? null) || fallbackWallet;
    const counterAccId = t.counter_wallet_id ? (m.walletAcc.get(t.counter_wallet_id) ?? null) || fallbackWallet : null;
    const categoryAccId = t.account_item_id || (t.category_id ? m.catAcc.get(t.category_id) ?? null : null) || (t.kind === "income" ? fallbackIncome : fallbackExpense);
    const lines = txToJournalLines(t, { walletAccId, counterAccId, categoryAccId });
    out.push({ id: t.id, date: t.date, description: t.description ?? null, source: "tx", lines: toLedgerLines(lines, m.items) });
  }
  const entries = (await env.DB.prepare(
    "SELECT id,date,description,source FROM journal_entries WHERE fiscal_period_id=? AND deleted_at IS NULL AND source != 'tx' ORDER BY date, created_at"
  ).bind(periodId).all()).results;
  for (const e of entries) {
    const ls = (await env.DB.prepare("SELECT side,account_item_id,amount,memo FROM journal_lines WHERE entry_id=? ORDER BY sort_order").bind(e.id).all()).results;
    out.push({ id: e.id, date: e.date, description: e.description, source: e.source, lines: toLedgerLines(ls, m.items) });
  }
  out.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
  return out;
}
async function trialBalance(env, periodId) {
  const m = await loadMaps(env);
  const entries = await buildEntriesForPeriod(env, periodId);
  const agg = /* @__PURE__ */ new Map();
  for (const e of entries) for (const l of e.lines) {
    const cur = agg.get(l.account_item_id) ?? { debit: 0, credit: 0 };
    if (l.side === "debit") cur.debit += l.amount;
    else cur.credit += l.amount;
    agg.set(l.account_item_id, cur);
  }
  const rows = [];
  for (const [id, v] of agg) {
    const a = m.items.get(id);
    if (!a) continue;
    const balance = a.normal_balance === "debit" ? v.debit - v.credit : v.credit - v.debit;
    rows.push({ code: a.code, name: a.name, major: a.major, debit: v.debit, credit: v.credit, balance });
  }
  rows.sort((x, y) => x.code < y.code ? -1 : 1);
  return rows;
}
export {
  buildEntriesForPeriod,
  createJournalEntry,
  softDeleteJournalEntry,
  trialBalance,
  txToJournalLines
};
