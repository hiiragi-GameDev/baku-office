-- アプリ内の複数エンティティ（型）対応（B7）。1つのアプリで顧客×案件のように複数の「テーブル」を持てる。
-- collection で種別を分け、リレーションは data(JSON) に関連レコードの id を保持して結合する。
-- NULL=従来どおり単一種別（後方互換）。
ALTER TABLE app_records ADD COLUMN collection TEXT;
CREATE INDEX IF NOT EXISTS idx_app_records_collection ON app_records (app_id, collection, created_at);
