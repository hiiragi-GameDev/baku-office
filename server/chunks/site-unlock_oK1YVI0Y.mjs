globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";
import { getSite, verifyPassword, makeUnlockCookie } from "./sites_DMFBMYur.mjs";
import { rateLimited } from "./public-pages_DHQdIiIX.mjs";
const prerender = false;
const POST = async ({ request }) => {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const form = await request.formData().catch(() => null);
  const slug = String(form?.get("slug") ?? "").slice(0, 60);
  const password = String(form?.get("password") ?? "");
  const dest = slug === "home" ? "/site" : `/lp/${encodeURIComponent(slug)}`;
  if (await rateLimited(env, ip)) return new Response(null, { status: 303, headers: { location: dest + "?e=1" } });
  const site = await getSite(env, slug);
  if (!site || !site.password) return new Response(null, { status: 303, headers: { location: dest } });
  if (!await verifyPassword(password, site.password)) return new Response(null, { status: 303, headers: { location: dest + "?e=1" } });
  const headers = new Headers({ location: dest });
  headers.append("set-cookie", await makeUnlockCookie(env, slug, site.password));
  return new Response(null, { status: 303, headers });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
