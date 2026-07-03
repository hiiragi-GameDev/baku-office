globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import { env } from "cloudflare:workers";
import { verifyPending } from "./auth_DL5yvmzT.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Join = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Join;
  const code = Astro2.url.searchParams.get("code") ?? "";
  const pendRaw = /pending_oauth=([^;]+)/.exec(Astro2.request.headers.get("cookie") ?? "")?.[1];
  const pend = pendRaw ? await verifyPending(env, pendRaw) : null;
  const provLabel = { google: "Google", line: "LINE", discord: "Discord", slack: "Slack" };
  const oauthName = pend?.name ?? "";
  const oauthProv = pend ? provLabel[pend.provider] ?? pend.provider : "";
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "参加", "auth": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 style="margin-top:1rem">組織に参加</h1> <p class="muted">招待コードで参加します。登録後は<strong>管理者の承認</strong>で利用開始。</p> <div class="card"> ${pend && renderTemplate`<p class="muted" style="font-size:.88rem">✅ <strong>${oauthProv}</strong> でログイン済みです。招待コードと氏名を入力して参加してください（パスワードは不要）。</p>`} <div class="field"><label for="code">招待コード</label><input id="code"${addAttribute(code, "value")}></div> <div class="field"><label for="name">氏名・役職</label><input id="name"${addAttribute(oauthName, "value")} placeholder="例：山田太郎 / 会計"></div> ${!pend && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="field"><label for="lid">ログインID（メールアドレス可）</label><input id="lid" placeholder="ログインID または メールアドレス"></div> <div class="field"><label for="pw">パスワード（8文字以上）</label><input id="pw" type="password"></div> ` })}`} <button class="btn btn-primary" id="join">参加申請する</button> </div>  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    document.getElementById("join").addEventListener("click",async(e)=>{\n      const v=(id)=>document.getElementById(id)?document.getElementById(id).value:"";\n      const r=await window.bo.api("/api/join",{code:v("code"),name:v("name"),loginId:v("lid"),password:v("pw")},{btn:e.currentTarget,successMsg:"申請しました。管理者の承認をお待ちください。"});\n      if(r.ok)setTimeout(()=>location.href="/login",1500);\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/join.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/join.astro";
const $$url = "/join";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Join,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
