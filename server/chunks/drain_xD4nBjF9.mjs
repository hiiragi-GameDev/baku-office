globalThis.process ??= {};
globalThis.process.env ??= {};
import { getApiKey } from "./client_F4fksau0.mjs";
import { t as cfEgressGateway, B as linePush, C as processSummaryJobs, D as processAppBuilds, E as processSiteBuilds } from "./ctx_D9xObGWH.mjs";
import { d as dueReminders, m as markReminderDone } from "./invoices_Cm4Zc-nT.mjs";
import { pollVideoJobs } from "./capabilities_DGQUed42.mjs";
import { processAgentJobs } from "./agent-jobs_DaGtU1F5.mjs";
import { reclaimStaleApprovals } from "./approvals_CEi6BOlb.mjs";
import { runDueScheduledTasks } from "./scheduled-tasks_DLesrd8F.mjs";
import { guardHeavy } from "./diag_CY3PJnOM.mjs";
import { getDriveBackup, driveConnected, backupToDrive, uploadBufferToDrive } from "./drive_BU5bDSNm.mjs";
import { getBackupSchedule, backupAlert, buildBackup, backupFileName, recordBackupDone } from "./backup_CQuZgyNM.mjs";
import { flushReports } from "./reports_CwNccJnM.mjs";
import { addNotification, pushWebhook } from "./notifications_DKh03i2Y.mjs";
import { getNotifyWebhook } from "./settings_dTyIbTCR.mjs";
import { purgeFiles } from "./storage_BHLYBEBb.mjs";
import { env } from "cloudflare:workers";
const KV_AUTO = "internal_key_auto";
function genKey() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}
async function resolveDrainKey(env2) {
  if (env2.INTERNAL_KEY) return env2.INTERNAL_KEY;
  const kv = env2.LICENSE;
  if (!kv) return null;
  let k = await kv.get(KV_AUTO).catch(() => null);
  if (!k) {
    k = genKey();
    await kv.put(KV_AUTO, k).catch(() => {
    });
  }
  return k;
}
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const expected = await resolveDrainKey(env);
  if (!expected || request.headers.get("x-internal-key") !== expected) return json({ error: "forbidden" }, 403);
  const g = await guardHeavy(env, "summary jobs", () => processSummaryJobs(env));
  const summarized = g.ok ? g.value : 0;
  const st = await guardHeavy(env, "scheduled tasks", () => runDueScheduledTasks(locals.ctx, new URL(request.url).origin));
  const scheduled = st.ok ? st.value : 0;
  const aj = await guardHeavy(env, "agent jobs", () => processAgentJobs(locals.ctx, new URL(request.url).origin));
  const agentJobs = aj.ok ? aj.value : 0;
  const origin = new URL(request.url).origin;
  let appBuilds = 0;
  let appBuildsMore = false;
  for (let round = 0; round < 6; round++) {
    const ab = await guardHeavy(env, "app builds", () => processAppBuilds(locals.ctx, origin, 2, { maxSteps: 8, deadlineMs: 15e3 }));
    if (!ab.ok) {
      appBuildsMore = true;
      break;
    }
    appBuilds += ab.value.processed;
    appBuildsMore = ab.value.moreActive || ab.value.queueMore;
    if (ab.value.processed === 0 || !ab.value.moreActive && !ab.value.queueMore) break;
  }
  let siteBuilds = 0;
  let siteBuildsMore = false;
  for (let round = 0; round < 4; round++) {
    const sb = await guardHeavy(env, "site builds", () => processSiteBuilds(locals.ctx, 2, { maxSteps: 6 }));
    if (!sb.ok) {
      siteBuildsMore = true;
      break;
    }
    siteBuilds += sb.value.processed;
    siteBuildsMore = sb.value.moreActive || sb.value.queueMore;
    if (sb.value.processed === 0 || !sb.value.moreActive && !sb.value.queueMore) break;
  }
  const ub = await guardHeavy(env, "upload batches", () => import("./upload-queue_B0YYP6NN.mjs").then((m) => m.processReadyUploads(locals.ctx, origin, 5)));
  const uploadBatches = ub.ok ? ub.value : 0;
  const au = await guardHeavy(env, "auto update", () => import("./update_BZb99hDh.mjs").then((m) => m.maybeAutoUpdate(env, origin)));
  const autoUpdate = au.ok ? au.value : { triggered: false, reason: "guard" };
  const ra = await guardHeavy(env, "reclaim approvals", () => reclaimStaleApprovals(env));
  const approvalsReclaimed = ra.ok ? ra.value : 0;
  const accessToken = await getApiKey(env, "line_token");
  const vr = await guardHeavy(env, "video jobs", () => pollVideoJobs(env, accessToken ?? void 0));
  const video = vr.ok ? vr.value : { done: 0, pending: 0 };
  let sent = 0, notified = 0;
  const notifyWebhook = await getNotifyWebhook(env);
  const gw = cfEgressGateway(env);
  for (const r of await dueReminders(locals.ctx)) {
    const userId = r.owner.startsWith("line:") ? r.owner.slice(5) : null;
    if (userId) {
      if (!accessToken) continue;
      await linePush(gw, accessToken, userId, `⏰ リマインド：${r.content}`);
      sent++;
    } else {
      await addNotification(locals.ctx, { owner: r.owner, kind: "reminder", body: `⏰ ${r.content}`, link: "/invoices" });
      if (notifyWebhook) await pushWebhook(gw, notifyWebhook, `⏰ リマインド：${r.content}`).catch(() => {
      });
      notified++;
    }
    await markReminderDone(locals.ctx, r.id);
  }
  let driveBackup = { uploaded: 0 };
  if ((await getDriveBackup(env)).enabled) {
    const dr = await guardHeavy(env, "drive backup", () => backupToDrive(env, 5));
    if (dr.ok) driveBackup = dr.value;
  }
  let fullBackup = { uploaded: false };
  const sched = await getBackupSchedule(env);
  if (sched.enabled && await driveConnected(env) && (await backupAlert(env)).alert) {
    const bk = await guardHeavy(env, "full backup", async () => {
      const { json: body, tables, files } = await buildBackup(env, { decrypt: sched.mode === "decrypted" });
      const up = await uploadBufferToDrive(env, backupFileName(sched.mode === "decrypted"), "application/json", new TextEncoder().encode(body).buffer);
      if (!up.ok) throw new Error(up.error ?? "upload failed");
      await recordBackupDone(env, "drive", sched.mode, tables, files);
      return true;
    });
    fullBackup = bk.ok ? { uploaded: true } : { uploaded: false, error: bk.error };
  }
  const fr = await guardHeavy(env, "flush reports", () => flushReports(env));
  const reportsSent = fr.ok ? fr.value : 0;
  const wk = await guardHeavy(env, "weekly kpi report", () => import("./kpi_BmbE7XHM.mjs").then((m) => m.maybeSendWeeklyReport(env)));
  const weeklyReport = wk.ok ? wk.value : false;
  const ud = await guardHeavy(env, "usage digest", () => import("./usage-digest_BEX2WCjN.mjs").then((m) => m.flushUsageDigest(env)));
  const usageDigest = ud.ok ? ud.value : false;
  const pf = await guardHeavy(env, "purge files", () => purgeFiles(env));
  const purged = pf.ok ? pf.value : { expired: 0, purged: 0 };
  return json({ ok: true, sent, notified, summarized, scheduled, video, agentJobs, appBuilds, appBuildsMore, siteBuilds, siteBuildsMore, uploadBatches, autoUpdate, approvalsReclaimed, driveBackup, fullBackup, reportsSent, weeklyReport, usageDigest, purged });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
