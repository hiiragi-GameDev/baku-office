globalThis.process ??= {};
globalThis.process.env ??= {};
import { getApiKey, saveApiKey } from "./client_F4fksau0.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
function b64urlFromBytes(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlFromJwkCoord(c) {
  const b64 = c.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((c.length + 3) % 4);
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
async function getVapidKeys(env) {
  const raw = await getApiKey(env, "vapid_keys");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
    }
  }
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const publicJwk = await crypto.subtle.exportKey("jwk", kp.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  const keys = { publicJwk, privateJwk };
  await saveApiKey(env, "vapid_keys", JSON.stringify(keys));
  return keys;
}
async function vapidPublicKey(env) {
  const { publicJwk } = await getVapidKeys(env);
  const x = b64urlFromJwkCoord(publicJwk.x ?? "");
  const y = b64urlFromJwkCoord(publicJwk.y ?? "");
  const raw = new Uint8Array(65);
  raw[0] = 4;
  raw.set(x, 1);
  raw.set(y, 33);
  return b64urlFromBytes(raw);
}
async function vapidJwt(env, audience) {
  const { privateJwk } = await getVapidKeys(env);
  const enc = new TextEncoder();
  const header = b64urlFromBytes(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64urlFromBytes(enc.encode(JSON.stringify({ aud: audience, exp: nowSec() + 12 * 3600, sub: "mailto:admin@baku-office" })));
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey("jwk", privateJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(data));
  return `${data}.${b64urlFromBytes(new Uint8Array(sig))}`;
}
async function saveSubscription(env, owner, sub) {
  if (!sub?.endpoint) return;
  await env.DB.prepare(
    "INSERT INTO push_subscriptions (id,owner,endpoint,p256dh,auth,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET owner=excluded.owner"
  ).bind(randomId(), owner, sub.endpoint, sub.keys?.p256dh ?? null, sub.keys?.auth ?? null, nowSec()).run();
}
async function pushToUser(env, owner) {
  const { results } = await env.DB.prepare("SELECT endpoint FROM push_subscriptions WHERE owner=? LIMIT 50").bind(owner).all();
  if (!results?.length) return;
  const pub = await vapidPublicKey(env);
  for (const s of results) {
    try {
      const jwt = await vapidJwt(env, new URL(s.endpoint).origin);
      const r = await fetch(s.endpoint, { method: "POST", headers: { Authorization: `vapid t=${jwt}, k=${pub}`, TTL: "60" } });
      if (r.status === 404 || r.status === 410) {
        await env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint=?").bind(s.endpoint).run();
      }
    } catch {
    }
  }
}
export {
  pushToUser as p,
  saveSubscription as s,
  vapidPublicKey as v
};
