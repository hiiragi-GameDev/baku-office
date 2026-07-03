-- 宣言的アプリ（baku.app/1）の汎用データ保存先。CRUD型アプリ（記録・一覧・集計）が
-- db.write/db.query で利用する。app_id でアプリ別、owner で利用者別にスコープする想定。
-- data は任意の本文（JSON文字列やテキスト）。アプリは自分の app_id 行のみ読み書きする。
CREATE TABLE IF NOT EXISTS app_records (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  owner TEXT NOT NULL,
  data TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_app_records_scope ON app_records (app_id, owner, created_at);
