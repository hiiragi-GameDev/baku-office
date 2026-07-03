-- 公開入口（フォーム送信・翻訳など）のアトミックなレート制限用テーブル。
-- WHY: 従来は KV の get→put 加算で、同時リクエスト時に上限を超え得た（非アトミック）。
--   D1 の "INSERT ... ON CONFLICT DO UPDATE SET count=count+1 RETURNING count" は単一文＝原子的に
--   加算と現在値取得ができ、同時アクセスでも超過しない。bucket は IP×endpoint×時間窓のキー。
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);
-- 期限切れ窓の掃除（window_start での範囲削除）を高速化。
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
