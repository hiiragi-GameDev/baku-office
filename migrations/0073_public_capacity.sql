-- N9（スマート公開フォーム）：公開フォームの定員＋キャンセル待ち。
-- capacity=NULL は定員無制限（既定）。定員に達した後の送信は status='waitlist' で受け付け、管理者が承認で繰り上げる。
ALTER TABLE public_pages ADD COLUMN capacity INTEGER;
