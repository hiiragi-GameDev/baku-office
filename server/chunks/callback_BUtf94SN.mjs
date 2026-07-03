globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { getApiKey } from "./client_F4fksau0.mjs";
import { t as cfEgressGateway } from "./ctx_D9xObGWH.mjs";
import { discordOAuthUserId } from "./discord_MitODRRb.mjs";
import { linkIdentity } from "./users_DArBIlQW.mjs";
import { env } from "cloudflare:workers";
import { R as REDIRECT_PATH } from "./start_BCD3NPW_.mjs";
const prerender = false;
const redir = (loc) => new Response(null, { status: 302, headers: { location: loc, "set-cookie": "dc_link_state=; Path=/; Max-Age=0" } });
const GET = async ({ request, url }) => {
  const ses = await requireOrgAdmin(env, request);
  if (!ses) return new Response("管理者のみ", { status: 403 });
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = /dc_link_state=([^;]+)/.exec(request.headers.get("cookie") ?? "")?.[1];
  if (!code || !state || state !== cookieState) return redir("/settings/messaging?dc_link=state");
  const appId = await getApiKey(env, "discord_app_id");
  const clientSecret = await getApiKey(env, "discord_client_secret");
  if (!appId || !clientSecret) return redir("/settings/messaging?dc_link=config");
  const u = await discordOAuthUserId(cfEgressGateway(env), appId, clientSecret, code, url.origin + REDIRECT_PATH);
  if (!u) return redir("/settings/messaging?dc_link=oauth");
  const r = await linkIdentity(env, ses.uid, "discord", u.id);
  return redir(`/settings/messaging?dc_link=${r.ok ? "ok" : "dup"}`);
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
