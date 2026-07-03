globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import { $ as $$ApprovalTabs } from "./ApprovalTabs_R8DoNXyE.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Review = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Review;
  const { getSession, canAccess } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const allowed = canAccess(ses.role, "review_accounting") || canAccess(ses.role, "review_documents");
  const isAdmin = ses.role === "admin";
  const { reviewQueue, approvedReceipts } = await import("./users_DArBIlQW.mjs");
  const queue = allowed ? await reviewQueue(env) : [];
  const approved = isAdmin ? await approvedReceipts(env) : [];
  const yen = (n) => n != null ? "¥" + n.toLocaleString("ja-JP") : "";
  const TYPE_LABEL = { receipt: "領収書", memo: "メモ", task: "タスク", schedule: "予定" };
  const typeLabel = (t) => TYPE_LABEL[t] ?? t;
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "共有承認", "active": "/review" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ApprovalTabs", $$ApprovalTabs, { "active": "review", "showReview": allowed, "showApprovals": isAdmin })} ${maybeRenderHead()}<h1>共有承認キュー</h1> ${!allowed && renderTemplate`<div class="banner banner-info">承認権限（会計／庶務／管理者）がありません。</div>`}${allowed && renderTemplate`<div class="table-wrap"><table><thead><tr><th>種別</th><th>概要</th><th>金額</th><th>日付</th><th></th></tr></thead><tbody> ${queue.map((q) => renderTemplate`<tr${addAttribute(q.id, "data-id")}><td>${typeLabel(q.type)}</td><td>${q.title}</td><td>${yen(q.amount)}</td><td>${q.date ?? ""}</td><td><button class="btn btn-sm btn-ok ap">承認</button> <button class="btn btn-sm btn-danger rj">却下</button></td></tr>`)} ${queue.length === 0 && renderTemplate`<tr><td colspan="5" class="muted">承認待ちはありません。</td></tr>`} </tbody></table></div>`}<p class="muted" style="margin-top:1rem">領収書の承認は会計取引のドラフトを自動生成します。</p> ${isAdmin && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h2 style="margin-top:2rem">承認済み領収書（誤承認の取消）</h2> <p class="muted">取消すると、連動して生成された会計取引も取り消され、記録は申請者が削除できる状態に戻ります。</p> <div class="table-wrap"><table><thead><tr><th>概要</th><th>金額</th><th>日付</th><th></th></tr></thead><tbody> ${approved.map((a) => renderTemplate`<tr${addAttribute(a.id, "data-approved-id")}><td>${a.title}</td><td>${yen(a.amount)}</td><td>${a.date ?? ""}</td><td><button class="btn btn-sm btn-danger un">承認を取消</button></td></tr>`)} ${approved.length === 0 && renderTemplate`<tr><td colspan="4" class="muted">取消できる承認済み領収書はありません。</td></tr>`} </tbody></table></div> ` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    document.querySelectorAll("tr[data-id]").forEach(tr=>{const id=tr.dataset.id;\n      tr.querySelector(".ap")?.addEventListener("click",async(e)=>{const r=await window.bo.api("/api/review",{_action:"approve",id},{btn:e.target,successMsg:"承認しました"});if(r.ok)setTimeout(()=>location.reload(),600);});\n      tr.querySelector(".rj")?.addEventListener("click",async(e)=>{const reason=prompt("却下理由")||"";const r=await window.bo.api("/api/review",{_action:"reject",id,reason},{btn:e.target,successMsg:"却下しました"});if(r.ok)setTimeout(()=>location.reload(),600);});\n    });\n    document.querySelectorAll("tr[data-approved-id]").forEach(tr=>{const id=tr.dataset.approvedId;\n      tr.querySelector(".un")?.addEventListener("click",async(e)=>{if(!(await window.bo.confirm("この承認を取消しますか？連動する会計取引も取り消されます。",{confirmLabel:"取消",danger:true})))return;const r=await window.bo.api("/api/review",{_action:"unapprove",id},{btn:e.target,successMsg:"承認を取消しました"});if(r.ok)setTimeout(()=>location.reload(),600);});\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/review.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/review.astro";
const $$url = "/review";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Review,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
