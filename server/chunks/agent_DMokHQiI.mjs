globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
const prerender = false;
const $$Agent = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Agent;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const { cachedEntitlement } = await import("./client_F4fksau0.mjs");
  const entitlement = await cachedEntitlement(env).catch(() => "free");
  const hasPlus = atLeast(entitlement, "plus");
  const hasPro = atLeast(entitlement, "pro");
  const items = [
    { href: "/settings/directory", label: "エージェントを公開（受付にする）", desc: "団体を公開し、招待なしで問い合わせを受け付ける", show: hasPlus },
    { href: "/directory", label: "公開団体を探す", desc: "公開している他団体を探して連絡する", show: hasPlus },
    { href: "/settings/a2a", label: "他団体との連携（A2A）", desc: "ほかの団体と、相互の同意でつながる（管理者のみ設定可）", show: hasPro }
  ].filter((i) => i.show);
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "エージェント設定", "active": "/settings", "denseMobile": true, "data-astro-cid-mzvflrad": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-mzvflrad>エージェント設定</h1> <p class="muted" data-astro-cid-mzvflrad>団体のAIエージェントの公開（受付）、公開団体の探索、他団体との連携（A2A）をここでまとめて管理します。いずれも管理者のみ設定できます。</p> ${items.length === 0 && renderTemplate`<div class="card" data-astro-cid-mzvflrad><div class="banner banner-warn" data-astro-cid-mzvflrad>エージェントの公開・連携機能は <strong data-astro-cid-mzvflrad>Plus / Pro プラン</strong>で利用できます。</div><a class="btn btn-primary" href="/billing" data-astro-cid-mzvflrad>プラン・課金へ</a></div>`}<div class="hub-grid" data-astro-cid-mzvflrad> ${items.map((i) => renderTemplate`<a class="card link hub-card"${addAttribute(i.href, "href")} data-astro-cid-mzvflrad><strong data-astro-cid-mzvflrad>${i.label}</strong><span class="muted small" data-astro-cid-mzvflrad>${i.desc}</span></a>`)} </div> ` })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/agent.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/agent.astro";
const $$url = "/settings/agent";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Agent,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
