globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { audit } from "./storage_BHLYBEBb.mjs";
const A2A_OUTWARD = /* @__PURE__ */ new Set(["call_partner", "broadcast_group", "call_group_member", "call_public", "send_inquiry"]);
function needsApproval(name, activeTools) {
  if (A2A_OUTWARD.has(name)) return true;
  const t = activeTools.find((x) => x.name === name);
  return t?.unattended === false;
}
async function getApprovalMode(env) {
  return await env.LICENSE.get("agent_approval") !== "off";
}
async function setApprovalMode(env, on) {
  await kvPut(env, "agent_approval", on ? "on" : "off");
  return on;
}
function previewFor(tool, args) {
  const s = (k) => args[k] == null ? "" : String(args[k]);
  switch (tool) {
    case "send_message":
      return `メール送信：宛先「${s("to")}」／件名「${s("subject")}」`;
    case "send_notice":
      return s("channel") === "discord" ? `連携チャンネルへ送信：「${s("message").slice(0, 80)}」` : `メール送信：宛先「${s("to")}」／件名「${s("subject") || "（無題）"}」／本文「${s("message").slice(0, 60)}」`;
    case "post_social":
      return `SNS投稿（${s("platform")}・外部公開）：「${s("text").slice(0, 100)}」${s("image_url") ? "＋画像" : ""}`;
    case "update_event":
      return `予定の変更：「${s("title") || s("event_id")}」`;
    case "delete_event":
      return `予定の削除：event_id「${s("event_id")}」`;
    case "call_partner":
      return `他団体連携（A2A）：partner=${s("partner")} / action=${s("action")}`;
    case "broadcast_group":
      return `グループ同報（A2A）：group=${s("group")} / action=${s("action")}`;
    case "call_group_member":
      return `グループ内連携（A2A）：group=${s("group")} / partner=${s("partner")} / action=${s("action")}`;
    case "call_public":
      return `公開団体への連絡（A2A）：partner=${s("partner")} / action=${s("action")}`;
    case "send_inquiry":
      return `公開団体への問い合わせ：partner=${s("partner")} / 本文「${s("message").slice(0, 60)}」`;
    default: {
      const j = JSON.stringify(args ?? {});
      return `${tool}（${j.length > 200 ? j.slice(0, 200) + "…" : j}）`;
    }
  }
}
function canonicalJson(v) {
  const norm = (x) => {
    if (Array.isArray(x)) return x.map(norm);
    if (x && typeof x === "object") return Object.fromEntries(Object.keys(x).sort().map((k) => [k, norm(x[k])]));
    return x;
  };
  return JSON.stringify(norm(v ?? {}));
}
async function createApproval(env, owner, tool, args, preview, meta) {
  const argsJson = canonicalJson(args ?? {});
  const dup = await env.DB.prepare("SELECT id FROM agent_approvals WHERE owner=? AND tool=? AND args=? AND status='pending' ORDER BY created_at DESC LIMIT 1").bind(owner, tool, argsJson).first();
  if (dup?.id) return dup.id;
  const id = randomId();
  await env.DB.prepare("INSERT INTO agent_approvals (id,owner,tool,args,preview,status,created_at,requester_role,requester_ctx,app_id,screen_id,app_version,subject_type,def_hash,perms_hash) VALUES (?,?,?,?,?, 'pending', ?,?,?,?,?,?,?,?,?)").bind(id, owner, tool, argsJson, preview, nowSec(), meta?.role ?? null, meta?.ctx ?? null, meta?.appId ?? null, meta?.screenId ?? null, meta?.appVersion ?? null, meta?.subjectType ?? null, meta?.defHash ?? null, meta?.permsHash ?? null).run();
  await audit(env, owner, "agent_approval_request", `${tool}:${id}`);
  try {
    const { notifyHook, notifyAdminsLine } = await import("./notifications_DKh03i2Y.mjs");
    const msg = `🔔 AIの操作に承認が必要です。
${preview}
baku-office の「承認待ち」で承認/却下してください。`;
    await notifyHook(env, msg);
    await notifyAdminsLine(env, msg);
  } catch {
  }
  return id;
}
async function listApprovals(env, status = "pending", limit = 100) {
  return (await env.DB.prepare("SELECT * FROM agent_approvals WHERE status=? ORDER BY created_at DESC LIMIT ?").bind(status, limit).all()).results;
}
const EXECUTING_TIMEOUT_SEC = 300;
async function reclaimStaleApprovals(env, maxAgeSec = EXECUTING_TIMEOUT_SEC) {
  const cutoff = nowSec() - maxAgeSec;
  const r = await env.DB.prepare(
    "UPDATE agent_approvals SET status='failed', error=? WHERE status='executing' AND decided_at IS NOT NULL AND decided_at < ?"
  ).bind("実行が完了せず中断されました（タイムアウト回収）。内容を確認のうえ再申請してください。", cutoff).run();
  return r.meta?.changes ?? 0;
}
async function getApproval(env, id) {
  return await env.DB.prepare("SELECT * FROM agent_approvals WHERE id=?").bind(id).first() ?? null;
}
async function decideApproval(env, id, approve, by, exec) {
  const a = await getApproval(env, id);
  if (!a) return { ok: false, error: "承認が見つかりません" };
  if (a.status !== "pending") return { ok: false, error: "すでに処理済みです" };
  if (!approve) {
    await env.DB.prepare("UPDATE agent_approvals SET status='rejected', decided_at=?, decided_by=? WHERE id=?").bind(nowSec(), by, id).run();
    await audit(env, by, "agent_approval_reject", `${a.tool}:${id}`);
    return { ok: true };
  }
  const claim = await env.DB.prepare("UPDATE agent_approvals SET status='executing', decided_at=?, decided_by=? WHERE id=? AND status='pending'").bind(nowSec(), by, id).run();
  if (!(claim.meta?.changes ?? 0)) return { ok: false, error: "すでに処理済みです" };
  let parsed = {};
  try {
    parsed = JSON.parse(a.args);
  } catch {
  }
  const r = await exec(a.tool, parsed).catch((e) => ({ ok: false, error: e instanceof Error ? e.message : String(e) }));
  if (r.ok) {
    await env.DB.prepare("UPDATE agent_approvals SET status='approved', result=?, error=NULL WHERE id=?").bind((r.result ?? "").slice(0, 4e3), id).run();
    await audit(env, by, "agent_approval_approve", `${a.tool}:${id}`);
    return { ok: true, result: r.result };
  }
  await env.DB.prepare("UPDATE agent_approvals SET status='failed', error=? WHERE id=?").bind((r.error ?? "実行に失敗しました。").slice(0, 4e3), id).run();
  await audit(env, by, "agent_approval_failed", `${a.tool}:${id}`);
  return { ok: false, error: r.error ?? "実行に失敗しました。" };
}
export {
  A2A_OUTWARD,
  createApproval,
  decideApproval,
  getApproval,
  getApprovalMode,
  listApprovals,
  needsApproval,
  previewFor,
  reclaimStaleApprovals,
  setApprovalMode
};
