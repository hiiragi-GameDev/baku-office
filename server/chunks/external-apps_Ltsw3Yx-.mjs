globalThis.process ??= {};
globalThis.process.env ??= {};
import { getToken, hostFetch, getVerifyJwk } from "./client_F4fksau0.mjs";
import { r as randomId, v as verifyEnvelope, i as importVerifyKey, p as payloadOf } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { p as preflight, i as isRunnableDefinition } from "./preflight_BWqz46-c.mjs";
import { sanitizeRenderHtml, validateDefinition, isBlockedHost } from "./appdef_CBJw5awM.mjs";
import { a as isCuratedHost } from "./cdn-allowlist_rKupC5M_.mjs";
import { r as registeredParts } from "./parts_BnninK9G.mjs";
import { installApp } from "./apps_qko8nJrR.mjs";
const MAX_TAGS = 8;
const MAX_TAG_LEN = 24;
const MAX_CAT_LEN = 24;
function normalizeTags(input) {
  const arr = Array.isArray(input) ? input : typeof input === "string" ? input.split(/[,、\s]+/) : [];
  const out = [];
  for (const t of arr) {
    const s = String(t ?? "").trim().slice(0, MAX_TAG_LEN);
    if (s && !out.includes(s)) out.push(s);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}
function normalizeCategory(input) {
  return String(input ?? "").trim().slice(0, MAX_CAT_LEN);
}
function parseTags(s) {
  if (!s) return [];
  try {
    return normalizeTags(JSON.parse(s));
  } catch {
    return normalizeTags(s);
  }
}
async function suggestAppMeta(ctx, app) {
  const defCat = app.definition?.category;
  const fallback = { category: normalizeCategory(defCat) || "アプリ", tags: [] };
  const prompt = `次の業務アプリに、一覧で整理するための「分類」1つと「タグ」3〜6個を付けてください。
分類は大きなジャンル（例：会計、顧客管理、予約、在庫、申請、集計、文書、その他）。
タグは検索・絞り込み用の短い語（例：CSV、グラフ、通知、フォーム、月次）。
JSON だけを出力：{"category":"…","tags":["…","…"]}

アプリ名: ${app.name}
仕様: ${(app.spec ?? "").slice(0, 1200)}`;
  try {
    const out = await ctx.ai.infer(prompt, { maxTokens: 300 });
    const m = out.match(/\{[\s\S]*\}/);
    if (!m) return fallback;
    const j = JSON.parse(m[0]);
    const category = normalizeCategory(j.category) || fallback.category;
    const tags = normalizeTags(j.tags);
    return { category, tags };
  } catch {
    return fallback;
  }
}
async function setAppMeta(ctx, id, meta) {
  const sets = [];
  const vals = [];
  if (meta.category !== void 0) {
    sets.push("category=?");
    vals.push(normalizeCategory(meta.category) || null);
  }
  if (meta.tags !== void 0) {
    sets.push("tags=?");
    vals.push(JSON.stringify(normalizeTags(meta.tags)));
  }
  if (!sets.length) return;
  for (const table of ["app_drafts", "external_apps"]) {
    await ctx.db.run(`UPDATE ${table} SET ${sets.join(",")} WHERE id=?`, [...vals, id]).catch(() => {
    });
  }
}
async function getAppMeta(ctx, id) {
  const row = await ctx.db.first(
    "SELECT category,tags FROM app_drafts WHERE id=? UNION ALL SELECT category,tags FROM external_apps WHERE id=? LIMIT 1",
    [id, id]
  );
  if (!row) return null;
  return { category: normalizeCategory(row.category) || "アプリ", tags: parseTags(row.tags) };
}
const appMeta = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getAppMeta,
  normalizeCategory,
  normalizeTags,
  parseTags,
  setAppMeta,
  suggestAppMeta
}, Symbol.toStringTag, { value: "Module" }));
function nextPatchVersion(cur) {
  const m = (cur || "0.1.0").match(/^(\d+)\.(\d+)\.(\d+)$/);
  return m ? `${m[1]}.${m[2]}.${Number(m[3]) + 1}` : "0.1.1";
}
function isRegisteredPart(id) {
  return registeredParts().some((p) => p.id === id);
}
const ORG_RELAXED_HOSTS_KEY = "org_relaxed_hosts";
const validHost = (h) => /^[a-z0-9.-]+(?::\d+)?$/.test(h) && !isBlockedHost(h);
async function getOrgRelaxedHosts(env) {
  const raw = await env.LICENSE.get(ORG_RELAXED_HOSTS_KEY).catch(() => null);
  if (!raw) return [];
  try {
    const a = JSON.parse(raw);
    return Array.isArray(a) ? a.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
async function addOrgRelaxedHosts(env, hosts) {
  const add = hosts.map((h) => String(h).trim().toLowerCase()).filter(validHost);
  if (!add.length) return getOrgRelaxedHosts(env);
  const merged = [.../* @__PURE__ */ new Set([...await getOrgRelaxedHosts(env), ...add])];
  await env.LICENSE.put(ORG_RELAXED_HOSTS_KEY, JSON.stringify(merged));
  return merged;
}
async function pendingRelaxedHosts(ctx, def) {
  const render = def?.render;
  if (!render || render.isolation !== "relaxed") return [];
  const conn = Array.isArray(render.connectHosts) ? render.connectHosts : [];
  if (conn.length) return [];
  const want = Array.isArray(render.allowHosts) ? render.allowHosts.map((h) => String(h).toLowerCase()) : [];
  const org = await getOrgRelaxedHosts(ctx.env);
  return [...new Set(want.filter((h) => validHost(h) && !isCuratedHost(h) && !org.includes(h)))];
}
async function enableRelaxedForApp(ctx, appId, hosts) {
  if (!appId) return { ok: false };
  await addOrgRelaxedHosts(ctx.env, hosts);
  try {
    const row = await ctx.db.first("SELECT definition FROM external_apps WHERE id=?", [appId]);
    if (row?.definition) {
      const def = JSON.parse(row.definition);
      if (def.render && Array.isArray(def.render.allowHosts) && def.render.allowHosts.length) {
        def.render.isolation = "relaxed";
        await ctx.db.run("UPDATE external_apps SET definition=? WHERE id=?", [JSON.stringify(def), appId]);
        await ctx.env.LICENSE.put(`app_relaxed:${appId}`, JSON.stringify({ allowHosts: def.render.allowHosts, connectHosts: [] }));
      }
    }
  } catch {
  }
  return { ok: true };
}
async function fetchVerifiedPackage(ctx, id) {
  const env = ctx.env;
  const token = await getToken(env);
  if (!token) return { ok: false, error: "ライセンス未取得" };
  let r;
  try {
    r = await hostFetch(env, "/api/registry/fetch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, id }) });
  } catch {
    return { ok: false, error: "ホストへ接続できません" };
  }
  if (!r.ok) {
    const j2 = await r.json().catch(() => ({}));
    return { ok: false, error: j2.error ?? "取得に失敗しました（承認済み・プラン充足が必要）" };
  }
  const j = await r.json().catch(() => ({}));
  if (!j.pkg) return { ok: false, error: "パッケージがありません" };
  const jwk = await getVerifyJwk(env);
  if (!jwk) return { ok: false, error: "検証鍵を取得できません" };
  let envlp;
  try {
    envlp = JSON.parse(atob(j.pkg));
  } catch {
    return { ok: false, error: "パッケージ形式が不正" };
  }
  if (!await verifyEnvelope(await importVerifyKey(jwk), envlp)) return { ok: false, error: "署名検証に失敗（改竄の可能性）" };
  const p = payloadOf(envlp);
  if (!p.id || !p.exp || p.exp < nowSec()) return { ok: false, error: "パッケージの有効期限切れ" };
  return { ok: true, pkg: p };
}
async function fetchAndInstall(ctx, id) {
  const fp = await fetchVerifiedPackage(ctx, id);
  if (!fp.ok || !fp.pkg) return { ok: false, error: fp.error };
  const p = fp.pkg;
  const now = nowSec();
  if (p.definition == null) {
    if (isRegisteredPart(p.id)) {
      await installApp(ctx, p.id);
      return { ok: true, kind: "tool" };
    }
    return { ok: false, error: "このアプリは定義を取得できませんでした（パッケージが壊れている可能性があります）。" };
  }
  await ctx.db.run(
    `INSERT INTO app_versions (app_id,version,definition,permissions,source,created_at) VALUES (?,?,?,?, 'store', ?)
     ON CONFLICT(app_id,version) DO UPDATE SET definition=excluded.definition,permissions=excluded.permissions`,
    [p.id, p.version, p.definition != null ? JSON.stringify(p.definition) : null, JSON.stringify(p.permissions ?? []), now]
  );
  await ctx.db.run(
    `INSERT INTO external_apps (id,name,version,category,description,permissions,definition,active_version,source,allow_fork,forked_from_id,forked_from_name,forked_from_version,installed_at) VALUES (?,?,?,?,?,?,?,?, 'store', ?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name,version=excluded.version,category=excluded.category,
       description=excluded.description,permissions=excluded.permissions,definition=excluded.definition,active_version=excluded.active_version,source='store',allow_fork=excluded.allow_fork,forked_from_id=excluded.forked_from_id,forked_from_name=excluded.forked_from_name,forked_from_version=excluded.forked_from_version,installed_at=excluded.installed_at`,
    [p.id, p.name, p.version, p.category ?? null, p.description ?? null, JSON.stringify(p.permissions ?? []), p.definition != null ? JSON.stringify(p.definition) : null, p.version, p.allowFork ? 1 : 0, p.forkedFrom?.id ?? null, p.forkedFrom?.name ?? null, p.forkedFrom?.version ?? null, now]
  );
  return { ok: true, kind: "app" };
}
async function reconcileInstalledParts(ctx) {
  const rows = await ctx.db.all("SELECT id FROM external_apps WHERE definition IS NULL AND source='store'");
  let fixed = 0;
  for (const r of rows) {
    if (!isRegisteredPart(r.id)) continue;
    await installApp(ctx, r.id);
    await ctx.db.run("DELETE FROM external_apps WHERE id=?", [r.id]);
    await ctx.db.run("DELETE FROM app_versions WHERE app_id=?", [r.id]);
    fixed++;
  }
  return fixed;
}
async function listExternalApps(ctx) {
  const results = await ctx.db.all("SELECT id,name,version,category,description,permissions,source,allow_fork,allowed_roles,forked_from_id,forked_from_name,forked_from_version FROM external_apps ORDER BY installed_at DESC");
  return results.map((r) => ({ ...r, permissions: JSON.parse(r.permissions || "[]"), allow_fork: r.allow_fork || 0, allowed_roles: (() => {
    if (!r.allowed_roles) return null;
    try {
      const a = JSON.parse(r.allowed_roles);
      return Array.isArray(a) ? a : null;
    } catch {
      return null;
    }
  })() }));
}
async function uninstallExternal(ctx, id) {
  await ctx.db.run("DELETE FROM external_apps WHERE id=?", [id]);
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "app-" + randomId(3);
function repairUnitOutputLiteral(unit) {
  const out = unit.output;
  if (!out || typeof out.from !== "string" || !out.from.startsWith("$")) return;
  const ref = out.from.slice(1);
  const steps = Array.isArray(unit.steps) ? unit.steps : [];
  const names = /* @__PURE__ */ new Set();
  for (const i of Array.isArray(unit.inputs) ? unit.inputs : []) {
    const n2 = i.name;
    if (typeof n2 === "string") names.add(n2);
  }
  for (const s of steps) {
    if (typeof s.as === "string") names.add(s.as);
  }
  if (names.has(ref)) return;
  const looksLiteral = /\s/.test(ref) || /[^\x00-\x7F]/.test(ref) || ref.includes("{{") || ref.length > 40;
  if (!looksLiteral) return;
  let as = "outMsg", n = 1;
  while (names.has(as)) as = "outMsg" + ++n;
  unit.steps = [...steps, { op: "transform", as, template: ref }];
  out.from = "$" + as;
}
async function recheckDraft(ctx, draftId) {
  const d = await ctx.db.first(
    "SELECT name,version,description,spec,permissions,definition,changelog FROM app_drafts WHERE id=?",
    [draftId]
  );
  if (!d || !d.definition) return { ok: false };
  let def;
  try {
    def = JSON.parse(d.definition);
  } catch {
    return { ok: false };
  }
  let perms = [];
  try {
    perms = JSON.parse(d.permissions || "[]");
  } catch {
  }
  const res = await createDraft(ctx, { name: d.name, description: d.description ?? void 0, spec: d.spec ?? void 0, permissions: perms, definition: def, version: d.version, changelog: d.changelog ?? void 0 });
  return { ok: true, gate: res.gate };
}
function repairOutputLiterals(def) {
  try {
    repairUnitOutputLiteral(def);
    const screens = def.screens;
    if (Array.isArray(screens)) {
      for (const s of screens) if (s && typeof s === "object") repairUnitOutputLiteral(s);
    }
  } catch {
  }
}
async function createDraft(ctx, d, by) {
  if (d.definition && typeof d.definition === "object") {
    const r = d.definition.render;
    if (r && typeof r.html === "string") r.html = sanitizeRenderHtml(r.html);
    repairOutputLiterals(d.definition);
  }
  const defId = d.definition?.id;
  const id = typeof defId === "string" && /[a-z0-9]/i.test(defId) ? slug(defId) : slug(d.name);
  const pf = await preflight(ctx, { name: d.name, permissions: d.permissions, definition: d.definition, spec: d.spec, estTokens: d.estTokens, role: d.role });
  if (!isRunnableDefinition(d.definition)) {
    pf.checks.push({ key: "impl", label: "実装確認", status: "fail", detail: '実行可能なアプリ定義（入力 inputs・処理 steps・出力 output）がありません。仕様(spec)の文章だけでは動きません。propose_app の definition に schema="baku.app/1"・inputs・steps・output を必ず含めてください。' });
    pf.ok = false;
  }
  const gate = pf.ok ? "ready" : "blocked";
  await ctx.db.run(
    `INSERT INTO app_drafts (id,name,version,description,spec,permissions,definition,est_tokens,preflight,gate_status,changelog,forked_from_id,forked_from_name,forked_from_version,selfcheck,selfcheck_status,status,created_by,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,NULL, 'pending', ?, ?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name,version=excluded.version,description=excluded.description,spec=excluded.spec,
       permissions=excluded.permissions,definition=excluded.definition,est_tokens=excluded.est_tokens,preflight=excluded.preflight,gate_status=excluded.gate_status,changelog=excluded.changelog,
       forked_from_id=COALESCE(excluded.forked_from_id,forked_from_id),forked_from_name=COALESCE(excluded.forked_from_name,forked_from_name),forked_from_version=COALESCE(excluded.forked_from_version,forked_from_version),
       selfcheck=NULL,selfcheck_status=NULL,status='pending'`,
    [id, d.name, d.version ?? "0.1.0", d.description ?? null, d.spec ?? null, JSON.stringify(d.permissions ?? []), d.definition != null ? JSON.stringify(d.definition) : null, d.estTokens ?? null, JSON.stringify(pf), gate, d.changelog ?? null, d.forkedFrom?.id ?? null, d.forkedFrom?.name ?? null, d.forkedFrom?.version ?? null, by ?? null, nowSec()]
  );
  return { id, preflight: pf, gate };
}
async function forkExternalApp(ctx, sourceId, newName, by) {
  const src = await ctx.db.first("SELECT id,name,version,permissions,definition,allow_fork FROM external_apps WHERE id=?", [sourceId]);
  if (!src) return { ok: false, error: "派生元アプリが見つかりません" };
  if (!src.definition) return { ok: false, error: "派生元に実行可能な定義がありません" };
  if (!src.allow_fork) return { ok: false, error: "このアプリは拡張開発（フォーク）を許可していません" };
  const name = (newName || "").trim() || `${src.name}（派生）`;
  const newId = slug(name) + "-" + randomId(4);
  let def = {};
  try {
    def = JSON.parse(src.definition);
  } catch {
    return { ok: false, error: "派生元の定義を読み込めません" };
  }
  def = { ...def, id: newId, name, version: "0.1.0" };
  const permissions = JSON.parse(src.permissions || "[]");
  const res = await createDraft(ctx, {
    name,
    permissions,
    definition: def,
    version: "0.1.0",
    changelog: `「${src.name}」(v${src.version}) から派生して作成`,
    forkedFrom: { id: src.id, name: src.name, version: src.version },
    role: "admin"
  }, by);
  return { ok: true, draftId: res.id };
}
async function installLocalApp(ctx, draftId, by) {
  const d = await ctx.db.first("SELECT id,name,version,category,tags,description,permissions,definition,changelog,gate_status,forked_from_id,forked_from_name,forked_from_version FROM app_drafts WHERE id=?", [draftId]);
  if (!d) return { ok: false, error: "草案が見つかりません" };
  if (d.gate_status !== "ready") return { ok: false, error: "事前確認（環境/権限/安全/コスト）に未通過のため有効化できません。" };
  if (d.definition) {
    try {
      const jsErr = (await import("./appdef_CBJw5awM.mjs")).checkRenderScripts(JSON.parse(d.definition).render?.html ?? "");
      if (jsErr) return { ok: false, error: `カスタムUIのスクリプトに構文エラーがあり、このまま登録すると全ボタンが動きません。開発チャットで「ボタンが効くように修正して」と依頼してください。詳細：${jsErr}` };
    } catch {
    }
  }
  if (d.definition) {
    try {
      const parsed = JSON.parse(d.definition);
      if (parsed.render?.isolation === "relaxed") {
        const want = Array.isArray(parsed.render.allowHosts) ? parsed.render.allowHosts : [];
        const wantConn = Array.isArray(parsed.render.connectHosts) ? parsed.render.connectHosts : [];
        const approvedRaw = await ctx.env.LICENSE.get(`app_relaxed:${d.id}`);
        const approved = approvedRaw ? JSON.parse(approvedRaw) : null;
        const approvedHosts = approved ? approved.allowHosts ?? [] : null;
        const approvedConn = approved ? approved.connectHosts ?? [] : null;
        const okApproved = approvedHosts !== null && want.every((h) => approvedHosts.includes(h)) && approvedConn !== null && wantConn.every((h) => approvedConn.includes(h));
        const orgHosts = await getOrgRelaxedHosts(ctx.env);
        const autoAllowCurated = !okApproved && wantConn.length === 0 && want.length > 0 && want.every((h) => isCuratedHost(h) || orgHosts.includes(String(h).toLowerCase()));
        if (okApproved) {
        } else if (autoAllowCurated) {
          const mergedHosts = [.../* @__PURE__ */ new Set([...approvedHosts ?? [], ...want])];
          await ctx.env.LICENSE.put(`app_relaxed:${d.id}`, JSON.stringify({ allowHosts: mergedHosts, connectHosts: approvedConn ?? [] }));
        } else {
          parsed.render.isolation = "sandboxed";
          d.definition = JSON.stringify(parsed);
          const { createApproval } = await import("./approvals_CEi6BOlb.mjs");
          const connNote = wantConn.length ? `／外部通信先（connect）：${wantConn.join("、")}` : "";
          await createApproval(
            ctx.env,
            by ?? "system",
            "app_render_isolation_relaxed",
            { appId: d.id, allowHosts: want, connectHosts: wantConn },
            `【ネイティブ描画（relaxed）への昇格】アプリ「${d.name}」を別オリジン緩和(T1)で描画します。許可ホスト（読込）：${want.join("、") || "（なし）"}${connNote}。CDN等の外部コード読込を許可しますが、別オリジン隔離は維持され親データ(D1/Cookie)への到達は引き続き不可です。承認するまでは安全側（sandboxed）で描画します。`,
            { appId: d.id, role: "admin" }
          );
        }
      }
    } catch {
    }
  }
  const now = nowSec();
  const prev = await ctx.db.first(
    "SELECT definition,permissions FROM app_versions WHERE app_id=? AND version=?",
    [d.id, d.version]
  );
  if (prev && (prev.definition !== d.definition || prev.permissions !== d.permissions)) {
    const latest = await ctx.db.first(
      "SELECT version FROM app_versions WHERE app_id=? ORDER BY created_at DESC LIMIT 1",
      [d.id]
    );
    const nextV = nextPatchVersion(latest?.version || d.version);
    d.version = nextV;
    if (d.definition) {
      try {
        const p = JSON.parse(d.definition);
        p.version = nextV;
        d.definition = JSON.stringify(p);
      } catch {
      }
    }
    await ctx.db.run("UPDATE app_drafts SET version=?, definition=? WHERE id=?", [nextV, d.definition, d.id]).catch(() => {
    });
  }
  await ctx.db.run(
    `INSERT INTO app_versions (app_id,version,definition,permissions,changelog,source,created_by,created_at) VALUES (?,?,?,?,?,'local',?,?)
     ON CONFLICT(app_id,version) DO NOTHING`,
    [d.id, d.version, d.definition, d.permissions, d.changelog, by ?? null, now]
  );
  await ctx.db.run(
    `INSERT INTO external_apps (id,name,version,category,tags,description,permissions,definition,active_version,source,allow_fork,allowed_roles,forked_from_id,forked_from_name,forked_from_version,installed_at) VALUES (?,?,?,?,?,?,?,?,?, 'local', 0, '["admin"]',?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name,version=excluded.version,category=COALESCE(excluded.category,external_apps.category),tags=COALESCE(excluded.tags,external_apps.tags),description=excluded.description,permissions=excluded.permissions,definition=excluded.definition,active_version=excluded.active_version,source='local',forked_from_id=COALESCE(excluded.forked_from_id,external_apps.forked_from_id),forked_from_name=COALESCE(excluded.forked_from_name,external_apps.forked_from_name),forked_from_version=COALESCE(excluded.forked_from_version,external_apps.forked_from_version),installed_at=excluded.installed_at`,
    [d.id, d.name, d.version, d.category, d.tags, d.description, d.permissions, d.definition, d.version, d.forked_from_id, d.forked_from_name, d.forked_from_version, now]
  );
  try {
    if (d.definition) {
      const { rebuildPublicPageFromDef } = await import("./public-pages_DHQdIiIX.mjs");
      await rebuildPublicPageFromDef(ctx.env, d.id, JSON.parse(d.definition), d.name);
    }
  } catch {
  }
  return { ok: true, version: d.version };
}
async function appVersions(ctx, appId) {
  const rows = await ctx.db.all(
    "SELECT app_id,version,definition,permissions,changelog,source,created_by,created_at FROM app_versions WHERE app_id=? ORDER BY created_at DESC",
    [appId]
  );
  return rows.map((r) => ({ ...r, definition: r.definition ? JSON.parse(r.definition) : null, permissions: JSON.parse(r.permissions || "[]") }));
}
async function activateAppVersion(ctx, appId, version) {
  const v = await ctx.db.first("SELECT definition,permissions FROM app_versions WHERE app_id=? AND version=?", [appId, version]);
  if (!v) return { ok: false, error: "指定の版が見つかりません" };
  await ctx.db.run("UPDATE external_apps SET active_version=?, version=?, definition=?, permissions=? WHERE id=?", [version, version, v.definition, v.permissions, appId]);
  try {
    if (v.definition) {
      const { rebuildPublicPageFromDef } = await import("./public-pages_DHQdIiIX.mjs");
      await rebuildPublicPageFromDef(ctx.env, appId, JSON.parse(v.definition));
    }
  } catch {
  }
  return { ok: true };
}
async function deleteLocalApp(ctx, appId, deleteData = false) {
  await ctx.db.run("DELETE FROM external_apps WHERE id=?", [appId]);
  await ctx.db.run("DELETE FROM app_versions WHERE app_id=?", [appId]);
  await (await import("./public-pages_DHQdIiIX.mjs")).deletePublicPagesByApp(ctx.env, appId).catch(() => {
  });
  if (deleteData) await ctx.db.run("DELETE FROM app_records WHERE app_id=?", [appId]).catch(() => {
  });
}
function roleCanUseApp(role, allowedRolesJson) {
  if (role === "admin" || role === "developer") return true;
  if (role === "guest") return false;
  if (!allowedRolesJson) return true;
  let arr;
  try {
    arr = JSON.parse(allowedRolesJson);
  } catch {
    return true;
  }
  if (!Array.isArray(arr) || arr.length === 0) return true;
  return arr.includes(role);
}
async function getAppAllowedRoles(ctx, appId) {
  const r = await ctx.db.first("SELECT allowed_roles FROM external_apps WHERE id=?", [appId]);
  if (!r || !r.allowed_roles) return null;
  try {
    const a = JSON.parse(r.allowed_roles);
    return Array.isArray(a) ? a : null;
  } catch {
    return null;
  }
}
async function setAppAllowedRoles(ctx, appId, roles) {
  const valid = /* @__PURE__ */ new Set(["accounting", "clerical", "other", "member"]);
  const cleaned = [...new Set(roles.filter((r) => valid.has(r)))];
  await ctx.db.run("UPDATE external_apps SET allowed_roles=? WHERE id=?", [JSON.stringify(cleaned.length ? cleaned : ["admin"]), appId]);
}
async function installedAppDefs(ctx, role) {
  const rows = await ctx.db.all("SELECT id,name,description,definition,allowed_roles FROM external_apps WHERE definition IS NOT NULL");
  const out = [];
  for (const r of rows) {
    if (role && !roleCanUseApp(role, r.allowed_roles)) continue;
    try {
      const def = JSON.parse(r.definition);
      if (def?.schema) out.push({ id: r.id, name: r.name, description: r.description, definition: def });
    } catch {
    }
  }
  return out;
}
async function appsBrief(ctx) {
  const drafts = await ctx.db.all("SELECT id,name,version,gate_status FROM app_drafts ORDER BY created_at DESC");
  const inst = await ctx.db.all("SELECT id,name,version FROM external_apps WHERE definition IS NOT NULL");
  const byId = /* @__PURE__ */ new Map();
  for (const d of drafts) byId.set(d.id, { id: d.id, name: d.name, version: d.version, state: d.gate_status === "ready" ? "実装可" : d.gate_status === "blocked" ? "ブロック" : "企画中" });
  for (const e of inst) {
    const cur = byId.get(e.id);
    if (cur) cur.state = "導入済み";
    else byId.set(e.id, { id: e.id, name: e.name, version: e.version, state: "導入済み" });
  }
  return [...byId.values()];
}
async function getAppDesign(ctx, appId) {
  const d = await ctx.db.first("SELECT id,name,version,spec,permissions,definition,changelog FROM app_drafts WHERE id=?", [appId]);
  if (d) return { id: d.id, name: d.name, version: d.version, spec: d.spec, permissions: JSON.parse(d.permissions || "[]"), definition: d.definition ? JSON.parse(d.definition) : null, changelog: d.changelog, source: "draft" };
  const e = await ctx.db.first("SELECT id,name,version,permissions,definition FROM external_apps WHERE id=?", [appId]);
  if (e) return { id: e.id, name: e.name, version: e.version, spec: null, permissions: JSON.parse(e.permissions || "[]"), definition: e.definition ? JSON.parse(e.definition) : null, changelog: null, source: "installed" };
  return null;
}
async function installedAppLaunchers(ctx, role) {
  const rows = await ctx.db.all(
    "SELECT id,name,category,tags,definition,allowed_roles FROM external_apps WHERE definition IS NOT NULL"
  );
  const items = [];
  for (const r of rows) {
    if (role && !roleCanUseApp(role, r.allowed_roles)) continue;
    let def = null;
    try {
      def = JSON.parse(r.definition);
    } catch {
      continue;
    }
    if (!def?.schema) continue;
    const name = r.name || def.name || r.id;
    items.push({
      id: r.id,
      name,
      href: `/app/${r.id}`,
      category: (r.category || def.category || "アプリ").trim(),
      tags: parseTags(r.tags),
      icon: (def.icon || [...name][0] || "□").trim()
    });
  }
  return items.sort((x, y) => x.category.localeCompare(y.category, "ja") || x.name.localeCompare(y.name, "ja"));
}
async function activeAppDefinition(ctx, appId) {
  const r = await ctx.db.first("SELECT name,version,permissions,definition,allowed_roles FROM external_apps WHERE id=?", [appId]);
  if (!r) return null;
  return { name: r.name, version: r.version, permissions: JSON.parse(r.permissions || "[]"), definition: r.definition ? JSON.parse(r.definition) : null, allowed_roles: r.allowed_roles };
}
async function listDrafts(ctx) {
  const results = await ctx.db.all("SELECT id,name,version,description,spec,category,tags,permissions,status,gate_status,preflight,selfcheck_status,forked_from_id,forked_from_name,forked_from_version FROM app_drafts ORDER BY created_at DESC");
  return results.map((r) => ({ ...r, permissions: JSON.parse(r.permissions || "[]"), tags: parseTags(r.tags), preflight: r.preflight ? JSON.parse(r.preflight) : null }));
}
async function deleteDraft(ctx, id) {
  await ctx.db.run("DELETE FROM app_drafts WHERE id=?", [id]);
}
async function deleteGenApp(ctx, appId, deleteData = true) {
  const id = (appId || "").trim();
  if (!id) return;
  await deleteDraft(ctx, id);
  await deleteLocalApp(ctx, id, deleteData);
}
async function submitDraft(ctx, id) {
  const env = ctx.env;
  const d = await ctx.db.first("SELECT * FROM app_drafts WHERE id=?", [id]);
  if (!d) return { ok: false, error: "ドラフトが見つかりません" };
  if (d.gate_status !== "ready") return { ok: false, error: "事前確認（環境/権限/安全/コスト）に未通過のため公開申請できません。" };
  if (d.selfcheck_status !== "pass") return { ok: false, error: "公開申請の前にセルフチェックを実行し、通過する必要があります。" };
  const token = await getToken(env);
  if (!token) return { ok: false, error: "ライセンス未取得" };
  const app = { id: d.id, name: d.name, version: d.version, description: d.description, permissions: JSON.parse(d.permissions || "[]"), definition: d.definition ? JSON.parse(d.definition) : null };
  if (d.forked_from_id) app.forkedFrom = { id: d.forked_from_id, name: d.forked_from_name, version: d.forked_from_version };
  let r;
  try {
    r = await hostFetch(env, "/api/registry/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, app }) });
  } catch {
    return { ok: false, error: "ホストへ接続できません" };
  }
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    return { ok: false, error: j.error ?? "申請に失敗" };
  }
  await ctx.db.run("UPDATE app_drafts SET status='submitted' WHERE id=?", [id]);
  return { ok: true };
}
const bumpMinor = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v || "");
  return m ? `${m[1]}.${Number(m[2]) + 1}.0` : "0.2.0";
};
function parseJson(text) {
  if (!text) return null;
  let t = text.trim();
  const f = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (f) t = f[1].trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s < 0 || e <= s) return null;
  try {
    return JSON.parse(t.slice(s, e + 1));
  } catch {
    return null;
  }
}
const MERGE_SYSTEM = 'あなたはアプリのバージョン統合(マージ)担当です。派生アプリ(現行)とフォーク元(上流)の新バージョンの定義(JSON)を比較し、上流の改善・修正を派生側へ取り込むべきか判断します。派生側の独自カスタマイズは尊重・維持し、上流の有用な変更(バグ修正・新機能・項目追加)だけを統合してください。出力は厳密なJSONのみ(前置き・コードフェンス禁止)。形式：{"recommend":"merge"|"skip","rationale":"日本語で2〜4文。何を取り込む/取り込まない理由","definition":{統合後の完全なアプリ定義(schema:"baku.app/1")}}。recommend=skip のときは definition を空オブジェクト {} にしてよい。取り込む価値が小さい/競合が大きいときは skip。';
async function proposeUpstreamMerge(ctx, draftId) {
  const d = await ctx.db.first("SELECT id,name,version,definition,forked_from_id,forked_from_version FROM app_drafts WHERE id=?", [draftId]);
  if (!d) return { ok: false, error: "草案が見つかりません" };
  if (!d.forked_from_id) return { ok: false, error: "このアプリは派生(フォーク)ではないため、取り込む元がありません" };
  const fp = await fetchVerifiedPackage(ctx, d.forked_from_id);
  if (!fp.ok || !fp.pkg) return { ok: false, error: fp.error ?? "フォーク元を取得できません" };
  const upstreamVersion = fp.pkg.version;
  if (upstreamVersion === d.forked_from_version) return { ok: true, updated: false, upstreamVersion };
  let merged = null;
  let recommend = "skip";
  let rationale = "";
  try {
    const prompt = `派生アプリ(現行) 定義：
${(d.definition || "{}").slice(0, 7e3)}

フォーク元(上流) 新バージョン v${upstreamVersion} 定義：
${JSON.stringify(fp.pkg.definition ?? {}).slice(0, 7e3)}`;
    const out = await ctx.ai.infer(prompt, { system: MERGE_SYSTEM, maxTokens: 4e3 });
    const j = parseJson(out);
    if (j) {
      recommend = j.recommend === "merge" ? "merge" : "skip";
      rationale = typeof j.rationale === "string" ? j.rationale : "";
      if (recommend === "merge" && j.definition && typeof j.definition === "object") {
        const def = { ...j.definition, id: d.id, name: d.name, version: bumpMinor(d.version) };
        if (validateDefinition(def).ok) merged = def;
        else {
          recommend = "skip";
          rationale = (rationale ? rationale + " " : "") + "（統合案の定義に不備があったため、自動取り込みは見送りました。手動での更新をご検討ください。）";
        }
      }
    } else {
      rationale = "AIが統合案を生成できませんでした。時間をおいて再度お試しください。";
    }
  } catch {
    return { ok: false, error: "AIマージの実行でエラーが発生しました。時間をおいて再度お試しください。" };
  }
  const proposal = { upstreamVersion, recommend, rationale, definition: merged };
  await ctx.db.run("UPDATE app_drafts SET merge_proposal=? WHERE id=?", [JSON.stringify(proposal), draftId]);
  return { ok: true, updated: true, recommend, rationale, upstreamVersion };
}
async function applyUpstreamMerge(ctx, draftId, by) {
  const d = await ctx.db.first("SELECT id,name,permissions,merge_proposal,forked_from_id,forked_from_name FROM app_drafts WHERE id=?", [draftId]);
  if (!d) return { ok: false, error: "草案が見つかりません" };
  if (!d.merge_proposal) return { ok: false, error: "適用できる統合案がありません。先に更新を確認してください。" };
  let p;
  try {
    p = JSON.parse(d.merge_proposal);
  } catch {
    return { ok: false, error: "統合案の読み込みに失敗しました" };
  }
  if (p.recommend !== "merge" || !p.definition) return { ok: false, error: "この更新はマージ非推奨のため適用できません" };
  await createDraft(ctx, {
    name: d.name,
    permissions: JSON.parse(d.permissions || "[]"),
    definition: p.definition,
    version: String(p.definition.version ?? bumpMinor("0.1.0")),
    changelog: `フォーク元の更新(v${p.upstreamVersion})を取り込み`,
    forkedFrom: d.forked_from_id ? { id: d.forked_from_id, name: d.forked_from_name, version: p.upstreamVersion } : void 0,
    role: "admin"
  }, by);
  await ctx.db.run("UPDATE app_drafts SET merge_proposal=NULL WHERE id=?", [draftId]);
  return { ok: true, version: String(p.definition.version ?? "") };
}
const externalApps = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activateAppVersion,
  activeAppDefinition,
  addOrgRelaxedHosts,
  appVersions,
  applyUpstreamMerge,
  appsBrief,
  createDraft,
  deleteDraft,
  deleteGenApp,
  deleteLocalApp,
  enableRelaxedForApp,
  fetchAndInstall,
  forkExternalApp,
  getAppAllowedRoles,
  getAppDesign,
  getOrgRelaxedHosts,
  installLocalApp,
  installedAppDefs,
  installedAppLaunchers,
  isRegisteredPart,
  listDrafts,
  listExternalApps,
  pendingRelaxedHosts,
  proposeUpstreamMerge,
  recheckDraft,
  reconcileInstalledParts,
  repairOutputLiterals,
  roleCanUseApp,
  setAppAllowedRoles,
  submitDraft,
  uninstallExternal
}, Symbol.toStringTag, { value: "Module" }));
export {
  appMeta as A,
  externalApps as B,
  activeAppDefinition as a,
  listExternalApps as b,
  forkExternalApp as c,
  applyUpstreamMerge as d,
  deleteDraft as e,
  fetchAndInstall as f,
  getAppDesign as g,
  appVersions as h,
  installLocalApp as i,
  activateAppVersion as j,
  deleteLocalApp as k,
  listDrafts as l,
  appsBrief as m,
  createDraft as n,
  repairOutputLiterals as o,
  proposeUpstreamMerge as p,
  getAppMeta as q,
  roleCanUseApp as r,
  submitDraft as s,
  setAppMeta as t,
  uninstallExternal as u,
  suggestAppMeta as v,
  pendingRelaxedHosts as w,
  isRegisteredPart as x,
  setAppAllowedRoles as y,
  installedAppDefs as z
};
