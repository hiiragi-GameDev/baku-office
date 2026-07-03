globalThis.process ??= {};
globalThis.process.env ??= {};
import { hasApiKey, validateApiKey, saveApiKey } from "./client_F4fksau0.mjs";
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const FIELDS = [
  "gemini",
  "line_secret",
  "line_token",
  "claude",
  "openai",
  "grok",
  "github_models",
  "groq",
  "cerebras",
  "notion",
  "google_client_id",
  "google_client_secret",
  "discord_app_id",
  "discord_public_key",
  "discord_bot_token",
  "discord_client_secret",
  "slack_signing_secret",
  "slack_bot_token",
  // SNS連携（投稿/閲覧/検索・BYOK）。X=OAuth2ユーザートークン、FB/IG=Graph APIトークン＋ID、YouTube=Data APIキー。
  "x_access_token",
  "facebook_page_id",
  "facebook_page_token",
  "instagram_user_id",
  "instagram_token",
  "youtube_api_key",
  "tiktok_access_token"
];
const GET = async ({ request, locals }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const status = {};
  for (const f of FIELDS) status[f] = await hasApiKey(env, f);
  return json({ status });
};
const POST = async ({ request, locals }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  const result = {};
  for (const f of FIELDS) {
    const v = b[f];
    if (v === void 0 || v === "") continue;
    const val = await validateApiKey(f, v);
    result[f] = val;
    if (val.ok) await saveApiKey(env, f, v);
  }
  return json({ ok: true, result });
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
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
