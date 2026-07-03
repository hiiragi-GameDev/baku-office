globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec, g as getAccountItemByCode } from "./accounting_D4tRmfws.mjs";
import { createJournalEntry } from "./journal_CPKMU7C_.mjs";
function depreciationSchedule(a) {
  const life = Math.max(1, Math.floor(a.useful_life_years));
  const residual = Math.max(0, Math.floor(a.residual_value));
  const cost = Math.max(0, Math.floor(a.acquisition_cost));
  const out = [];
  let bv = cost;
  if (a.method === "declining_balance") {
    const r = a.rate && a.rate > 0 ? a.rate : 2 / life;
    for (let y = 0; y < life; y++) {
      let amt = Math.floor(bv * r);
      if (y === life - 1 || bv - amt < residual) amt = bv - residual;
      if (amt < 0) amt = 0;
      bv -= amt;
      out.push({ year: y + 1, amount: amt, bookValue: bv });
    }
  } else {
    const base = cost - residual;
    const annual = Math.floor(base / life);
    for (let y = 0; y < life; y++) {
      const amt = y === life - 1 ? base - annual * (life - 1) : annual;
      bv -= amt;
      out.push({ year: y + 1, amount: amt, bookValue: bv });
    }
  }
  return out;
}
async function createFixedAsset(env, a) {
  const id = randomId();
  const now = nowSec();
  const assetAcc = a.asset_account_item_id ?? (await getAccountItemByCode(env, "170"))?.id ?? null;
  const expenseAcc = a.expense_account_item_id ?? (await getAccountItemByCode(env, "640"))?.id ?? null;
  await env.DB.prepare(
    `INSERT INTO fixed_assets (id,name,acquired_date,acquisition_cost,useful_life_years,method,residual_value,rate,asset_account_item_id,expense_account_item_id,fiscal_period_id,status,notes,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,'active',?,?,?)`
  ).bind(id, a.name, a.acquired_date, Math.round(a.acquisition_cost), Math.floor(a.useful_life_years), a.method, Math.round(a.residual_value ?? 0), a.rate ?? null, assetAcc, expenseAcc, a.fiscal_period_id ?? null, a.notes ?? null, now, now).run();
  return id;
}
async function listFixedAssets(env) {
  return (await env.DB.prepare("SELECT * FROM fixed_assets WHERE deleted_at IS NULL ORDER BY acquired_date, created_at").all()).results;
}
async function softDeleteFixedAsset(env, id) {
  await env.DB.prepare("UPDATE fixed_assets SET deleted_at=? WHERE id=?").bind(nowSec(), id).run();
}
async function depreciationCount(env, assetId) {
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM depreciation_entries WHERE asset_id=?").bind(assetId).first();
  return r?.n ?? 0;
}
async function postDepreciation(env, assetId, periodId, periodLabel, date) {
  const asset = await env.DB.prepare("SELECT * FROM fixed_assets WHERE id=? AND deleted_at IS NULL").bind(assetId).first();
  if (!asset) return null;
  const dup = await env.DB.prepare("SELECT id FROM depreciation_entries WHERE asset_id=? AND period_label=?").bind(assetId, periodLabel).first();
  if (dup) return null;
  const idx = await depreciationCount(env, assetId);
  const sched = depreciationSchedule(asset);
  if (idx >= sched.length) return null;
  const amount = sched[idx].amount;
  if (amount <= 0) return null;
  if (!asset.expense_account_item_id || !asset.asset_account_item_id) return null;
  const entryId = await createJournalEntry(env, {
    fiscal_period_id: periodId,
    date,
    description: `減価償却：${asset.name}（${periodLabel}）`,
    source: "depreciation",
    source_ref: assetId,
    lines: [
      { side: "debit", account_item_id: asset.expense_account_item_id, amount },
      { side: "credit", account_item_id: asset.asset_account_item_id, amount }
    ]
  });
  await env.DB.prepare("INSERT INTO depreciation_entries (id,asset_id,fiscal_period_id,period_label,amount,journal_entry_id,created_at) VALUES (?,?,?,?,?,?,?)").bind(randomId(), assetId, periodId, periodLabel, amount, entryId, nowSec()).run();
  return entryId;
}
export {
  createFixedAsset,
  depreciationCount,
  depreciationSchedule,
  listFixedAssets,
  postDepreciation,
  softDeleteFixedAsset
};
