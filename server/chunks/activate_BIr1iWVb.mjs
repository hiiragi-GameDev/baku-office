globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Activate = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Activate;
  const url = Astro2.url;
  const origin = url.origin;
  const host = (env.HOST_BASE_URL ?? "").replace(/\/$/, "");
  const licenseId = url.searchParams.get("license_id");
  const code = url.searchParams.get("code");
  let message = "";
  if (licenseId && !code) {
    return Astro2.redirect(`${host}/api/activate?license_id=${encodeURIComponent(licenseId)}&callback=${encodeURIComponent(origin + "/activate")}`, 302);
  }
  if (code) {
    const { hostFetch, saveToken } = await import("./client_F4fksau0.mjs");
    const r = await hostFetch(env, "/api/token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, deployUrl: origin }) });
    const j = await r.json().catch(() => ({}));
    if (j.ok && j.token) {
      await saveToken(env, j.token);
      return Astro2.redirect("/login?activated=1", 302);
    }
    message = "アクティベーションに失敗しました：" + (j.error ?? "不明なエラー");
  }
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "アクティベーション", "auth": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 style="margin-top:1rem">baku-office をアクティベート</h1> ${message && renderTemplate`<div class="banner banner-danger">${message}</div>`}<div class="card"> <p><strong>申込時の Google アカウントでログイン</strong>すると、自動でアクティベートされて利用開始できます。ライセンスIDの入力は不要です。</p> <a class="btn btn-primary" href="/api/auth/google/start" style="display:block;text-align:center;padding:.85rem;font-size:1.05rem;text-decoration:none">Google でログイン</a> <p class="muted" style="font-size:.82rem;margin-top:.8rem;line-height:1.6">
本サービスは法人・非営利団体・各種事業体（個人事業主を含む）を対象としています。Gmail・カレンダー・ドライブ等の Google 連携は
<strong>Google Workspace の組織アカウント</strong>でのご利用を前提としており、組織アカウントであれば追加の審査なく連携できます。<br>
個人の Google アカウント（@gmail.com など）でご利用の場合は Google による審査が必要となることがあり、
<strong>審査の可否は Google 側の判断によります</strong>（当社では保証できません）。
</p> </div> <details style="margin-top:.5rem"><summary class="muted">うまくいかない場合：ライセンスIDで手動アクティベート</summary> <div class="card" style="margin-top:.5rem"> <div class="field"><input id="lid" placeholder="ライセンスID"></div> <button class="btn" id="go">アクティベート</button> </div> </details>  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    document.getElementById("go")?.addEventListener("click", () => {\n      const v = document.getElementById("lid").value.trim();\n      if (!v) { (window.bo?.toast ? window.bo.toast("ライセンスIDを入力してください", "err") : alert("ライセンスIDを入力してください")); return; }\n      location.href = "/activate?license_id=" + encodeURIComponent(v);\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/activate.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/activate.astro";
const $$url = "/activate";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Activate,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
