globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
const prerender = false;
const $$Org = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Org;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdminOrg = ses.role === "admin";
  const canReview = ses.role === "admin" || ses.role === "accounting" || ses.role === "clerical";
  const items = [
    { href: "/account", label: "自分のアカウント", desc: "お名前・パスワードなどの変更", show: true },
    { href: "/settings/members", label: "メンバー・権限", desc: "招待・承認・できることの設定", show: isAdminOrg },
    { href: "/billing", label: "プラン・お支払い", desc: "ご利用プランの確認・変更", show: isAdminOrg },
    { href: "/approvals", label: "AI操作の承認", desc: "AIが行う送信・変更の承認", show: isAdminOrg },
    { href: "/review", label: "共有の承認", desc: "個人から団体への共有を承認", show: canReview }
  ].filter((i) => i.show);
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "アカウント・組織", "active": "/settings", "denseMobile": true, "data-astro-cid-chu44qix": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-chu44qix>アカウント・組織</h1> <p class="muted" data-astro-cid-chu44qix>自分のアカウント、メンバーと権限、プラン、各種承認をここでまとめて管理します。</p> <div class="hub-grid" data-astro-cid-chu44qix> ${items.map((i) => renderTemplate`<a class="card link hub-card"${addAttribute(i.href, "href")} data-astro-cid-chu44qix><strong data-astro-cid-chu44qix>${i.label}</strong><span class="muted small" data-astro-cid-chu44qix>${i.desc}</span></a>`)} </div> ` })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/org.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/org.astro";
const $$url = "/settings/org";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Org,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
