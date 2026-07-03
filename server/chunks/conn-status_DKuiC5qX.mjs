globalThis.process ??= {};
globalThis.process.env ??= {};
function saveMark(saved) {
  return saved ? "✓ 保存済み" : "未保存";
}
const CONN_LABEL = {
  unset: "未設定",
  // 何も入力されていない
  saved: "保存済み",
  // 入力値は保存したが、送受信テストは未確認
  pending: "確認待ち",
  // 実際の送受信テストが必要
  connected: "接続済み",
  // テスト成功＝機能している
  warning: "一部のみ利用可",
  // 一部の工程だけ成功（部分完了）
  error: "エラー"
  // セットアップに失敗
};
function connLabel(state) {
  return CONN_LABEL[state] ?? CONN_LABEL.unset;
}
function linkLabel(linked) {
  return linked ? "連携済み" : "未連携";
}
export {
  connLabel,
  linkLabel,
  saveMark
};
