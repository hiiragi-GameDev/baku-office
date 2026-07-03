globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";
import { r as rateLimited } from "./rate-limit_B3Jlq_2x.mjs";
import { sha256hex } from "./sites_DMFBMYur.mjs";
import { i as inferApp } from "./ctx_D9xObGWH.mjs";
import { kvPut } from "./kv_JIFmI05h.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const LANG_NAME = { en: "English", zh: "中文（簡体字）", ko: "한국어", ja: "日本語", fr: "Français", es: "Español" };
const POST = async ({ request }) => {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const b = await request.json().catch(() => ({}));
  const text = String(b.text ?? "").slice(0, 8e3).trim();
  const lang = String(b.lang ?? "").toLowerCase();
  if (!text || !LANG_NAME[lang]) return json({ error: "text と対応言語(lang) が必要です" }, 400);
  const key = "tr:" + (await sha256hex(lang + ":" + text)).slice(0, 40);
  const cached = await env.LICENSE.get(key);
  if (cached) return json({ ok: true, text: cached, cached: true });
  if (await rateLimited(env, `translate:${ip}`, 30, 3600)) return json({ error: "rate limited" }, 429);
  const out = await inferApp(env, `次のテキストを ${LANG_NAME[lang]} に翻訳してください。訳文だけを出力（注釈・前置きなし）。

${text}`, { maxTokens: 2e3, feature: "translate" });
  if (!out) return json({ error: "翻訳できませんでした（AI連携が必要です）。" }, 400);
  await kvPut(env, key, out, { expirationTtl: 30 * 86400 }).catch(() => void 0);
  return json({ ok: true, text: out });
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
