globalThis.process ??= {};
globalThis.process.env ??= {};
import { o as oidcJwks } from "./oidc-idp_7nfWEyN-.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const GET = async () => {
  const body = JSON.stringify(await oidcJwks(env));
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
