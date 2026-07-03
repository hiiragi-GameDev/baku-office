globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
function looksLikeLimit(msg) {
  if (/maximum call stack|stack size exceeded|rangeerror/i.test(msg)) return false;
  return /\bcpu\b|cpu time|time limit|exceeded (the )?(cpu|memory|time|wall|resource)|too many subrequests|worker exceeded|exceeded its (cpu|memory|resource)|resource limits|memory limit|out of memory|isolate.*(terminat|kill)|\b1102\b|\b1027\b|\b1042\b|D1_ERROR.*timeout/i.test(msg);
}
async function logDiag(env, level, category, message, context = "") {
  try {
    await env.DB.prepare("INSERT INTO diagnostics (id,level,category,message,context,created_at) VALUES (?,?,?,?,?,?)").bind(randomId(), level, category, message.slice(0, 500), context.slice(0, 500), nowSec()).run();
  } catch {
  }
  if (level === "error" && category !== "migration") {
    try {
      const fp = `auto:${category}:${message.slice(0, 80)}`;
      const dup = await env.DB.prepare("SELECT 1 FROM client_report_outbox WHERE fingerprint=? AND sent=0 LIMIT 1").bind(fp).first().catch(() => null);
      if (!dup) {
        await env.DB.prepare("INSERT INTO client_report_outbox (id,kind,severity,category,title,message,context,fingerprint,created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(randomId(), "error", level, category, message.slice(0, 120), message.slice(0, 2e3), context.slice(0, 2e3) || null, fp, nowSec()).run();
      }
    } catch {
    }
  }
}
async function recentDiagnostics(env, limit = 50) {
  return (await env.DB.prepare("SELECT level,category,message,created_at FROM diagnostics ORDER BY created_at DESC LIMIT ?").bind(limit).all()).results;
}
async function hasRecentLimitError(env) {
  const { getWorkersPaid } = await import("./settings_dTyIbTCR.mjs");
  if (await getWorkersPaid(env).catch(() => false)) return false;
  const since = nowSec() - 3600;
  const row = await env.DB.prepare("SELECT 1 FROM diagnostics WHERE category='limit' AND created_at>=? LIMIT 1").bind(since).first();
  return !!row;
}
async function guardHeavy(env, label, fn) {
  try {
    return { ok: true, value: await fn() };
  } catch (e) {
    const msg = e.message ?? String(e);
    const limit = looksLikeLimit(msg);
    await logDiag(env, "error", limit ? "limit" : "other", `${label}: ${msg}`);
    return { ok: false, error: msg, limit };
  }
}
const PAID_HINT = "処理がCloudflareの無料枠の制限（CPU時間・実行時間など）に達した可能性があります。大きなファイルや重い処理を安定させるには、管理画面の【高度なオプション → Workers Paid】の案内に沿ってCloudflareの有料プラン(Workers Paid)へ切り替えてください。";
export {
  PAID_HINT,
  guardHeavy,
  hasRecentLimitError,
  logDiag,
  looksLikeLimit,
  recentDiagnostics
};
