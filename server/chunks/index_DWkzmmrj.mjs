globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import { $ as $$MoneyTabs } from "./MoneyTabs_PgnGZb0p.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { getSession, canAccess } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (!canAccess(ses.role, "accounting")) return Astro2.redirect("/forbidden", 302);
  const acc = await import("./accounting_D4tRmfws.mjs").then((n) => n.k);
  await acc.ensureSeed(env);
  const period = await acc.currentPeriod(env);
  const wallets = await acc.listWallets(env);
  const categories = await acc.listCategoriesWithUsage(env);
  const selWallet = Astro2.url.searchParams.get("wallet") ?? wallets[0]?.id ?? "";
  const is = period ? await acc.incomeStatement(env, period.id) : null;
  const book = period && selWallet ? await acc.cashbook(env, period.id, selWallet) : null;
  const ba = period ? await acc.budgetActual(env, period.id) : [];
  const balances = period ? await acc.walletBalances(env, period.id) : [];
  const yen = (n) => "¥" + n.toLocaleString("ja-JP");
  const jstNow = new Date(Date.now() + 9 * 3600 * 1e3);
  const todayIso = jstNow.toISOString().slice(0, 10);
  const jpToday = `${jstNow.getUTCFullYear()}年${jstNow.getUTCMonth() + 1}月${jstNow.getUTCDate()}日（${["日", "月", "火", "水", "木", "金", "土"][jstNow.getUTCDay()]}）`;
  const KIND_JA = { income: "入金", expense: "出金", transfer: "振替" };
  const isOrgAdmin = ses?.role === "admin" && ses?.ctx === "org";
  const { cachedEntitlement } = await import("./client_F4fksau0.mjs");
  const hasPro = atLeast(await cachedEntitlement(env).catch(() => "free"), "pro");
  const { getBookkeepingMode } = await import("./settings_dTyIbTCR.mjs");
  const mode = await getBookkeepingMode(env);
  const acctItems = await import("./accounting_D4tRmfws.mjs").then((n) => n.j);
  const WALLET_TYPES = acctItems.WALLET_TYPES;
  const walletTypeLabel = (t) => WALLET_TYPES.find((w) => w.type === t)?.label ?? t;
  const jr = await import("./journal_CPKMU7C_.mjs");
  const accountItems = await acctItems.listAccountItems(env, { enabledOnly: true });
  const trial = mode === "double" && period ? await jr.trialBalance(env, period.id) : [];
  const entries = mode === "double" && period ? await jr.buildEntriesForPeriod(env, period.id) : [];
  const trialDebit = trial.reduce((s, r) => s + r.debit, 0);
  const trialCredit = trial.reduce((s, r) => s + r.credit, 0);
  const SRC_JA = { tx: "出納帳", manual: "手動", depreciation: "減価償却", closure: "レジ締め" };
  const fa = await import("./fixed-assets_B-_ABDN3.mjs");
  const assets = isOrgAdmin ? await fa.listFixedAssets(env) : [];
  const assetRows = await Promise.all(assets.map(async (a) => ({ a, sched: fa.depreciationSchedule(a), posted: await fa.depreciationCount(env, a.id) })));
  const reg = await import("./register_BlCGyPLB.mjs");
  const walletName = new Map(wallets.map((w) => [w.id, w.name]));
  const CLOSURE_JA = { daily: "日次", monthly: "月次", year_end: "年度末" };
  const closuresRaw = isOrgAdmin && period ? await reg.listClosures(env, period.id) : [];
  const closureRows = closuresRaw.map((c) => {
    const diff = Number(c.difference);
    return {
      id: String(c.id),
      kindJa: CLOSURE_JA[String(c.kind)] ?? String(c.kind),
      label: String(c.period_label),
      wallet: walletName.get(String(c.wallet_id)) ?? "",
      expected: Number(c.expected_amount),
      counted: Number(c.counted_amount),
      diff,
      diffLabel: diff === 0 ? "一致" : diff > 0 ? `不足 ${yen(diff)}` : `過剰 ${yen(-diff)}`,
      reason: c.ai_reason ? String(c.ai_reason) : diff === 0 ? "—" : "（AIキー未設定）",
      canAdjust: diff !== 0 && !c.adjustment_entry_id,
      adjusted: !!c.adjustment_entry_id
    };
  });
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "お金の記録", "active": "/accounting", "data-astro-cid-cmolzfmm": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "MoneyTabs", $$MoneyTabs, { "active": "accounting", "showInvoices": isOrgAdmin && hasPro, "showBilling": isOrgAdmin, "data-astro-cid-cmolzfmm": true })} ${maybeRenderHead()}<h1 data-astro-cid-cmolzfmm>お金の記録 <span class="muted" style="font-size:1rem;font-weight:600" data-astro-cid-cmolzfmm>${period?.name ?? "会計期なし"}</span></h1> ${isOrgAdmin && renderTemplate`<div class="book-mode" role="group" aria-label="記帳方式" data-astro-cid-cmolzfmm> <span class="muted" style="font-size:.85rem" data-astro-cid-cmolzfmm>記帳方式：</span> <button${addAttribute("bm-opt" + (mode === "single" ? " on" : ""), "class")} data-mode="single" type="button" data-astro-cid-cmolzfmm>単式（かんたん）</button> <button${addAttribute("bm-opt" + (mode === "double" ? " on" : ""), "class")} data-mode="double" type="button" data-astro-cid-cmolzfmm>複式（仕訳）</button> <span class="muted" style="font-size:.8rem" data-astro-cid-cmolzfmm>複式にすると仕訳・試算表が使えます</span> </div>`}<section class="bal-row" aria-label="口座の残高" data-astro-cid-cmolzfmm> ${balances.map((w) => renderTemplate`<div class="bal-card" data-astro-cid-cmolzfmm> <div class="bal-name" data-astro-cid-cmolzfmm>${w.name}</div> <div class="bal-amt" data-astro-cid-cmolzfmm>${yen(w.balance)}</div> </div>`)} ${balances.length === 0 && renderTemplate`<div class="muted" data-astro-cid-cmolzfmm>口座がまだありません。</div>`} </section> ${isOrgAdmin && renderTemplate`<details class="adv" style="margin:.2rem 0 1rem" data-astro-cid-cmolzfmm> <summary data-astro-cid-cmolzfmm>お金の種類・口座を追加／管理（管理者向け）</summary> <p class="adv-note" style="font-size:.9rem" data-astro-cid-cmolzfmm>現金・口座のほか、クレジットカード・電子マネー・QRコード決済・プライベート資金など、扱うお金の種類を追加できます（freeeの区分に対応）。</p> <div class="card" data-astro-cid-cmolzfmm> <div class="row" data-astro-cid-cmolzfmm> <div style="flex:2" data-astro-cid-cmolzfmm><label for="wl-name" data-astro-cid-cmolzfmm>名称</label><input id="wl-name" placeholder="例：◯◯カード、PayPay、現金" data-astro-cid-cmolzfmm></div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="wl-type" data-astro-cid-cmolzfmm>お金の種類</label><select id="wl-type" data-astro-cid-cmolzfmm>${WALLET_TYPES.map((w) => renderTemplate`<option${addAttribute(w.type, "value")} data-astro-cid-cmolzfmm>${w.label}</option>`)}</select></div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="wl-open" data-astro-cid-cmolzfmm>期首残高（円）</label><input id="wl-open" type="number" inputmode="numeric" value="0" data-astro-cid-cmolzfmm></div> <div style="flex:0 0 auto;align-self:end" data-astro-cid-cmolzfmm><button class="btn btn-primary" id="wl-add" data-astro-cid-cmolzfmm>追加</button></div> </div> </div> <div class="table-wrap" style="margin-top:.5rem" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm> <thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>名称</th><th data-astro-cid-cmolzfmm>種類</th><th class="r" data-astro-cid-cmolzfmm>期首残高</th><th data-astro-cid-cmolzfmm></th></tr></thead> <tbody data-astro-cid-cmolzfmm> ${balances.map((w) => renderTemplate`<tr data-astro-cid-cmolzfmm><td data-astro-cid-cmolzfmm>${w.name}</td><td data-astro-cid-cmolzfmm>${walletTypeLabel(w.type)}</td><td class="r" data-astro-cid-cmolzfmm>${yen(w.opening_balance)}</td><td data-astro-cid-cmolzfmm><button class="btn btn-sm btn-danger wl-del"${addAttribute(w.id, "data-id")} data-astro-cid-cmolzfmm>削除</button></td></tr>`)} </tbody> </table></div> </details>`}<h2 data-astro-cid-cmolzfmm>お金を記録する</h2> <div class="card" data-astro-cid-cmolzfmm> <div class="rec-modes" role="group" aria-label="記録の種類" data-astro-cid-cmolzfmm> <button type="button" class="rec-mode income" data-kind="income" data-astro-cid-cmolzfmm><span class="rm-sign" data-astro-cid-cmolzfmm>＋</span>入金を記録<small data-astro-cid-cmolzfmm>お金を受け取った</small></button> <button type="button" class="rec-mode expense" data-kind="expense" data-astro-cid-cmolzfmm><span class="rm-sign" data-astro-cid-cmolzfmm>−</span>出金を記録<small data-astro-cid-cmolzfmm>お金を支払った</small></button> </div> <div id="recForm" hidden style="margin-top:1rem" data-astro-cid-cmolzfmm> <p id="recLabel" class="rec-label" data-astro-cid-cmolzfmm></p> <div class="row" data-astro-cid-cmolzfmm> <div style="flex:1" data-astro-cid-cmolzfmm> <label for="date" data-astro-cid-cmolzfmm>日付</label> <input id="date" type="date"${addAttribute(todayIso, "value")} data-astro-cid-cmolzfmm> <div class="muted" style="font-size:.85rem;margin-top:4px" data-astro-cid-cmolzfmm>今日：${jpToday}</div> </div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="wallet" data-astro-cid-cmolzfmm>口座</label><select id="wallet" data-astro-cid-cmolzfmm>${wallets.map((w) => renderTemplate`<option${addAttribute(w.id, "value")} data-astro-cid-cmolzfmm>${w.name}</option>`)}</select></div> </div> <div class="row" style="margin-top:.5rem" data-astro-cid-cmolzfmm> <div id="catBox" style="flex:1" data-astro-cid-cmolzfmm><label for="cat" data-astro-cid-cmolzfmm>分類（科目）<span class="muted" style="font-weight:400;font-size:.76rem" data-astro-cid-cmolzfmm> かんたんな日本語でOK（例：会費、消耗品）</span></label> <input id="cat" list="cat-list-income" placeholder="自由に入力（過去の科目から選べます）例：会費収入" autocomplete="off" data-astro-cid-cmolzfmm> <datalist id="cat-list-income" data-astro-cid-cmolzfmm>${categories.filter((c) => c.kind === "income").map((c) => renderTemplate`<option${addAttribute(c.name, "value")} data-astro-cid-cmolzfmm></option>`)}</datalist> <datalist id="cat-list-expense" data-astro-cid-cmolzfmm>${categories.filter((c) => c.kind === "expense").map((c) => renderTemplate`<option${addAttribute(c.name, "value")} data-astro-cid-cmolzfmm></option>`)}</datalist> </div> <div id="counterBox" style="flex:1;display:none" data-astro-cid-cmolzfmm><label for="counter" data-astro-cid-cmolzfmm>振替先の口座</label><select id="counter" data-astro-cid-cmolzfmm>${wallets.map((w) => renderTemplate`<option${addAttribute(w.id, "value")} data-astro-cid-cmolzfmm>${w.name}</option>`)}</select></div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="amount" data-astro-cid-cmolzfmm>金額（円）</label><input id="amount" type="number" min="1" inputmode="numeric" placeholder="0" data-astro-cid-cmolzfmm></div> </div> <div class="field" data-astro-cid-cmolzfmm><label for="desc" data-astro-cid-cmolzfmm>内容（メモ）</label><input id="desc" placeholder="例：6月分の会費" data-astro-cid-cmolzfmm></div> <div id="acctBox" class="row" style="align-items:flex-end" data-astro-cid-cmolzfmm> <div style="flex:2" data-astro-cid-cmolzfmm><label for="acct" data-astro-cid-cmolzfmm>勘定科目<span class="muted" style="font-weight:400;font-size:.76rem" data-astro-cid-cmolzfmm> 会計ソフト（freee/弥生）用・未選択でOK</span></label><select id="acct" data-astro-cid-cmolzfmm><option value="" data-astro-cid-cmolzfmm>指定しない（分類から自動）</option>${accountItems.map((a) => renderTemplate`<option${addAttribute(a.id, "value")}${addAttribute(a.code, "data-code")} data-astro-cid-cmolzfmm>${a.name}（${a.code}）</option>`)}</select></div> <div style="flex:0 0 auto" data-astro-cid-cmolzfmm><button class="btn" type="button" id="acctAi" title="「内容（メモ）」の文章をもとに、AIが当てはまりそうな勘定科目を提案します" data-astro-cid-cmolzfmm>メモ内容からAIが提案</button></div> </div> <div class="muted" style="font-size:.8rem;margin-top:2px" data-astro-cid-cmolzfmm>↑「内容（メモ）」に書いた文章にもとづいてAIが勘定科目を判断・提案します（最終的にはご自身で選べます）。任意項目なので、迷う場合は空欄のままで問題ありません。</div> <input type="hidden" id="kind" value="income" data-astro-cid-cmolzfmm> <div class="row" data-astro-cid-cmolzfmm> <button class="btn btn-primary btn-lg" id="reg" style="flex:1" data-astro-cid-cmolzfmm>この内容で記録する</button> <button class="btn btn-ghost" id="recCancel" type="button" style="flex:0 0 auto" data-astro-cid-cmolzfmm>やめる</button> </div> </div> <details class="rec-transfer" style="margin-top:.7rem" data-astro-cid-cmolzfmm> <summary data-astro-cid-cmolzfmm>＋ 口座間でお金を移したとき（振替）：タップして入力</summary> <p class="muted" style="font-size:.9rem;margin:.4rem 0 .6rem" data-astro-cid-cmolzfmm>現金を口座に預けた、口座から引き出した、などの「移動」を記録します。</p> <button type="button" class="btn" data-kind="transfer" data-astro-cid-cmolzfmm>口座間の移動を記録する</button> </details> </div> ${isOrgAdmin && renderTemplate`<details class="adv" style="margin:.6rem 0" data-astro-cid-cmolzfmm> <summary data-astro-cid-cmolzfmm>明細を取り込む（銀行・カード・レジのCSV）</summary> <div class="card" data-astro-cid-cmolzfmm> <p class="muted" style="font-size:.88rem" data-astro-cid-cmolzfmm>銀行・クレジットカード・レジ（スマレジ等）が書き出した明細CSVを取り込み、手入力なしで記録します。1行目に見出し（日付／内容／金額、または 入金・出金）がある形式に対応します。まず「内容を確認」で中身を見てから取り込めます。取り込んだ明細は科目「口座取込（要確認）」に入るので、あとで分類を見直せます。</p> <div class="row" data-astro-cid-cmolzfmm> <div style="flex:1" data-astro-cid-cmolzfmm><label for="imp-wallet" data-astro-cid-cmolzfmm>取り込み先の口座</label><select id="imp-wallet" data-astro-cid-cmolzfmm>${wallets.map((w) => renderTemplate`<option${addAttribute(w.id, "value")} data-astro-cid-cmolzfmm>${w.name}</option>`)}</select></div> <div style="flex:0 0 auto;align-self:flex-end" data-astro-cid-cmolzfmm><input id="imp-file" type="file" accept=".csv,text/csv" aria-label="明細CSVファイル" data-astro-cid-cmolzfmm></div> </div> <div class="field" style="margin-top:.5rem" data-astro-cid-cmolzfmm><label for="imp-csv" data-astro-cid-cmolzfmm>またはCSVを貼り付け</label><textarea id="imp-csv" rows="5" placeholder="日付,内容,入金,出金
2026-06-01,会費 6月,3000,
2026-06-02,文具,,500" style="width:100%;font-family:monospace;font-size:.82rem" data-astro-cid-cmolzfmm></textarea></div> <div class="row" data-astro-cid-cmolzfmm><button class="btn" id="imp-preview" type="button" data-astro-cid-cmolzfmm>内容を確認</button><button class="btn btn-primary" id="imp-run" type="button" disabled data-astro-cid-cmolzfmm>この内容で取り込む</button></div> <div id="imp-out" hidden style="margin-top:.6rem" data-astro-cid-cmolzfmm></div> </div> </details>`}<h2 data-astro-cid-cmolzfmm>収支のまとめ <a class="btn btn-sm btn-ghost" href="/accounting/export.csv" data-astro-cid-cmolzfmm>Excel用に保存</a> <a class="btn btn-sm btn-ghost" href="/accounting/yayoi.csv" data-astro-cid-cmolzfmm>弥生会計へ書き出し</a></h2> ${is && renderTemplate`<div class="grid" data-astro-cid-cmolzfmm> <div class="table-wrap" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm><thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>収入の科目</th><th class="r" data-astro-cid-cmolzfmm>金額</th></tr></thead><tbody data-astro-cid-cmolzfmm> ${is.income.map((r) => renderTemplate`<tr data-astro-cid-cmolzfmm><td data-astro-cid-cmolzfmm>${r.name}</td><td class="r" data-astro-cid-cmolzfmm>${yen(r.amount)}</td></tr>`)} <tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>収入合計</th><th class="r" data-astro-cid-cmolzfmm>${yen(is.totalIncome)}</th></tr></tbody></table></div> <div class="table-wrap" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm><thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>支出の科目</th><th class="r" data-astro-cid-cmolzfmm>金額</th></tr></thead><tbody data-astro-cid-cmolzfmm> ${is.expense.map((r) => renderTemplate`<tr data-astro-cid-cmolzfmm><td data-astro-cid-cmolzfmm>${r.name}</td><td class="r" data-astro-cid-cmolzfmm>${yen(r.amount)}</td></tr>`)} <tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>支出合計</th><th class="r" data-astro-cid-cmolzfmm>${yen(is.totalExpense)}</th></tr></tbody></table></div> </div>`}${is && renderTemplate`<p data-astro-cid-cmolzfmm><strong data-astro-cid-cmolzfmm>今期の収支：${yen(is.totalIncome - is.totalExpense)}</strong></p>`}${mode === "double" && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h2 data-astro-cid-cmolzfmm>試算表</h2> <div class="table-wrap" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm> <thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>科目</th><th class="r" data-astro-cid-cmolzfmm>借方</th><th class="r" data-astro-cid-cmolzfmm>貸方</th><th class="r" data-astro-cid-cmolzfmm>残高</th></tr></thead> <tbody data-astro-cid-cmolzfmm> ${trial.map((r) => renderTemplate`<tr data-astro-cid-cmolzfmm><td data-astro-cid-cmolzfmm>${r.name}</td><td class="r" data-astro-cid-cmolzfmm>${r.debit ? yen(r.debit) : ""}</td><td class="r" data-astro-cid-cmolzfmm>${r.credit ? yen(r.credit) : ""}</td><td class="r" data-astro-cid-cmolzfmm>${yen(r.balance)}</td></tr>`)} ${trial.length === 0 && renderTemplate`<tr data-astro-cid-cmolzfmm><td colspan="4" class="muted" style="text-align:center;padding:1rem" data-astro-cid-cmolzfmm>まだ仕訳がありません。</td></tr>`} <tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>合計</th><th class="r" data-astro-cid-cmolzfmm>${yen(trialDebit)}</th><th class="r" data-astro-cid-cmolzfmm>${yen(trialCredit)}</th><th class="r" data-astro-cid-cmolzfmm>${trialDebit === trialCredit ? "一致" : "不一致"}</th></tr> </tbody> </table></div> <h2 data-astro-cid-cmolzfmm>仕訳帳</h2> <p class="muted" style="font-size:.9rem" data-astro-cid-cmolzfmm>仕訳は上の「<strong data-astro-cid-cmolzfmm>お金を記録する</strong>」（入金／出金／振替＋勘定科目）から自動で作成されます。複式の借方・貸方も自動です。</p> <div class="table-wrap" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm> <thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>日付</th><th data-astro-cid-cmolzfmm>借方</th><th data-astro-cid-cmolzfmm>貸方</th><th class="r" data-astro-cid-cmolzfmm>金額</th><th data-astro-cid-cmolzfmm>摘要</th><th data-astro-cid-cmolzfmm>種類</th><th data-astro-cid-cmolzfmm></th></tr></thead> <tbody data-astro-cid-cmolzfmm> ${entries.map((e) => {
    const deb = e.lines.filter((l) => l.side === "debit");
    const cre = e.lines.filter((l) => l.side === "credit");
    const total = deb.reduce((s, l) => s + l.amount, 0);
    return renderTemplate`<tr data-astro-cid-cmolzfmm> <td data-astro-cid-cmolzfmm>${e.date}</td> <td data-astro-cid-cmolzfmm>${deb.map((l) => l.name).join(" / ")}</td> <td data-astro-cid-cmolzfmm>${cre.map((l) => l.name).join(" / ")}</td> <td class="r" data-astro-cid-cmolzfmm>${yen(total)}</td> <td data-astro-cid-cmolzfmm>${e.description ?? ""}</td> <td data-astro-cid-cmolzfmm><span class="muted" style="font-size:.82rem" data-astro-cid-cmolzfmm>${SRC_JA[e.source] ?? e.source}</span></td> <td data-astro-cid-cmolzfmm>${isOrgAdmin && e.source !== "tx" && renderTemplate`<button class="btn btn-sm btn-danger je-del"${addAttribute(e.id, "data-del")} data-astro-cid-cmolzfmm>削除</button>`}</td> </tr>`;
  })} ${entries.length === 0 && renderTemplate`<tr data-astro-cid-cmolzfmm><td colspan="7" class="muted" style="text-align:center;padding:1rem" data-astro-cid-cmolzfmm>まだ仕訳がありません。</td></tr>`} </tbody> </table></div> ` })}`}<h2 data-astro-cid-cmolzfmm>出納帳（お金の出入り）</h2> <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.5rem" data-astro-cid-cmolzfmm>${wallets.map((w) => renderTemplate`<a${addAttribute(`btn btn-sm ${w.id === selWallet ? "btn-primary" : "btn-ghost"}`, "class")}${addAttribute(`/accounting?wallet=${w.id}`, "href")} data-astro-cid-cmolzfmm>${w.name}</a>`)}</div> ${book && renderTemplate`<div class="table-wrap" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm> <thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>日付</th><th data-astro-cid-cmolzfmm>種類</th><th data-astro-cid-cmolzfmm>内容</th><th class="r" data-astro-cid-cmolzfmm>入金</th><th class="r" data-astro-cid-cmolzfmm>出金</th><th class="r" data-astro-cid-cmolzfmm>残高</th><th data-astro-cid-cmolzfmm></th></tr></thead> <tbody data-astro-cid-cmolzfmm> ${book.rows.map((t) => {
    const isIn = t.kind === "income" && t.wallet_id === selWallet || t.kind === "transfer" && t.counter_wallet_id === selWallet;
    return renderTemplate`<tr data-astro-cid-cmolzfmm><td data-astro-cid-cmolzfmm>${t.date}</td><td data-astro-cid-cmolzfmm>${KIND_JA[t.kind] ?? t.kind}</td><td data-astro-cid-cmolzfmm>${t.description ?? ""}</td><td class="r" data-astro-cid-cmolzfmm>${isIn ? yen(t.amount) : ""}</td><td class="r" data-astro-cid-cmolzfmm>${!isIn ? yen(t.amount) : ""}</td><td class="r" data-astro-cid-cmolzfmm>${yen(t.running)}</td><td data-astro-cid-cmolzfmm><button class="btn btn-sm btn-danger del"${addAttribute(t.id, "data-del")} data-astro-cid-cmolzfmm>削除</button></td></tr>`;
  })} ${book.rows.length === 0 && renderTemplate`<tr data-astro-cid-cmolzfmm><td colspan="7" class="muted" style="text-align:center;padding:1.2rem" data-astro-cid-cmolzfmm>まだ記録がありません。上の「＋ 入金を記録」から最初の1件を登録してみましょう。</td></tr>`} </tbody></table></div>`}${isOrgAdmin && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h2 data-astro-cid-cmolzfmm>レジ締め（現金の確認）</h2> <div class="card" data-astro-cid-cmolzfmm> <p class="muted" style="font-size:.9rem" data-astro-cid-cmolzfmm>手元の現金を数えて入力すると、帳簿上の想定額と照合します。ズレがあれば原因の見当をAIが補助します。</p> <div class="row" data-astro-cid-cmolzfmm> <div style="flex:1" data-astro-cid-cmolzfmm><label for="cl-wallet" data-astro-cid-cmolzfmm>口座</label><select id="cl-wallet" data-astro-cid-cmolzfmm>${wallets.map((w) => renderTemplate`<option${addAttribute(w.id, "value")} data-astro-cid-cmolzfmm>${w.name}</option>`)}</select></div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="cl-kind" data-astro-cid-cmolzfmm>締めの種類</label><select id="cl-kind" data-astro-cid-cmolzfmm><option value="daily" data-astro-cid-cmolzfmm>日次（今日まで）</option><option value="monthly" data-astro-cid-cmolzfmm>月次（今月末まで）</option><option value="year_end" data-astro-cid-cmolzfmm>年度末（会計期末まで）</option></select></div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="cl-counted" data-astro-cid-cmolzfmm>実際に数えた金額（円）</label><input id="cl-counted" type="number" min="0" inputmode="numeric" placeholder="0" data-astro-cid-cmolzfmm></div> </div> <div class="row" style="margin-top:.6rem" data-astro-cid-cmolzfmm><button class="btn btn-primary" id="cl-add" data-astro-cid-cmolzfmm>この内容で締める</button></div> </div> <div class="table-wrap" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm> <thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>締め</th><th data-astro-cid-cmolzfmm>対象</th><th data-astro-cid-cmolzfmm>口座</th><th class="r" data-astro-cid-cmolzfmm>想定</th><th class="r" data-astro-cid-cmolzfmm>実査</th><th class="r" data-astro-cid-cmolzfmm>差異</th><th data-astro-cid-cmolzfmm>原因の見当（AI）</th><th data-astro-cid-cmolzfmm></th></tr></thead> <tbody data-astro-cid-cmolzfmm> ${closureRows.map((c) => renderTemplate`<tr data-astro-cid-cmolzfmm> <td data-astro-cid-cmolzfmm>${c.kindJa}</td> <td data-astro-cid-cmolzfmm>${c.label}</td> <td data-astro-cid-cmolzfmm>${c.wallet}</td> <td class="r" data-astro-cid-cmolzfmm>${yen(c.expected)}</td> <td class="r" data-astro-cid-cmolzfmm>${yen(c.counted)}</td> <td${addAttribute(c.diff === 0 ? "r" : "r u-warn", "class")} data-astro-cid-cmolzfmm>${c.diffLabel}</td> <td style="font-size:.85rem" data-astro-cid-cmolzfmm>${c.reason}</td> <td data-astro-cid-cmolzfmm>${c.canAdjust && renderTemplate`<button class="btn btn-sm cl-adj"${addAttribute(c.id, "data-id")} data-astro-cid-cmolzfmm>現金過不足で調整</button>`}${c.adjusted && renderTemplate`<span class="muted" style="font-size:.82rem" data-astro-cid-cmolzfmm>調整済</span>`}</td> </tr>`)} ${closureRows.length === 0 && renderTemplate`<tr data-astro-cid-cmolzfmm><td colspan="8" class="muted" style="text-align:center;padding:1rem" data-astro-cid-cmolzfmm>まだレジ締めの記録はありません。</td></tr>`} </tbody> </table></div> <h2 data-astro-cid-cmolzfmm>固定資産・減価償却</h2> <div class="card" data-astro-cid-cmolzfmm> <p class="muted" style="font-size:.9rem" data-astro-cid-cmolzfmm>パソコン・備品など長く使う資産を登録すると、毎期の減価償却費を仕訳として計上できます。</p> <div class="row" data-astro-cid-cmolzfmm> <div style="flex:2" data-astro-cid-cmolzfmm><label for="fa-name" data-astro-cid-cmolzfmm>資産名</label><input id="fa-name" placeholder="例：ノートパソコン" data-astro-cid-cmolzfmm></div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="fa-date" data-astro-cid-cmolzfmm>取得日</label><input id="fa-date" type="date"${addAttribute(todayIso, "value")} data-astro-cid-cmolzfmm></div> </div> <div class="row" style="margin-top:.5rem" data-astro-cid-cmolzfmm> <div style="flex:1" data-astro-cid-cmolzfmm><label for="fa-cost" data-astro-cid-cmolzfmm>取得価額（円）</label><input id="fa-cost" type="number" min="1" inputmode="numeric" placeholder="0" data-astro-cid-cmolzfmm></div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="fa-life" data-astro-cid-cmolzfmm>耐用年数</label><input id="fa-life" type="number" min="1" inputmode="numeric" placeholder="例：4" data-astro-cid-cmolzfmm></div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="fa-method" data-astro-cid-cmolzfmm>償却方法</label><select id="fa-method" data-astro-cid-cmolzfmm><option value="straight_line" data-astro-cid-cmolzfmm>定額法</option><option value="declining_balance" data-astro-cid-cmolzfmm>定率法</option></select></div> <div style="flex:1" data-astro-cid-cmolzfmm><label for="fa-residual" data-astro-cid-cmolzfmm>残存価額（円）</label><input id="fa-residual" type="number" min="0" inputmode="numeric" value="0" data-astro-cid-cmolzfmm></div> </div> <div class="row" style="margin-top:.6rem" data-astro-cid-cmolzfmm><button class="btn btn-primary" id="fa-add" data-astro-cid-cmolzfmm>資産を登録</button></div> </div> <div class="table-wrap" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm> <thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>資産名</th><th data-astro-cid-cmolzfmm>取得日</th><th class="r" data-astro-cid-cmolzfmm>取得価額</th><th data-astro-cid-cmolzfmm>方法</th><th class="r" data-astro-cid-cmolzfmm>耐用</th><th class="r" data-astro-cid-cmolzfmm>初年度償却</th><th data-astro-cid-cmolzfmm>計上</th><th data-astro-cid-cmolzfmm></th></tr></thead> <tbody data-astro-cid-cmolzfmm> ${assetRows.map(({ a, sched, posted }) => renderTemplate`<tr data-astro-cid-cmolzfmm> <td data-astro-cid-cmolzfmm>${a.name}</td><td data-astro-cid-cmolzfmm>${a.acquired_date}</td><td class="r" data-astro-cid-cmolzfmm>${yen(a.acquisition_cost)}</td> <td data-astro-cid-cmolzfmm>${a.method === "declining_balance" ? "定率法" : "定額法"}</td><td class="r" data-astro-cid-cmolzfmm>${a.useful_life_years}年</td> <td class="r" data-astro-cid-cmolzfmm>${sched[0] ? yen(sched[0].amount) : "—"}</td> <td data-astro-cid-cmolzfmm>${posted}/${a.useful_life_years}期</td> <td data-astro-cid-cmolzfmm> <button class="btn btn-sm fa-dep"${addAttribute(a.id, "data-id")}${addAttribute(posted >= a.useful_life_years, "disabled")} data-astro-cid-cmolzfmm>当期分を計上</button> <button class="btn btn-sm btn-danger fa-del"${addAttribute(a.id, "data-id")} data-astro-cid-cmolzfmm>削除</button> </td> </tr>`)} ${assetRows.length === 0 && renderTemplate`<tr data-astro-cid-cmolzfmm><td colspan="8" class="muted" style="text-align:center;padding:1rem" data-astro-cid-cmolzfmm>登録された固定資産はありません。</td></tr>`} </tbody> </table></div> ` })}`}<h2 data-astro-cid-cmolzfmm>予算と実績</h2> <p class="muted" style="font-size:.85rem;margin:.2rem 0 .6rem" data-astro-cid-cmolzfmm>差額は「プラス＝良い状態」で表示します（収入は予算より多い／支出は予算より少ない）。</p> <div class="table-wrap" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm><thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>科目</th><th class="r" data-astro-cid-cmolzfmm>予算</th><th class="r" data-astro-cid-cmolzfmm>実績</th><th class="r" title="プラスは良い状態（収入は予算超過、支出は予算内）" data-astro-cid-cmolzfmm>差額</th></tr></thead><tbody data-astro-cid-cmolzfmm> ${ba.map((r) => {
    const diff = r.kind === "income" ? r.actual - r.budget : r.budget - r.actual;
    return renderTemplate`<tr data-astro-cid-cmolzfmm><td data-astro-cid-cmolzfmm>${r.name}</td><td class="r" data-astro-cid-cmolzfmm>${yen(r.budget)}</td><td class="r" data-astro-cid-cmolzfmm>${yen(r.actual)}</td><td class="r"${addAttribute(diff < 0 ? "color:var(--danger)" : diff > 0 ? "color:var(--ok)" : "", "style")} data-astro-cid-cmolzfmm>${diff > 0 ? "+" : ""}${yen(diff)}</td></tr>`;
  })} ${ba.length === 0 && renderTemplate`<tr data-astro-cid-cmolzfmm><td colspan="4" class="muted" style="text-align:center;padding:1rem" data-astro-cid-cmolzfmm>予算の設定はまだありません。</td></tr>`} </tbody></table></div> <h2 data-astro-cid-cmolzfmm>科目の整理</h2> <p class="muted" style="font-size:.88rem" data-astro-cid-cmolzfmm>誤って作った科目やテスト用の科目を削除できます。<strong data-astro-cid-cmolzfmm>取引で使用中の科目は削除できません</strong>（先にその取引の科目を変更してください）。</p> <div class="table-wrap" data-astro-cid-cmolzfmm><table data-astro-cid-cmolzfmm><thead data-astro-cid-cmolzfmm><tr data-astro-cid-cmolzfmm><th data-astro-cid-cmolzfmm>種別</th><th data-astro-cid-cmolzfmm>科目</th><th class="r" data-astro-cid-cmolzfmm>使用件数</th><th data-astro-cid-cmolzfmm></th></tr></thead><tbody data-astro-cid-cmolzfmm> ${categories.map((c) => renderTemplate`<tr${addAttribute(c.id, "data-cat")} data-astro-cid-cmolzfmm><td data-astro-cid-cmolzfmm>${c.kind === "income" ? "収入" : "支出"}</td><td data-astro-cid-cmolzfmm>${c.name}</td><td class="r" data-astro-cid-cmolzfmm>${c.used}</td><td data-astro-cid-cmolzfmm>${c.used === 0 ? renderTemplate`<button class="btn btn-sm btn-danger cat-del" data-astro-cid-cmolzfmm>削除</button>` : renderTemplate`<span class="muted" style="font-size:.8rem" data-astro-cid-cmolzfmm>使用中</span>`}</td></tr>`)} ${categories.length === 0 && renderTemplate`<tr data-astro-cid-cmolzfmm><td colspan="4" class="muted" style="text-align:center;padding:1rem" data-astro-cid-cmolzfmm>科目はまだありません。</td></tr>`} </tbody></table></div>   `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template([`<script data-astro-rerun>
    // 科目の削除（未使用のみ）。
    document.querySelectorAll("tr[data-cat] .cat-del").forEach((b)=>b.addEventListener("click",async(e)=>{const tr=e.target.closest("tr[data-cat]");const nm=(tr.children[1]?.textContent||"この科目").trim();if(!(await window.bo.confirm("科目「"+nm+"」を削除しますか？",{confirmLabel:"削除",danger:true})))return;const r=await window.bo.api("/api/tx",{_action:"delete_category",id:tr.dataset.cat},{btn:e.target,successMsg:"削除しました"});if(r.ok)setTimeout(()=>location.reload(),400);}));
    const recForm=document.getElementById("recForm"),kindEl=document.getElementById("kind"),catBox=document.getElementById("catBox"),counterBox=document.getElementById("counterBox"),recLabel=document.getElementById("recLabel"),acctBox=document.getElementById("acctBox");
    const LABELS={income:"＋ 入金を記録します",expense:"− 出金を記録します",transfer:"口座間の移動（振替）を記録します"};
    function openMode(k){
      kindEl.value=k;recLabel.textContent=LABELS[k]||"";recForm.hidden=false;
      catBox.style.display=k==="transfer"?"none":"";counterBox.style.display=k==="transfer"?"":"none";
      if(acctBox)acctBox.style.display=k==="transfer"?"none":"flex";
      // 科目は自由記述。種別に応じて候補（過去の科目）の datalist を切り替え、別種別の値が残らないよう必要に応じクリア。
      const catEl=document.getElementById("cat");
      if(catEl&&k!=="transfer"){catEl.setAttribute("list",k==="expense"?"cat-list-expense":"cat-list-income");}
      document.querySelectorAll(".rec-mode").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===k)));
      recForm.scrollIntoView({behavior:"smooth",block:"nearest"});
      const amt=document.getElementById("amount");if(amt)setTimeout(()=>amt.focus(),200);
    }
    document.querySelectorAll("[data-kind]").forEach(b=>b.addEventListener("click",()=>openMode(b.dataset.kind)));
    document.getElementById("recCancel").addEventListener("click",()=>{recForm.hidden=true;document.querySelectorAll(".rec-mode").forEach(b=>b.setAttribute("aria-pressed","false"));});
    // AIで勘定科目をおすすめ（経費の科目推定・Plus以上）。
    document.getElementById("acctAi")?.addEventListener("click",async(e)=>{
      const body={vendor:document.getElementById("desc").value,description:document.getElementById("desc").value,amount:Number(document.getElementById("amount").value)||undefined};
      const r=await window.bo.api("/api/accounting/suggest-account",body,{btn:e.currentTarget,successMsg:null});
      if(r.ok&&r.suggestion){document.getElementById("acct").value=r.suggestion.id;window.bo.toast("おすすめ："+r.suggestion.name+(r.suggestion.reason?"（"+r.suggestion.reason+"）":""),"ok");}
      else if(r.ok){window.bo.toast("おすすめ科目が見つかりませんでした。手動で選んでください","info");}
    });
    document.getElementById("reg").addEventListener("click",async(e)=>{
      const body={date:document.getElementById("date").value,kind:kindEl.value,wallet_id:document.getElementById("wallet").value,category_name:document.getElementById("cat").value,counter_wallet_id:document.getElementById("counter").value,amount:document.getElementById("amount").value,description:document.getElementById("desc").value,account_item_id:document.getElementById("acct").value};
      if(!body.date){window.bo.toast("日付を入力してください","err");return;}
      if(!(Number(body.amount)>0)){window.bo.toast("金額は1以上で入力してください","err");return;}
      if(!body.wallet_id){window.bo.toast("口座を選択してください","err");return;}
      if(body.kind!=="transfer"&&!body.category_name.trim()){window.bo.toast("分類（科目）を入力してください","err");return;}
      if(body.kind==="transfer"&&body.wallet_id===body.counter_wallet_id){window.bo.toast("振替元と振替先が同じ口座です","err");return;}
      const r=await window.bo.api("/api/tx",body,{btn:e.currentTarget,successMsg:"記録しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    });
    document.querySelectorAll(".del[data-del]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("この記録を消します。よろしいですか？",{confirmLabel:"削除",danger:true,auditHref:"/diagnostics"})))return;
      const r=await window.bo.api("/api/tx",{_action:"delete",id:e.target.dataset.del},{btn:e.target,successMsg:"削除しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
    // 明細CSVの取込（管理者）。確認→取り込み。
    (function(){
      const fileEl=document.getElementById("imp-file"),csvEl=document.getElementById("imp-csv"),outEl=document.getElementById("imp-out"),runBtn=document.getElementById("imp-run");
      if(!csvEl)return;
      const yen=(n)=>"¥"+(n||0).toLocaleString("ja-JP");
      const esc=(s)=>String(s).replace(/[&<>"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
      fileEl?.addEventListener("change",async()=>{const f=fileEl.files?.[0];if(f)csvEl.value=await f.text();});
      const getCsv=()=>csvEl.value.trim();
      document.getElementById("imp-preview")?.addEventListener("click",async(e)=>{
        if(!getCsv()){window.bo.toast("CSVを貼り付けるかファイルを選んでください","err");return;}
        const r=await window.bo.api("/api/accounting/import-csv",{_action:"preview",csv:getCsv()},{btn:e.currentTarget,successMsg:null});
        if(!r.ok)return;
        const d=r.data;outEl.hidden=false;
        let h="";
        if(d.warnings&&d.warnings.length)h+='<div class="banner banner-warn">'+d.warnings.map(esc).join("<br>")+"</div>";
        h+="<p class=\\"muted\\" style=\\"font-size:.85rem\\">取り込める明細："+d.total+" 件"+(d.skipped?("／読み飛ばし "+d.skipped+" 件（日付や金額が無い行）"):"")+"</p>";
        if(d.rows&&d.rows.length){
          h+='<div class="table-wrap"><table><thead><tr><th>日付</th><th>内容</th><th>区分</th><th class="r">金額</th></tr></thead><tbody>';
          for(const row of d.rows.slice(0,30))h+="<tr><td>"+esc(row.date)+"</td><td>"+esc(row.description)+"</td><td>"+(row.kind==="income"?"入金":"出金")+'</td><td class="r">'+yen(row.amount)+"</td></tr>";
          h+="</tbody></table></div>";
          if(d.total>30)h+='<p class="muted" style="font-size:.82rem">（先頭30件のみ表示）</p>';
        }
        outEl.innerHTML=h;
        if(runBtn)runBtn.disabled=!(d.total>0);
      });
      runBtn?.addEventListener("click",async(e)=>{
        const wallet_id=document.getElementById("imp-wallet").value;
        if(!getCsv()){window.bo.toast("先に内容を確認してください","err");return;}
        if(!(await window.bo.confirm("この明細を「"+(document.getElementById("imp-wallet").selectedOptions[0]?.textContent||"")+"」に取り込みます。よろしいですか？",{confirmLabel:"取り込む"})))return;
        const r=await window.bo.api("/api/accounting/import-csv",{_action:"import",csv:getCsv(),wallet_id},{btn:e.currentTarget,successMsg:null});
        if(r.ok){window.bo.toast(r.data.imported+" 件を取り込みました"+(r.data.skipped?("（"+r.data.skipped+" 件は読み飛ばし）"):""));setTimeout(()=>location.reload(),1200);}
      });
    })();
    // お金の種類（口座）の追加・削除（管理者）。
    document.getElementById("wl-add")?.addEventListener("click",async(e)=>{
      const name=document.getElementById("wl-name").value.trim();
      if(!name){window.bo.toast("名称を入力してください","err");return;}
      const body={name,type:document.getElementById("wl-type").value,opening_balance:Number(document.getElementById("wl-open").value)||0};
      const r=await window.bo.api("/api/accounting/wallet",body,{btn:e.currentTarget,successMsg:"追加しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    });
    document.querySelectorAll(".wl-del[data-id]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("この口座を削除しますか？（取引がある場合は削除できません）",{confirmLabel:"削除",danger:true})))return;
      const r=await window.bo.api("/api/accounting/wallet",{_action:"delete",id:e.target.dataset.id},{btn:e.target,successMsg:"削除しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
    // 記帳方式の切替（管理者）。
    document.querySelectorAll(".bm-opt").forEach(b=>b.addEventListener("click",async()=>{
      const r=await window.bo.api("/api/settings",{_action:"bookkeeping_mode",mode:b.dataset.mode},{successMsg:"記帳方式を変更しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
    // 仕訳の削除（複式・管理者）。手動入力は廃止し「お金を記録する」に一本化（仕訳は橋渡しで自動生成）。
    document.querySelectorAll(".je-del[data-del]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("この仕訳を消します。よろしいですか？",{confirmLabel:"削除",danger:true})))return;
      const r=await window.bo.api("/api/accounting/journal",{_action:"delete",id:e.target.dataset.del},{btn:e.target,successMsg:"削除しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
    // レジ締め（管理者）。差異があればAI推定が表示される。
    document.getElementById("cl-add")?.addEventListener("click",async(e)=>{
      const body={wallet_id:document.getElementById("cl-wallet").value,kind:document.getElementById("cl-kind").value,counted_amount:Number(document.getElementById("cl-counted").value)};
      if(!(body.counted_amount>=0)){window.bo.toast("数えた金額を入力してください","err");return;}
      const r=await window.bo.api("/api/accounting/closure",body,{btn:e.currentTarget,successMsg:null});
      if(r.ok){const msg=r.difference===0?"ぴったり一致しました":((r.difference>0?"不足":"過剰")+" "+Math.abs(r.difference).toLocaleString()+"円");window.bo.toast("締めました："+msg,r.difference===0?"ok":"info");setTimeout(()=>location.reload(),900);}
    });
    document.querySelectorAll(".cl-adj[data-id]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("差異を現金過不足で調整する仕訳を作成します。よろしいですか？",{confirmLabel:"調整する"})))return;
      const r=await window.bo.api("/api/accounting/closure",{_action:"adjust",id:e.target.dataset.id},{btn:e.target,successMsg:"調整しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    }));
    // 固定資産の登録・減価償却の計上・削除（管理者）。
    document.getElementById("fa-add")?.addEventListener("click",async(e)=>{
      const body={name:document.getElementById("fa-name").value,acquired_date:document.getElementById("fa-date").value,acquisition_cost:Number(document.getElementById("fa-cost").value),useful_life_years:Number(document.getElementById("fa-life").value),method:document.getElementById("fa-method").value,residual_value:Number(document.getElementById("fa-residual").value)||0};
      if(!body.name){window.bo.toast("資産名を入力してください","err");return;}
      if(!(body.acquisition_cost>0)||!(body.useful_life_years>0)){window.bo.toast("取得価額と耐用年数を入力してください","err");return;}
      const r=await window.bo.api("/api/accounting/asset",body,{btn:e.currentTarget,successMsg:"固定資産を登録しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    });
    document.querySelectorAll(".fa-dep[data-id]").forEach(b=>b.addEventListener("click",async(e)=>{
      const r=await window.bo.api("/api/accounting/asset",{_action:"depreciate",id:e.target.dataset.id},{btn:e.target,successMsg:"当期分の減価償却を計上しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    }));
    document.querySelectorAll(".fa-del[data-id]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("この固定資産を削除しますか？",{confirmLabel:"削除",danger:true})))return;
      const r=await window.bo.api("/api/accounting/asset",{_action:"delete",id:e.target.dataset.id},{btn:e.target,successMsg:"削除しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
  <\/script>`], [`<script data-astro-rerun>
    // 科目の削除（未使用のみ）。
    document.querySelectorAll("tr[data-cat] .cat-del").forEach((b)=>b.addEventListener("click",async(e)=>{const tr=e.target.closest("tr[data-cat]");const nm=(tr.children[1]?.textContent||"この科目").trim();if(!(await window.bo.confirm("科目「"+nm+"」を削除しますか？",{confirmLabel:"削除",danger:true})))return;const r=await window.bo.api("/api/tx",{_action:"delete_category",id:tr.dataset.cat},{btn:e.target,successMsg:"削除しました"});if(r.ok)setTimeout(()=>location.reload(),400);}));
    const recForm=document.getElementById("recForm"),kindEl=document.getElementById("kind"),catBox=document.getElementById("catBox"),counterBox=document.getElementById("counterBox"),recLabel=document.getElementById("recLabel"),acctBox=document.getElementById("acctBox");
    const LABELS={income:"＋ 入金を記録します",expense:"− 出金を記録します",transfer:"口座間の移動（振替）を記録します"};
    function openMode(k){
      kindEl.value=k;recLabel.textContent=LABELS[k]||"";recForm.hidden=false;
      catBox.style.display=k==="transfer"?"none":"";counterBox.style.display=k==="transfer"?"":"none";
      if(acctBox)acctBox.style.display=k==="transfer"?"none":"flex";
      // 科目は自由記述。種別に応じて候補（過去の科目）の datalist を切り替え、別種別の値が残らないよう必要に応じクリア。
      const catEl=document.getElementById("cat");
      if(catEl&&k!=="transfer"){catEl.setAttribute("list",k==="expense"?"cat-list-expense":"cat-list-income");}
      document.querySelectorAll(".rec-mode").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===k)));
      recForm.scrollIntoView({behavior:"smooth",block:"nearest"});
      const amt=document.getElementById("amount");if(amt)setTimeout(()=>amt.focus(),200);
    }
    document.querySelectorAll("[data-kind]").forEach(b=>b.addEventListener("click",()=>openMode(b.dataset.kind)));
    document.getElementById("recCancel").addEventListener("click",()=>{recForm.hidden=true;document.querySelectorAll(".rec-mode").forEach(b=>b.setAttribute("aria-pressed","false"));});
    // AIで勘定科目をおすすめ（経費の科目推定・Plus以上）。
    document.getElementById("acctAi")?.addEventListener("click",async(e)=>{
      const body={vendor:document.getElementById("desc").value,description:document.getElementById("desc").value,amount:Number(document.getElementById("amount").value)||undefined};
      const r=await window.bo.api("/api/accounting/suggest-account",body,{btn:e.currentTarget,successMsg:null});
      if(r.ok&&r.suggestion){document.getElementById("acct").value=r.suggestion.id;window.bo.toast("おすすめ："+r.suggestion.name+(r.suggestion.reason?"（"+r.suggestion.reason+"）":""),"ok");}
      else if(r.ok){window.bo.toast("おすすめ科目が見つかりませんでした。手動で選んでください","info");}
    });
    document.getElementById("reg").addEventListener("click",async(e)=>{
      const body={date:document.getElementById("date").value,kind:kindEl.value,wallet_id:document.getElementById("wallet").value,category_name:document.getElementById("cat").value,counter_wallet_id:document.getElementById("counter").value,amount:document.getElementById("amount").value,description:document.getElementById("desc").value,account_item_id:document.getElementById("acct").value};
      if(!body.date){window.bo.toast("日付を入力してください","err");return;}
      if(!(Number(body.amount)>0)){window.bo.toast("金額は1以上で入力してください","err");return;}
      if(!body.wallet_id){window.bo.toast("口座を選択してください","err");return;}
      if(body.kind!=="transfer"&&!body.category_name.trim()){window.bo.toast("分類（科目）を入力してください","err");return;}
      if(body.kind==="transfer"&&body.wallet_id===body.counter_wallet_id){window.bo.toast("振替元と振替先が同じ口座です","err");return;}
      const r=await window.bo.api("/api/tx",body,{btn:e.currentTarget,successMsg:"記録しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    });
    document.querySelectorAll(".del[data-del]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("この記録を消します。よろしいですか？",{confirmLabel:"削除",danger:true,auditHref:"/diagnostics"})))return;
      const r=await window.bo.api("/api/tx",{_action:"delete",id:e.target.dataset.del},{btn:e.target,successMsg:"削除しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
    // 明細CSVの取込（管理者）。確認→取り込み。
    (function(){
      const fileEl=document.getElementById("imp-file"),csvEl=document.getElementById("imp-csv"),outEl=document.getElementById("imp-out"),runBtn=document.getElementById("imp-run");
      if(!csvEl)return;
      const yen=(n)=>"¥"+(n||0).toLocaleString("ja-JP");
      const esc=(s)=>String(s).replace(/[&<>"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
      fileEl?.addEventListener("change",async()=>{const f=fileEl.files?.[0];if(f)csvEl.value=await f.text();});
      const getCsv=()=>csvEl.value.trim();
      document.getElementById("imp-preview")?.addEventListener("click",async(e)=>{
        if(!getCsv()){window.bo.toast("CSVを貼り付けるかファイルを選んでください","err");return;}
        const r=await window.bo.api("/api/accounting/import-csv",{_action:"preview",csv:getCsv()},{btn:e.currentTarget,successMsg:null});
        if(!r.ok)return;
        const d=r.data;outEl.hidden=false;
        let h="";
        if(d.warnings&&d.warnings.length)h+='<div class="banner banner-warn">'+d.warnings.map(esc).join("<br>")+"</div>";
        h+="<p class=\\\\"muted\\\\" style=\\\\"font-size:.85rem\\\\">取り込める明細："+d.total+" 件"+(d.skipped?("／読み飛ばし "+d.skipped+" 件（日付や金額が無い行）"):"")+"</p>";
        if(d.rows&&d.rows.length){
          h+='<div class="table-wrap"><table><thead><tr><th>日付</th><th>内容</th><th>区分</th><th class="r">金額</th></tr></thead><tbody>';
          for(const row of d.rows.slice(0,30))h+="<tr><td>"+esc(row.date)+"</td><td>"+esc(row.description)+"</td><td>"+(row.kind==="income"?"入金":"出金")+'</td><td class="r">'+yen(row.amount)+"</td></tr>";
          h+="</tbody></table></div>";
          if(d.total>30)h+='<p class="muted" style="font-size:.82rem">（先頭30件のみ表示）</p>';
        }
        outEl.innerHTML=h;
        if(runBtn)runBtn.disabled=!(d.total>0);
      });
      runBtn?.addEventListener("click",async(e)=>{
        const wallet_id=document.getElementById("imp-wallet").value;
        if(!getCsv()){window.bo.toast("先に内容を確認してください","err");return;}
        if(!(await window.bo.confirm("この明細を「"+(document.getElementById("imp-wallet").selectedOptions[0]?.textContent||"")+"」に取り込みます。よろしいですか？",{confirmLabel:"取り込む"})))return;
        const r=await window.bo.api("/api/accounting/import-csv",{_action:"import",csv:getCsv(),wallet_id},{btn:e.currentTarget,successMsg:null});
        if(r.ok){window.bo.toast(r.data.imported+" 件を取り込みました"+(r.data.skipped?("（"+r.data.skipped+" 件は読み飛ばし）"):""));setTimeout(()=>location.reload(),1200);}
      });
    })();
    // お金の種類（口座）の追加・削除（管理者）。
    document.getElementById("wl-add")?.addEventListener("click",async(e)=>{
      const name=document.getElementById("wl-name").value.trim();
      if(!name){window.bo.toast("名称を入力してください","err");return;}
      const body={name,type:document.getElementById("wl-type").value,opening_balance:Number(document.getElementById("wl-open").value)||0};
      const r=await window.bo.api("/api/accounting/wallet",body,{btn:e.currentTarget,successMsg:"追加しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    });
    document.querySelectorAll(".wl-del[data-id]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("この口座を削除しますか？（取引がある場合は削除できません）",{confirmLabel:"削除",danger:true})))return;
      const r=await window.bo.api("/api/accounting/wallet",{_action:"delete",id:e.target.dataset.id},{btn:e.target,successMsg:"削除しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
    // 記帳方式の切替（管理者）。
    document.querySelectorAll(".bm-opt").forEach(b=>b.addEventListener("click",async()=>{
      const r=await window.bo.api("/api/settings",{_action:"bookkeeping_mode",mode:b.dataset.mode},{successMsg:"記帳方式を変更しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
    // 仕訳の削除（複式・管理者）。手動入力は廃止し「お金を記録する」に一本化（仕訳は橋渡しで自動生成）。
    document.querySelectorAll(".je-del[data-del]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("この仕訳を消します。よろしいですか？",{confirmLabel:"削除",danger:true})))return;
      const r=await window.bo.api("/api/accounting/journal",{_action:"delete",id:e.target.dataset.del},{btn:e.target,successMsg:"削除しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
    // レジ締め（管理者）。差異があればAI推定が表示される。
    document.getElementById("cl-add")?.addEventListener("click",async(e)=>{
      const body={wallet_id:document.getElementById("cl-wallet").value,kind:document.getElementById("cl-kind").value,counted_amount:Number(document.getElementById("cl-counted").value)};
      if(!(body.counted_amount>=0)){window.bo.toast("数えた金額を入力してください","err");return;}
      const r=await window.bo.api("/api/accounting/closure",body,{btn:e.currentTarget,successMsg:null});
      if(r.ok){const msg=r.difference===0?"ぴったり一致しました":((r.difference>0?"不足":"過剰")+" "+Math.abs(r.difference).toLocaleString()+"円");window.bo.toast("締めました："+msg,r.difference===0?"ok":"info");setTimeout(()=>location.reload(),900);}
    });
    document.querySelectorAll(".cl-adj[data-id]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("差異を現金過不足で調整する仕訳を作成します。よろしいですか？",{confirmLabel:"調整する"})))return;
      const r=await window.bo.api("/api/accounting/closure",{_action:"adjust",id:e.target.dataset.id},{btn:e.target,successMsg:"調整しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    }));
    // 固定資産の登録・減価償却の計上・削除（管理者）。
    document.getElementById("fa-add")?.addEventListener("click",async(e)=>{
      const body={name:document.getElementById("fa-name").value,acquired_date:document.getElementById("fa-date").value,acquisition_cost:Number(document.getElementById("fa-cost").value),useful_life_years:Number(document.getElementById("fa-life").value),method:document.getElementById("fa-method").value,residual_value:Number(document.getElementById("fa-residual").value)||0};
      if(!body.name){window.bo.toast("資産名を入力してください","err");return;}
      if(!(body.acquisition_cost>0)||!(body.useful_life_years>0)){window.bo.toast("取得価額と耐用年数を入力してください","err");return;}
      const r=await window.bo.api("/api/accounting/asset",body,{btn:e.currentTarget,successMsg:"固定資産を登録しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    });
    document.querySelectorAll(".fa-dep[data-id]").forEach(b=>b.addEventListener("click",async(e)=>{
      const r=await window.bo.api("/api/accounting/asset",{_action:"depreciate",id:e.target.dataset.id},{btn:e.target,successMsg:"当期分の減価償却を計上しました"});
      if(r.ok)setTimeout(()=>location.reload(),600);
    }));
    document.querySelectorAll(".fa-del[data-id]").forEach(b=>b.addEventListener("click",async(e)=>{
      if(!(await window.bo.confirm("この固定資産を削除しますか？",{confirmLabel:"削除",danger:true})))return;
      const r=await window.bo.api("/api/accounting/asset",{_action:"delete",id:e.target.dataset.id},{btn:e.target,successMsg:"削除しました"});
      if(r.ok)setTimeout(()=>location.reload(),500);
    }));
  <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/accounting/index.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/accounting/index.astro";
const $$url = "/accounting";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
