globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { saveApiKey } from "./client_F4fksau0.mjs";
import { notionOAuthEnabled, exchangeNotionCode } from "./notion-oauth_Cg9XxEMi.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const redir = (loc) => new Response(null, { status: 302, headers: { location: loc, "set-cookie": "notion_oauth_state=; Path=/; Max-Age=0" } });
const GET = async ({ request, url }) => {
  if (!await requireOrgAdmin(env, request)) return new Response("管理者のみ", { status: 403 });
  if (!notionOAuthEnabled(env)) return redir("/settings/keys?notion=config");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = /notion_oauth_state=([^;]+)/.exec(request.headers.get("cookie") ?? "")?.[1];
  if (!code || !state || state !== cookieState) return redir("/settings/keys?notion=state");
  const token = await exchangeNotionCode(env, code, url.origin);
  if (!token) return redir("/settings/keys?notion=oauth");
  await saveApiKey(env, "notion", token);
  return redir("/settings/keys?notion=ok");
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
