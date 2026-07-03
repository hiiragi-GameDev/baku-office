-- 問い合わせ（H3）。サイトの問い合わせフォームblockからの受信箱。匿名受付・管理者が確認。
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  page TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages (created_at);
