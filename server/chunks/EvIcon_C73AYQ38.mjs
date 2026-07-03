globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { m as maybeRenderHead, a as addAttribute, r as renderTemplate } from "./sequence_BESBTeYg.mjs";
const $$EvIcon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$EvIcon;
  const { name, size = 18, class: cls = "" } = Astro2.props;
  const PATHS = {
    pin: "M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 18.5 10.8C18.5 15.6 12 21 12 21z M12 8.2a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z",
    users: "M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19 M9.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4 M15.5 5.2a3 3 0 0 1 0 5.8",
    calendar: "M7 4v3 M17 4v3 M4.5 9.5h15 M5 6.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1z",
    clock: "M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    lock: "M7 11V8a5 5 0 0 1 10 0v3 M5.5 11h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z",
    check: "M5 12.5l4.5 4.5L19 7.5",
    arrow: "M5 12h14 M13 6l6 6-6 6",
    mail: "M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z M3.5 7.5l8.5 6 8.5-6",
    spark: "M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"
  };
  const d = PATHS[name] ?? "";
  return renderTemplate`${maybeRenderHead()}<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="flex:0 0 auto;vertical-align:middle"> ${d.split(" M").map((seg, i) => renderTemplate`<path${addAttribute(i === 0 ? seg : "M" + seg, "d")}></path>`)} </svg>`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/components/EvIcon.astro", void 0);
export {
  $$EvIcon as $
};
