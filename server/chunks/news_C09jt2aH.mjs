globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$EventPublic } from "./EventPublic_CaN2h5s9.mjs";
import { listPublishedPosts } from "./news_BXvjBFaK.mjs";
import { brandName, getTheme } from "./theme_DFty9gzU.mjs";
const prerender = false;
const $$News = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$News;
  const posts = await listPublishedPosts(env);
  const brand = brandName(await getTheme(Astro2.locals.ctx).catch(() => ({})));
  const fmt = (s) => new Date(s * 1e3).toLocaleDateString("ja-JP");
  return renderTemplate`${renderComponent($$result, "EventPublic", $$EventPublic, { "title": "お知らせ — " + brand, "desc": "新着のお知らせ一覧", "pageType": "website" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main style="max-width:760px;margin:0 auto;padding:32px 20px"> <h1 style="font-family:var(--font-serif)">お知らせ</h1> ${posts.length === 0 && renderTemplate`<p style="color:var(--muted)">お知らせはまだありません。</p>`} <ul style="list-style:none;padding:0;margin:24px 0"> ${posts.map((p) => renderTemplate`<li style="padding:16px 0;border-bottom:1px solid var(--line)"> <a${addAttribute(`/news/${p.slug}`, "href")} style="display:block"> <time style="font-size:.82rem;color:var(--muted)">${fmt(p.created_at)}</time> <div style="font-size:1.1rem;font-weight:600;margin-top:4px">${p.title}</div> </a> </li>`)} </ul> </main> ` })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/news.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/news.astro";
const $$url = "/news";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$News,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
