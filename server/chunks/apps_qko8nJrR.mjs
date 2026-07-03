globalThis.process ??= {};
globalThis.process.env ??= {};
import { e as enabledPartIds, r as registeredParts, s as setEnabledPartIds, a as scopeCtx } from "./parts_BnninK9G.mjs";
import { disabledBuiltins } from "./client_F4fksau0.mjs";
const PERMISSIONS = [
  { id: "db:read", label: "データの読取（一覧・検索）" },
  { id: "db:write", label: "データの書込（登録・更新）", privileged: true },
  { id: "storage:read", label: "ファイル/KVの読取（アップロードされたファイルの読み込み等）" },
  { id: "storage:write", label: "ファイル/KVの書込（生成ファイルの保存等）", privileged: true },
  { id: "ai", label: "AI推論（要約・生成・分類）" },
  { id: "agent", label: "エージェント実行（自律処理・他ツール連携）" },
  { id: "members:read", label: "メンバー・名簿の参照", privileged: true },
  { id: "net", label: "外部送信（Gmail/カレンダー連携・外部送信。将来 allowlist 必須）", privileged: true },
  { id: "notify", label: "通知・メール送信（アプリ内通知／組織のGmailからメール送信）", privileged: true },
  { id: "knowledge", label: "組織ナレッジの検索（社内文書を根拠にAIが回答・RAG）", privileged: true }
];
const ALLOWED_PERMISSIONS = new Set(PERMISSIONS.map((p) => p.id));
const PRIVILEGED_PERMISSIONS = new Set(PERMISSIONS.filter((p) => "privileged" in p && p.privileged).map((p) => p.id));
const permissionCatalogText = () => PERMISSIONS.map((p) => `${p.id}（${p.label}）`).join("、");
function appCatalog() {
  return registeredParts().map((p) => ({
    id: p.id,
    name: p.name,
    version: p.version,
    description: p.description,
    category: p.category,
    minPlan: p.minPlan,
    permissions: p.permissions ?? [],
    actions: (p.actions ?? []).map((a) => a.name)
  }));
}
const MANDATORY_APPS = ["chat"];
const DEFAULT_APPS = ["chat", "members", "accounting", "knowledge", "reminders", "memo"];
function defaultAppIds(known) {
  return DEFAULT_APPS.filter((id) => known.has(id));
}
async function installedAppIds(ctx) {
  const known = new Set(registeredParts().map((p) => p.id));
  const stored = await enabledPartIds(ctx);
  const ids = stored ?? defaultAppIds(known);
  for (const m of MANDATORY_APPS) if (known.has(m) && !ids.includes(m)) ids.push(m);
  const disabled = new Set((await disabledBuiltins(ctx.env)).filter((id) => !MANDATORY_APPS.includes(id)));
  return ids.filter((id) => known.has(id) && !disabled.has(id));
}
async function installApp(ctx, id) {
  const base = await enabledPartIds(ctx) ?? defaultAppIds(new Set(registeredParts().map((p) => p.id)));
  return setEnabledPartIds(ctx, base.includes(id) ? base : [...base, id]);
}
async function uninstallApp(ctx, id) {
  if (MANDATORY_APPS.includes(id)) throw new Error("このアプリは必須のため削除できません。");
  const base = await enabledPartIds(ctx) ?? defaultAppIds(new Set(registeredParts().map((p) => p.id)));
  return setEnabledPartIds(ctx, base.filter((x) => x !== id));
}
function makeAppsApi(ctx) {
  return {
    list: () => registeredParts().map((p) => ({ id: p.id, name: p.name, actions: (p.actions ?? []).map((a) => a.name) })),
    call: async (appId, action, args = {}, caller) => {
      const app = registeredParts().find((p) => p.id === appId);
      if (!app) throw new Error(`アプリが見つかりません: ${appId}`);
      const act = (app.actions ?? []).find((a) => a.name === action);
      if (!act) throw new Error(`操作が見つかりません: ${appId}.${action}`);
      if (act.requiredPermission && caller) {
        const callerApp = registeredParts().find((p) => p.id === caller);
        const granted = callerApp?.permissions ?? [];
        if (!granted.includes(act.requiredPermission)) throw new Error(`権限がありません: ${caller} は ${act.requiredPermission} を保有していません`);
      }
      return act.run(scopeCtx(ctx, app.permissions), args, caller);
    }
  };
}
export {
  ALLOWED_PERMISSIONS,
  DEFAULT_APPS,
  MANDATORY_APPS,
  PERMISSIONS,
  PRIVILEGED_PERMISSIONS,
  appCatalog,
  installApp,
  installedAppIds,
  makeAppsApi,
  permissionCatalogText,
  uninstallApp
};
