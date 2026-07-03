-- プロジェクト公開ハブ：配下の公開ページ(LP)をまとめた対外ページ /hub/<projectId>。既定OFF（誤公開防止）。
ALTER TABLE projects ADD COLUMN hub_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN hub_intro TEXT;
