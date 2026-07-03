globalThis.process ??= {};
globalThis.process.env ??= {};
const prerender = false;
const GET = async ({ url }) => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /settings",
    "Disallow: /api/",
    "Disallow: /admin",
    "Disallow: /activate",
    `Sitemap: ${url.origin}/sitemap.xml`,
    ""
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
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
