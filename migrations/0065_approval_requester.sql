-- P0-01: 承認の権限昇格を塞ぐ。承認待ちに「起案者の権限コンテキスト」と「対象アプリ版」を保存し、
-- 承認後の実行は承認者(admin)ではなく申請者ロールで再実行する（承認は「実行を許可する判断」だけに使う）。
-- requester_role/ctx＝起案時の権限主体、app_id/screen_id＝対象、app_version＝申請後の定義変更検知用。
-- error＝実行失敗の理由（P1-01：失敗を approved と記録しないため status を executing/failed に分離する）。
ALTER TABLE agent_approvals ADD COLUMN requester_role TEXT;
ALTER TABLE agent_approvals ADD COLUMN requester_ctx TEXT;
ALTER TABLE agent_approvals ADD COLUMN app_id TEXT;
ALTER TABLE agent_approvals ADD COLUMN screen_id TEXT;
ALTER TABLE agent_approvals ADD COLUMN app_version TEXT;
ALTER TABLE agent_approvals ADD COLUMN error TEXT;
