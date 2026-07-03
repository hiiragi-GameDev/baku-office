globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { HOPS_EXCEEDED, MODEL_REFUSED } from "./ai_Dn536Rzr.mjs";
const TASK_KIND_LABEL = {
  inquiry: "照会・質問",
  summary: "要約",
  draft: "下書き・文章作成",
  translate: "翻訳",
  extract: "転記・抽出",
  document: "資料作成",
  expense: "領収書・経費",
  schedule: "予定調整",
  app_dev: "アプリ/HP開発",
  admin_op: "設定・管理操作",
  other: "その他"
};
const TOOL_KIND = [
  [/^make_document$/, "document"],
  [/^(propose_app|manage_app)$/, "app_dev"],
  [/invoice|receipt/, "expense"],
  [/calendar|schedule|event|remind/, "schedule"],
  [/^(update_setting|manage_member|manage_parts|manage_a2a)$/, "admin_op"]
];
const TEXT_KIND = [
  [/翻訳|英訳|和訳|英語に|日本語に/, "translate"],
  [/要約|まとめて|議事録/, "summary"],
  [/領収書|レシート|経費|請求書/, "expense"],
  [/転記|抽出|書き写|データ化|読み取っ/, "extract"],
  [/下書き|文面|案内文|挨拶文|お知らせ.*(書|作)|メール.*(書|作)|文章.*(書|作)/, "draft"],
  [/資料|スライド|レポート/, "document"],
  [/予定|日程|スケジュール|カレンダー/, "schedule"],
  [/アプリ|ホームページ|HP|LP|サイト/, "app_dev"]
];
function classifyTaskKind(text, tools) {
  for (const t of tools) for (const [re, kind] of TOOL_KIND) if (re.test(t)) return kind;
  for (const [re, kind] of TEXT_KIND) if (re.test(text)) return kind;
  return "inquiry";
}
const READ_TOOL = /^(list_|get_|find_|search_|read_|check_)/;
function execTypeOf(tools) {
  return tools.some((t) => !READ_TOOL.test(t)) ? "execute" : "suggest";
}
function stripUnmet(reply) {
  const m = reply.match(/\[UNMET:([^\]]{1,300})\]/);
  if (!m) return { reply, unmet: null };
  return { reply: reply.replace(m[0], "").replace(/\n{3,}/g, "\n\n").trim(), unmet: m[1].trim().slice(0, 200) };
}
function assessReply(reply) {
  if (reply === HOPS_EXCEEDED || /一度の処理では完了できませんでした/.test(reply)) return { aiCompleted: false, failReason: "hops" };
  if (reply === MODEL_REFUSED) return { aiCompleted: false, failReason: "refused" };
  if (/APIクレジット（利用枠）が不足/.test(reply)) return { aiCompleted: false, failReason: "credit" };
  if (/レート制限/.test(reply) && reply.startsWith("⚠️")) return { aiCompleted: false, failReason: "rate" };
  if (/APIキーが無効|APIキーが未設定|AI機能が未設定|キーの認証に失敗/.test(reply)) return { aiCompleted: false, failReason: "auth" };
  if (/この操作は承認が必要です|承認キューに登録しました/.test(reply)) return { aiCompleted: false, failReason: "approval_pending" };
  if (reply.startsWith("⚠️")) return { aiCompleted: false, failReason: "model_error" };
  if (/（停止しました）|費用上限（\$/.test(reply)) return { aiCompleted: false, failReason: "cancelled" };
  return { aiCompleted: true, failReason: null };
}
async function logTask(env, t) {
  try {
    const id = randomId();
    await env.DB.prepare(
      "INSERT INTO task_logs (id, ts, owner, role, source, kind, ai_completed, exec_type, fail_reason, unmet, session_id, message_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(id, Math.floor(Date.now() / 1e3), t.owner, t.role, t.source, t.kind, t.aiCompleted ? 1 : 0, t.execType, t.failReason ?? null, t.unmet ?? null, t.sessionId ?? null, t.messageId ?? null).run();
    return id;
  } catch {
    return null;
  }
}
async function linkTaskMessage(env, taskId, messageId) {
  try {
    await env.DB.prepare("UPDATE task_logs SET message_id=? WHERE id=?").bind(messageId, taskId).run();
  } catch {
  }
}
async function recordTaskFromReply(env, a) {
  const { reply, unmet } = stripUnmet(a.reply ?? "");
  const tools = a.tools ?? [];
  const base = assessReply(reply);
  const taskId = await logTask(env, {
    owner: a.owner,
    role: a.role,
    source: a.source,
    kind: classifyTaskKind(a.userText ?? "", tools),
    aiCompleted: unmet ? false : base.aiCompleted,
    execType: execTypeOf(tools),
    failReason: unmet ? "out_of_scope" : base.failReason,
    unmet,
    sessionId: a.sessionId ?? null,
    messageId: a.messageId ?? null
  });
  return { reply, taskId };
}
export {
  TASK_KIND_LABEL,
  assessReply,
  classifyTaskKind,
  execTypeOf,
  linkTaskMessage,
  logTask,
  recordTaskFromReply,
  stripUnmet
};
