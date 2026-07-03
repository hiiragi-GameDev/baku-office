-- アプリのデータ変更監査（B11）。アプリ実行時の書込・削除・状態遷移を記録する。
-- WHY app_audit_log: 別系統のレガシー監査 audit_log（0001_client.sql・actor/action/target）と名前が衝突し、
-- 旧 audit_log には app_id 列が無いため index 作成が "no such column: app_id" で失敗していた（0050 以降が全停止）。
-- アプリ実行監査は app_audit_log として分離する（旧 audit_log はファイル操作監査で引き続き使用）。
CREATE TABLE IF NOT EXISTS app_audit_log (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  owner TEXT NOT NULL,          -- 実行者
  op TEXT NOT NULL,             -- db.write / db.delete / record.status
  detail TEXT,                  -- 要約（テーブル名・id・遷移先など。本文は保存しない）
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_app_audit_app ON app_audit_log (app_id, created_at);
