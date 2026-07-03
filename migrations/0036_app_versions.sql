-- アプリのバージョン履歴（不変スナップショット）。更新/ロールバックは external_apps.active_version の切替で行う。
CREATE TABLE IF NOT EXISTS app_versions (
  app_id TEXT NOT NULL,
  version TEXT NOT NULL,
  definition TEXT,        -- その版の定義(JSON)
  permissions TEXT,       -- その版の要求権限(JSON配列)
  changelog TEXT,         -- AI生成の変更ログ
  ai_meta TEXT,           -- 機械情報(model/tokens 等, JSON)
  source TEXT NOT NULL DEFAULT 'local',  -- local / store
  created_by TEXT,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (app_id, version)
);
-- external_apps に現役版ポインタと導入元を追加（既存行は NULL=旧来動作）。
ALTER TABLE external_apps ADD COLUMN active_version TEXT;
ALTER TABLE external_apps ADD COLUMN source TEXT;
-- 草案に AI変更ログ列を追加。
ALTER TABLE app_drafts ADD COLUMN changelog TEXT;
