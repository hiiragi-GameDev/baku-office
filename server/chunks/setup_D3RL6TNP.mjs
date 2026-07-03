globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { saveApiKey } from "./client_F4fksau0.mjs";
import { t as cfEgressGateway } from "./ctx_D9xObGWH.mjs";
import { fetchDiscordApp, setDiscordInteractionsUrl, registerDiscordCommands, discordInviteUrl } from "./discord_MitODRRb.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  const token = (b.token ?? "").trim();
  if (!token) return json({ error: "Bot Token を入力してください。" }, 400);
  const gw = cfEgressGateway(env);
  const app = await fetchDiscordApp(gw, token);
  if (!app) return json({ error: "Bot Token が無効か、アプリ情報を取得できませんでした。Token を確認してください。" }, 400);
  await saveApiKey(env, "discord_bot_token", token);
  await saveApiKey(env, "discord_app_id", app.id);
  await saveApiKey(env, "discord_public_key", app.verifyKey);
  const interactionsUrl = `${new URL(request.url).origin}/api/inbound/discord`;
  const patched = await setDiscordInteractionsUrl(gw, token, interactionsUrl);
  const reg = await registerDiscordCommands(gw, app.id, token);
  return json({
    ok: true,
    appId: app.id,
    interactionsUrl,
    interactionsSet: patched.ok,
    interactionsDetail: patched.ok ? void 0 : patched.detail,
    commandsRegistered: reg.ok,
    commandsDetail: reg.ok ? void 0 : reg.detail,
    inviteUrl: discordInviteUrl(app.id),
    inviteUrlNoCreate: discordInviteUrl(app.id, { manageChannels: false })
  });
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
