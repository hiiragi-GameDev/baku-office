-- 承認ワークフロー（B10）。レコードに状態を持たせ、申請→承認→却下などの遷移を可能にする。
-- NULL=状態管理なし（後方互換）。アプリは status で絞り込み、record.status op で遷移させる。
ALTER TABLE app_records ADD COLUMN status TEXT;
CREATE INDEX IF NOT EXISTS idx_app_records_status ON app_records (app_id, status, created_at);
