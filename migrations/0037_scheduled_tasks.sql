-- 定期実行タスク（スケジュールタスク）。owner の指示(prompt)を freq の周期で無人実行（agent_jobs へ enqueue）。
-- 時刻は JST 基準の「0:00 からの分」(at_min)。weekly は dow(0=日..6=土)、monthly は dom(1..28)。
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  prompt TEXT NOT NULL,
  freq TEXT NOT NULL,                 -- 'daily' | 'weekly' | 'monthly'
  at_min INTEGER NOT NULL DEFAULT 540, -- 実行時刻（JST・分）。既定 9:00
  dow INTEGER,                        -- weekly のみ：0=日..6=土
  dom INTEGER,                        -- monthly のみ：1..28
  role TEXT NOT NULL DEFAULT 'member',
  enabled INTEGER NOT NULL DEFAULT 1,
  next_run INTEGER NOT NULL,          -- 次回実行 epoch秒
  last_run INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sched_tasks_due ON scheduled_tasks (enabled, next_run);
