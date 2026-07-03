globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
const MAX_ACTIONS = 6;
const MAX_LABEL = 40;
const isRelPath = (s) => /^\/[^/]/.test(s) || s.startsWith("/#") || s === "/";
const isLinkHref = (s) => isRelPath(s) || /^https:\/\//.test(s);
const str = (v, max = 2e3) => typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
const style = (v) => v === "primary" || v === "ghost" ? v : "ghost";
function sanitizeOne(raw) {
  if (!raw || typeof raw !== "object") return null;
  const a = raw;
  const label = str(a.label, MAX_LABEL);
  if (!label) return null;
  switch (a.kind) {
    case "reply": {
      const text = str(a.text);
      return text ? { label, kind: "reply", text, style: style(a.style) } : null;
    }
    case "copy": {
      const text = str(a.text);
      return text ? { label, kind: "copy", text, style: style(a.style) } : null;
    }
    case "navigate": {
      const href = str(a.href, 1e3);
      return href && isRelPath(href) ? { label, kind: "navigate", href, style: style(a.style) } : null;
    }
    case "link": {
      const href = str(a.href, 1e3);
      return href && isLinkHref(href) ? { label, kind: "link", href, style: style(a.style) } : null;
    }
    case "api": {
      const endpoint = str(a.endpoint, 200);
      if (!endpoint || !endpoint.startsWith("/api/")) return null;
      const payload = a.payload && typeof a.payload === "object" ? a.payload : void 0;
      const then = str(a.then, 1e3);
      return {
        label,
        kind: "api",
        endpoint,
        ...payload ? { payload } : {},
        ...str(a.successMsg, 200) ? { successMsg: str(a.successMsg, 200) } : {},
        ...then && isRelPath(then) ? { then } : {},
        ...a.reload === true ? { reload: true } : {},
        style: style(a.style)
      };
    }
    default:
      return null;
  }
}
function sanitizeActions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(sanitizeOne).filter((x) => x !== null).slice(0, MAX_ACTIONS);
}
function serializeActions(actions) {
  const arr = sanitizeActions(actions ?? []);
  return arr.length ? JSON.stringify(arr) : null;
}
function parseActions(s) {
  if (!s) return [];
  try {
    return sanitizeActions(JSON.parse(s));
  } catch {
    return [];
  }
}
const NAV_ROUTES = [
  { href: "/approvals", label: "承認待ち一覧を開く", admin: true, alias: /承認待ち|承認画面|承認の状況|承認すると/ },
  { href: "/settings/members", label: "メンバー管理を開く", admin: true },
  { href: "/settings/agent", label: "AIエージェント設定を開く", admin: true },
  { href: "/settings/keys", label: "APIキー設定を開く", admin: true },
  { href: "/settings/messaging", label: "通知・連携設定を開く", admin: true },
  { href: "/settings/integrations", label: "外部連携設定を開く", admin: true },
  { href: "/settings/a2a", label: "他団体連携を開く", admin: true },
  { href: "/settings/public", label: "公開ページ設定を開く", admin: true },
  { href: "/settings/domain", label: "独自ドメイン設定を開く", admin: true },
  { href: "/settings/advanced", label: "高度なオプションを開く", admin: true },
  { href: "/settings/theme", label: "配色・外観設定を開く", admin: true },
  { href: "/settings/nav", label: "メニュー表示設定を開く", admin: true },
  { href: "/settings/org", label: "団体設定を開く", admin: true },
  { href: "/billing", label: "プラン・請求を開く" },
  { href: "/apps", label: "アプリ画面を開く" },
  { href: "/settings", label: "設定を開く", admin: true }
];
const NAV_PATH_RE = /\/(?:approvals|apps|billing|settings(?:\/[a-z0-9-]+)?)\b/g;
function navGuidance(reply, role) {
  const text = reply || "";
  const paths = /* @__PURE__ */ new Set();
  for (const m of text.matchAll(NAV_PATH_RE)) paths.add(m[0]);
  const out = [];
  for (const r of NAV_ROUTES) {
    if (r.admin && role !== "admin") continue;
    if (!paths.has(r.href) && !(r.alias && r.alias.test(text))) continue;
    out.push({ label: r.label, kind: "navigate", href: r.href, style: "ghost" });
    if (out.length >= 3) break;
  }
  return out;
}
const NAV_HREFS = new Set(NAV_ROUTES.map((r) => r.href));
const ADMIN_NAV_HREFS = new Set(NAV_ROUTES.filter((r) => r.admin).map((r) => r.href));
function navHrefAllowed(href) {
  return NAV_HREFS.has(href) || /^\/(app|p)\/[A-Za-z0-9_-]+/.test(href) || /^\/apps(\?|#|$)/.test(href);
}
function filterAiActions(raw, role) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const a of raw) {
    if (!a || !a.kind) continue;
    if (a.kind === "reply" || a.kind === "copy") {
      out.push(a);
      continue;
    }
    if (a.kind === "navigate") {
      if (!navHrefAllowed(a.href)) continue;
      if (ADMIN_NAV_HREFS.has(a.href) && role !== "admin") continue;
      out.push(a);
      continue;
    }
    if (a.kind === "link") {
      out.push(a);
      continue;
    }
  }
  return out;
}
function dedupeActions(actions) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const a of actions) {
    const x = a;
    const key = a.kind + "|" + (x.href ?? x.text ?? x.endpoint ?? a.label);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}
