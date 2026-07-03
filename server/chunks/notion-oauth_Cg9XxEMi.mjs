globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
const AUTHORIZE = "https://api.notion.com/v1/oauth/authorize";
const TOKEN = "https://api.notion.com/v1/oauth/token";
function notionOAuthEnabled(env) {
  return !!(env.NOTION_CLIENT_ID && env.NOTION_CLIENT_SECRET);
}
function notionRedirectUri(origin) {
  return `${origin}/api/notion/oauth/callback`;
}
const newNotionState = () => randomId(12);
function notionAuthorizeUrl(env, origin, state) {
  if (!env.NOTION_CLIENT_ID) return null;
  const u = new URL(AUTHORIZE);
  u.searchParams.set("client_id", env.NOTION_CLIENT_ID);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("owner", "user");
  u.searchParams.set("redirect_uri", notionRedirectUri(origin));
  u.searchParams.set("state", state);
  return u.toString();
}
async function exchangeNotionCode(env, code, origin) {
  if (!env.NOTION_CLIENT_ID || !env.NOTION_CLIENT_SECRET) return null;
  const basic = btoa(`${env.NOTION_CLIENT_ID}:${env.NOTION_CLIENT_SECRET}`);
  const r = await fetch(TOKEN, {
    method: "POST",
    headers: { authorization: `Basic ${basic}`, "content-type": "application/json" },
    body: JSON.stringify({ grant_type: "authorization_code", code, redirect_uri: notionRedirectUri(origin) })
  });
  if (!r.ok) {
    console.log("[notion-oauth-token]", r.status, (await r.text()).slice(0, 200));
    return null;
  }
  const tok = await r.json();
  return tok.access_token ?? null;
}
export {
  exchangeNotionCode,
  newNotionState,
  notionAuthorizeUrl,
  notionOAuthEnabled,
  notionRedirectUri
};
