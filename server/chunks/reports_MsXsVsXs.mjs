globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { $ as $$App, r as renderScript } from "./App_Wwjuh1XD.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const $$Reports = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Reports;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdmin = ses.role === "admin";
  if (!isAdmin) return Astro2.redirect("/", 302);
  const qMonth = Astro2.url.searchParams.get("month") ?? "";
  const month = /^\d{4}-\d{2}$/.test(qMonth) ? qMonth : (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const mDate = new Date(Date.parse(`${month}-01T00:00:00Z`));
  const prevMonth = new Date(Date.UTC(mDate.getUTCFullYear(), mDate.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
  const nextMonth = new Date(Date.UTC(mDate.getUTCFullYear(), mDate.getUTCMonth() + 1, 1)).toISOString().slice(0, 7);
  const isCurrent = month === (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const { monthKpi } = await import("./kpi_BmbE7XHM.mjs");
  const { TASK_KIND_LABEL } = await import("./task-log_BGzViZew.mjs");
  const kpi = await monthKpi(env, month);
  const hours = Math.round(kpi.savedMinutes / 60 * 10) / 10;
  const fbHours = Math.round(kpi.feedbackMinutes / 60 * 10) / 10;
  const FAIL_LABEL = {
    hops: "処理が長すぎた",
    refused: "AIが応答を見送った",
    credit: "APIクレジット不足",
    rate: "レート制限",
    auth: "APIキー無効",
    approval_pending: "承認待ち",
    model_error: "AI側エラー",
    cancelled: "利用者が停止",
    out_of_scope: "スコープ外（未対応）"
  };
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "実績レポート", "data-astro-cid-k5zskagf": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="wrap" data-astro-cid-k5zskagf> <section class="card" id="report" data-astro-cid-k5zskagf> <div class="rep-head" data-astro-cid-k5zskagf> <h1 data-astro-cid-k5zskagf>実績レポート</h1> <div class="rep-nav no-print" data-astro-cid-k5zskagf> <a class="btn btn-sm"${addAttribute(`/reports?month=${prevMonth}`, "href")} data-astro-cid-k5zskagf>← 前月</a> <strong data-astro-cid-k5zskagf>${month}</strong> ${!isCurrent && renderTemplate`<a class="btn btn-sm"${addAttribute(`/reports?month=${nextMonth}`, "href")} data-astro-cid-k5zskagf>翌月 →</a>`} <a class="btn btn-sm"${addAttribute(`/api/reports/kpi?month=${month}&format=csv`, "href")} data-astro-cid-k5zskagf>CSV</a> <button class="btn btn-sm" id="printBtn" type="button" data-astro-cid-k5zskagf>印刷 / PDF保存</button> </div> </div> <p class="muted" data-astro-cid-k5zskagf>集計はタスク単位の自動ログ（本文・個人情報は含みません）。削減時間＝AI単独完了 × 種別ごとの想定手作業分数（下の設定で調整できます）。金額は概算です。</p> <h2 data-astro-cid-k5zskagf>今月のサマリ${isCurrent ? "（累計中）" : ""}</h2> <div class="kpi-grid" data-astro-cid-k5zskagf> <div class="kpi" data-astro-cid-k5zskagf><span class="kpi-v" data-astro-cid-k5zskagf>${kpi.total}</span><span class="kpi-l" data-astro-cid-k5zskagf>処理件数</span></div> <div class="kpi" data-astro-cid-k5zskagf><span class="kpi-v" data-astro-cid-k5zskagf>${kpi.completionRate}%</span><span class="kpi-l" data-astro-cid-k5zskagf>AI単独完了</span></div> <div class="kpi" data-astro-cid-k5zskagf><span class="kpi-v" data-astro-cid-k5zskagf>${kpi.reworkRate}%</span><span class="kpi-l" data-astro-cid-k5zskagf>手戻り率</span></div> <div class="kpi kpi-hero" data-astro-cid-k5zskagf><span class="kpi-v" data-astro-cid-k5zskagf>${hours}時間</span><span class="kpi-l" data-astro-cid-k5zskagf>削減時間 ≒ ${kpi.savedJpy.toLocaleString()}円</span></div> <div class="kpi" data-astro-cid-k5zskagf><span class="kpi-v" data-astro-cid-k5zskagf>${kpi.aiCostJpy.toLocaleString()}円</span><span class="kpi-l" data-astro-cid-k5zskagf>AI実費（概算）</span></div> <div class="kpi" data-astro-cid-k5zskagf><span class="kpi-v" data-astro-cid-k5zskagf>${kpi.roi !== null ? kpi.roi + "倍" : "—"}</span><span class="kpi-l" data-astro-cid-k5zskagf>削減額 ÷ AI実費</span></div> <div class="kpi" data-astro-cid-k5zskagf><span class="kpi-v" data-astro-cid-k5zskagf>${kpi.activeUsers}</span><span class="kpi-l" data-astro-cid-k5zskagf>利用メンバー</span></div> <div class="kpi" data-astro-cid-k5zskagf><span class="kpi-v" data-astro-cid-k5zskagf>${fbHours}時間</span><span class="kpi-l" data-astro-cid-k5zskagf>利用者申告の削減（参考）</span></div> <div class="kpi" data-astro-cid-k5zskagf><span class="kpi-v" data-astro-cid-k5zskagf>${kpi.nps.respondents ? `${kpi.nps.yes} / ${kpi.nps.neutral} / ${kpi.nps.no}` : "—"}</span><span class="kpi-l" data-astro-cid-k5zskagf>勧めたい（はい/どちらでも/いいえ）</span></div> </div> <h2 data-astro-cid-k5zskagf>killerタスク（効いている業務 上位）</h2> ${kpi.killer.length ? renderTemplate`<div class="table-wrap" data-astro-cid-k5zskagf><table data-astro-cid-k5zskagf> <thead data-astro-cid-k5zskagf><tr data-astro-cid-k5zskagf><th data-astro-cid-k5zskagf>業務</th><th data-astro-cid-k5zskagf>件数</th><th data-astro-cid-k5zskagf>AI単独完了</th><th data-astro-cid-k5zskagf>削減時間</th><th data-astro-cid-k5zskagf>削減額</th><th data-astro-cid-k5zskagf>評価（はい/いまいち）</th></tr></thead> <tbody data-astro-cid-k5zskagf>${kpi.killer.map((k) => renderTemplate`<tr data-astro-cid-k5zskagf><td data-astro-cid-k5zskagf>${k.label}</td><td data-astro-cid-k5zskagf>${k.total}</td><td data-astro-cid-k5zskagf>${k.completed}</td><td data-astro-cid-k5zskagf>${Math.round(k.savedMinutes / 60 * 10) / 10}時間</td><td data-astro-cid-k5zskagf>${k.savedJpy.toLocaleString()}円</td><td data-astro-cid-k5zskagf>${k.good} / ${k.bad}</td></tr>`)}</tbody> </table></div>` : renderTemplate`<p class="muted" data-astro-cid-k5zskagf>まだ十分なデータがありません（この機能の導入後のタスクから集計されます）。</p>`} <h2 data-astro-cid-k5zskagf>種別別の内訳</h2> <div class="table-wrap" data-astro-cid-k5zskagf><table data-astro-cid-k5zskagf> <thead data-astro-cid-k5zskagf><tr data-astro-cid-k5zskagf><th data-astro-cid-k5zskagf>種別</th><th data-astro-cid-k5zskagf>件数</th><th data-astro-cid-k5zskagf>AI単独完了</th><th data-astro-cid-k5zskagf>手戻り</th><th data-astro-cid-k5zskagf>削減時間</th><th data-astro-cid-k5zskagf>削減額</th></tr></thead> <tbody data-astro-cid-k5zskagf> ${kpi.byKind.map((k) => renderTemplate`<tr data-astro-cid-k5zskagf><td data-astro-cid-k5zskagf>${k.label}</td><td data-astro-cid-k5zskagf>${k.total}</td><td data-astro-cid-k5zskagf>${k.completed}</td><td data-astro-cid-k5zskagf>${k.rework}</td><td data-astro-cid-k5zskagf>${Math.round(k.savedMinutes / 60 * 10) / 10}時間</td><td data-astro-cid-k5zskagf>${k.savedJpy.toLocaleString()}円</td></tr>`)} ${kpi.byKind.length === 0 && renderTemplate`<tr data-astro-cid-k5zskagf><td colspan="6" class="muted" data-astro-cid-k5zskagf>この月のタスクはありません。</td></tr>`} </tbody> </table></div> <h2 data-astro-cid-k5zskagf>成長レポート（次に強くする所）</h2> <h3 data-astro-cid-k5zskagf>改善ホットスポット（失敗・手戻りの多い所＝優先度順）</h3> ${kpi.hotspots.length ? renderTemplate`<div class="table-wrap" data-astro-cid-k5zskagf><table data-astro-cid-k5zskagf> <thead data-astro-cid-k5zskagf><tr data-astro-cid-k5zskagf><th data-astro-cid-k5zskagf>業務</th><th data-astro-cid-k5zskagf>理由</th><th data-astro-cid-k5zskagf>件数</th><th data-astro-cid-k5zskagf>優先度スコア</th></tr></thead> <tbody data-astro-cid-k5zskagf>${kpi.hotspots.map((h) => renderTemplate`<tr data-astro-cid-k5zskagf><td data-astro-cid-k5zskagf>${h.label}</td><td data-astro-cid-k5zskagf>${FAIL_LABEL[h.failReason] ?? h.failReason}</td><td data-astro-cid-k5zskagf>${h.count}</td><td data-astro-cid-k5zskagf>${h.score}</td></tr>`)}</tbody> </table></div>` : renderTemplate`<p class="muted" data-astro-cid-k5zskagf>この月の失敗・手戻りはありません。</p>`} <h3 data-astro-cid-k5zskagf>未対応要求ランキング（新しい機能・スキルの候補）</h3> ${kpi.unmet.length ? renderTemplate`<div class="table-wrap" data-astro-cid-k5zskagf><table data-astro-cid-k5zskagf> <thead data-astro-cid-k5zskagf><tr data-astro-cid-k5zskagf><th data-astro-cid-k5zskagf>要望（AIによる一行要約・匿名）</th><th data-astro-cid-k5zskagf>件数</th></tr></thead> <tbody data-astro-cid-k5zskagf>${kpi.unmet.map((u) => renderTemplate`<tr data-astro-cid-k5zskagf><td data-astro-cid-k5zskagf>${u.summary}</td><td data-astro-cid-k5zskagf>${u.count}</td></tr>`)}</tbody> </table></div>` : renderTemplate`<p class="muted" data-astro-cid-k5zskagf>この月の未対応要求はありません。</p>`} <h2 class="no-print" data-astro-cid-k5zskagf>削減時間の設定（管理者）</h2> <div class="no-print" data-astro-cid-k5zskagf> <p class="muted" data-astro-cid-k5zskagf>「手作業ならかかる時間」の目安と時給。導入先と合意した値に調整してください（削減額の計算に使います）。</p> <div class="labor-grid" data-astro-cid-k5zskagf> <label data-astro-cid-k5zskagf>時給（円）<input id="hourly" type="number" min="1"${addAttribute(kpi.labor.hourlyJpy, "value")} data-astro-cid-k5zskagf></label> ${Object.entries(kpi.labor.minutesByKind).map(([k, v]) => renderTemplate`<label data-astro-cid-k5zskagf>${TASK_KIND_LABEL[k] ?? k}（分）<input class="lab-min"${addAttribute(k, "data-kind")} type="number" min="0"${addAttribute(v, "value")} data-astro-cid-k5zskagf></label>`)} </div> <button class="btn btn-primary" id="saveLabor" type="button" data-astro-cid-k5zskagf>設定を保存</button> <p class="muted" style="margin-top:.6rem" data-astro-cid-k5zskagf>週次サマリは通知Webhook（設定 → 通知）へ自動送付されます（Webhook設定時のみ・7日ごと）。</p> </div> </section> </main> ` })} ${renderScript($$result, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/reports.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/reports.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/reports.astro";
const $$url = "/reports";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Reports,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
