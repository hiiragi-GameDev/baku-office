globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, u as unescapeHTML, F as Fragment, a as addAttribute, m as maybeRenderHead } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import { $ as $$MoneyTabs } from "./MoneyTabs_PgnGZb0p.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast, p as planLabel } from "./types_BVJxqWI9.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b;
const prerender = false;
const $$Billing = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Billing;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const { pollHost, cachedEntitlement, getLicenseId, hostFetch } = await import("./client_F4fksau0.mjs");
  const check = await pollHost(env, Astro2.url.origin);
  const entitlement = check?.entitlement ?? await cachedEntitlement(env);
  const licenseId = await getLicenseId(env);
  const hostBase = (env.HOST_BASE_URL ?? "").replace(/\/$/, "");
  let stripe = false;
  try {
    stripe = (await (await hostFetch(env, "/api/billing/status")).json()).stripe ?? false;
  } catch {
  }
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "プラン・課金", "active": "/billing" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", " ", "<h1>プラン・課金</h1> ", '<div class="card">現在のプラン：<span class="pill">', '</span> <p class="muted">入金が確認・継続している間のみ有料機能が有効。無料(Free)は常に利用可。データはロック・削除しません。</p> <p class="muted" style="margin:0"><a href="/usage">使用量・上限を見る</a></p> </div> <div class="card" style="margin-top:1rem"> <h2 style="margin-top:0;border:0">アップグレード</h2> <p class="muted">', "</p> <button", ' data-plan="plus"', ">", "</button> <button", ' data-plan="pro"', ">", "</button> ", ' </div> <div class="card" style="margin-top:1rem"> <h2 style="margin-top:0;border:0">NonProfit（非営利団体・全機能無料）</h2> ', ' </div> <div class="card" style="margin-top:1rem"> <h2 style="margin-top:0;border:0">エンタープライズ（大企業・組織向け）</h2> ', ' </div> <script type="application/json" id="bo-billing-data">', "<\/script>  "])), renderComponent($$result2, "MoneyTabs", $$MoneyTabs, { "active": "billing", "showInvoices": atLeast(entitlement, "pro"), "showBilling": true }), maybeRenderHead(), !stripe && renderTemplate`<div class="banner banner-warn"><strong>デモモード</strong>：Stripe未接続のため、下の「支払った（デモ）」で入金を擬似確認しエンタイトルメントを昇格します（本番はStripe決済）。</div>`, planLabel(entitlement), stripe ? "カードは即時、銀行振込・コンビニは入金確認後に反映。" : "デモ：ボタンで即時に昇格します。", addAttribute(`btn ${stripe ? "btn-primary" : "btn-warn"} up`, "class"), addAttribute(atLeast(entitlement, "plus"), "disabled"), stripe ? "Plus（AI）にする" : "【デモ】Plus に支払った", addAttribute(`btn ${stripe ? "btn-primary" : "btn-warn"} up`, "class"), addAttribute(atLeast(entitlement, "pro"), "disabled"), stripe ? "Pro（エージェント）にする" : "【デモ】Pro に支払った", entitlement === "test" && renderTemplate`<p class="muted" style="margin-top:.5rem">テスト権限（全機能解放）が付与されています。</p>`, entitlement === "nonprofit" ? renderTemplate`<p class="muted">NonProfit（全機能・無料）が有効です。ご不明点は担当窓口へ。</p>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p class="muted">非営利団体は、ホスト審査の通過で<strong>全機能を無料</strong>で利用できます。下のボタンから申し込めます（承認まではFree相当で利用できます）。</p> <button class="btn btn-primary pr-toggle" type="button" data-kind="nonprofit">非営利団体として申し込む</button> <form class="pr-form" data-kind="nonprofit" hidden style="margin-top:.7rem"> <div class="field"><label>団体名</label><input name="orgName" type="text" placeholder="例：NPO法人 ◯◯" autocomplete="organization"></div> <div class="field"><label>ご連絡先（メール／電話）</label><input name="contact" type="text" placeholder="承認連絡用" autocomplete="email"></div> <div class="field"><label>団体種別・用途・認証番号や書類URL（任意）</label><textarea name="note" rows="2" placeholder="例：認定NPO・地域福祉。認証番号 / 書類URL など"></textarea></div> <button class="btn btn-primary pr-submit" type="button" data-kind="nonprofit">この内容で申し込む</button> </form> ` })}`, entitlement === "enterprise" ? renderTemplate`<p class="muted">エンタープライズ（全機能解放）が有効です。ご相談は担当窓口へ。</p>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p class="muted">大企業・組織向けに、全機能解放・個別サポート・専用条件をご用意します。<strong>個別相談</strong>での提供です。下のボタンから相談を申し込めます。</p> <button class="btn btn-primary pr-toggle" type="button" data-kind="enterprise">エンタープライズを申し込む（相談）</button> <form class="pr-form" data-kind="enterprise" hidden style="margin-top:.7rem"> <div class="field"><label>会社・組織名</label><input name="orgName" type="text" placeholder="例：株式会社 ◯◯" autocomplete="organization"></div> <div class="field"><label>ご連絡先（メール／電話）</label><input name="contact" type="text" placeholder="折り返しご連絡します" autocomplete="email"></div> <div class="field"><label>ご要望・規模・利用想定（任意）</label><textarea name="note" rows="2" placeholder="例：従業員200名・全社展開を検討。SSO 等のご要望"></textarea></div> <button class="btn btn-primary pr-submit" type="button" data-kind="enterprise">この内容で申し込む</button> </form> ` })}`, unescapeHTML(JSON.stringify({ licenseId, hostBase }).replace(/</g, "\\u003c"))), "scripts": async ($$result2) => renderTemplate(_b || (_b = __template([`<script data-astro-rerun>
    var __billing = JSON.parse(document.getElementById("bo-billing-data").textContent), licenseId = __billing.licenseId, hostBase = __billing.hostBase;
    document.querySelectorAll(".up").forEach(b=>b.addEventListener("click",async(e)=>{
      const plan=e.currentTarget.dataset.plan;
      const r=await window.bo.api("/api/billing/start",{plan},{btn:e.currentTarget,successMsg:null});
      if(!r.ok)return;
      if(r.data.mode==="stripe"){window.bo.toast("決済へ移動します");location.href=r.data.url;return;}
      window.bo.toast("入金確認（デモ）へ移動します");
      location.href=\`\${hostBase}/api/billing/dev-confirm?license_id=\${encodeURIComponent(licenseId)}&plan=\${plan}&return=\${encodeURIComponent(location.origin+"/billing")}\`;
    }));
    // 非営利/エンタープライズ申込：フォーム展開→送信（ホストへ中継）。
    document.querySelectorAll(".pr-toggle").forEach(b=>b.addEventListener("click",(e)=>{
      const k=e.currentTarget.dataset.kind;
      const f=document.querySelector('.pr-form[data-kind="'+k+'"]');
      if(f){f.hidden=!f.hidden;e.currentTarget.hidden=true;}
    }));
    document.querySelectorAll(".pr-submit").forEach(b=>b.addEventListener("click",async(e)=>{
      const k=e.currentTarget.dataset.kind;
      const f=document.querySelector('.pr-form[data-kind="'+k+'"]');
      const get=(n)=>(f.querySelector('[name="'+n+'"]')?.value||"").trim();
      const orgName=get("orgName");
      if(!orgName){window.bo.toast(k==="nonprofit"?"団体名を入力してください":"会社・組織名を入力してください","err");return;}
      const r=await window.bo.api("/api/plan-request",{kind:k,orgName,contact:get("contact"),note:get("note")},{btn:e.currentTarget,successMsg:null});
      if(r.ok){f.innerHTML='<div class="banner banner-ok">申し込みを受け付けました。審査の承認後、自動で反映され通知が届きます。</div>';}
    }));
  <\/script>`], [`<script data-astro-rerun>
    var __billing = JSON.parse(document.getElementById("bo-billing-data").textContent), licenseId = __billing.licenseId, hostBase = __billing.hostBase;
    document.querySelectorAll(".up").forEach(b=>b.addEventListener("click",async(e)=>{
      const plan=e.currentTarget.dataset.plan;
      const r=await window.bo.api("/api/billing/start",{plan},{btn:e.currentTarget,successMsg:null});
      if(!r.ok)return;
      if(r.data.mode==="stripe"){window.bo.toast("決済へ移動します");location.href=r.data.url;return;}
      window.bo.toast("入金確認（デモ）へ移動します");
      location.href=\\\`\\\${hostBase}/api/billing/dev-confirm?license_id=\\\${encodeURIComponent(licenseId)}&plan=\\\${plan}&return=\\\${encodeURIComponent(location.origin+"/billing")}\\\`;
    }));
    // 非営利/エンタープライズ申込：フォーム展開→送信（ホストへ中継）。
    document.querySelectorAll(".pr-toggle").forEach(b=>b.addEventListener("click",(e)=>{
      const k=e.currentTarget.dataset.kind;
      const f=document.querySelector('.pr-form[data-kind="'+k+'"]');
      if(f){f.hidden=!f.hidden;e.currentTarget.hidden=true;}
    }));
    document.querySelectorAll(".pr-submit").forEach(b=>b.addEventListener("click",async(e)=>{
      const k=e.currentTarget.dataset.kind;
      const f=document.querySelector('.pr-form[data-kind="'+k+'"]');
      const get=(n)=>(f.querySelector('[name="'+n+'"]')?.value||"").trim();
      const orgName=get("orgName");
      if(!orgName){window.bo.toast(k==="nonprofit"?"団体名を入力してください":"会社・組織名を入力してください","err");return;}
      const r=await window.bo.api("/api/plan-request",{kind:k,orgName,contact:get("contact"),note:get("note")},{btn:e.currentTarget,successMsg:null});
      if(r.ok){f.innerHTML='<div class="banner banner-ok">申し込みを受け付けました。審査の承認後、自動で反映され通知が届きます。</div>';}
    }));
  <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/billing.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/billing.astro";
const $$url = "/billing";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Billing,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
