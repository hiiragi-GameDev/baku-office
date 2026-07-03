globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$EventPublic } from "./EventPublic_CaN2h5s9.mjs";
import { $ as $$EventCard } from "./EventCard_xtzTILMV.mjs";
import { getTheme, brandName } from "./theme_DFty9gzU.mjs";
const prerender = false;
const $$Events = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Events;
  const { listPublishedEvents } = await import("./events_DvycExYH.mjs");
  const events = await listPublishedEvents(env).catch(() => []);
  const theme = await getTheme(Astro2.locals.ctx).catch(() => ({}));
  const brand = brandName(theme);
  return renderTemplate`${renderComponent($$result, "EventPublic", $$EventPublic, { "title": "イベント — " + brand, "desc": "開催予定のイベント一覧" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="wrap" style="padding-top:72px;padding-bottom:8px"> <p class="eyebrow">Events</p> <h1 class="display" style="font-size:clamp(2rem,1.4rem+2.4vw,3rem);margin:.18em 0 .25em">イベント</h1> <p class="lead" style="max-width:34rem">開催予定のイベントから、ご関心のあるものを選んでお申し込みください。</p> </section> <section class="wrap section-sm"> ${events.length === 0 && renderTemplate`<div class="card pad"><p class="muted" style="margin:0">現在公開中のイベントはありません。</p></div>`} <div class="ev-grid"> ${events.map((e) => renderTemplate`${renderComponent($$result2, "EventCard", $$EventCard, { "ev": e })}`)} </div> </section> ` })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/events.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/events.astro";
const $$url = "/events";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Events,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
