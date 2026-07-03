globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import "./sequence_BESBTeYg.mjs";
const prerender = false;
const $$Connectors = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Connectors;
  return Astro2.redirect("/settings/messaging", 301);
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/connectors.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/connectors.astro";
const $$url = "/settings/connectors";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Connectors,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
