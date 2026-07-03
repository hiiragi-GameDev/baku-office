-- HP の AI 生成を背景Phase制で進めるジョブ表（アプリの app_builds と同型）。
-- status: planning → building → done | error。plan=作るブロック型の配列、blocks=蓄積中の生成結果、cursor=進捗。
-- lease（updated_at が一定時間更新されない active 行）は cron drain が回収して再開する。
CREATE TABLE IF NOT EXISTS site_builds (
  id TEXT PRIMARY KEY,
  owner TEXT,
  slug TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL,
  prompt TEXT,
  base TEXT,
  plan TEXT,
  blocks TEXT,
  cursor INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  model TEXT,
  note TEXT,
  error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_site_builds_active ON site_builds(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_site_builds_slug ON site_builds(slug, created_at DESC);
