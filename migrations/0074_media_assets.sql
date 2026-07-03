-- 素材ライブラリ（HP用の画像/SVGロゴ/動画）。実体は KV(media:<id>) または R2、メタはここで一覧/削除/再利用。
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  name TEXT,
  kind TEXT,                 -- image | svg | video
  mime TEXT,
  size INTEGER,
  backend TEXT,              -- kv | r2
  created_by TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_media_assets_created ON media_assets(created_at DESC);
