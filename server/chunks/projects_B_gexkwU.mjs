globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
const toProject = (r) => ({ ...r, archived: !!r.archived, hub_enabled: !!r.hub_enabled, hub_intro: r.hub_intro ?? null });
const PROJ_COLS = "id,name,description,color,icon,archived,hub_enabled,hub_intro,created_by,created_at,updated_at";
function newId() {
  return "prj_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}
async function createProject(env, p) {
  const now = nowSec();
  const id = newId();
  await env.DB.prepare(
    "INSERT INTO projects (id,name,description,color,icon,archived,created_by,created_at,updated_at) VALUES (?,?,?,?,?,0,?,?,?)"
  ).bind(id, p.name.slice(0, 120), p.description?.slice(0, 1e3) ?? null, p.color ?? null, p.icon ?? null, p.by ?? null, now, now).run();
  return { id, name: p.name.slice(0, 120), description: p.description ?? null, color: p.color ?? null, icon: p.icon ?? null, archived: false, hub_enabled: false, hub_intro: null, created_by: p.by ?? null, created_at: now, updated_at: now };
}
async function listProjects(env, includeArchived = false) {
  const sql = `SELECT ${PROJ_COLS} FROM projects` + (includeArchived ? "" : " WHERE archived=0") + " ORDER BY created_at DESC";
  const { results } = await env.DB.prepare(sql).all();
  return (results ?? []).map(toProject);
}
async function getProject(env, id) {
  const r = await env.DB.prepare(`SELECT ${PROJ_COLS} FROM projects WHERE id=?`).bind(id).first();
  return r ? toProject(r) : null;
}
async function updateProject(env, id, p) {
  const sets = [];
  const vals = [];
  if (p.name !== void 0) {
    sets.push("name=?");
    vals.push(p.name.slice(0, 120));
  }
  if (p.description !== void 0) {
    sets.push("description=?");
    vals.push(p.description?.slice(0, 1e3) ?? null);
  }
  if (p.color !== void 0) {
    sets.push("color=?");
    vals.push(p.color);
  }
  if (p.icon !== void 0) {
    sets.push("icon=?");
    vals.push(p.icon);
  }
  if (p.archived !== void 0) {
    sets.push("archived=?");
    vals.push(p.archived ? 1 : 0);
  }
  if (p.hub_enabled !== void 0) {
    sets.push("hub_enabled=?");
    vals.push(p.hub_enabled ? 1 : 0);
  }
  if (p.hub_intro !== void 0) {
    sets.push("hub_intro=?");
    vals.push(p.hub_intro?.slice(0, 2e3) ?? null);
  }
  if (!sets.length) return;
  sets.push("updated_at=?");
  vals.push(nowSec());
  await env.DB.prepare(`UPDATE projects SET ${sets.join(",")} WHERE id=?`).bind(...vals, id).run();
}
async function deleteProject(env, id) {
  await env.DB.prepare("UPDATE external_apps SET project_id=NULL WHERE project_id=?").bind(id).run();
  await env.DB.prepare("DELETE FROM projects WHERE id=?").bind(id).run();
}
async function assignAppToProject(env, appId, projectId) {
  await env.DB.prepare("UPDATE external_apps SET project_id=? WHERE id=?").bind(projectId, appId).run();
}
async function bulkSetPublic(env, projectId, enabled) {
  const r = await env.DB.prepare(
    "UPDATE public_pages SET enabled=?, updated_at=? WHERE slug IN (SELECT id FROM external_apps WHERE project_id=?)"
  ).bind(enabled ? 1 : 0, nowSec(), projectId).run();
  return r.meta?.changes ?? 0;
}
async function bulkSetRoles(env, projectId, roles) {
  const json = roles && roles.length ? JSON.stringify(roles) : null;
  const r = await env.DB.prepare("UPDATE external_apps SET allowed_roles=? WHERE project_id=?").bind(json, projectId).run();
  return r.meta?.changes ?? 0;
}
async function projectApps(env, projectId) {
  const { results } = await env.DB.prepare(
    `SELECT a.id AS id, a.name AS name, a.version AS version, a.allowed_roles AS allowed_roles,
            p.enabled AS publicEnabled,
            (SELECT COUNT(*) FROM app_records r WHERE r.app_id=a.id) AS records
     FROM external_apps a
     LEFT JOIN public_pages p ON p.slug=a.id
     WHERE a.project_id=?
     ORDER BY a.name`
  ).bind(projectId).all();
  return (results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    version: r.version,
    allowed_roles: r.allowed_roles,
    publicEnabled: r.publicEnabled == null ? null : !!r.publicEnabled,
    records: Number(r.records) || 0
  }));
}
async function projectPublicLPs(env, projectId) {
  const { results } = await env.DB.prepare(
    `SELECT a.id AS appId, COALESCE(p.title, a.name) AS title
     FROM external_apps a JOIN public_pages p ON p.slug=a.id
     WHERE a.project_id=? AND p.enabled=1 ORDER BY title`
  ).bind(projectId).all();
  return results ?? [];
}
async function projectAppCounts(env) {
  const { results } = await env.DB.prepare("SELECT project_id AS pid, COUNT(*) AS n FROM external_apps WHERE project_id IS NOT NULL GROUP BY project_id").all();
  const out = {};
  for (const r of results ?? []) out[r.pid] = Number(r.n) || 0;
  return out;
}
async function projectRecordCounts(env) {
  const { results } = await env.DB.prepare(
    "SELECT a.project_id AS pid, COUNT(r.id) AS n FROM external_apps a JOIN app_records r ON r.app_id=a.id WHERE a.project_id IS NOT NULL GROUP BY a.project_id"
  ).all();
  const out = {};
  for (const r of results ?? []) out[r.pid] = Number(r.n) || 0;
  return out;
}
function commonFields(data) {
  const entries = Object.entries(data).filter(([k]) => !k.startsWith("_"));
  const asStr = (v) => (v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)).trim();
  const find = (re, exclude) => {
    const hit = entries.find(([k]) => re.test(k) && (!exclude || !exclude.test(k)));
    return hit ? asStr(hit[1]) : void 0;
  };
  const company = find(/company|corp|organi|会社|組織|団体|法人|店舗|屋号/i);
  const email = find(/e?mail|メール|アドレス/i);
  const tel = find(/tel|phone|電話|携帯|連絡先/i);
  const name = find(/(contact|担当|氏名|representative|applicant|なまえ|お名前)/i) ?? find(/name|名前/i, /company|corp|organi|会社|団体|user|mail|file/i);
  const r = {};
  if (company) r.company = company;
  if (name) r.name = name;
  if (email) r.email = email;
  if (tel) r.tel = tel;
  return r;
}
async function projectRecords(env, projectId, limit = 500) {
  const lim = Math.min(Math.max(limit, 1), 5e3);
  const { results } = await env.DB.prepare(
    `SELECT r.id AS id, r.app_id AS app_id, r.data AS data, r.created_at AS created_at, a.name AS app_name
     FROM app_records r JOIN external_apps a ON a.id=r.app_id
     WHERE a.project_id=? ORDER BY r.created_at DESC LIMIT ${lim}`
  ).bind(projectId).all();
  return (results ?? []).map((r) => {
    let data = {};
    try {
      const o = r.data ? JSON.parse(r.data) : {};
      if (o && typeof o === "object" && !Array.isArray(o)) data = o;
    } catch {
    }
    return { id: r.id, app_id: r.app_id, app_name: r.app_name, created_at: r.created_at, data, common: commonFields(data) };
  });
}
export {
  assignAppToProject,
  bulkSetPublic,
  bulkSetRoles,
  commonFields,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  projectAppCounts,
  projectApps,
  projectPublicLPs,
  projectRecordCounts,
  projectRecords,
  updateProject
};
