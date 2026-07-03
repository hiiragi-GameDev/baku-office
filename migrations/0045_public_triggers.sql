-- 公開ページの送信時トリガ（B3）。送信を受けたら管理者へ通知し、任意で申込者へ確認メールを送る。
-- email_field＝申込者メールが入るフォーム項目名（確認メール送信に使う）。
ALTER TABLE public_pages ADD COLUMN notify_admin INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public_pages ADD COLUMN confirm_email INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public_pages ADD COLUMN email_field TEXT;
ALTER TABLE public_pages ADD COLUMN confirm_subject TEXT;
ALTER TABLE public_pages ADD COLUMN confirm_body TEXT;
