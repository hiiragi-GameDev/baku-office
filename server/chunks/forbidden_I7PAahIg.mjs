globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
const prerender = false;
const $$Forbidden = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Forbidden;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "権限がありません", "active": "" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>このページは表示できません</h1> <div class="card"> <p style="margin:0">この機能をご利用いただく権限がありません。${ses.ctx === "org" ? "" : "組織の管理者がご利用いただける機能です。"}</p> <p class="muted" style="margin:.6rem 0 0">ログインは継続中です（ログアウトされていません）。必要な場合は組織の管理者にお問い合わせください。</p> <p style="margin:1rem 0 0"><a class="btn btn-primary" href="/">ホームへ戻る</a></p> </div> ` })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/forbidden.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/forbidden.astro";
const $$url = "/forbidden";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Forbidden,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
