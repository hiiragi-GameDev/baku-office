globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { g as getAccountItemByCode, n as nowSec } from "./accounting_D4tRmfws.mjs";
import { createJournalEntry } from "./journal_CPKMU7C_.mjs";
import { e as estimateDiscrepancy } from "./ctx_D9xObGWH.mjs";
async function expectedBalance(env, periodId, walletId, asOf) {
  const wallet = await env.DB.prepare("SELECT opening_balance FROM wallets WHERE id=?").bind(walletId).first();
  let bal = wallet?.opening_balance ?? 0;
  const { results } = await env.DB.prepare(
    "SELECT kind,wallet_id,counter_wallet_id,amount FROM transactions WHERE fiscal_period_id=? AND deleted_at IS NULL AND date<=? AND (wallet_id=? OR counter_wallet_id=?)"
  ).bind(periodId, asOf, walletId, walletId).all();
  for (const t of results) {
    if (t.kind === "income" && t.wallet_id === walletId) bal += t.amount;
    else if (t.kind === "expense" && t.wallet_id === walletId) bal -= t.amount;
    else if (t.kind === "transfer") {
      if (t.wallet_id === walletId) bal -= t.amount;
      else if (t.counter_wallet_id === walletId) bal += t.amount;
    }
  }
  return bal;
}
async function recentTx(env, periodId, walletId, asOf) {
  return (await env.DB.prepare(
    "SELECT date,kind,amount,description FROM transactions WHERE fiscal_period_id=? AND deleted_at IS NULL AND date<=? AND (wallet_id=? OR counter_wallet_id=?) ORDER BY date DESC, created_at DESC LIMIT 30"
  ).bind(periodId, asOf, walletId, walletId).all()).results;
}
async function createClosure(env, c) {
  const expected = await expectedBalance(env, c.fiscal_period_id, c.wallet_id, c.asOf);
  const difference = expected - c.counted_amount;
  let ai_reason = null;
  if (difference !== 0) {
    const recent = await recentTx(env, c.fiscal_period_id, c.wallet_id, c.asOf);
    ai_reason = await estimateDiscrepancy(env, difference, recent).catch(() => null);
  }
  const id = randomId();
  await env.DB.prepare(
    "INSERT INTO register_closures (id,fiscal_period_id,wallet_id,kind,period_label,expected_amount,counted_amount,difference,ai_reason,closed_by,closed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(id, c.fiscal_period_id, c.wallet_id, c.kind, c.period_label, expected, c.counted_amount, difference, ai_reason, c.closed_by ?? null, nowSec()).run();
  return { id, expected, difference, ai_reason };
}
async function listClosures(env, periodId) {
  return (await env.DB.prepare(
    "SELECT * FROM register_closures WHERE fiscal_period_id=? ORDER BY closed_at DESC LIMIT 50"
  ).bind(periodId).all()).results;
}
async function postCashOverShort(env, closureId, date) {
  const c = await env.DB.prepare("SELECT * FROM register_closures WHERE id=?").bind(closureId).first();
  if (!c || c.difference === 0 || c.adjustment_entry_id) return null;
  const wallet = await env.DB.prepare("SELECT account_item_id FROM wallets WHERE id=?").bind(c.wallet_id).first();
  const overShort = await getAccountItemByCode(env, "195");
  if (!wallet?.account_item_id || !overShort) return null;
  const amount = Math.abs(c.difference);
  const lines = c.difference > 0 ? [{ side: "debit", account_item_id: overShort.id, amount }, { side: "credit", account_item_id: wallet.account_item_id, amount }] : [{ side: "debit", account_item_id: wallet.account_item_id, amount }, { side: "credit", account_item_id: overShort.id, amount }];
  const entryId = await createJournalEntry(env, { fiscal_period_id: c.fiscal_period_id, date, description: "レジ締め：現金過不足の調整", source: "closure", source_ref: closureId, lines });
  await env.DB.prepare("UPDATE register_closures SET adjustment_entry_id=? WHERE id=?").bind(entryId, closureId).run();
  return entryId;
}
export {
  createClosure,
  expectedBalance,
  listClosures,
  postCashOverShort
};
