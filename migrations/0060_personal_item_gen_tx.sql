-- 共有領収書の承認で自動生成した会計取引の id を個人記録に紐付ける。
-- WHY: 誤承認の取消（管理者リカバリ・§9 D）で、連動生成した取引も一緒にソフトデリートできるようにする。
-- NULL=取引未生成（領収書以外、または金額なし）。
ALTER TABLE personal_items ADD COLUMN gen_tx_id TEXT;
