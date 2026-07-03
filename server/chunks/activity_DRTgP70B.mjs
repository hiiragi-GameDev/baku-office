globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { cancelAgentJob } from "./agent-jobs_DaGtU1F5.mjs";
import { c as cancelAppBuild } from "./ctx_D9xObGWH.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const trunc = (s) => {
  const t = String(s ?? "");
  return t.length > 28 ? t.slice(0, 28) + "…" : t;
};
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  const b = await request.json().catch(() => ({}));
  if (b._action === "cancel" && b.id) {
    const id = String(b.id);
    let ok = await cancelAgentJob(locals.ctx, ses.uid, id) || await cancelAppBuild(locals.ctx, ses.uid, id);
    if (!ok) {
      for (const tbl of ["summary_jobs", "video_jobs"]) {
        const r = await env.DB.prepare(`UPDATE ${tbl} SET status='cancelled' WHERE id=? AND owner=? AND status='pending'`).bind(id, ses.uid).run();
        if (r.meta?.changes) {
          ok = true;
          break;
        }
      }
    }
    return json({ ok });
  }
  return json({ error: "不正な操作です" }, 400);
};
const GET = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ active: 0, tasks: [] });
  const tasks = [];
  try {
    const a = (await env.DB.prepare("SELECT id,owner,session_id,prompt,status FROM agent_jobs WHERE status IN ('pending','running') ORDER BY created_at DESC LIMIT 8").all()).results;
    for (const j of a) {
      const mine = j.owner === ses.uid;
      tasks.push({ kind: "agent", status: j.status, label: mine ? trunc(j.prompt) : "AIエージェント", mine, ...mine ? { id: j.id, sessionId: j.session_id ?? void 0 } : {} });
    }
  } catch {
  }
  try {
    const s = (await env.DB.prepare("SELECT id,owner,name,status FROM summary_jobs WHERE status='pending' ORDER BY created_at DESC LIMIT 8").all()).results;
    for (const j of s) {
      const mine = j.owner === ses.uid;
      tasks.push({ kind: "summary", status: j.status, label: j.name ? `要約: ${trunc(j.name)}` : "ファイル要約", mine, ...mine ? { id: j.id } : {} });
    }
  } catch {
  }
  try {
    const v = (await env.DB.prepare("SELECT id,owner,status FROM video_jobs WHERE status='pending' ORDER BY created_at DESC LIMIT 8").all()).results;
    for (const j of v) {
      const mine = j.owner === ses.uid;
      tasks.push({ kind: "video", status: j.status, label: "動画生成", mine, ...mine ? { id: j.id } : {} });
    }
  } catch {
  }
  try {
    const ab = (await env.DB.prepare("SELECT id,owner,session_id,name,status,plan,cursor,created_at,kind,app_id FROM app_builds WHERE status IN ('planning','building','finalizing') ORDER BY created_at DESC LIMIT 8").all()).results;
    for (const j of ab) {
      const mine = j.owner === ses.uid;
      const isEdit = j.kind === "edit";
      let total = 0;
      try {
        total = (JSON.parse(j.plan ?? "{}").phases ?? []).length;
      } catch {
      }
      const phase = j.status === "planning" ? 0 : j.cursor;
      const label = isEdit ? mine ? `アプリ修正: ${trunc(j.name ?? j.app_id ?? "")}` : "アプリ修正" : mine ? `アプリ作成: ${trunc(j.name ?? "")}` : "アプリ作成";
      tasks.push({ kind: isEdit ? "edit" : "build", status: j.status, label, mine, phase: isEdit ? 0 : phase, total: isEdit ? 0 : total, elapsedSec: Math.max(0, nowSec() - j.created_at), ...mine ? { ...j.status !== "finalizing" ? { id: j.id } : {}, sessionId: j.session_id ?? void 0, appId: j.app_id ?? void 0 } : {} });
    }
  } catch {
  }
  return json({ active: tasks.length, tasks });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
