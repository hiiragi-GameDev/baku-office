-- 限定公開（H7）。サイト(LP)にパスワードを設定すると、閲覧前に入力ゲートを出す。
-- password は SHA-256 hex（平文は保存しない）。NULL=誰でも閲覧可。
ALTER TABLE sites ADD COLUMN password TEXT;
