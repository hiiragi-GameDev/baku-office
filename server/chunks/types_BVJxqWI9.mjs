globalThis.process ??= {};
globalThis.process.env ??= {};
const ROLE_LABELS = {
  admin: "管理者",
  developer: "開発者",
  accounting: "会計",
  clerical: "庶務",
  other: "その他",
  member: "メンバー",
  guest: "ゲスト"
};
function roleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}
function isDeveloperRole(role) {
  return role === "admin" || role === "developer";
}
const ENTITLEMENT_RANK = { free: 0, plus: 1, pro: 2, nonprofit: 40, enterprise: 50, test: 99 };
function atLeast(e, min) {
  return ENTITLEMENT_RANK[e] >= ENTITLEMENT_RANK[min];
}
function planLabel(p) {
  return p === "test" ? "テスト（全機能解放）" : p === "enterprise" ? "エンタープライズ（個別相談・全機能）" : p === "nonprofit" ? "NonProfit（非営利・全機能・要審査）" : p === "pro" ? "Pro（エージェント）" : p === "plus" ? "Plus（AI）" : "Free（無料）";
}
export {
  ENTITLEMENT_RANK as E,
  ROLE_LABELS as R,
  atLeast as a,
  isDeveloperRole as i,
  planLabel as p,
  roleLabel as r
};