const MARKER = /<!--\s*bo-actions:\s*(\[[\s\S]*?\])\s*-->/;
function extractActions(text) {
  const m = text.match(MARKER);
  if (!m) return { content: text, actions: [] };
  let actions = [];
  try {
    actions = sanitizeActions(JSON.parse(m[1]));
  } catch {
    actions = [];
  }
  const content = text.replace(MARKER, "").trimEnd();
  return { content, actions };
}
const chatActions = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dedupeActions,
  extractActions,
  filterAiActions,
  navGuidance,
  parseActions,
  sanitizeActions,
  serializeActions
}, Symbol.toStringTag, { value: "Module" }));
async function listSessions(ctx, owner) {
  return await ctx.db.all("SELECT id,title,model,updated_at FROM chat_sessions WHERE owner=? ORDER BY updated_at DESC LIMIT 50", [owner]);
}
async function createSession(ctx, owner, model) {
  const id = randomId();
  const now = nowSec();
  await ctx.db.run(
    "INSERT INTO chat_sessions (id,owner,title,model,created_at,updated_at) VALUES (?,?,?,?,?,?)",
    [id, owner, null, model ?? null, now, now]
  );
  return id;
}
async function deleteSession(ctx, owner, id) {
  const s = await ctx.db.first("SELECT id FROM chat_sessions WHERE id=? AND owner=?", [id, owner]);
  if (!s) return;
  await ctx.db.run("DELETE FROM chat_messages WHERE session_id=?", [id]);
  await ctx.db.run("DELETE FROM chat_sessions WHERE id=?", [id]);
}
async function ownedSession(ctx, owner, id) {
  return await ctx.db.first("SELECT id,model FROM chat_sessions WHERE id=? AND owner=?", [id, owner]) ?? null;
}
async function getMessages(ctx, sessionId) {
  const rows = await ctx.db.all(
    "SELECT id,role,content,created_at,actions FROM chat_messages WHERE session_id=? ORDER BY created_at LIMIT 200",
    [sessionId]
  );
  return rows.map((r) => ({ id: r.id, role: r.role, content: r.content, created_at: r.created_at, actions: parseActions(r.actions) }));
}
async function appendMessage(ctx, sessionId, role, content, actions) {
  const id = randomId();
  await ctx.db.run(
    "INSERT INTO chat_messages (id,session_id,role,content,created_at,actions) VALUES (?,?,?,?,?,?)",
    [id, sessionId, role, content, nowSec(), serializeActions(actions)]
  );
  await ctx.db.run("UPDATE chat_sessions SET updated_at=? WHERE id=?", [nowSec(), sessionId]);
  return id;
}
async function ensureTitle(ctx, sessionId, firstText) {
  await ctx.db.run(
    "UPDATE chat_sessions SET title=? WHERE id=? AND (title IS NULL OR title='')",
    [firstText.slice(0, 40), sessionId]
  );
}
function toTurns(msgs, limit = 20) {
  return msgs.slice(-limit).map((m) => m.role === "assistant" ? { role: "assistant", text: m.content } : { role: "user", text: m.content });
}
const chatSessions = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  appendMessage,
  createSession,
  deleteSession,
  ensureTitle,
  getMessages,
  listSessions,
  ownedSession,
  toTurns
}, Symbol.toStringTag, { value: "Module" }));
export {
  appendMessage as a,
  deleteSession as b,
  createSession as c,
  dedupeActions as d,
  ensureTitle as e,
  filterAiActions as f,
  getMessages as g,
  chatActions as h,
  chatSessions as i,
  listSessions as l,
  navGuidance as n,
  ownedSession as o,
  toTurns as t
};
