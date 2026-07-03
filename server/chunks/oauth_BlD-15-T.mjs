globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
function conf(env, p) {
  switch (p) {
    case "google":
      return { id: env.GOOGLE_CLIENT_ID, secret: env.GOOGLE_CLIENT_SECRET, authUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", scope: "openid email profile" };
    case "line":
      return { id: env.LINE_LOGIN_CHANNEL_ID, secret: env.LINE_LOGIN_CHANNEL_SECRET, authUrl: "https://access.line.me/oauth2/v2.1/authorize", tokenUrl: "https://api.line.me/oauth2/v2.1/token", scope: "profile openid" };
    case "discord":
      return { id: env.DISCORD_CLIENT_ID, secret: env.DISCORD_CLIENT_SECRET, authUrl: "https://discord.com/oauth2/authorize", tokenUrl: "https://discord.com/api/oauth2/token", scope: "identify" };
    case "slack":
      return { id: env.SLACK_CLIENT_ID, secret: env.SLACK_CLIENT_SECRET, authUrl: "https://slack.com/openid/connect/authorize", tokenUrl: "https://slack.com/api/openid.connect.token", scope: "openid profile" };
  }
}
function providerEnabled(env, p) {
  const c = conf(env, p);
  return !!(c.id && c.secret);
}
function redirectUri(origin, p) {
  return `${origin}/api/auth/${p}/callback`;
}
function authorizeUrl(env, p, origin, state) {
  const c = conf(env, p);
  if (!c.id || !c.secret) return null;
  const u = new URL(c.authUrl);
  u.searchParams.set("client_id", c.id);
  u.searchParams.set("redirect_uri", redirectUri(origin, p));
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", c.scope);
  u.searchParams.set("state", state);
  if (p === "google") u.searchParams.set("access_type", "online");
  return u.toString();
}
async function exchange(env, p, code, origin) {
  const c = conf(env, p);
  if (!c.id || !c.secret) return null;
  const tr = await fetch(c.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri(origin, p), client_id: c.id, client_secret: c.secret })
  });
  if (!tr.ok) {
    console.log(`[oauth-${p}-token]`, tr.status, (await tr.text()).slice(0, 200));
    return null;
  }
  const tok = await tr.json();
  if (!tok.access_token) return null;
  if (p === "google") {
    const r2 = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${tok.access_token}` } });
    if (!r2.ok) return null;
    const u2 = await r2.json();
    return { externalId: u2.sub, name: u2.name ?? u2.email ?? "", email: u2.email };
  }
  if (p === "line") {
    const r2 = await fetch("https://api.line.me/v2/profile", { headers: { authorization: `Bearer ${tok.access_token}` } });
    if (!r2.ok) return null;
    const u2 = await r2.json();
    return { externalId: u2.userId, name: u2.displayName ?? "" };
  }
  if (p === "slack") {
    const r2 = await fetch("https://slack.com/api/openid.connect.userInfo", { headers: { authorization: `Bearer ${tok.access_token}` } });
    if (!r2.ok) return null;
    const u2 = await r2.json();
    const uid = u2["https://slack.com/user_id"];
    if (!uid) return null;
    return { externalId: uid, name: u2.name ?? "" };
  }
  const r = await fetch("https://discord.com/api/users/@me", { headers: { authorization: `Bearer ${tok.access_token}` } });
  if (!r.ok) return null;
  const u = await r.json();
  return { externalId: u.id, name: u.username ?? "" };
}
const newState = () => randomId(12);
export {
  authorizeUrl,
  exchange,
  newState,
  providerEnabled,
  redirectUri
};
