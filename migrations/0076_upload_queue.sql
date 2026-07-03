-- メッセンジャー（LINE/Discord/Slack）でアップロードされたバイナリ（画像/動画/音声/PDF）の
-- 「即レス＋選択肢＋待機ウィンドウでまとめて背景処理」用キュー。
-- 同一 owner の status='queued' 行が1バッチ。idx＝バッチ内の通し番号（1枚目..）。
-- mode: null=未決（選択待ち）/ read / store / skip。deadline を過ぎ mode が決まれば cron が一括処理し結果をまとめて push。
CREATE TABLE IF NOT EXISTS upload_queue (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,        -- "connector:externalId"（push 宛先の解決にも使う）
  connector TEXT,
  role TEXT,                  -- 受信時の会員ロール（背景でのagent実行に使う）
  file_id TEXT NOT NULL,      -- 保存済みファイル（storage.files.id）
  name TEXT,
  mime TEXT,
  idx INTEGER NOT NULL,       -- バッチ内の通し番号
  mode TEXT,                  -- null=未決 / read / store / skip
  context TEXT,               -- 自然文指示の文脈（例「領収書」）
  status TEXT NOT NULL,       -- queued / processing / done / skipped / error
  result TEXT,
  deadline INTEGER NOT NULL,  -- この時刻を過ぎ mode が決まれば処理（連投をまとめる待機ウィンドウ）
  attempts INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_upload_queue_owner ON upload_queue(owner, status);
CREATE INDEX IF NOT EXISTS idx_upload_queue_ready ON upload_queue(status, deadline);
