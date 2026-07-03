globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import "./sequence_BESBTeYg.mjs";
const prerender = false;
const $$Chat = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Chat;
  const qs = Astro2.url.search || "";
  return Astro2.redirect("/" + qs, 308);
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/chat.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/chat.astro";
const $$url = "/chat";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Chat,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
