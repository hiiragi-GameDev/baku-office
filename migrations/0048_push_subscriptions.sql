-- Web Push 購読（B9・PWAプッシュ通知）。端末ごとの購読を owner に紐づけて保持する。
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT,
  auth TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_push_owner ON push_subscriptions (owner);
