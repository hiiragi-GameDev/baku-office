-- 簡易NPS（月1回・任意）「同僚に勧めたい？」yes/neutral/no。拡張シグナルとして実績レポートに載せる。
CREATE TABLE IF NOT EXISTS nps_responses (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  owner TEXT,
  score TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nps_ts ON nps_responses(ts);
