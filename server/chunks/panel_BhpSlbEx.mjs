globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { getApiKey } from "./client_F4fksau0.mjs";
import { t as cfEgressGateway } from "./ctx_D9xObGWH.mjs";
import { listDiscordChannels, listDiscordGuilds, createDiscordChannel, postAskPanel } from "./discord_MitODRRb.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const PANEL_CHANNEL_NAME = "baku-office";
const GET = async ({ request, url }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const botToken = await getApiKey(env, "discord_bot_token");
  if (!botToken) return json({ error: "先に Discord 連携設定（自動セットアップ）を行ってください。" }, 400);
  const gw = cfEgressGateway(env);
  const guildId = url.searchParams.get("guild");
  if (guildId) return json({ channels: await listDiscordChannels(gw, botToken, guildId) });
  return json({ guilds: await listDiscordGuilds(gw, botToken) });
};
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  const botToken = await getApiKey(env, "discord_bot_token");
  if (!botToken) return json({ error: "先に Discord 連携設定を行ってください。" }, 400);
  const gw = cfEgressGateway(env);
  let channelId = (b.channelId ?? "").trim();
  let createdChannel = false;
  if (!channelId && b.createChannel && b.guildId) {
    const existing = (await listDiscordChannels(gw, botToken, b.guildId)).find((c) => c.name === PANEL_CHANNEL_NAME);
    if (existing) {
      channelId = existing.id;
    } else {
      const ch = await createDiscordChannel(gw, botToken, b.guildId, PANEL_CHANNEL_NAME);
      if (!ch) return json({ ok: false, error: "チャンネルの作成に失敗しました。bot に『チャンネルの管理』権限があるか確認してください（招待リンクで権限ごと追加し直すと確実です）。" }, 502);
      channelId = ch.id;
      createdChannel = true;
    }
  }
  if (!channelId) return json({ error: "チャンネルを選択してください。" }, 400);
  const r = await postAskPanel(gw, botToken, channelId);
  if (!r.ok) return json({ ok: false, error: `パネル設置に失敗しました (${r.status})。bot にチャンネルの閲覧・メッセージ送信権限があるか確認してください。` }, 502);
  return json({ ok: true, pinned: r.pinned, channelId, createdChannel });
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
