globalThis.process ??= {};
globalThis.process.env ??= {};
import { a as openidConfiguration } from "./oidc-idp_7nfWEyN-.mjs";
const prerender = false;
const GET = async ({ url }) => {
  const body = JSON.stringify(openidConfiguration(url.origin));
  return new Response(body, {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" }
  });
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
