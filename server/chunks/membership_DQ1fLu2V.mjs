globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { s as softDeleteTx, n as nowSec, e as ensureSeed, c as currentPeriod, l as listWallets, a as createTx } from "./accounting_D4tRmfws.mjs";
async function postFeeIncome(env, a) {
  try {
    await ensureSeed(env);
    const period = await currentPeriod(env);
    if (!period) return null;
    const cat = await env.DB.prepare("SELECT id FROM categories WHERE name='会費収入' AND kind='income' LIMIT 1").first();
    const wallets = await listWallets(env);
    const wallet = wallets.find((w) => w.type === "bank") ?? wallets[0];
    if (!wallet) return null;
    const date = a.date && /^\d{4}-\d{2}-\d{2}/.test(a.date) ? a.date.slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    return await createTx(env, {
      fiscal_period_id: period.id,
      date,
      wallet_id: wallet.id,
      kind: "income",
      category_id: cat?.id ?? null,
      amount: Math.round(a.amount),
      description: `会費：${a.name}`,
      counter_wallet_id: null
    });
  } catch {
    return null;
  }
}
const FEE_STATUSES = ["paid", "unpaid", "exempt", "withdrawn"];
const FEE_LABEL = { paid: "支払済", unpaid: "未払い", exempt: "免除", withdrawn: "退会" };
async function listMembers(env, q = "") {
  if (q) return (await env.DB.prepare("SELECT * FROM membership WHERE name LIKE ? OR contact LIKE ? ORDER BY created_at DESC LIMIT 500").bind("%" + q + "%", "%" + q + "%").all()).results;
  return (await env.DB.prepare("SELECT * FROM membership ORDER BY created_at DESC LIMIT 500").all()).results;
}
const toAmount = (v) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? n : null;
};
async function createMember(env, a) {
  const id = randomId();
  const now = nowSec();
  const fee = FEE_STATUSES.includes(a.fee_status ?? "unpaid") ? a.fee_status : "unpaid";
  const amount = toAmount(a.fee_amount);
  const txId = fee === "paid" && amount ? await postFeeIncome(env, { name: a.name, amount, date: a.paid_at }) : null;
  await env.DB.prepare(
    "INSERT INTO membership (id,name,contact,fee_status,paid_at,status_changed_at,extra,fee_amount,rank,fee_tx_id,stripe_customer,consent_version,consent_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(id, a.name, a.contact ?? null, fee, a.paid_at ?? null, now, a.extra ?? null, amount, a.rank?.trim() || null, txId, a.stripe_customer ?? null, a.consent_version ?? null, a.consent_at ?? null, now, now).run();
  return id;
}
const JOIN_CONSENT_VERSION = "2026-06-25";
async function updateMember(env, id, patch) {
  const cur = await env.DB.prepare("SELECT name,fee_status,fee_amount,fee_tx_id FROM membership WHERE id=?").bind(id).first();
  if (!cur) return;
  const sets = [];
  const binds = [];
  if (patch.name !== void 0) {
    sets.push("name=?");
    binds.push(patch.name);
  }
  if (patch.contact !== void 0) {
    sets.push("contact=?");
    binds.push(patch.contact || null);
  }
  if (patch.extra !== void 0) {
    sets.push("extra=?");
    binds.push(patch.extra || null);
  }
  if (patch.rank !== void 0) {
    sets.push("rank=?");
    binds.push(patch.rank.trim() || null);
  }
  const newAmount = patch.fee_amount !== void 0 ? toAmount(patch.fee_amount) : cur.fee_amount;
  if (patch.fee_amount !== void 0) {
    sets.push("fee_amount=?");
    binds.push(newAmount);
  }
  let paidAt = patch.paid_at;
  const becamePaid = patch.fee_status !== void 0 && FEE_STATUSES.includes(patch.fee_status) && patch.fee_status !== cur.fee_status && patch.fee_status === "paid";
  const leftPaid = patch.fee_status !== void 0 && patch.fee_status !== cur.fee_status && cur.fee_status === "paid";
  if (patch.fee_status !== void 0 && FEE_STATUSES.includes(patch.fee_status) && patch.fee_status !== cur.fee_status) {
    sets.push("fee_status=?", "status_changed_at=?");
    binds.push(patch.fee_status, nowSec());
    if (patch.fee_status === "paid" && paidAt === void 0) paidAt = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace("T", " ");
  }
  if (paidAt !== void 0) {
    sets.push("paid_at=?");
    binds.push(paidAt || null);
  }
  let feeTxChange = null;
  if (becamePaid && newAmount && !cur.fee_tx_id) {
    const txId = await postFeeIncome(env, { name: patch.name ?? cur.name, amount: newAmount, date: paidAt });
    if (txId) feeTxChange = { col: true, val: txId };
  } else if (leftPaid && cur.fee_tx_id) {
    await softDeleteTx(env, cur.fee_tx_id).catch(() => {
    });
    feeTxChange = { col: true, val: null };
  }
  if (feeTxChange) {
    sets.push("fee_tx_id=?");
    binds.push(feeTxChange.val);
  }
  if (!sets.length) return;
  sets.push("updated_at=?");
  binds.push(nowSec());
  binds.push(id);
  await env.DB.prepare(`UPDATE membership SET ${sets.join(",")} WHERE id=?`).bind(...binds).run();
}
async function deleteMember(env, id) {
  const cur = await env.DB.prepare("SELECT fee_tx_id FROM membership WHERE id=?").bind(id).first();
  if (cur?.fee_tx_id) await softDeleteTx(env, cur.fee_tx_id).catch(() => {
  });
  await env.DB.prepare("DELETE FROM membership WHERE id=?").bind(id).run();
}
async function memberStats(env) {
  try {
    const total = (await env.DB.prepare("SELECT COUNT(*) AS n FROM membership").first())?.n ?? 0;
    const paid = (await env.DB.prepare("SELECT COUNT(*) AS n FROM membership WHERE fee_status='paid'").first())?.n ?? 0;
    const unpaid = (await env.DB.prepare("SELECT COUNT(*) AS n FROM membership WHERE fee_status='unpaid'").first())?.n ?? 0;
    return { total, paid, unpaid };
  } catch {
    return { total: 0, paid: 0, unpaid: 0 };
  }
}
export {
  FEE_LABEL,
  FEE_STATUSES,
  JOIN_CONSENT_VERSION,
  createMember,
  deleteMember,
  listMembers,
  memberStats,
  updateMember
};
