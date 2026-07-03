-- P0-01: 承認対象の定義差し替え(TOCTOU)を塞ぐ。承認待ちに「対象種別」と「申請時に確認した
-- 定義・権限の正規化ハッシュ」を保存し、承認実行時に現行定義の再ハッシュと完全一致したときだけ実行する。
-- subject_type: installed / draft / outward。def_hash/perms_hash: 正規化JSON(キー順安定)のSHA-256(hex)。
-- 旧レコード（NULL）は従来の app_version 比較にフォールバックする（後方互換）。
ALTER TABLE agent_approvals ADD COLUMN subject_type TEXT;
ALTER TABLE agent_approvals ADD COLUMN def_hash TEXT;
ALTER TABLE agent_approvals ADD COLUMN perms_hash TEXT;
