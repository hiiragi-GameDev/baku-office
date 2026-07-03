globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import "./sequence_BESBTeYg.mjs";
import { env } from "cloudflare:workers";
import { getPublicPage } from "./public-pages_DHQdIiIX.mjs";
import { b as buildPublicFullPage } from "./app-frame_NWC0ZR-C.mjs";
const prerender = false;
const $$sitepage = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$sitepage;
  const slug = Astro2.params.sitepage ?? "";
  const notFound = () => new Response("ページが見つかりません", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  if (!Astro2.locals.publicHost) return notFound();
  const page2 = await getPublicPage(env, slug);
  if (!page2) return notFound();
  let allowHosts = [];
  try {
    const row = await env.DB.prepare("SELECT definition FROM external_apps WHERE id=? UNION ALL SELECT definition FROM app_drafts WHERE id=? LIMIT 1").bind(page2.app_id, page2.app_id).first();
    const r = row?.definition ? JSON.parse(row.definition).render : null;
    if (r?.isolation === "relaxed" && Array.isArray(r.allowHosts)) allowHosts = r.allowHosts;
  } catch {
  }
  Astro2.locals.publicSiteAllowHosts = allowHosts;
  return new Response(buildPublicFullPage(page2.html, { slug, title: page2.title, canonical: Astro2.url.origin + "/" + slug, params: Object.fromEntries(Astro2.url.searchParams), nonce: Astro2.locals.cspNonce }), { headers: { "content-type": "text/html; charset=utf-8" } });
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/[sitepage].astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/[sitepage].astro";
const $$url = "/[sitepage]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$sitepage,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
