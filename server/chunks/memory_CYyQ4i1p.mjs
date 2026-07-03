globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
const MAX_RECALL = 12;
const MAX_LEN = 400;
const MAX_KEEP = 200;
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
  return h;
}
async function recallUserMemory(ctx, owner, limit = MAX_RECALL) {
  const rows = await ctx.db.all(
    "SELECT content FROM user_memory WHERE owner=? ORDER BY updated_at DESC LIMIT ?",
    [owner, limit]
  ).catch(() => []);
  return rows.map((r) => r.content);
}
async function rememberUserFact(ctx, owner, content, sessionId) {
  const text = (content || "").trim().replace(/\s+/g, " ").slice(0, MAX_LEN);
  if (!text) return { ok: false, note: "記憶する内容が空です。" };
  const now = nowSec();
  const dup = await ctx.db.first("SELECT id FROM user_memory WHERE owner=? AND content=? LIMIT 1", [owner, text]).catch(() => null);
  if (dup) {
    await ctx.db.run("UPDATE user_memory SET updated_at=? WHERE id=?", [now, dup.id]);
    return { ok: true, note: "（既に記憶済みのため更新しました）" };
  }
  const id = "mem" + now.toString(36) + Math.abs(hashStr(owner + text)).toString(36);
  await ctx.db.run(
    "INSERT INTO user_memory (id,owner,content,source_session,created_at,updated_at) VALUES (?,?,?,?,?,?)",
    [id, owner, text, sessionId ?? null, now, now]
  );
  await ctx.db.run("DELETE FROM user_memory WHERE owner=? AND id NOT IN (SELECT id FROM user_memory WHERE owner=? ORDER BY updated_at DESC LIMIT ?)", [owner, owner, MAX_KEEP]).catch(() => {
  });
  return { ok: true, note: "" };
}
async function forgetUserFact(ctx, owner, query) {
  const q = (query || "").trim();
  if (!q) return { removed: 0 };
  const r = await ctx.db.run("DELETE FROM user_memory WHERE owner=? AND content LIKE ?", [owner, `%${q}%`]).catch(() => ({ rowsWritten: 0 }));
  return { removed: r.rowsWritten ?? 0 };
}
export {
  forgetUserFact,
  recallUserMemory,
  rememberUserFact
};
