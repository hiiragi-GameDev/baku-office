globalThis.process ??= {};
globalThis.process.env ??= {};
import { AppError, INFRA } from "./errors_Cz86HmdL.mjs";
const deny = (perm, op) => {
  throw new AppError(INFRA.CAPABILITY, `このアプリは「${perm}」権限を宣言していないため、${op} を実行できません。アプリのマニフェスト（permissions）に追加してください。`, 403);
};
function gate(allowed, fn, self, perm, op) {
  return allowed && typeof fn === "function" ? fn.bind(self) : ((..._a) => deny(perm, op));
}
function gatePort(allowed, port, perm, name) {
  if (allowed && port) return port;
  return new Proxy({}, { get: (_t, prop) => () => deny(perm, `${name}.${String(prop)}`) });
}
function scopeCtx(ctx, permissions = []) {
  const has = (p) => permissions.includes(p);
  const s = ctx.storage;
  const r = has("storage:read");
  const w = has("storage:write");
  const db = {
    all: gate(has("db:read"), ctx.db?.all, ctx.db, "db:read", "db.all"),
    first: gate(has("db:read"), ctx.db?.first, ctx.db, "db:read", "db.first"),
    run: gate(has("db:write"), ctx.db?.run, ctx.db, "db:write", "db.run"),
    batch: gate(has("db:write"), ctx.db?.batch, ctx.db, "db:write", "db.batch")
  };
  const storage = {
    kv: {
      get: gate(r, s?.kv?.get, s?.kv, "storage:read", "kv.get"),
      list: gate(r, s?.kv?.list, s?.kv, "storage:read", "kv.list"),
      put: gate(w, s?.kv?.put, s?.kv, "storage:write", "kv.put"),
      delete: gate(w, s?.kv?.delete, s?.kv, "storage:write", "kv.delete")
    },
    mode: typeof s?.mode === "function" ? s.mode.bind(s) : (() => "kv"),
    // 保存方式の判定のみ＝無害。
    getFile: gate(r, s?.getFile, s, "storage:read", "getFile"),
    ownsFile: gate(r, s?.ownsFile, s, "storage:read", "ownsFile"),
    saveFile: gate(w, s?.saveFile, s, "storage:write", "saveFile")
  };
  return {
    profile: ctx.profile,
    db,
    storage,
    ai: gatePort(has("ai"), ctx.ai, "ai", "ai"),
    agent: gatePort(has("agent"), ctx.agent, "agent", "agent"),
    google: gatePort(has("net"), ctx.google, "net", "google"),
    notify: gatePort(has("notify"), ctx.notify, "notify", "notify"),
    messaging: gatePort(has("net"), ctx.messaging, "net", "messaging"),
    knowledge: gatePort(has("knowledge"), ctx.knowledge, "knowledge", "knowledge"),
    egress: gatePort(has("net"), ctx.egress, "net", "egress"),
    identity: gatePort(has("members:read"), ctx.identity, "members:read", "identity"),
    apps: ctx.apps
    // アプリ間連動は呼び出し時に target の requiredPermission を別途検査する。
  };
}
function scopedWidgets(parts2) {
  return parts2.flatMap((p) => (p.widgets ?? []).map((wdg) => ({
    ...wdg,
    run: (ctx, owner) => wdg.run(scopeCtx(ctx, p.permissions), owner)
  })));
}
const REGISTRY = /* @__PURE__ */ new Map();
function registerPart(p) {
  if (!REGISTRY.has(p.id)) REGISTRY.set(p.id, p);
}
function registeredParts() {
  return [...REGISTRY.values()];
}
function partOfTool(name) {
  return registeredParts().find((p) => (p.agentTools ?? []).some((t) => t.name === name));
}
function partCatalog() {
  return registeredParts().map((p) => ({ id: p.id, name: p.name, version: p.version }));
}
function enabledParts(enabledIds) {
  const all = registeredParts();
  return enabledIds ? all.filter((p) => enabledIds.includes(p.id)) : all;
}
function toolsOf(parts2) {
  return parts2.flatMap((p) => p.agentTools ?? []);
}
const KV_ENABLED_PARTS = "enabled_parts";
async function enabledPartIds(ctx) {
  const raw = await ctx.storage.kv.get(KV_ENABLED_PARTS);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : null;
  } catch {
    return null;
  }
}
async function setEnabledPartIds(ctx, ids) {
  const known = new Set(registeredParts().map((p) => p.id));
  const clean = [...new Set(ids.map(String))].filter((id) => known.has(id));
  await ctx.storage.kv.put(KV_ENABLED_PARTS, JSON.stringify(clean));
  return clean;
}
const parts = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  enabledPartIds,
  enabledParts,
  partCatalog,
  partOfTool,
  registerPart,
  registeredParts,
  scopedWidgets,
  setEnabledPartIds,
  toolsOf
}, Symbol.toStringTag, { value: "Module" }));
export {
  scopeCtx as a,
  registerPart as b,
  enabledParts as c,
  partOfTool as d,
  enabledPartIds as e,
  parts as f,
  partCatalog as p,
  registeredParts as r,
  setEnabledPartIds as s,
  toolsOf as t
};
