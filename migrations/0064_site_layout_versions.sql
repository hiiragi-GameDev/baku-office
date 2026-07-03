-- HP/LP 公開履歴（P1-22）。公開（layout_draft→layout 反映）のたびに公開時点の layout を版として記録し、
-- 以前の版へロールバックできるようにする。DDL 限定（スナップショット投入はアプリ層で冪等に＝publishLayout）。
CREATE TABLE IF NOT EXISTS site_layout_versions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  version_no INTEGER NOT NULL,     -- slug 内の連番（1,2,3…）
  layout TEXT NOT NULL,            -- 公開時点の layout JSON
  published_by TEXT,               -- 公開した管理者 uid
  published_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_slv_slug ON site_layout_versions (slug, version_no);
