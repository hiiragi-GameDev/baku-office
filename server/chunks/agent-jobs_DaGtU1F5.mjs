globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { r as runAgent, n as notifyOwnerDirect } from "./ctx_D9xObGWH.mjs";
import { a as appendMessage, g as getMessages, t as toTurns } from "./chat-sessions_DJA_I8xR.mjs";
import { addNotification, notifyHook } from "./notifications_DKh03i2Y.mjs";
const AGENT_JOB_MAX_AGE = 1800;
async function enqueueAgentJob(ctx, a) {
  const id = randomId();
  const now = nowSec();
  await ctx.db.run(
    "INSERT INTO agent_jobs (id,owner,session_id,prompt,role,status,created_at,updated_at) VALUES (?,?,?,?,?,'pending',?,?)",
    [id, a.owner, a.sessionId ?? null, a.prompt, a.role ?? "member", now, now]
  );
  return id;
}
async function cancelAgentJob(ctx, owner, id) {
  const r = await ctx.db.run("UPDATE agent_jobs SET status='cancelled', updated_at=? WHERE id=? AND owner=? AND status IN ('pending','running')", [nowSec(), id, owner]);
  return !!r.rowsWritten;
}
async function processAgentJobs(ctx, baseUrl = "", limit = 2) {
  const now = nowSec();
  const stale = now - 180;
  const results = await ctx.db.all("SELECT id,owner,session_id,prompt,role,created_at FROM agent_jobs WHERE status='pending' OR (status='running' AND updated_at < ?) ORDER BY created_at LIMIT ?", [stale, limit]);
  let done = 0;
  for (const j of results) {
    if (now - (j.created_at ?? now) > AGENT_JOB_MAX_AGE) {
      const dead = "処理に時間がかかり、完了できませんでした。お手数ですが依頼を分けて再度お試しください。";
      const upd = await ctx.db.run("UPDATE agent_jobs SET status='error', result=?, updated_at=? WHERE id=? AND status IN ('pending','running')", [dead, now, j.id]);
      if (upd.rowsWritten) {
        if (j.session_id) await appendMessage(ctx, j.session_id, "assistant", dead).catch(() => {
        });
        await addNotification(ctx, { owner: j.owner, kind: "agent", body: "AIの作業を完了できませんでした。タップで詳細を開きます。", link: j.session_id ? `/?ses=${j.session_id}` : "/" }).catch(() => {
        });
      }
      continue;
    }
    await ctx.db.run("UPDATE agent_jobs SET status='running', updated_at=? WHERE id=?", [nowSec(), j.id]);
    try {
      let history;
      if (j.session_id) {
        const msgs = await getMessages(ctx, j.session_id).catch(() => []);
        history = msgs.length && msgs[msgs.length - 1].role === "user" && msgs[msgs.length - 1].content === j.prompt ? msgs.slice(0, -1) : msgs;
      }
      const usedTools = [];
      const raw = await runAgent(ctx, j.owner, j.prompt, void 0, baseUrl, j.role ?? "member", { unattended: true, history: history ? toTurns(history) : void 0, feature: "agent_job", onEvent: (ev) => {
        if (ev.type === "tool") usedTools.push(ev.name);
      } });
      const { HOPS_EXCEEDED } = await import("./ai_Dn536Rzr.mjs");
      const exhausted = raw === HOPS_EXCEEDED;
      const rawReply = exhausted ? "ご依頼の内容が大きく、一度の処理では完了できませんでした。お手数ですが、対象（特定の画面・機能・手順）を絞るか、ご希望を具体的にお知らせください。" : raw;
      const { recordTaskFromReply } = await import("./task-log_BGzViZew.mjs");
      const task = await recordTaskFromReply(ctx.env, { owner: j.owner, role: j.role ?? "member", source: "agent_job", userText: j.prompt, reply: rawReply, tools: usedTools, sessionId: j.session_id });
      const reply = task.reply;
      const { extractActions } = await import("./chat-sessions_DJA_I8xR.mjs").then((n) => n.h);
      const ex = extractActions(reply);
      const actions = ex.actions.filter((a) => a.kind === "reply");
      const upd = await ctx.db.run("UPDATE agent_jobs SET status=?, result=?, updated_at=? WHERE id=? AND status='running'", [exhausted ? "error" : "done", ex.content, nowSec(), j.id]);
      if (!upd.rowsWritten) continue;
      if (j.session_id) {
        const mid = await appendMessage(ctx, j.session_id, "assistant", ex.content, actions).catch(() => null);
        if (mid && task.taskId) await (await import("./task-log_BGzViZew.mjs")).linkTaskMessage(ctx.env, task.taskId, mid);
      }
      await addNotification(ctx, { owner: j.owner, kind: "agent", body: exhausted ? "AIの作業を完了できませんでした。タップで詳細を開きます。" : "AIの作業が完了しました。タップで結果を開きます。", link: j.session_id ? `/?ses=${j.session_id}` : "/" }).catch(() => {
      });
      await notifyOwnerDirect(ctx, j.owner, exhausted ? "⚠️ AIの作業を完了できませんでした（依頼の具体化をお願いします）。" : "✅ AIの作業が完了しました。").catch(() => {
      });
      await notifyHook(ctx.env, exhausted ? "⚠️ AIの作業を完了できませんでした（依頼の具体化をお願いします）。" : "✅ AIの作業が完了しました。").catch(() => {
      });
      done++;
    } catch (e) {
      await ctx.db.run("UPDATE agent_jobs SET status='error', result=?, updated_at=? WHERE id=?", [String(e.message ?? e), nowSec(), j.id]);
      await addNotification(ctx, { owner: j.owner, kind: "agent", body: "AIの作業でエラーが発生しました。", link: j.session_id ? `/?ses=${j.session_id}` : "/" }).catch(() => {
      });
    }
  }
  return done;
}
export {
  cancelAgentJob,
  enqueueAgentJob,
  processAgentJobs
};
