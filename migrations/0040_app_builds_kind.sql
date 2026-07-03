-- app_builds に kind を追加：'build'（新規作成・既定）と 'edit'（既存アプリの編集/デバッグ）。
-- edit は app_id（対象）と spec（指示）を持ち、最小差分パッチで定義を更新→自動反映する（背景・再開可能）。
ALTER TABLE app_builds ADD COLUMN kind TEXT NOT NULL DEFAULT 'build';
