globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";
import { kvPut } from "./kv_JIFmI05h.mjs";
const prerender = false;
const GIF = Uint8Array.from([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 255, 255, 255, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59]);
const PIXEL = () => new Response(GIF, { headers: { "content-type": "image/gif", "cache-control": "no-store, max-age=0" } });
const PV_DAILY_CAP = 2e3;
const GET = async ({ url, request }) => {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return PIXEL();
  const raw = url.searchParams.get("p") ?? "/";
  let path = "/";
  try {
    path = decodeURIComponent(raw).split("?")[0].split("#")[0].slice(0, 300) || "/";
  } catch {
    path = "/";
  }
  if (!path.startsWith("/") || path.startsWith("/api/") || path.startsWith("/settings")) path = "/";
  const day = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const rlKey = `pvrl:${day}:${ip}`;
  try {
    const cur = Number(await env.LICENSE.get(rlKey) ?? "0");
    if (cur >= PV_DAILY_CAP) return PIXEL();
    await kvPut(env, rlKey, String(cur + 1), { expirationTtl: 86400 });
  } catch {
  }
  try {
    await env.DB.prepare("INSERT INTO pageviews (day,path,count) VALUES (?,?,1) ON CONFLICT(day,path) DO UPDATE SET count=count+1").bind(day, path).run();
  } catch {
  }
  return PIXEL();
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
