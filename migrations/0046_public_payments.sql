-- 公開フォームの決済（B4・有料申込/寄付/物販）。price>0 で Stripe Checkout に誘導する。
ALTER TABLE public_pages ADD COLUMN price INTEGER NOT NULL DEFAULT 0;     -- 金額（JPYは円・ゼロ小数）。0=無料。
ALTER TABLE public_pages ADD COLUMN currency TEXT NOT NULL DEFAULT 'jpy';
ALTER TABLE public_pages ADD COLUMN pay_label TEXT;                       -- 商品名/名目（未設定はタイトル）。

-- 送信ごとの決済状態。none=無料／unpaid=要決済／paid=入金済。
ALTER TABLE public_submissions ADD COLUMN pay_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public_submissions ADD COLUMN amount INTEGER;
ALTER TABLE public_submissions ADD COLUMN stripe_session TEXT;
