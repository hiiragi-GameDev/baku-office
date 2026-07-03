globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { enqueueAgentJob } from "./agent-jobs_DaGtU1F5.mjs";
import { c as createSession, a as appendMessage, e as ensureTitle } from "./chat-sessions_DJA_I8xR.mjs";
const JST = 9 * 3600;
function nextRun(freq, atMin, dow, dom, fromSec) {
  const d = new Date((fromSec + JST) * 1e3);
  const Y = d.getUTCFullYear(), Mo = d.getUTCMonth(), Da = d.getUTCDate();
  const mk = (y, mo, da) => Math.floor(Date.UTC(y, mo, da, 0, atMin) / 1e3) - JST;
  if (freq === "weekly") {
    const target = ((dow ?? 1) % 7 + 7) % 7;
    const add = (target - d.getUTCDay() + 7) % 7;
    let c2 = mk(Y, Mo, Da + add);
    if (c2 <= fromSec) c2 = mk(Y, Mo, Da + add + 7);
    return c2;
  }
  if (freq === "monthly") {
    const day = Math.min(Math.max(dom ?? 1, 1), 28);
    let c2 = mk(Y, Mo, day);
    if (c2 <= fromSec) c2 = mk(Y, Mo + 1, day);
    return c2;
  }
  let c = mk(Y, Mo, Da);
  if (c <= fromSec) c = mk(Y, Mo, Da + 1);
  return c;
}
async function listScheduledTasks(ctx, owner) {
  return await ctx.db.all(
    "SELECT id,owner,prompt,freq,at_min,dow,dom,role,enabled,next_run,last_run,created_at FROM scheduled_tasks WHERE owner=? ORDER BY enabled DESC, next_run ASC LIMIT 50",
    [owner]
  );
}
async function createScheduledTask(ctx, owner, a) {
  const prompt = (a.prompt ?? "").trim();
  if (!prompt) return { ok: false, error: "実行する指示を入力してください。" };
  if (!["daily", "weekly", "monthly"].includes(a.freq)) return { ok: false, error: "周期が不正です。" };
  const atMin = Math.min(Math.max(Math.floor(a.at_min ?? 540), 0), 1439);
  const dow = a.freq === "weekly" ? ((a.dow ?? 1) % 7 + 7) % 7 : null;
  const dom = a.freq === "monthly" ? Math.min(Math.max(a.dom ?? 1, 1), 28) : null;
  const id = randomId();
  const now = nowSec();
  const nr = nextRun(a.freq, atMin, dow, dom, now);
  await ctx.db.run(
    "INSERT INTO scheduled_tasks (id,owner,prompt,freq,at_min,dow,dom,role,enabled,next_run,last_run,created_at) VALUES (?,?,?,?,?,?,?,?,1,?,NULL,?)",
    [id, owner, prompt, a.freq, atMin, dow, dom, a.role ?? "member", nr, now]
  );
  return { ok: true, id };
}
async function deleteScheduledTask(ctx, owner, id) {
  await ctx.db.run("DELETE FROM scheduled_tasks WHERE id=? AND owner=?", [id, owner]);
}
async function toggleScheduledTask(ctx, owner, id, enabled) {
  const t = await ctx.db.first("SELECT * FROM scheduled_tasks WHERE id=? AND owner=?", [id, owner]);
  if (!t) return;
  const nr = enabled ? nextRun(t.freq, t.at_min, t.dow, t.dom, nowSec()) : t.next_run;
  await ctx.db.run("UPDATE scheduled_tasks SET enabled=?, next_run=? WHERE id=? AND owner=?", [enabled ? 1 : 0, nr, id, owner]);
}
async function runDueScheduledTasks(ctx, baseUrl = "") {
  const now = nowSec();
  const due = await ctx.db.all(
    "SELECT id,owner,prompt,freq,at_min,dow,dom,role,enabled,next_run,last_run,created_at FROM scheduled_tasks WHERE enabled=1 AND next_run<=? ORDER BY next_run LIMIT 20",
    [now]
  );
  let n = 0;
  for (const t of due) {
    const nr = nextRun(t.freq, t.at_min, t.dow, t.dom, now);
    const claimed = await ctx.db.run("UPDATE scheduled_tasks SET last_run=?, next_run=? WHERE id=? AND next_run=?", [now, nr, t.id, t.next_run]);
    if (!claimed.rowsWritten) continue;
    let sid = "";
    try {
      sid = await createSession(ctx, t.owner);
      await appendMessage(ctx, sid, "user", t.prompt);
      await ensureTitle(ctx, sid, `定期実行：${t.prompt}`);
    } catch {
      sid = "";
    }
    await enqueueAgentJob(ctx, { owner: t.owner, sessionId: sid || void 0, prompt: t.prompt, role: t.role ?? "member" });
    n++;
  }
  return n;
}
export {
  createScheduledTask,
  deleteScheduledTask,
  listScheduledTasks,
  nextRun,
  runDueScheduledTasks,
  toggleScheduledTask
};
