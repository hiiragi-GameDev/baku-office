globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";
const prerender = false;
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const GET = async ({ url, locals }) => {
  const origin = url.origin;
  const urls = [{ loc: `${origin}/` }, { loc: `${origin}/events` }];
  if (locals.publicHost) {
    try {
      const { isReservedSlug } = await import("./site-routing_D_cHuHu3.mjs");
      const pages = await env.DB.prepare("SELECT slug, updated_at FROM public_pages WHERE enabled=1").all();
      for (const p of pages.results ?? []) {
        const path = isReservedSlug(p.slug) ? `/p/${encodeURIComponent(p.slug)}` : `/${encodeURIComponent(p.slug)}`;
        urls.push({ loc: `${origin}${path}`, lastmod: p.updated_at });
      }
    } catch {
    }
  }
  try {
    const sites = await env.DB.prepare("SELECT slug, updated_at FROM sites WHERE published=1").all();
    for (const s of sites.results ?? []) urls.push({ loc: `${origin}/lp/${encodeURIComponent(s.slug)}`, lastmod: s.updated_at });
  } catch {
  }
  try {
    const evs = await env.DB.prepare("SELECT slug, updated_at FROM events WHERE published=1").all();
    for (const e of evs.results ?? []) urls.push({ loc: `${origin}/event/${encodeURIComponent(e.slug)}`, lastmod: e.updated_at });
  } catch {
  }
  try {
    const posts = await env.DB.prepare("SELECT slug, updated_at FROM posts WHERE published=1").all();
    if ((posts.results ?? []).length) urls.push({ loc: `${origin}/news` });
    for (const p of posts.results ?? []) urls.push({ loc: `${origin}/news/${encodeURIComponent(p.slug)}`, lastmod: p.updated_at });
  } catch {
  }
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">\n' + urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod * 1e3).toISOString().slice(0, 10)}</lastmod>` : ""}</url>`).join("\n") + "\n</urlset>\n";
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
