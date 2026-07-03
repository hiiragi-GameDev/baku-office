-- 既存メンバーへの外部連携コード（アカウントを増やさず、本人の既存アカウントへ LINE/Discord/Slack を紐付ける）。
-- target_user_id が入った招待コードは「新規参加」ではなく「既存ユーザーへの identity 連携」として処理する。
ALTER TABLE invites ADD COLUMN target_user_id TEXT;
