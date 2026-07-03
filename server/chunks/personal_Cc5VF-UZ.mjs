globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Personal = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Personal;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isOrg = ses.ctx === "org";
  const { listMyItems } = await import("./users_DArBIlQW.mjs");
  const items = await listMyItems(env, ses.uid);
  const yen = (n) => n != null ? "¥" + n.toLocaleString("ja-JP") : "";
  const TYPE_LABEL = { receipt: "領収書", memo: "メモ", task: "タスク", schedule: "予定" };
  const STATUS_LABEL = { pending: "承認待ち", approved: "承認済み", rejected: "却下", none: "" };
  const typeLabel = (t) => TYPE_LABEL[t] ?? t;
  const statusLabel = (s) => STATUS_LABEL[s] ?? s;
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "メモ・記録", "active": "/personal" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>メモ・記録</h1> <p class="muted">${isOrg ? "メモ・領収書・予定などを記録できます（この組織アカウントの記録です）。" : "領収書・メモ・タスク・予定を記録し、必要なものを組織へ共有申請できます。"}</p> <div class="card"> <div class="row"> <select id="type" aria-label="種別"><option value="receipt">領収書</option><option value="memo">メモ</option><option value="task">タスク</option><option value="schedule">予定</option></select> <input id="title" placeholder="概要" aria-label="概要"> <input id="amount" type="number" placeholder="金額（円）" aria-label="金額"> <button class="btn btn-primary" id="add" style="flex:0 0 auto">追加</button> </div> </div> <div class="table-wrap" style="margin-top:1rem"><table><thead><tr><th>種別</th><th>概要</th><th>金額</th><th>共有</th><th></th></tr></thead><tbody> ${items.map((it) => renderTemplate`<tr${addAttribute(it.id, "data-id")}><td>${typeLabel(it.type)}</td><td>${it.title}</td><td>${yen(it.amount)}</td><td>${it.share_scope === "org" ? "組織：" + statusLabel(it.review_status) : isOrg ? "組織" : "個人"}</td><td style="white-space:nowrap">${!isOrg && it.share_scope !== "org" && renderTemplate`<button class="btn btn-sm btn-primary share">組織へ共有</button>`} ${it.review_status !== "approved" && renderTemplate`<button class="btn btn-sm btn-danger del">削除</button>`}</td></tr>`)} ${items.length === 0 && renderTemplate`<tr><td colspan="5" class="muted" style="text-align:center;padding:1.2rem">まだ記録がありません。上の欄から領収書・メモなどを追加してみましょう。</td></tr>`} </tbody></table></div>  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    // 金額欄は「領収書」のときだけ表示（メモ/タスク/予定では不要なので隠す）。\n    const typeEl=document.getElementById("type"),amountEl=document.getElementById("amount");\n    function syncAmount(){amountEl.style.display=typeEl.value==="receipt"?"":"none";if(typeEl.value!=="receipt")amountEl.value="";}\n    typeEl.addEventListener("change",syncAmount);syncAmount();\n    document.getElementById("add").addEventListener("click",async(e)=>{const r=await window.bo.api("/api/personal",{_action:"create",type:typeEl.value,title:document.getElementById("title").value,amount:amountEl.value||undefined},{btn:e.currentTarget,successMsg:"追加しました"});if(r.ok)setTimeout(()=>location.reload(),500);});\n    document.querySelectorAll("tr[data-id] .share").forEach(b=>b.addEventListener("click",async(e)=>{const r=await window.bo.api("/api/personal",{_action:"share",id:e.target.closest("tr").dataset.id},{btn:e.target,successMsg:"共有申請しました"});if(r.ok)setTimeout(()=>location.reload(),500);}));\n    document.querySelectorAll("tr[data-id] .del").forEach(b=>b.addEventListener("click",async(e)=>{if(!(await window.bo.confirm("この記録を削除しますか？",{confirmLabel:"削除",danger:true})))return;const r=await window.bo.api("/api/personal",{_action:"delete",id:e.target.closest("tr").dataset.id},{btn:e.target,successMsg:"削除しました"});if(r.ok)setTimeout(()=>location.reload(),400);}));\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/personal.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/personal.astro";
const $$url = "/personal";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Personal,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
