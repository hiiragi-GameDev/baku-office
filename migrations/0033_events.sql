-- イベント（公開申込・参加者管理）。HP/LP 公開（sites）と会員管理・会計に連動。
-- events.plans は JSON 配列 [{id,name,price}]（参加プラン）。capacity=NULL は定員無制限。
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  lead TEXT,
  body TEXT,
  location TEXT,
  event_date TEXT,
  capacity INTEGER,
  plans TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- イベント参加登録。user_id=作成したログインアカウント、member_id=名簿(membership)行。
-- pay_status: unpaid / paid（デモ決済で paid）。fee_tx_id=参加費入金の会計取引（二重計上防止）。
CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id TEXT,
  member_id TEXT,
  name TEXT NOT NULL,
  contact TEXT,
  plan_id TEXT,
  plan_name TEXT,
  headcount INTEGER NOT NULL DEFAULT 1,
  amount INTEGER,
  pay_status TEXT NOT NULL DEFAULT 'unpaid',
  fee_tx_id TEXT,
  paid_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_regs_event ON event_registrations (event_id, created_at);
CREATE INDEX IF NOT EXISTS idx_event_regs_user ON event_registrations (user_id);
