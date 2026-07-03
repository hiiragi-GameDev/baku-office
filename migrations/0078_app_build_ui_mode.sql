-- ビルドのUI方針（simple=素のフォーム/rich=カスタムUI SPA）。null=旧挙動（AI判断）。
ALTER TABLE app_builds ADD COLUMN ui_mode TEXT;
