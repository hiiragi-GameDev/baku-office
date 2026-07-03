globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { getToken, APP_VERSION, hostFetch } from "./client_F4fksau0.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
async function enqueueReport(env, r) {
  try {
    await env.DB.prepare(
      "INSERT INTO client_report_outbox (id,kind,severity,category,title,message,context,fingerprint,created_at) VALUES (?,?,?,?,?,?,?,?,?)"
    ).bind(randomId(), r.kind, r.severity ?? null, r.category ?? null, r.title ?? null, r.message.slice(0, 2e3), (r.context ?? "").slice(0, 2e3) || null, r.fingerprint ?? null, nowSec()).run();
  } catch {
  }
}
async function flushReports(env, limit = 25) {
  const token = await getToken(env);
  if (!token) return 0;
  const { results } = await env.DB.prepare(
    "SELECT id,kind,severity,category,title,message,context,fingerprint FROM client_report_outbox WHERE sent=0 ORDER BY created_at ASC LIMIT ?"
  ).bind(limit).all();
  if (!results.length) return 0;
  const reports = results.map((r) => ({ kind: r.kind, severity: r.severity ?? void 0, category: r.category ?? void 0, title: r.title ?? void 0, message: r.message, context: r.context ?? void 0, fingerprint: r.fingerprint ?? void 0, appVersion: APP_VERSION }));
  try {
    const resp = await hostFetch(env, "/api/report", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, reports }) });
    if (!resp.ok) {
      const ph2 = results.map(() => "?").join(",");
      await env.DB.prepare(`UPDATE client_report_outbox SET attempts=attempts+1 WHERE id IN (${ph2})`).bind(...results.map((r) => r.id)).run().catch(() => {
      });
      return 0;
    }
  } catch {
    return 0;
  }
  const ph = results.map(() => "?").join(",");
  await env.DB.prepare(`UPDATE client_report_outbox SET sent=1 WHERE id IN (${ph})`).bind(...results.map((r) => r.id)).run().catch(() => {
  });
  return results.length;
}
async function applyReportUpdates(env, updates) {
  for (const u of updates.slice(0, 20)) {
    await env.DB.prepare(
      "INSERT INTO host_report_replies (id,kind,title,status,resolution,pr_url,received_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status, resolution=excluded.resolution, pr_url=excluded.pr_url, received_at=excluded.received_at"
    ).bind(u.id, u.kind ?? null, u.title ?? null, u.status ?? null, u.resolution ?? null, u.pr_url ?? null, nowSec()).run().catch(() => {
    });
  }
}
async function listReplies(env, limit = 30) {
  return (await env.DB.prepare("SELECT id,kind,title,status,resolution,pr_url,received_at FROM host_report_replies ORDER BY received_at DESC LIMIT ?").bind(limit).all()).results;
}
async function submitFeedback(env, f) {
  if (!f.message || !f.message.trim()) return { ok: false, error: "内容を入力してください" };
  await enqueueReport(env, { kind: "request", category: "feedback", title: f.title?.slice(0, 120), message: f.message });
  await flushReports(env).catch(() => 0);
  return { ok: true };
}
export {
  applyReportUpdates,
  enqueueReport,
  flushReports,
  listReplies,
  submitFeedback
};
