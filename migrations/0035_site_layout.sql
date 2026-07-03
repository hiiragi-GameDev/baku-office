-- ページビルダー：ブロック構成の保存。layout=公開版、layout_draft=編集中（下書き）、seo=任意メタ。
-- いずれも JSON 文字列。NULL の sites 行は従来どおり body(HTML) を描画（後方互換）。
ALTER TABLE sites ADD COLUMN layout TEXT;
ALTER TABLE sites ADD COLUMN layout_draft TEXT;
ALTER TABLE sites ADD COLUMN seo TEXT;
