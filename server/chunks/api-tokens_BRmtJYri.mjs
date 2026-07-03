globalThis.process ??= {};
globalThis.process.env ??= {};
import { sha256hex } from "./sites_DMFBMYur.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
function genToken() {
  const u = new Uint8Array(24);
  crypto.getRandomValues(u);
  return "bo_" + [...u].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function createApiToken(env, appId, owner, label) {
  const token = genToken();
  const id = randomId();
  await env.DB.prepare("INSERT INTO api_tokens (id,token_hash,app_id,owner,label,created_at) VALUES (?,?,?,?,?,?)").bind(id, await sha256hex(token), appId, owner, label?.slice(0, 60) ?? null, nowSec()).run();
  return { id, token };
}
async function verifyApiToken(env, token) {
  if (!token || token.length < 8) return null;
  return await env.DB.prepare("SELECT app_id, owner FROM api_tokens WHERE token_hash=?").bind(await sha256hex(token)).first() ?? null;
}
async function listApiTokens(env, appId) {
  return (await env.DB.prepare("SELECT id,label,created_at FROM api_tokens WHERE app_id=? ORDER BY created_at DESC").bind(appId).all()).results ?? [];
}
async function revokeApiToken(env, id) {
  await env.DB.prepare("DELETE FROM api_tokens WHERE id=?").bind(id).run();
}
export {
  createApiToken as c,
  listApiTokens as l,
  revokeApiToken as r,
  verifyApiToken as v
};
