globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$SiteLockGate, a as $$PublicSite } from "./SiteLockGate_B_itOqbx.mjs";
const prerender = false;
const $$Site = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Site;
  const { getPublishedSite, getSite, siteLocked } = await import("./sites_DMFBMYur.mjs");
  const wantPreview = Astro2.url.searchParams.get("preview") === "1";
  let site = await getPublishedSite(env, "home");
  let adminPreview = false;
  if (wantPreview) {
    const { getSession } = await import("./auth_DL5yvmzT.mjs");
    const ses = await getSession(env, Astro2.request);
    if (ses?.role === "admin") {
      site = await getSite(env, "home");
      adminPreview = true;
    }
  }
  if (!site) return new Response("ページは公開されていません。", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  const locked = await siteLocked(env, Astro2.request, site, adminPreview);
  const lockError = Astro2.url.searchParams.get("e") === "1";
  return renderTemplate`${locked ? renderTemplate`${renderComponent($$result, "SiteLockGate", $$SiteLockGate, { "title": site.title, "slug": site.slug, "error": lockError })}` : renderTemplate`${renderComponent($$result, "PublicSite", $$PublicSite, { "site": site, "preview": adminPreview })}`}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/site.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/site.astro";
const $$url = "/site";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Site,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
