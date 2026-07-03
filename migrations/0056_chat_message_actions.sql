-- チャットメッセージに付随するアクションボタン（生成アプリの導線・会話の選択肢など）。
-- JSON 配列（ChatAction[]）。NULL=ボタンなし（後方互換）。履歴復元時もボタンを再描画する。
ALTER TABLE chat_messages ADD COLUMN actions TEXT;
