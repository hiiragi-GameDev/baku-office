-- アプリのAPI/Webhook公開（C4）。アプリごとのアクセストークン（外部システム連携・inbound webhook）。
-- token_hash は SHA-256 hex（平文は保存しない）。
CREATE TABLE IF NOT EXISTS api_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  app_id TEXT NOT NULL,
  owner TEXT NOT NULL,
  label TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_api_tokens_app ON api_tokens (app_id);
