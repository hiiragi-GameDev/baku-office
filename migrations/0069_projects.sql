-- プロジェクト：アカウント共有の第一級コンテナ（事業/イベント単位でアプリ＋公開LPをまとめる）。
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
-- アプリの所属プロジェクト（0〜1）。LPはアプリの公開ページなので自動的に同じプロジェクトに属する。
ALTER TABLE external_apps ADD COLUMN project_id TEXT;
CREATE INDEX IF NOT EXISTS idx_external_apps_project ON external_apps (project_id);
