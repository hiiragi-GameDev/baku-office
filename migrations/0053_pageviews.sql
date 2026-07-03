-- アクセス解析（H5・内蔵カウンタ）。外部スクリプト不要・プライバシー配慮（個人を記録しない）。
-- 日付×パスごとの閲覧数のみ集計する。
CREATE TABLE IF NOT EXISTS pageviews (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);
