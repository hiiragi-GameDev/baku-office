globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { r as rateLimited$1 } from "./rate-limit_B3Jlq_2x.mjs";
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function renderFormHtml(opts) {
  const fieldHtml = (f) => {
    const name = escapeHtml(f.name);
    const label = escapeHtml(f.label || f.name) + (f.required ? ' <span style="color:#946F2C">*</span>' : "");
    const req = f.required ? " required" : "";
    const ph = f.placeholder ? ` placeholder="${escapeHtml(String(f.placeholder))}"` : "";
    let control;
    if (f.type === "textarea") control = `<textarea class="bo-input" name="${name}"${req}${ph}></textarea>`;
    else if (f.type === "select") control = `<select class="bo-input" name="${name}"${req}>${(f.options ?? []).map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("")}</select>`;
    else if (f.type === "boolean") return `<div class="bo-field"><label><input type="checkbox" name="${name}" style="width:auto;margin-right:8px">${label}</label></div>`;
    else if (f.type === "file") control = `<input class="bo-input" type="file" name="${name}"${f.accept ? ` accept="${escapeHtml(f.accept)}"` : ""}${req}>`;
    else control = `<input class="bo-input" type="${f.type === "number" ? "number" : "text"}" name="${name}"${req}${ph}>`;
    return `<div class="bo-field"><label class="bo-label" for="${name}">${label}</label>${control}</div>`;
  };
  const fields = (opts.fields ?? []).filter((f) => f && f.name && !f.name.startsWith("_"));
  const fileField = opts.allowFiles && !fields.some((f) => f.type === "file") ? '<div class="bo-field"><label class="bo-label">添付ファイル（任意）</label><input class="bo-input" type="file" name="attachment" multiple></div>' : "";
  return [
    '<div class="bo-wrap">',
    '<div class="bo-card">',
    `<h1>${escapeHtml(opts.title)}</h1>`,
    opts.intro ? `<p class="bo-muted">${escapeHtml(opts.intro)}</p>` : "",
    "<form>",
    fields.map(fieldHtml).join(""),
    fileField,
    // honeypot（人間には見えない・bot が埋めがちな囮フィールド）。
    '<div style="position:absolute;left:-9999px" aria-hidden="true"><label>この欄は空のままにしてください<input name="_hp" tabindex="-1" autocomplete="off"></label></div>',
    `<div class="bo-actions"><button type="submit" class="bo-btn">${escapeHtml(opts.submitLabel || "送信する")}</button></div>`,
    "</form>",
    "</div></div>"
  ].join("");
}
function fieldsFromDefinition(def) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const add = (arr) => {
    if (Array.isArray(arr)) for (const f of arr) {
      const ff = f;
      if (ff && ff.name && !ff.name.startsWith("_") && !seen.has(ff.name)) {
        seen.add(ff.name);
        out.push(ff);
      }
    }
  };
  add(def.inputs);
  const screens = def.screens;
  if (Array.isArray(screens)) for (const s of screens) add(s.inputs);
  return out;
}
function collectionFromDefinition(def) {
  const units = [];
  const screens = def.screens;
  if (Array.isArray(screens)) units.push(...screens);
  units.push(def);
  for (const u of units) {
    const steps = u.steps;
    if (Array.isArray(steps)) for (const st of steps) {
      const s = st;
      if (s && s.op === "data.create" && typeof s.collection === "string" && s.collection.trim()) return s.collection;
    }
  }
  return null;
}
function publicFieldsForDefinition(def) {
  const fields = fieldsFromDefinition(def);
  const hasCustom = !!(def.render && typeof def.render.html === "string" && String(def.render.html).trim());
  return hasCustom ? fields.map((f) => ({ name: f.name, label: f.label, type: "text", required: false })) : fields;
}
function publicHtmlForDefinition(def, title, intro, allowFiles = false, fields) {
  const customHtml = def.render && typeof def.render.html === "string" ? String(def.render.html).trim() : "";
  return customHtml || renderFormHtml({ title, intro, fields: fields ?? fieldsFromDefinition(def), allowFiles, submitLabel: "送信する" });
}
async function rebuildPublicPageFromDef(env, slug, def, title) {
  const page = await getPublicPageAny(env, slug);
  if (!page) return { ok: false, error: "公開ページが見つかりません。" };
  const fields = publicFieldsForDefinition(def);
  const html = publicHtmlForDefinition(def, title || page.title, void 0, page.allow_files, fields);
  const r = await upsertPublicPage(env, {
    slug,
    appId: page.app_id,
    title: title || page.title,
    html,
    fields,
    allowFiles: page.allow_files,
    notifyAdmin: page.notify_admin,
    confirmEmail: page.confirm_email,
    emailField: page.email_field,
    confirmSubject: page.confirm_subject,
    confirmBody: page.confirm_body,
    price: page.price ?? 0,
    currency: page.currency ?? "jpy",
    payLabel: page.pay_label,
    enabled: page.enabled,
    // 既存設定を維持しつつ、取り込み先 collection は最新定義から取り直す（保存先変更に追従）。
    autoApprove: page.auto_approve,
    collection: collectionFromDefinition(def)
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,47}$/;
function normalizeSlug(input) {
  const s = (input || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return s || "p" + Math.abs(hashStr(input || String(nowSec()))).toString(36).slice(0, 8);
}
function isValidSlug(s) {
  return SLUG_RE.test(s);
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}
function ipHash(ip) {
  return Math.abs(hashStr("bo:" + ip)).toString(36);
}
function toPage(r) {
  let fields = [];
  try {
    const p = JSON.parse(r.fields);
    if (Array.isArray(p)) fields = p;
  } catch {
  }
  return {
    slug: r.slug,
    app_id: r.app_id,
    title: r.title,
    html: r.html,
    fields,
    allow_files: !!r.allow_files,
    enabled: !!r.enabled,
    created_by: r.created_by,
    notify_admin: r.notify_admin == null ? true : !!r.notify_admin,
    confirm_email: !!r.confirm_email,
    email_field: r.email_field,
    confirm_subject: r.confirm_subject,
    confirm_body: r.confirm_body,
    price: r.price ?? 0,
    currency: r.currency ?? "jpy",
    pay_label: r.pay_label,
    register_mode: r.register_mode === "guest" ? "guest" : "none",
    auto_approve: r.auto_approve == null ? true : !!r.auto_approve,
    collection: r.collection ?? null,
    capacity: r.capacity == null ? null : Number(r.capacity)
  };
}
const PAGE_COLS = "slug,app_id,title,html,fields,allow_files,enabled,created_by,notify_admin,confirm_email,email_field,confirm_subject,confirm_body,price,currency,pay_label,register_mode,auto_approve,collection,capacity";
async function setRegisterMode(env, slug, mode) {
  await env.DB.prepare("UPDATE public_pages SET register_mode=?, updated_at=? WHERE slug=?").bind(mode, nowSec(), slug).run();
}
async function getPublicPage(env, slug) {
  const r = await env.DB.prepare(`SELECT ${PAGE_COLS} FROM public_pages WHERE slug=? AND enabled=1`).bind(slug).first();
  return r ? toPage(r) : null;
}
async function getPublicPageAny(env, slug) {
  const r = await env.DB.prepare(`SELECT ${PAGE_COLS} FROM public_pages WHERE slug=?`).bind(slug).first();
  return r ? toPage(r) : null;
}
async function listPublicPages(env) {
  const { results } = await env.DB.prepare(`SELECT ${PAGE_COLS} FROM public_pages ORDER BY updated_at DESC`).all();
  const out = [];
  for (const r of results) {
    const c = await env.DB.prepare("SELECT COUNT(*) n FROM public_submissions WHERE slug=? AND status='pending'").bind(r.slug).first();
    out.push({ ...toPage(r), pending: c?.n ?? 0 });
  }
  return out;
}
async function upsertPublicPage(env, p) {
  const slug = isValidSlug(p.slug) ? p.slug : normalizeSlug(p.slug || p.title);
  const existing = await getPublicPageAny(env, slug);
  if (existing && existing.app_id !== p.appId) return { ok: false, error: "この公開URLは既に使われています。別の名前にしてください。" };
  const now = nowSec();
  await env.DB.prepare(
    `INSERT INTO public_pages (slug,app_id,title,html,fields,allow_files,enabled,created_by,notify_admin,confirm_email,email_field,confirm_subject,confirm_body,price,currency,pay_label,auto_approve,collection,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(slug) DO UPDATE SET title=excluded.title, html=excluded.html, fields=excluded.fields, allow_files=excluded.allow_files,
       notify_admin=excluded.notify_admin, confirm_email=excluded.confirm_email, email_field=excluded.email_field,
       confirm_subject=excluded.confirm_subject, confirm_body=excluded.confirm_body, price=excluded.price, currency=excluded.currency,
       pay_label=excluded.pay_label, auto_approve=excluded.auto_approve, collection=excluded.collection, updated_at=excluded.updated_at`
  ).bind(
    slug,
    p.appId,
    p.title.slice(0, 200),
    p.html.slice(0, 256 * 1024),
    JSON.stringify(p.fields ?? []),
    p.allowFiles ? 1 : 0,
    p.enabled === false ? 0 : 1,
    p.createdBy ?? null,
    p.notifyAdmin === false ? 0 : 1,
    p.confirmEmail ? 1 : 0,
    p.emailField ?? null,
    p.confirmSubject ?? null,
    p.confirmBody ?? null,
    Math.max(0, Math.round(p.price ?? 0)),
    (p.currency ?? "jpy").toLowerCase().slice(0, 8),
    p.payLabel ?? null,
    p.autoApprove === false ? 0 : 1,
    p.collection ?? null,
    now,
    now
  ).run();
  return { ok: true, slug };
}
async function setSubmissionPayment(env, id, status, amount, sessionId) {
  await env.DB.prepare("UPDATE public_submissions SET pay_status=?, amount=?, stripe_session=COALESCE(?, stripe_session) WHERE id=?").bind(status, amount, sessionId ?? null, id).run();
}
async function markSubmissionPaidBySession(env, submissionId) {
  const row = await env.DB.prepare("SELECT slug,pay_status FROM public_submissions WHERE id=?").bind(submissionId).first();
  if (!row) return { ok: false };
  if (row.pay_status !== "paid") {
    await env.DB.prepare("UPDATE public_submissions SET pay_status='paid' WHERE id=?").bind(submissionId).run();
  }
  return { ok: true, slug: row.slug };
}
async function fireSubmitTriggers(ctx, page, data) {
  if (page.notify_admin && page.created_by) {
    await ctx.notify.inapp(page.created_by, `「${page.title}」に新しい申込/送信が届きました。`, "/settings/public").catch(() => void 0);
  }
  if (page.confirm_email && page.email_field) {
    const to = String(data[page.email_field] ?? "").trim();
    if (to && /@/.test(to)) {
      await ctx.notify.email(to, page.confirm_subject || `【${page.title}】受付完了`, page.confirm_body || `${page.title} を受け付けました。ありがとうございました。`).catch(() => void 0);
    }
  }
  if (page.register_mode === "guest") {
    await registerGuestFromSubmission(ctx, page, data).catch(() => void 0);
  }
}
async function registerGuestFromSubmission(ctx, page, data) {
  const env = ctx.env;
  const entries = Object.entries(data).filter(([k]) => !k.startsWith("_"));
  const find = (re) => entries.find(([k]) => re.test(k))?.[1];
  const fieldLabel = (re) => page.fields.find((f) => re.test(f.name) || re.test(f.label ?? ""))?.name;
  const byLabel = (re) => {
    const n = fieldLabel(re);
    return n ? data[n] : void 0;
  };
  const name = String(byLabel(/(名前|氏名|name|なまえ)/i) ?? find(/(名前|氏名|name)/i) ?? "").trim().slice(0, 80) || "（公開フォーム）";
  const email = page.email_field ? String(data[page.email_field] ?? "").trim() : String(byLabel(/(メール|email|mail)/i) ?? "").trim();
  const tel = String(byLabel(/(電話|tel|phone|連絡)/i) ?? "").trim();
  const contact = [email, tel].filter(Boolean).join(" / ").slice(0, 200);
  if (contact) {
    const dup = await env.DB.prepare("SELECT id FROM members WHERE contact=? LIMIT 1").bind(contact).first().catch(() => null);
    if (dup) return;
  }
  const { createMember } = await import("./membership_DQ1fLu2V.mjs");
  await createMember(env, { name, contact, fee_status: "unpaid", extra: `公開フォーム「${page.title}」から登録` });
}
async function setPublicEnabled(env, slug, enabled) {
  await env.DB.prepare("UPDATE public_pages SET enabled=?, updated_at=? WHERE slug=?").bind(enabled ? 1 : 0, nowSec(), slug).run();
}
async function deletePublicPage(env, slug) {
  await env.DB.prepare("DELETE FROM public_submissions WHERE slug=?").bind(slug).run().catch(() => {
  });
  await env.DB.prepare("DELETE FROM public_pages WHERE slug=?").bind(slug).run();
}
async function deletePublicPagesByApp(env, appId) {
  await env.DB.prepare("DELETE FROM public_submissions WHERE app_id=?").bind(appId).run().catch(() => {
  });
  await env.DB.prepare("DELETE FROM public_pages WHERE app_id=?").bind(appId).run().catch(() => {
  });
}
const RL_CAP = 8;
async function rateLimited(env, ip) {
  return rateLimited$1(env, `pubform:${ip}`, RL_CAP, 3600);
}
function honeypotTripped(values) {
  return typeof values._hp === "string" && values._hp.trim() !== "";
}
const MAX_VALUE_LEN = 5e3;
function validateSubmission(fields, values) {
  const clean = {};
  for (const f of fields) {
    if (!f || !f.name || f.name.startsWith("_")) continue;
    const raw = values[f.name];
    const empty = raw == null || raw === "";
    if (f.required && empty) return { ok: false, error: `「${f.label || f.name}」は必須です。`, clean };
    if (empty) continue;
    if (f.type === "number") {
      const n = Number(raw);
      if (!Number.isFinite(n)) return { ok: false, error: `「${f.label || f.name}」は数値で入力してください。`, clean };
      clean[f.name] = n;
    } else if (f.type === "boolean") {
      clean[f.name] = raw === true || raw === "true" || raw === "on" || raw === "1";
    } else if (f.type === "select") {
      const v = String(raw);
      if (Array.isArray(f.options) && f.options.length && !f.options.includes(v)) return { ok: false, error: `「${f.label || f.name}」の選択値が不正です。`, clean };
      clean[f.name] = v;
    } else {
      clean[f.name] = String(raw).slice(0, MAX_VALUE_LEN);
    }
  }
  return { ok: true, clean };
}
async function createSubmission(env, page, data, files, ip, status = "pending") {
  const id = randomId();
  await env.DB.prepare(
    "INSERT INTO public_submissions (id,slug,app_id,data,files,ip_hash,status,created_at) VALUES (?,?,?,?,?,?,?,?)"
  ).bind(id, page.slug, page.app_id, JSON.stringify(data).slice(0, 64 * 1024), files.length ? JSON.stringify(files) : null, ipHash(ip), status, nowSec()).run();
  return { id };
}
async function seatsTaken(env, slug) {
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM public_submissions WHERE slug=? AND status IN ('pending','approved')").bind(slug).first();
  return r?.n ?? 0;
}
async function wouldWaitlist(env, page) {
  if (page.capacity == null || page.capacity <= 0) return false;
  return await seatsTaken(env, page.slug) >= page.capacity;
}
async function setCapacity(env, slug, capacity) {
  const v = capacity == null || !Number.isFinite(capacity) || capacity <= 0 ? null : Math.floor(capacity);
  await env.DB.prepare("UPDATE public_pages SET capacity=?, updated_at=? WHERE slug=?").bind(v, nowSec(), slug).run();
}
async function listSubmissions(env, slug, status = "pending", limit = 100) {
  const { results } = await env.DB.prepare(
    "SELECT id,slug,app_id,data,files,status,created_at FROM public_submissions WHERE slug=? AND status=? ORDER BY created_at DESC LIMIT ?"
  ).bind(slug, status, limit).all();
  return results;
}
async function moderate(env, id, action, reviewer) {
  const row = await env.DB.prepare("SELECT id,slug,app_id,data,files,status FROM public_submissions WHERE id=?").bind(id).first();
  if (!row) return { ok: false, error: "送信が見つかりません。" };
  if (row.status !== "pending" && row.status !== "waitlist") return { ok: false, error: "この送信は既に処理済みです。" };
  if (action === "approve") {
    const page = await getPublicPageAny(env, row.slug);
    const owner = page?.created_by ?? "public";
    const payload = (() => {
      try {
        return JSON.parse(row.data);
      } catch {
        return {};
      }
    })();
    const data = JSON.stringify({ ...payload, _public: true, _files: row.files ? JSON.parse(row.files) : [], _submission_id: row.id });
    await env.DB.prepare("INSERT INTO app_records (id,app_id,owner,data,collection,created_at) VALUES (?,?,?,?,?,?)").bind(randomId(), row.app_id, owner, data, page?.collection ?? null, nowSec()).run();
  }
  await env.DB.prepare("UPDATE public_submissions SET status=?, reviewed_by=?, reviewed_at=? WHERE id=?").bind(action === "approve" ? "approved" : "rejected", reviewer, nowSec(), id).run();
  return { ok: true };
}
export {
  collectionFromDefinition,
  createSubmission,
  deletePublicPage,
  deletePublicPagesByApp,
  escapeHtml,
  fieldsFromDefinition,
  fireSubmitTriggers,
  getPublicPage,
  getPublicPageAny,
  honeypotTripped,
  isValidSlug,
  listPublicPages,
  listSubmissions,
  markSubmissionPaidBySession,
  moderate,
  normalizeSlug,
  publicFieldsForDefinition,
  publicHtmlForDefinition,
  rateLimited,
  rebuildPublicPageFromDef,
  renderFormHtml,
  seatsTaken,
  setCapacity,
  setPublicEnabled,
  setRegisterMode,
  setSubmissionPayment,
  upsertPublicPage,
  validateSubmission,
  wouldWaitlist
};
