-- 段階実装（Phase制・再開可能）なアプリビルド。1実行=1ステップに抑え、短い実行枠でも確実に進む。
-- status: planning（計画生成前）→ building（Phase 実装中）→ done / error。
-- plan=JSON{ id,name,permissions,isCustomUI,phases:[{title,goal,kind,status}] }、definition=JSON（蓄積中の定義）。
-- cursor=次に実装する Phase の index。paid=WorkersPaid（1実行で進めるステップ数の調整に使う）。
CREATE TABLE IF NOT EXISTS app_builds (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  session_id TEXT,
  app_id TEXT,
  name TEXT,
  model TEXT,
  paid INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning',
  spec TEXT,
  plan TEXT,
  definition TEXT,
  cursor INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_app_builds_active ON app_builds(status, updated_at);
