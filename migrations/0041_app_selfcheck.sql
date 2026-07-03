-- 公開申請前のセルフチェック結果を草案に保持する。
-- selfcheck=結果JSON（チェック項目・status・detail）、selfcheck_status='pass'|'fail'|NULL（未実施）。
-- 申請は selfcheck_status='pass' のときのみ許可する（submitDraft のゲート）。
ALTER TABLE app_drafts ADD COLUMN selfcheck TEXT;
ALTER TABLE app_drafts ADD COLUMN selfcheck_status TEXT;
