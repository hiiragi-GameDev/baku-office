globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { m as maybeRenderHead, a as addAttribute, r as renderTemplate } from "./sequence_BESBTeYg.mjs";
const $$SectionTabs = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$SectionTabs;
  const { active, label, tabs } = Astro2.props;
  const visible = tabs.filter((t) => t.show !== false);
  return renderTemplate`${visible.length >= 2 && renderTemplate`${maybeRenderHead()}<nav class="section-tabs"${addAttribute(label, "aria-label")} data-astro-cid-2ypbjnip>${visible.map((t) => renderTemplate`<a${addAttribute("section-tab" + (active === t.id ? " on" : ""), "class")}${addAttribute(t.href, "href")}${addAttribute(active === t.id ? "page" : void 0, "aria-current")} data-astro-cid-2ypbjnip>${t.label}</a>`)}</nav>`}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/components/SectionTabs.astro", void 0);
export {
  $$SectionTabs as $
};
