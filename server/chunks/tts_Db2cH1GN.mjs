globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { synthesizeSpeechBytes } from "./capabilities_DGQUed42.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses) return new Response(JSON.stringify({ error: "ログインが必要です" }), { status: 401, headers: { "content-type": "application/json" } });
  const body = await request.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return new Response(JSON.stringify({ error: "text 必須" }), { status: 400, headers: { "content-type": "application/json" } });
  const voice = typeof body.voice === "string" && body.voice ? body.voice : void 0;
  const out = await synthesizeSpeechBytes(env, text, voice);
  if (!out) return new Response(JSON.stringify({ error: "クラウドTTS未設定です（設定→高度なオプションで音声合成を追加）" }), { status: 400, headers: { "content-type": "application/json" } });
  return new Response(out.buf, { headers: { "content-type": out.mime, "cache-control": "no-store" } });
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
