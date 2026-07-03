globalThis.process ??= {};
globalThis.process.env ??= {};
import { getApiKey, saveApiKey } from "./client_F4fksau0.mjs";
import { kvPut } from "./kv_JIFmI05h.mjs";
const PRIVATE_JWK = "oidc_private_jwk";
const PUBLIC_JWK = "oidc_public_jwk";
const ALG = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
const enc = new TextEncoder();
const b64url = (buf) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64urlStr = (s) => b64url(enc.encode(s));
async function jwkThumbprint(pub) {
  const canon = JSON.stringify({ e: pub.e, kty: pub.kty, n: pub.n });
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(canon));
  return b64url(digest);
}
async function ensureOidcKey(env) {
  const storedPriv = await getApiKey(env, PRIVATE_JWK);
  const storedPub = await env.LICENSE.get(PUBLIC_JWK);
  if (storedPriv && storedPub) {
    const privJwk2 = JSON.parse(storedPriv);
    const publicJwk2 = JSON.parse(storedPub);
    const key2 = await crypto.subtle.importKey("jwk", privJwk2, ALG, false, ["sign"]);
    return { key: key2, kid: publicJwk2.kid, publicJwk: publicJwk2 };
  }
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );
  const privJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const pubExport = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const kid = await jwkThumbprint(pubExport);
  const publicJwk = { kty: pubExport.kty, n: pubExport.n, e: pubExport.e, alg: "RS256", use: "sig", kid };
  await saveApiKey(env, PRIVATE_JWK, JSON.stringify(privJwk));
  await kvPut(env, PUBLIC_JWK, JSON.stringify(publicJwk));
  const key = await crypto.subtle.importKey("jwk", privJwk, ALG, false, ["sign"]);
  return { key, kid, publicJwk };
}
async function oidcJwks(env) {
  const { publicJwk } = await ensureOidcKey(env);
  return { keys: [publicJwk] };
}
function openidConfiguration(issuer) {
  const iss = issuer.replace(/\/$/, "");
  return {
    issuer: iss,
    jwks_uri: `${iss}/.well-known/jwks.json`,
    authorization_endpoint: `${iss}/api/google/start`,
    // 形式上の必須項目（本IdPは認可フローを提供しない）
    response_types_supported: ["id_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"]
  };
}
async function signOidcJwt(env, claims) {
  const { key, kid } = await ensureOidcKey(env);
  const header = b64urlStr(JSON.stringify({ alg: "RS256", typ: "JWT", kid }));
  const payload = b64urlStr(JSON.stringify(claims));
  const data = `${header}.${payload}`;
  const sig = await crypto.subtle.sign(ALG.name, key, enc.encode(data));
  return `${data}.${b64url(sig)}`;
}
export {
  openidConfiguration as a,
  ensureOidcKey as e,
  oidcJwks as o,
  signOidcJwt as s
};
