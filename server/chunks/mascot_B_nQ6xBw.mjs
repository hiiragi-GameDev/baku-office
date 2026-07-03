globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { kvPut } from "./kv_JIFmI05h.mjs";
import { getTheme, setTheme } from "./theme_DFty9gzU.mjs";
import { nowSec } from "./client_F4fksau0.mjs";
import { logDiag } from "./diag_CY3PJnOM.mjs";
import { env } from "cloudflare:workers";
const KEY = "mascot_image";
async function getMascot(env2) {
  const r = await env2.LICENSE.getWithMetadata(KEY, { type: "arrayBuffer" });
  if (!r.value) return null;
  return { buf: r.value, ct: r.metadata?.ct || "image/png" };
}
async function storeMascot(env2, buf, ct) {
  await kvPut(env2, KEY, buf, { metadata: { ct } });
}
async function clearMascot(env2) {
  await env2.LICENSE.delete(KEY);
}
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const MAX = 3 * 1024 * 1024;
const b64ToBuf = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
const GET = async ({ locals }) => {
  const m = await getMascot(env).catch(() => null);
  if (!m) return new Response("not found", { status: 404 });
  return new Response(m.buf, { status: 200, headers: { "content-type": m.ct, "cache-control": "public, max-age=600" } });
};
const POST = async ({ request, locals }) => {
  const ctx = locals.ctx;
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "権限がありません（管理者のみ）" }, 403);
  const b = await request.json().catch(() => ({}));
  const setUrl = async () => {
    const t = await getTheme(ctx);
    await setTheme(ctx, { ...t, mascotUrl: "/api/mascot?v=" + nowSec() });
    return "/api/mascot?v=" + nowSec();
  };
  switch (b._action) {
    case "reset": {
      await clearMascot(env);
      const { mascotUrl: _drop, ...rest } = await getTheme(ctx);
      await setTheme(ctx, rest);
      return json({ ok: true, mascotUrl: "" });
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
      await storeMascot(env, buf, mime);
      return json({ ok: true, mascotUrl: await setUrl() });
    }
    case "generate": {
      if (!env.AI) return json({ error: "この環境では画像生成（Workers AI）が利用できません" }, 400);
      const p = String(b.prompt || "").trim();
      if (!p) return json({ error: "どんなキャラクターにするか説明を入力してください" }, 400);
      const prompt = `${p}. cute mascot character, single subject, centered, simple flat illustration, soft solid pastel background, friendly, clean, high quality`;
      try {
        const out = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", { prompt, steps: 6 });
        if (!out?.image) return json({ error: "生成に失敗しました。説明を変えて再試行してください。" }, 502);
        await storeMascot(env, b64ToBuf(out.image), "image/jpeg");
        return json({ ok: true, mascotUrl: await setUrl() });
      } catch (e) {
        await logDiag(env, "error", "mascot", `generate: ${e.message}`);
        return json({ error: "画像生成に失敗しました：" + e.message }, 500);
      }
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
