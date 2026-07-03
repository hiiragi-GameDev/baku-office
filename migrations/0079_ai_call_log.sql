-- AI API呼び出しの明細ログ（1呼び出し=1行）。プロンプト・本文は保存しない（トークン数とメタデータのみ）。
-- 金額は焼き込まない：単価は変動するため、集計時に単価表（MODEL_PRICING）と掛けて算出する。
CREATE TABLE IF NOT EXISTS ai_call_log (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  feature TEXT NOT NULL DEFAULT 'other',
  plan TEXT,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens INTEGER NOT NULL DEFAULT 0,
  cache_write_tokens INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_ai_call_log_ts ON ai_call_log(ts);
CREATE INDEX IF NOT EXISTS idx_ai_call_log_feature_ts ON ai_call_log(feature, ts);
