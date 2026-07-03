globalThis.process ??= {};
globalThis.process.env ??= {};
import { getToken, hostFetch } from "./client_F4fksau0.mjs";
async function callPartner(env, to, action, args) {
  const token = await getToken(env);
  if (!token) return { ok: false, error: "ライセンス未取得" };
  try {
    const r = await hostFetch(env, "/api/a2a/relay", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, to, action, args }) });
    return await r.json().catch(() => ({ ok: false, error: "応答不正" }));
  } catch (e) {
    return { ok: false, error: "ホストへ到達できません：" + (e.message ?? "") };
  }
}
async function callPublic(env, to, action, args) {
  const token = await getToken(env);
  if (!token) return { ok: false, error: "ライセンス未取得" };
  try {
    const r = await hostFetch(env, "/api/a2a/relay-public", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, to, action, args }) });
    return await r.json().catch(() => ({ ok: false, error: "応答不正" }));
  } catch (e) {
    return { ok: false, error: "ホストへ到達できません：" + (e.message ?? "") };
  }
}
async function sendInquiry(env, to, message, args) {
  return callPublic(env, to, "__inquiry__", { message, ...{} });
}
async function establishPublicConnection(env, partner) {
  const token = await getToken(env);
  if (!token) return { ok: false, error: "ライセンス未取得" };
  try {
    const r = await hostFetch(env, "/api/a2a/connect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ _action: "establish_public", token, partner }) });
    return await r.json().catch(() => ({ ok: false, error: "応答不正" }));
  } catch (e) {
    return { ok: false, error: "ホストへ到達できません：" + (e.message ?? "") };
  }
}
async function a2aHost(env, action, body = {}) {
  const token = await getToken(env);
  if (!token) return { error: "ライセンス未取得" };
  const r = await hostFetch(env, "/api/a2a/connect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ _action: action, token, ...body }) });
  return await r.json().catch(() => ({ error: "応答不正" }));
}
async function groupHost(env, action, body = {}) {
  const token = await getToken(env);
  if (!token) return { error: "ライセンス未取得" };
  const r = await hostFetch(env, "/api/a2a/groups", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ _action: action, token, ...body }) });
  return await r.json().catch(() => ({ error: "応答不正" }));
}
async function groupRelayCall(env, groupId, to, action, args) {
  const token = await getToken(env);
  if (!token) return { ok: false, error: "ライセンス未取得" };
  try {
    const r = await hostFetch(env, "/api/a2a/broadcast", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, groupId, to: to ?? void 0, action, args }) });
    return await r.json().catch(() => ({ ok: false, error: "応答不正" }));
  } catch (e) {
    return { ok: false, error: "ホストへ到達できません：" + (e.message ?? "") };
  }
}
export {
  a2aHost,
  callPartner,
  callPublic,
  establishPublicConnection,
  groupHost,
  groupRelayCall,
  sendInquiry
};
