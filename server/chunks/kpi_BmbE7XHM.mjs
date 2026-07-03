globalThis.process ??= {};
globalThis.process.env ??= {};
import { getLaborSettings } from "./settings_dTyIbTCR.mjs";
import { monthCallAgg } from "./usage_CfukLLAj.mjs";
import { TASK_KIND_LABEL } from "./task-log_BGzViZew.mjs";
import { kvPut } from "./kv_JIFmI05h.mjs";
function monthRange(month) {
  const start = Date.parse(`${month}-01T00:00:00Z`);
  if (!Number.isFinite(start)) return null;
  const d = new Date(start);
  return [Math.floor(start / 1e3), Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) / 1e3)];
}
const EMPTY = {
  total: 0,
  completed: 0,
  completionRate: 0,
  rework: 0,
  reworkRate: 0,
  savedMinutes: 0,
  savedJpy: 0,
  feedbackMinutes: 0,
  activeUsers: 0,
  byKind: [],
  killer: [],
  hotspots: [],
  unmet: [],
  nps: { yes: 0, neutral: 0, no: 0, respondents: 0 },
  aiCostUsd: 0,
  aiCostJpy: 0,
  roi: null
};
async function monthKpi(env, month) {
  const usdJpy = Number.isFinite(Number(env.USD_JPY)) && Number(env.USD_JPY) > 0 ? Number(env.USD_JPY) : 150;
  const labor = await getLaborSettings(env);
  const range = monthRange(month);
  if (!range) return { month, usdJpy, labor, ...EMPTY };
  const [start, end] = range;
  try {
    const kindRows = (await env.DB.prepare(
      "SELECT kind, COUNT(*) AS total, SUM(ai_completed) AS completed, SUM(rework) AS rework, SUM(CASE WHEN feedback='good' THEN 1 ELSE 0 END) AS good, SUM(CASE WHEN feedback='bad' THEN 1 ELSE 0 END) AS bad FROM task_logs WHERE ts>=? AND ts<? GROUP BY kind"
    ).bind(start, end).all()).results;
    const byKind = kindRows.map((r) => {
      const mins = labor.minutesByKind[r.kind] ?? labor.minutesByKind.other ?? 10;
      const savedMinutes2 = (r.completed ?? 0) * mins;
      const savedJpy2 = Math.round(savedMinutes2 / 60 * labor.hourlyJpy);
      const score = Math.round(savedJpy2 * (((r.good ?? 0) + 1) / ((r.good ?? 0) + (r.bad ?? 0) + 2)));
      return { kind: r.kind, label: TASK_KIND_LABEL[r.kind] ?? r.kind, total: r.total ?? 0, completed: r.completed ?? 0, rework: r.rework ?? 0, good: r.good ?? 0, bad: r.bad ?? 0, savedMinutes: savedMinutes2, savedJpy: savedJpy2, score };
    });
    const total = byKind.reduce((a, r) => a + r.total, 0);
    const completed = byKind.reduce((a, r) => a + r.completed, 0);
    const rework = byKind.reduce((a, r) => a + r.rework, 0);
    const savedMinutes = byKind.reduce((a, r) => a + r.savedMinutes, 0);
    const savedJpy = byKind.reduce((a, r) => a + r.savedJpy, 0);
    const hotRows = (await env.DB.prepare(
      "SELECT kind, fail_reason AS failReason, COUNT(*) AS count FROM task_logs WHERE ts>=? AND ts<? AND fail_reason IS NOT NULL GROUP BY kind, fail_reason ORDER BY count DESC LIMIT 10"
    ).bind(start, end).all()).results;
    const hotspots = hotRows.map((r) => ({ ...r, label: TASK_KIND_LABEL[r.kind] ?? r.kind, score: r.count * (labor.minutesByKind[r.kind] ?? 10) })).sort((a, b) => b.score - a.score);
    const unmet = (await env.DB.prepare(
      "SELECT unmet AS summary, COUNT(*) AS count, MAX(ts) AS lastTs FROM task_logs WHERE ts>=? AND ts<? AND unmet IS NOT NULL GROUP BY unmet ORDER BY count DESC, lastTs DESC LIMIT 20"
    ).bind(start, end).all()).results;
    const misc = await env.DB.prepare(
      "SELECT COUNT(DISTINCT owner) AS users, SUM(COALESCE(saved_minutes,0)) AS fbMin FROM task_logs WHERE ts>=? AND ts<?"
    ).bind(start, end).first();
    const npsRows = (await env.DB.prepare(
      "SELECT score, COUNT(*) AS c FROM (SELECT owner, score, MAX(ts) FROM nps_responses WHERE ts>=? AND ts<? GROUP BY owner) GROUP BY score"
    ).bind(start, end).all().catch(() => ({ results: [] }))).results;
    const npsOf = (s) => npsRows.find((r) => r.score === s)?.c ?? 0;
    const nps = { yes: npsOf("yes"), neutral: npsOf("neutral"), no: npsOf("no"), respondents: npsRows.reduce((a, r) => a + r.c, 0) };
    const aiCostUsd = (await monthCallAgg(env, month)).reduce((a, r) => a + r.estUsd, 0);
    const aiCostJpy = Math.round(aiCostUsd * usdJpy);
    return {
      month,
      usdJpy,
      labor,
      total,
      completed,
      completionRate: total ? Math.round(completed / total * 1e3) / 10 : 0,
      rework,
      reworkRate: total ? Math.round(rework / total * 1e3) / 10 : 0,
      savedMinutes,
      savedJpy,
      feedbackMinutes: misc?.fbMin ?? 0,
      activeUsers: misc?.users ?? 0,
      byKind: [...byKind].sort((a, b) => b.total - a.total),
      killer: [...byKind].filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 5),
      hotspots,
      unmet,
      nps,
      aiCostUsd: Math.round(aiCostUsd * 100) / 100,
      aiCostJpy,
      roi: aiCostJpy > 0 ? Math.round(savedJpy / aiCostJpy * 10) / 10 : null
    };
  } catch {
    return { month, usdJpy, labor, ...EMPTY };
  }
}
async function maybeSendWeeklyReport(env) {
  const last = Number(await env.LICENSE.get("weekly_report_last"));
  const now = Math.floor(Date.now() / 1e3);
  if (Number.isFinite(last) && now - last < 7 * 86400) return false;
  const { notifyHook } = await import("./notifications_DKh03i2Y.mjs");
  const kpi = await monthKpi(env, (/* @__PURE__ */ new Date()).toISOString().slice(0, 7));
  const hours = Math.round(kpi.savedMinutes / 60 * 10) / 10;
  const lines = [
    `📊 週次レポート（今月累計 ${kpi.month}）`,
    `処理 ${kpi.total}件 / AI単独完了 ${kpi.completionRate}% / 手戻り ${kpi.reworkRate}%`,
    `削減 約${hours}時間 ＝ 約${kpi.savedJpy.toLocaleString()}円（AI実費 約${kpi.aiCostJpy.toLocaleString()}円${kpi.roi !== null ? `・ROI ${kpi.roi}倍` : ""}）`,
    kpi.killer.length ? `よく効いた業務: ${kpi.killer.slice(0, 3).map((k) => k.label).join("、")}` : "",
    kpi.unmet.length ? `未対応の要望 ${kpi.unmet.length}種（詳細はレポート画面）` : "",
    "詳細: 設定 → 実績レポート /reports"
  ].filter(Boolean);
  const sent = await notifyHook(env, lines.join("\n")).catch(() => false);
  if (sent) await kvPut(env, "weekly_report_last", String(now));
  return sent;
}
export {
  maybeSendWeeklyReport,
  monthKpi
};
