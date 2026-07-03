globalThis.process ??= {};
globalThis.process.env ??= {};
const prerender = false;
const GET = () => new Response(null, { status: 302, headers: { location: "/favicon.svg", "cache-control": "public, max-age=86400" } });
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
