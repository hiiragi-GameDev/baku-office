-- 公開フォーム送信時の登録方式。'none'＝フォーム送信のみ（既定・後方互換）／
-- 'guest'＝送信者を名簿にゲストとして登録する。クライアントが公開ページごとに選べる。
ALTER TABLE public_pages ADD COLUMN register_mode TEXT NOT NULL DEFAULT 'none';
