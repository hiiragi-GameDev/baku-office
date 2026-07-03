globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { getApiKey } from "./client_F4fksau0.mjs";
import { discordLinkAuthorizeUrl } from "./discord_MitODRRb.mjs";
import { newState } from "./oauth_BlD-15-T.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const REDIRECT_PATH = "/api/discord/link/callback";
const GET = async ({ request, url }) => {
  if (!await requireOrgAdmin(env, request)) return new Response("管理者のみ", { status: 403 });
  const appId = await getApiKey(env, "discord_app_id");
  const clientSecret = await getApiKey(env, "discord_client_secret");
  if (!appId || !clientSecret) {
    return new Response("先に Discord 連携設定で App ID と OAuth2 Client Secret を保存してください。", { status: 400 });
  }
  const state = newState();
  const target = discordLinkAuthorizeUrl(appId, url.origin + REDIRECT_PATH, state);
  return new Response(null, {
    status: 302,
    headers: { location: target, "set-cookie": `dc_link_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600` }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  REDIRECT_PATH,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
export {
  REDIRECT_PATH as R,
  _page as _
};
