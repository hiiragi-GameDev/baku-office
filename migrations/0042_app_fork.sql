-- 拡張開発（フォーク）の許可スナップショットと来歴（クライアント側）。
-- external_apps.allow_fork=導入時点で派生元が拡張開発を許可していたか（フォークボタン表示の判定用・最終検証は host）。
-- forked_from_* は派生で作った草案/アプリが「どのアプリから派生したか」を必ず保持する（新アプリでも来歴が分かる）。
ALTER TABLE external_apps ADD COLUMN allow_fork INTEGER NOT NULL DEFAULT 0;
ALTER TABLE external_apps ADD COLUMN forked_from_id TEXT;
ALTER TABLE external_apps ADD COLUMN forked_from_name TEXT;
ALTER TABLE external_apps ADD COLUMN forked_from_version TEXT;
ALTER TABLE app_drafts ADD COLUMN forked_from_id TEXT;
ALTER TABLE app_drafts ADD COLUMN forked_from_name TEXT;
ALTER TABLE app_drafts ADD COLUMN forked_from_version TEXT;
