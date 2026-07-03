-- 公開ページ（ログイン不要・LP/申込フォーム）。AIがアプリ開発時に発行する /p/<slug>。
-- アプリ(external_apps)に紐づき、表示HTML＋フォーム項目を持つ。匿名訪問者は閲覧と送信のみ可。
CREATE TABLE IF NOT EXISTS public_pages (
  slug TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  title TEXT NOT NULL,
  html TEXT NOT NULL,
  fields TEXT NOT NULL DEFAULT '[]',
  allow_files INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 公開フォーム送信（モデレーションキュー）。承認すると app_records へ取り込む（status=pending/approved/rejected）。
-- 生IPは保存せず ip_hash（ハッシュ）のみ＝レート制限/不正調査用。
CREATE TABLE IF NOT EXISTS public_submissions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  app_id TEXT NOT NULL,
  data TEXT NOT NULL,
  files TEXT,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  reviewed_by TEXT,
  reviewed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_pubsub_scope ON public_submissions (slug, status, created_at);
