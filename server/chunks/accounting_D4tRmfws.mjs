globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
const DEFAULTS = [
  ["111", "現金", "asset"],
  ["112", "普通預金", "asset"],
  ["120", "電子マネー", "asset"],
  ["121", "QR決済", "asset"],
  ["135", "売掛金", "asset"],
  ["170", "工具器具備品", "asset"],
  ["180", "事業主貸", "asset"],
  ["195", "現金過不足", "asset"],
  ["311", "未払金", "liability"],
  ["315", "預り金", "liability"],
  ["330", "クレジットカード", "liability"],
  ["401", "繰越金", "equity"],
  ["420", "事業主借", "equity"],
  ["501", "売上高", "revenue"],
  ["509", "受取手数料", "revenue"],
  ["540", "雑収入", "revenue"],
  ["601", "仕入高", "expense"],
  ["611", "消耗品費", "expense"],
  ["615", "水道光熱費", "expense"],
  ["617", "通信費", "expense"],
  ["621", "支払手数料", "expense"],
  ["630", "会議費", "expense"],
  ["635", "旅費交通費", "expense"],
  ["640", "減価償却費", "expense"],
  ["690", "雑費", "expense"]
];
const normalBalanceOf = (m) => m === "asset" || m === "expense" ? "debit" : "credit";
const WALLET_TYPES = [
  { type: "cash", label: "現金", code: "111" },
  { type: "bank", label: "口座（振込）", code: "112" },
  { type: "credit_card", label: "クレジットカード", code: "330" },
  { type: "emoney", label: "電子マネー", code: "120" },
  { type: "qr", label: "QRコード決済", code: "121" },
  { type: "private", label: "プライベート資金", code: "420" },
  { type: "other", label: "その他", code: "112" }
];
const walletAccountCode = (type) => WALLET_TYPES.find((w) => w.type === type)?.code ?? "112";
async function ensureChartOfAccounts(env) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM account_items").first();
  if ((row?.n ?? 0) >= DEFAULTS.length) return;
  let i = 0;
  for (const [code, name, major] of DEFAULTS) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO account_items (id,code,name,major,normal_balance,builtin,enabled,sort_order) VALUES (?,?,?,?,?,1,1,?)"
    ).bind(randomId(), code, name, major, normalBalanceOf(major), i++).run();
  }
}
async function ensureCategoryAccountLinks(env) {
  const items = await listAccountItems(env);
  const byCode = new Map(items.map((a) => [a.code, a]));
  const byName = new Map(items.map((a) => [a.name, a]));
  const wallets = (await env.DB.prepare("SELECT id,type,account_item_id FROM wallets").all()).results;
  for (const w of wallets) {
    if (w.account_item_id) continue;
    const acc = byCode.get(walletAccountCode(w.type));
    if (acc) await env.DB.prepare("UPDATE wallets SET account_item_id=? WHERE id=?").bind(acc.id, w.id).run();
  }
  const cats = (await env.DB.prepare("SELECT id,name,kind,account_item_id FROM categories").all()).results;
  for (const c of cats) {
    if (c.account_item_id) continue;
    const acc = byName.get(c.name) ?? (c.kind === "income" ? byCode.get("501") : byCode.get("690"));
    if (acc) await env.DB.prepare("UPDATE categories SET account_item_id=? WHERE id=?").bind(acc.id, c.id).run();
  }
}
async function listAccountItems(env, opts) {
  const where = opts?.enabledOnly ? "WHERE enabled=1" : "";
  return (await env.DB.prepare(`SELECT * FROM account_items ${where} ORDER BY sort_order, code`).all()).results;
}
async function getAccountItem(env, id) {
  return env.DB.prepare("SELECT * FROM account_items WHERE id=?").bind(id).first();
}
async function getAccountItemByCode(env, code) {
  return env.DB.prepare("SELECT * FROM account_items WHERE code=?").bind(code).first();
}
const accountItems = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  WALLET_TYPES,
  ensureCategoryAccountLinks,
  ensureChartOfAccounts,
  getAccountItem,
  getAccountItemByCode,
  listAccountItems,
  walletAccountCode
}, Symbol.toStringTag, { value: "Module" }));
const nowSec = () => Math.floor(Date.now() / 1e3);
async function ensureSeed(env) {
  await ensureChartOfAccounts(env);
  const fp = await env.DB.prepare("SELECT id FROM fiscal_periods LIMIT 1").first();
  if (!fp) {
    const y = (/* @__PURE__ */ new Date()).getUTCFullYear();
    const fid = randomId();
    await env.DB.prepare("INSERT INTO fiscal_periods (id,name,start_date,end_date,status) VALUES (?,?,?,?,'open')").bind(fid, `${y}年度`, `${y}-04-01`, `${y + 1}-03-31`).run();
    const wallets = [["現金", "cash"], ["普通預金", "bank"]];
    let i = 0;
    for (const [name, type] of wallets) {
      await env.DB.prepare("INSERT INTO wallets (id,name,type,opening_balance,sort_order) VALUES (?,?,?,0,?)").bind(randomId(), name, type, i++).run();
    }
    const cats = [
      ["会費収入", "income"],
      ["寄付収入", "income"],
      ["事業収入", "income"],
      ["雑収入", "income"],
      ["消耗品費", "expense"],
      ["通信費", "expense"],
      ["会議費", "expense"],
      ["旅費交通費", "expense"],
      ["雑費", "expense"]
    ];
    i = 0;
    for (const [name, kind] of cats) {
      await env.DB.prepare("INSERT INTO categories (id,name,kind,parent_id,sort_order) VALUES (?,?,?,NULL,?)").bind(randomId(), name, kind, i++).run();
    }
  }
  await ensureCategoryAccountLinks(env);
}
async function currentPeriod(env) {
  return env.DB.prepare("SELECT * FROM fiscal_periods WHERE status='open' ORDER BY start_date DESC LIMIT 1").first();
}
async function listWallets(env) {
  return (await env.DB.prepare("SELECT * FROM wallets ORDER BY sort_order").all()).results;
}
async function createWallet(env, w) {
  const { WALLET_TYPES: WALLET_TYPES2, getAccountItemByCode: getAccountItemByCode2, walletAccountCode: walletAccountCode2 } = await Promise.resolve().then(() => accountItems);
  const valid = WALLET_TYPES2.some((t) => t.type === w.type) ? w.type : "other";
  const acc = await getAccountItemByCode2(env, walletAccountCode2(valid));
  const id = randomId();
  const max = await env.DB.prepare("SELECT COALESCE(MAX(sort_order),-1) AS m FROM wallets").first();
  await env.DB.prepare("INSERT INTO wallets (id,name,type,opening_balance,sort_order,account_item_id) VALUES (?,?,?,?,?,?)").bind(id, w.name, valid, Math.round(w.opening_balance ?? 0), (max?.m ?? -1) + 1, acc?.id ?? null).run();
  return id;
}
async function softDeleteWallet(env, id) {
  await env.DB.prepare("DELETE FROM wallets WHERE id=?").bind(id).run();
}
async function listCategories(env) {
  return (await env.DB.prepare("SELECT * FROM categories ORDER BY kind, sort_order").all()).results;
}
async function listCategoriesWithUsage(env) {
  const { results } = await env.DB.prepare(
    "SELECT c.*, (SELECT COUNT(*) FROM transactions t WHERE t.category_id=c.id) AS used FROM categories c ORDER BY c.kind, c.sort_order"
  ).all();
  return results;
}
async function deleteCategory(env, id) {
  const used = await env.DB.prepare("SELECT COUNT(*) AS n FROM transactions WHERE category_id=?").bind(id).first();
  if ((used?.n ?? 0) > 0) return { ok: false, error: "この科目は取引で使用中のため削除できません（先に取引の科目を変更してください）。" };
  await env.DB.prepare("DELETE FROM categories WHERE id=?").bind(id).run();
  return { ok: true };
}
async function findOrCreateCategory(env, name, kind) {
  const nm = name.trim().slice(0, 40);
  if (!nm) return null;
  const existing = await env.DB.prepare("SELECT id FROM categories WHERE name=? AND kind=? LIMIT 1").bind(nm, kind).first();
  if (existing) return existing.id;
  const id = randomId();
  const max = await env.DB.prepare("SELECT COALESCE(MAX(sort_order),-1) AS m FROM categories WHERE kind=?").bind(kind).first();
  await env.DB.prepare("INSERT INTO categories (id,name,kind,parent_id,sort_order) VALUES (?,?,?,NULL,?)").bind(id, nm, kind, (max?.m ?? -1) + 1).run();
  await ensureCategoryAccountLinks(env).catch(() => {
  });
  return id;
}
async function walletBalances(env, periodId) {
  const wallets = await listWallets(env);
  const { results } = await env.DB.prepare(
    "SELECT kind, wallet_id, counter_wallet_id, amount FROM transactions WHERE fiscal_period_id=? AND deleted_at IS NULL"
  ).bind(periodId).all();
  const delta = /* @__PURE__ */ new Map();
  const add = (id, v) => {
    if (id) delta.set(id, (delta.get(id) ?? 0) + v);
  };
  for (const t of results) {
    if (t.kind === "income") add(t.wallet_id, t.amount);
    else if (t.kind === "expense") add(t.wallet_id, -t.amount);
    else if (t.kind === "transfer") {
      add(t.wallet_id, -t.amount);
      add(t.counter_wallet_id, t.amount);
    }
  }
  return wallets.map((w) => ({ ...w, balance: w.opening_balance + (delta.get(w.id) ?? 0) }));
}
async function createTx(env, t) {
  const id = randomId();
  const now = nowSec();
  await env.DB.prepare(
    `INSERT INTO transactions (id,fiscal_period_id,date,wallet_id,kind,category_id,amount,description,counter_wallet_id,account_item_id,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(id, t.fiscal_period_id, t.date, t.wallet_id, t.kind, t.category_id, t.amount, t.description, t.counter_wallet_id, t.account_item_id ?? null, now, now).run();
  return id;
}
async function softDeleteTx(env, id) {
  await env.DB.prepare("UPDATE transactions SET deleted_at=? WHERE id=?").bind(nowSec(), id).run();
}
async function cashbook(env, periodId, walletId) {
  const wallet = await env.DB.prepare("SELECT * FROM wallets WHERE id=?").bind(walletId).first();
  if (!wallet) throw new Error("wallet not found");
  const { results } = await env.DB.prepare(
    `SELECT * FROM transactions WHERE fiscal_period_id=? AND deleted_at IS NULL AND (wallet_id=? OR counter_wallet_id=?) ORDER BY date, created_at`
  ).bind(periodId, walletId, walletId).all();
  let running = wallet.opening_balance;
  const rows = results.map((t) => {
    let delta = 0;
    if (t.kind === "income" && t.wallet_id === walletId) delta = t.amount;
    else if (t.kind === "expense" && t.wallet_id === walletId) delta = -t.amount;
    else if (t.kind === "transfer") {
      if (t.wallet_id === walletId) delta = -t.amount;
      else if (t.counter_wallet_id === walletId) delta = t.amount;
    }
    running += delta;
    return { ...t, running };
  });
  return { wallet, rows };
}
async function incomeStatement(env, periodId) {
  const { results } = await env.DB.prepare(
    `SELECT c.name AS name, c.kind AS kind, COALESCE(SUM(t.amount),0) AS amount
     FROM transactions t JOIN categories c ON c.id=t.category_id
     WHERE t.fiscal_period_id=? AND t.deleted_at IS NULL AND t.kind IN ('income','expense')
     GROUP BY t.category_id ORDER BY c.kind, c.sort_order`
  ).bind(periodId).all();
  const income = results.filter((r) => r.kind === "income").map((r) => ({ name: r.name, amount: r.amount }));
  const expense = results.filter((r) => r.kind === "expense").map((r) => ({ name: r.name, amount: r.amount }));
  return {
    income,
    expense,
    totalIncome: income.reduce((s, r) => s + r.amount, 0),
    totalExpense: expense.reduce((s, r) => s + r.amount, 0)
  };
}
async function budgetActual(env, periodId) {
  const { results } = await env.DB.prepare(
    `SELECT c.name AS name, c.kind AS kind, COALESCE(b.amount,0) AS budget,
            COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.category_id=c.id AND t.fiscal_period_id=? AND t.deleted_at IS NULL),0) AS actual
     FROM categories c LEFT JOIN budgets b ON b.category_id=c.id AND b.fiscal_period_id=?
     ORDER BY c.kind, c.sort_order`
  ).bind(periodId, periodId).all();
  return results;
}
const accounting = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  budgetActual,
  cashbook,
  createTx,
  createWallet,
  currentPeriod,
  deleteCategory,
  ensureSeed,
  findOrCreateCategory,
  incomeStatement,
  listCategories,
  listCategoriesWithUsage,
  listWallets,
  nowSec,
  softDeleteTx,
  softDeleteWallet,
  walletBalances
}, Symbol.toStringTag, { value: "Module" }));
export {
  createTx as a,
  listAccountItems as b,
  currentPeriod as c,
  softDeleteWallet as d,
  ensureSeed as e,
  findOrCreateCategory as f,
  getAccountItemByCode as g,
  createWallet as h,
  deleteCategory as i,
  accountItems as j,
  accounting as k,
  listWallets as l,
  nowSec as n,
  softDeleteTx as s
};
