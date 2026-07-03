globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { m as maybeRenderHead, a as addAttribute, r as renderTemplate } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { $ as $$EvIcon } from "./EvIcon_C73AYQ38.mjs";
const $$EventCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$EventCard;
  const { ev } = Astro2.props;
  const fmtDate = (s) => {
    if (!s) return "日程調整中";
    const d = new Date(s.replace(" ", "T"));
    if (isNaN(d.getTime())) return s;
    return `${d.getMonth() + 1}月${d.getDate()}日（${"日月火水木金土"[d.getDay()]}）${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const priceFrom = ev.plans.length ? Math.min(...ev.plans.map((p) => p.price)) : 0;
  return renderTemplate`${maybeRenderHead()}<a class="ev-card"${addAttribute("/event/" + ev.slug, "href")}> ${ev.image && renderTemplate`<span class="ev-thumb"${addAttribute(`background-image:url('${ev.image}')`, "style")}></span>`} <span class="ev-pad"> <span> <span class="tag">${renderComponent($$result, "EvIcon", $$EvIcon, { "name": "calendar", "size": 14 })} ${fmtDate(ev.event_date)}</span> <h3>${ev.title}</h3> ${ev.lead && renderTemplate`<p class="lead-sm">${ev.lead}</p>`} <span class="meta">${renderComponent($$result, "EvIcon", $$EvIcon, { "name": "pin", "size": 15 })} ${ev.location ?? "会場調整中"}</span> </span> <span class="ev-foot"> <span class="price">${priceFrom > 0 ? "¥" + priceFrom.toLocaleString("ja-JP") + "〜" : "参加無料"}</span> <span class="ev-go">詳細・申込 ${renderComponent($$result, "EvIcon", $$EvIcon, { "name": "arrow", "size": 16 })}</span> </span> </span> </a>`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/components/EventCard.astro", void 0);
export {
  $$EventCard as $
};
