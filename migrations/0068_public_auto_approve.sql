-- 公開フォームの承認フロー設定と取り込み先コレクション。
-- auto_approve=1（既定）＝承認不要：送信を即アプリデータ(app_records)化し管理ビューにすぐ出す。0＝承認制。
-- collection＝取り込み先（アプリの保存先 data.create の collection と一致させ、管理ビューの data.list と整合させる）。
ALTER TABLE public_pages ADD COLUMN auto_approve INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public_pages ADD COLUMN collection TEXT;
