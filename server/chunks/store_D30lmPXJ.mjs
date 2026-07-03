globalThis.process ??= {};
globalThis.process.env ??= {};
import { getToken, hostFetch } from "./client_F4fksau0.mjs";
async function call(env, body) {
  const token = await getToken(env);
  if (!token) return { error: "ライセンス未取得" };
  try {
    const r = await hostFetch(env, "/api/registry/store", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, ...body }) });
    return await r.json().catch(() => ({ error: "応答不正" }));
  } catch (e) {
    return { error: "ホストへ到達できません：" + (e.message ?? "") };
  }
}
async function storeCatalog(env) {
  const r = await call(env, { _action: "catalog" });
  return r.apps ?? [];
}
async function myApps(env) {
  const r = await call(env, { _action: "mine" });
  return r.apps ?? [];
}
async function setAllowFork(env, appId, allow) {
  return call(env, { _action: "set_allow_fork", appId, allow });
}
async function requestStoreRemoval(env, appId, reason) {
  return call(env, { _action: "remove_request", appId, reason });
}
async function setListed(env, appId, listed, minEntitlement) {
  return call(env, { _action: "set_listed", appId, listed, minEntitlement });
}
async function rateApp(env, appId, rating, body) {
  return call(env, { _action: "rate", appId, rating, body });
}
async function listReviews(env, appId) {
  const r = await call(env, { _action: "reviews", appId });
  return r.reviews ?? [];
}
export {
  listReviews,
  myApps,
  rateApp,
  requestStoreRemoval,
  setAllowFork,
  setListed,
  storeCatalog
};
