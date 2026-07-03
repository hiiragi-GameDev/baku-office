-- 外部送信(egress)の監査ログ（§通信境界・egress 統制）。EgressGateway を通った送信のうち
-- 拒否（allowlist 違反）・失敗（HTTPエラー/例外）を記録する。量を抑え成功は記録しない。
-- app_audit_log（アプリ実行）/ audit_log（ファイル操作）とは別系統＝egress 専用。
CREATE TABLE IF NOT EXISTS egress_log (
  id TEXT PRIMARY KEY,
  connector TEXT NOT NULL,
  host TEXT,
  method TEXT,
  ok INTEGER NOT NULL,
  status INTEGER,
  blocked INTEGER NOT NULL DEFAULT 0,   -- 1=allowlist 拒否で送信していない
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_egress_log_created ON egress_log (created_at);
