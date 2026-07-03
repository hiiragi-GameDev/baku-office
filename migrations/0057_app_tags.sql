-- アプリの分類（category・既存）に加えてタグ（自由ラベル・複数）を持たせる。
-- 一覧をジャンル/タグで絞り込めるようにする。JSON 配列（string[]）。NULL=タグ無し（後方互換）。
ALTER TABLE app_drafts ADD COLUMN tags TEXT;
ALTER TABLE external_apps ADD COLUMN tags TEXT;
