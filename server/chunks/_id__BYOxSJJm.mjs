globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getMediaMeta, a as getMedia } from "./site-media_DAdK9838.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const cleanId = (id) => String(id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);
const GET = async ({ params, request }) => {
  const id = cleanId(String(params.id ?? ""));
  const meta = await getMediaMeta(env, id).catch(() => null);
  if (meta?.backend === "r2" && env.MEDIA_R2) {
    const key = "media:" + id;
    const range = request.headers.get("range");
    const ctype = meta.mime || "application/octet-stream";
    const m = range && /^bytes=(\d+)-(\d*)$/.exec(range);
    if (m) {
      const offset = parseInt(m[1], 10);
      const endSpec = m[2] ? parseInt(m[2], 10) : void 0;
      const obj2 = await env.MEDIA_R2.get(key, { range: { offset, length: endSpec !== void 0 ? endSpec - offset + 1 : void 0 } }).catch(() => null);
      if (!obj2 || !obj2.body) return new Response("not found", { status: 404 });
      const total = obj2.size;
      const end = endSpec !== void 0 ? endSpec : total - 1;
      return new Response(obj2.body, { status: 206, headers: { "content-type": ctype, "accept-ranges": "bytes", "content-range": `bytes ${offset}-${end}/${total}`, "content-length": String(end - offset + 1), "cache-control": "public, max-age=86400" } });
    }
    const obj = await env.MEDIA_R2.get(key).catch(() => null);
    if (!obj || !obj.body) return new Response("not found", { status: 404 });
    return new Response(obj.body, { status: 200, headers: { "content-type": ctype, "accept-ranges": "bytes", "content-length": String(obj.size), "cache-control": "public, max-age=86400" } });
  }
  const r = await getMedia(env, id).catch(() => null);
  if (!r) return new Response("not found", { status: 404 });
  const headers = { "content-type": r.ct, "cache-control": "public, max-age=86400" };
  if (/svg/i.test(r.ct)) headers["content-security-policy"] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:";
  return new Response(r.buf, { status: 200, headers });
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
