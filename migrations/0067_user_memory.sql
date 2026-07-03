-- 横断記憶（セッションを跨いで「覚えておく」personal な重要事項）。
-- AIチャットが過去の会話で得た恒久的な好み・事実を保存し、新しいセッションでも想起できるようにする。
-- owner スコープ（各自の記憶）。DDL のみ（データ投入はアプリ層で冪等に行う）。
CREATE TABLE IF NOT EXISTS user_memory (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  content TEXT NOT NULL,
  source_session TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_memory_owner ON user_memory(owner, updated_at);
