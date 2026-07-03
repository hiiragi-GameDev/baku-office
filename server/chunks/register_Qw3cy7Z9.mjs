globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { getApiKey } from "./client_F4fksau0.mjs";
import { t as cfEgressGateway } from "./ctx_D9xObGWH.mjs";
import { registerDiscordCommands } from "./discord_MitODRRb.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const appId = await getApiKey(env, "discord_app_id");
  const botToken = await getApiKey(env, "discord_bot_token");
  if (!appId || !botToken) return json({ error: "discord_app_id と discord_bot_token を先に連携設定で保存してください。" }, 400);
  const r = await registerDiscordCommands(cfEgressGateway(env), appId, botToken);
  if (!r.ok) return json({ ok: false, error: `Discord 登録に失敗しました (${r.status})`, detail: r.detail }, 502);
  return json({ ok: true, message: "コマンドを登録しました（/ask・メッセージコマンド）。" });
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
