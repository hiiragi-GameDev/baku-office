globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$EventPublic } from "./EventPublic_CaN2h5s9.mjs";
import { $ as $$EventCard } from "./EventCard_xtzTILMV.mjs";
import { s as sanitizeHtml } from "./sanitize_DRp-o0kC.mjs";
const prerender = false;
const $$CraftCareer = createComponent(async ($$result, $$props, $$slots) => {
  const { listPublishedEvents, CRAFT_LP_SLUG, CRAFT_LP_DEFAULT } = await import("./events_DvycExYH.mjs");
  const { getPublishedSite } = await import("./sites_DMFBMYur.mjs");
  const site = await getPublishedSite(env, CRAFT_LP_SLUG).catch(() => null);
  if (!site) return new Response("ページが見つかりません。", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  const events = await listPublishedEvents(env).catch(() => []);
  const heroTitle = site.title?.trim() || CRAFT_LP_DEFAULT.title;
  const bodyHtml = sanitizeHtml(site.body && site.body.trim() ? site.body : CRAFT_LP_DEFAULT.body);
  return renderTemplate`${renderComponent($$result, "EventPublic", $$EventPublic, { "title": "Craft Beer × Career — 醸造とキャリアが交わる夜", "desc": "クラフトビール片手に、キャリアを語る。越境して人とつながるソーシャルイベント。", "brand": "Craft Beer × Career", "accent": "#c79a5a", "mode": "dark", "eventsHref": "/lp/craft-career", "eventsLabel": "イベント" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="hero" style="background-image: linear-gradient(180deg, rgba(16,14,10,.55), rgba(16,14,10,.86) 72%, var(--bg)), url('/img/craft-hero.jpg'); background-size: cover; background-position: center 32%; background-repeat: no-repeat;"> <div class="wrap"> <p class="eyebrow">Craft Beer &times; Career</p> <h1 class="display">${heroTitle}</h1> <div class="hero-cta"> <a class="btn btn-primary btn-lg" href="#events">イベントを見る</a> <a class="btn btn-lg" href="#about">コンセプト</a> </div> </div> </section> <section id="about" class="wrap section"> <div class="lp-rich">${unescapeHTML(bodyHtml)}</div> </section> <hr class="rule"> <section id="events" class="wrap section"> <p class="eyebrow">Events</p> <h2 style="font-size:2rem;margin:.2em 0 .1em">開催イベント</h2> <p class="muted" style="margin-bottom:28px">ご関心のある会を選び、お申し込みください。</p> ${events.length === 0 && renderTemplate`<div class="card pad"><p class="muted" style="margin:0">現在公開中のイベントはありません。</p></div>`} <div class="ev-grid"> ${events.map((e) => renderTemplate`${renderComponent($$result2, "EventCard", $$EventCard, { "ev": e })}`)} </div> </section> ` })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/lp/craft-career.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/lp/craft-career.astro";
const $$url = "/lp/craft-career";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$CraftCareer,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
