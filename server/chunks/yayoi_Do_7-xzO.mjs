globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as currentPeriod } from "./accounting_D4tRmfws.mjs";
import { getSession, canAccess } from "./auth_DL5yvmzT.mjs";
import { buildEntriesForPeriod } from "./journal_CPKMU7C_.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const GET = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses || !canAccess(ses.role, "accounting")) {
    return new Response("forbidden", { status: 403 });
  }
  const period = await currentPeriod(env);
  if (!period) return new Response("会計期がありません", { status: 400 });
  const entries = await buildEntriesForPeriod(env, period.id);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const ymd = (d) => d.replace(/-/g, "/");
  const rows = [];
  let no = 1;
  for (const e of entries) {
    const deb = e.lines.find((l) => l.side === "debit");
    const cre = e.lines.find((l) => l.side === "credit");
    if (!deb || !cre) continue;
    const cols = [
      "2000",
      // 1 識別フラグ（仕訳データ）
      String(no++),
      // 2 伝票番号
      "",
      // 3 決算整理仕訳
      ymd(e.date),
      // 4 取引日付
      deb.name,
      // 5 借方勘定科目
      "",
      // 6 借方補助科目
      "",
      // 7 借方部門
      "対象外",
      // 8 借方税区分
      String(deb.amount),
      // 9 借方金額
      "0",
      // 10 借方税金額
      cre.name,
      // 11 貸方勘定科目
      "",
      // 12 貸方補助科目
      "",
      // 13 貸方部門
      "対象外",
      // 14 貸方税区分
      String(cre.amount),
      // 15 貸方金額
      "0",
      // 16 貸方税金額
      e.description ?? "",
      // 17 摘要
      "",
      // 18 番号
      "",
      // 19 期日
      "",
      // 20 タイプ
      "",
      // 21 生成元
      "",
      // 22 仕訳メモ
      "",
      // 23 付箋1
      "",
      // 24 付箋2
      "no"
      // 25 調整
    ];
    rows.push(cols.map(esc).join(","));
  }
  const csv = "\uFEFF" + rows.join("\r\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="yayoi_shiwake_${period.name}.csv"`
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
