-- 外部メッセージのコネクタ設定（§通信境界・egress 統制）。
-- 論理チャンネル(label)→ プロバイダ(connector)＋宛先(address) の対応をデータで保持する。
-- プロバイダ切替は connector/address の UPDATE 1 行で済む＝ベンダーロックイン回避。
CREATE TABLE IF NOT EXISTS connectors (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  connector TEXT NOT NULL,        -- "discord" | "line" | "slack" ...（解釈はアダプタ）
  address TEXT NOT NULL,          -- 宛先（webhook id / channel id 等）
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_connectors_enabled ON connectors (enabled);
