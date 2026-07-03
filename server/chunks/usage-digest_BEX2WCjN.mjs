globalThis.process ??= {};
globalThis.process.env ??= {};
import { getToken, hostFetch, APP_VERSION, nowSec } from "./client_F4fksau0.mjs";
import { kvPut } from "./kv_JIFmI05h.mjs";
import { dailyCallAgg, monthCallAgg } from "./usage_CfukLLAj.mjs";
import { monthKpi } from "./kpi_BmbE7XHM.mjs";
const DAILY_WINDOW_DEFAULT = 35;
function dailyWindowDays(env) {
  const n = Number(env.USAGE_DIGEST_DAILY_DAYS);
  if (!Number.isFinite(n) || n < 0) return DAILY_WINDOW_DEFAULT;
  return Math.min(93, Math.floor(n));
}
async function buildDailyDigest(env) {
  const days = dailyWindowDays(env);
  if (days === 0) return null;
  const to = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const from = new Date(Date.now() - (days - 1) * 864e5).toISOString().slice(0, 10);
  const rows = (await dailyCallAgg(env, from, to)).map((r) => ({ ...r, model: r.model ?? "" }));
  return { from, to, rows: rows.slice(0, 2e3) };
}
async function buildUsageDigest(env, months) {
  const out = [];
  for (const month of months) {
    const usage = (await monthCallAgg(env, month)).map((u) => ({ ...u, model: u.model ?? "" }));
    const k = await monthKpi(env, month);
    if (usage.length === 0 && k.total === 0) continue;
    out.push({
      month,
      usage: usage.slice(0, 200),
      kpi: {
        total: k.total,
        completed: k.completed,
        completionRate: k.completionRate,
        rework: k.rework,
        reworkRate: k.reworkRate,
        savedMinutes: k.savedMinutes,
        savedJpy: k.savedJpy,
        feedbackMinutes: k.feedbackMinutes,
        activeUsers: k.activeUsers,
        byKind: k.byKind,
        hotspots: k.hotspots,
        unmet: k.unmet,
        nps: k.nps,
        aiCostUsd: k.aiCostUsd,
        aiCostJpy: k.aiCostJpy,
        roi: k.roi
      }
    });
  }
  return out;
}
async function flushUsageDigest(env) {
  const last = Number(await env.LICENSE.get("usage_digest_last"));
  const now = nowSec();
  if (Number.isFinite(last) && now - last < 24 * 3600) return false;
  const token = await getToken(env);
  if (!token) return false;
  const cur = /* @__PURE__ */ new Date();
  const curM = cur.toISOString().slice(0, 7);
  const prevM = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
  const months = await buildUsageDigest(env, [prevM, curM]);
  const daily = await buildDailyDigest(env);
  if (!months.length && !daily?.rows.length) {
    await kvPut(env, "usage_digest_last", String(now));
    return false;
  }
  try {
    const r = await hostFetch(env, "/api/usage-digest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, appVersion: APP_VERSION, months, ...daily ? { daily } : {} })
    });
    if (r.ok) await kvPut(env, "usage_digest_last", String(now));
    return r.ok;
  } catch {
    return false;
  }
}
export {
  buildDailyDigest,
  buildUsageDigest,
  flushUsageDigest
};
