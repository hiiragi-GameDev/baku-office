globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { kvPut } from "./kv_JIFmI05h.mjs";
import { getTheme, setTheme } from "./theme_DFty9gzU.mjs";
import { nowSec } from "./client_F4fksau0.mjs";
import { env } from "cloudflare:workers";
const KEY = "logo_image";
async function getLogo(env2) {
  const r = await env2.LICENSE.getWithMetadata(KEY, { type: "arrayBuffer" });
  if (!r.value) return null;
  return { buf: r.value, ct: r.metadata?.ct || "image/png" };
}
async function storeLogo(env2, buf, ct) {
  await kvPut(env2, KEY, buf, { metadata: { ct } });
}
async function clearLogo(env2) {
  await env2.LICENSE.delete(KEY);
}
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const MAX = 3 * 1024 * 1024;
const b64ToBuf = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
const GET = async () => {
  const m = await getLogo(env).catch(() => null);
  if (!m) return new Response("not found", { status: 404 });
  return new Response(m.buf, { status: 200, headers: { "content-type": m.ct, "cache-control": "public, max-age=600" } });
};
const POST = async ({ request, locals }) => {
  const ctx = locals.ctx;
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "権限がありません（管理者のみ）" }, 403);
  const b = await request.json().catch(() => ({}));
  switch (b._action) {
    case "reset": {
      await clearLogo(env);
      const { logoUrl: _drop, ...rest } = await getTheme(ctx);
      await setTheme(ctx, rest);
      return json({ ok: true, logoUrl: "" });
    }
    case "upload": {
      const mime = String(b.mime || "");
      if (!/^image\/(png|jpeg|webp|gif)$/.test(mime)) return json({ error: "画像（PNG/JPEG/WebP/GIF）のみ対応" }, 400);
      let buf;
      try {
        buf = b64ToBuf(b.dataB64 || "");
      } catch {
        return json({ error: "画像データが不正です" }, 400);
      }
      if (buf.byteLength === 0) return json({ error: "画像が空です" }, 400);
      if (buf.byteLength > MAX) return json({ error: "画像が大きすぎます（3MBまで）" }, 400);
      await storeLogo(env, buf, mime);
      const t = await getTheme(ctx);
      const logoUrl = "/api/logo?v=" + nowSec();
      await setTheme(ctx, { ...t, logoUrl });
      return json({ ok: true, logoUrl });
    }
    default:
      return json({ error: "不明な操作" }, 400);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
