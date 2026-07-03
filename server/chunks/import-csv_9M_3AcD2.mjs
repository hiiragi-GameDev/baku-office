globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin, getSession } from "./auth_DL5yvmzT.mjs";
import { e as ensureSeed, c as currentPeriod, l as listWallets, f as findOrCreateCategory, a as createTx } from "./accounting_D4tRmfws.mjs";
import { audit } from "./storage_BHLYBEBb.mjs";
import { env } from "cloudflare:workers";
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const s = text.replace(/\r\n?/g, "\n");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
function num(s) {
  const t = (s ?? "").replace(/[\s,，¥]/g, "").replace(/^[（(]/, "-").replace(/[)）]/g, "").trim();
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}
function normDate(s) {
  const t = (s ?? "").trim();
  const m = /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(t);
  if (m) return `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`;
  return "";
}
const findCol = (header, res) => header.findIndex((h) => res.some((re) => re.test(h.trim())));
function parseTransactionsCsv(text) {
  const grid = parseCsv(text);
  const warnings = [];
  if (grid.length < 2) return { rows: [], total: 0, skipped: 0, warnings: ["データ行が見つかりませんでした（1行目は見出し）。"] };
  const header = grid[0];
  const dateCol = findCol(header, [/日付|取引日|年月日|date/i]);
  const descCol = findCol(header, [/摘要|内容|お取引内容|備考|memo|description|品名|店舗/i]);
  const amtCol = findCol(header, [/^金額$|amount|利用金額|取引金額/i]);
  const inCol = findCol(header, [/入金|預入|お預り|入金額/i]);
  const outCol = findCol(header, [/出金|引出|お支払|出金額|利用額/i]);
  if (dateCol < 0) warnings.push("「日付」列が見つかりませんでした。1行目の見出しに日付の列名を入れてください。");
  if (amtCol < 0 && inCol < 0 && outCol < 0) warnings.push("「金額」または「入金/出金」の列が見つかりませんでした。");
  const rows = [];
  let skipped = 0;
  for (let i = 1; i < grid.length; i++) {
    const r = grid[i];
    const date = dateCol >= 0 ? normDate(r[dateCol]) : "";
    const description = (descCol >= 0 ? r[descCol] : "").trim().slice(0, 200);
    let amount = 0;
    let kind = "expense";
    if (inCol >= 0 || outCol >= 0) {
      const inc = inCol >= 0 ? num(r[inCol]) : 0;
      const out = outCol >= 0 ? num(r[outCol]) : 0;
      if (inc > 0) {
        amount = inc;
        kind = "income";
      } else if (out > 0) {
        amount = out;
        kind = "expense";
      }
    } else if (amtCol >= 0) {
      const v = num(r[amtCol]);
      amount = Math.abs(v);
      kind = v >= 0 ? "income" : "expense";
    }
    if (!date || amount <= 0) {
      skipped++;
      continue;
    }
    rows.push({ date, description, amount: Math.round(amount), kind });
  }
  return { rows, total: rows.length, skipped, warnings };
}
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  const csv = String(b.csv ?? "");
  if (csv.trim().length < 3) return json({ error: "CSV の内容が空です" }, 400);
  const parsed = parseTransactionsCsv(csv);
  if (b._action === "preview") {
    return json({ ok: true, rows: parsed.rows.slice(0, 100), total: parsed.total, skipped: parsed.skipped, warnings: parsed.warnings });
  }
  if (b._action === "import") {
    if (!b.wallet_id) return json({ error: "取り込み先の口座を選んでください" }, 400);
    if (!parsed.rows.length) return json({ error: "取り込める明細がありませんでした", warnings: parsed.warnings }, 400);
    await ensureSeed(env);
    const period = await currentPeriod(env);
    if (!period) return json({ error: "会計期がありません" }, 400);
    const wallets = await listWallets(env);
    if (!wallets.some((w) => w.id === b.wallet_id)) return json({ error: "口座が見つかりません" }, 400);
    const incCat = await findOrCreateCategory(env, "口座取込（収入・要確認）", "income");
    const expCat = await findOrCreateCategory(env, "口座取込（支出・要確認）", "expense");
    let imported = 0;
    for (const r of parsed.rows) {
      await createTx(env, {
        fiscal_period_id: period.id,
        date: r.date,
        wallet_id: String(b.wallet_id),
        kind: r.kind,
        category_id: r.kind === "income" ? incCat : expCat,
        amount: r.amount,
        description: r.description || "（明細取込）",
        counter_wallet_id: null
      });
      imported++;
    }
    const uid = (await getSession(env, request).catch(() => null))?.uid ?? "admin";
    await audit(env, uid, "accounting.import_csv", `wallet=${b.wallet_id} imported=${imported} skipped=${parsed.skipped}`);
    return json({ ok: true, imported, skipped: parsed.skipped, warnings: parsed.warnings });
  }
  return json({ error: "不明な操作" }, 400);
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
