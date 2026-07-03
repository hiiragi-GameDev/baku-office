globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { notionOAuthEnabled, newNotionState, notionAuthorizeUrl } from "./notion-oauth_Cg9XxEMi.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const GET = async ({ request, url }) => {
  if (!await requireOrgAdmin(env, request)) return new Response("管理者のみ", { status: 403 });
  if (!notionOAuthEnabled(env)) return new Response("Notion OAuth が未設定です（手動トークンをご利用ください）。", { status: 400 });
  const state = newNotionState();
  const target = notionAuthorizeUrl(env, url.origin, state);
  return new Response(null, {
    status: 302,
    headers: { location: target, "set-cookie": `notion_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600` }
  });
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
