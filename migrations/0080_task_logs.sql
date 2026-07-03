-- タスク実行ログ（実績＆成長ループ・1タスク=1行）。依頼本文・応答本文は保存しない
-- （種別・完了/失敗・未対応要求の一行要約・フィードバックなどメタデータのみ）。
CREATE TABLE IF NOT EXISTS task_logs (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  owner TEXT,
  role TEXT,
  source TEXT NOT NULL DEFAULT 'chat',
  kind TEXT NOT NULL DEFAULT 'inquiry',
  ai_completed INTEGER NOT NULL DEFAULT 0,
  exec_type TEXT NOT NULL DEFAULT 'suggest',
  rework INTEGER NOT NULL DEFAULT 0,
  fail_reason TEXT,
  unmet TEXT,
  session_id TEXT,
  message_id TEXT,
  feedback TEXT,
  saved_minutes INTEGER
);
CREATE INDEX IF NOT EXISTS idx_task_logs_ts ON task_logs(ts);
CREATE INDEX IF NOT EXISTS idx_task_logs_session_ts ON task_logs(session_id, ts);
