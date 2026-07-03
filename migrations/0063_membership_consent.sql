-- 公開申込フォームでの個人情報取扱い同意の記録（P0-07）。
-- consent_version: 同意した文面の版（後で文面を改訂したら版を上げて区別する）。
-- consent_at: 同意した日時（epoch秒）。どちらも公開フォーム経由の申込でのみ設定される。
ALTER TABLE membership ADD COLUMN consent_version TEXT;
ALTER TABLE membership ADD COLUMN consent_at INTEGER;
