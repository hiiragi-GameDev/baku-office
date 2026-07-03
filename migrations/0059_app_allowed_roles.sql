-- アプリごとのアクセス権限（ロール）。管理者が「このアプリを使えるロール」を設定する。
-- JSON 配列（例 ["accounting","clerical"]）。NULL/空＝全ロール可（既定・後方互換）。
-- admin/developer は設定に関わらず常に利用可（管理・開発のため）。guest は対象外。
ALTER TABLE external_apps ADD COLUMN allowed_roles TEXT;
