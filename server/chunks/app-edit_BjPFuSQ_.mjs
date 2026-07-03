globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession, canDevelopApps } from "./auth_DL5yvmzT.mjs";
import { parseRequestModel, getWorkersPaid } from "./settings_dTyIbTCR.mjs";
import { d as startAppEdit, p as processAppBuild } from "./ctx_D9xObGWH.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const GET = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const row = await locals.ctx.db.first("SELECT status,error,cursor,plan FROM app_builds WHERE id=? AND owner=?", [id, ses.uid]);
  if (!row) return json({ ok: false, status: "unknown" });
  let progress = null;
  try {
    const phases = JSON.parse(row.plan ?? "{}").phases ?? [];
    if (phases.length) {
      const idx = Math.min(row.cursor ?? 0, phases.length);
      progress = { cursor: idx, total: phases.length, title: String(phases[Math.min(idx, phases.length - 1)]?.title ?? "") };
    }
  } catch {
  }
  const phaseLabel = row.status === "planning" ? "計画を立てています…" : progress && progress.total > 1 ? `工程 ${Math.min(progress.cursor + 1, progress.total)}/${progress.total}：${progress.title}` : "修正中です…";
  return json({ ok: true, status: row.status, message: row.error ?? "", phaseLabel, progress });
};
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません（管理者または開発者のみ）" }, 403);
  const b = await request.json().catch(() => ({}));
  const appId = String(b.appId ?? "").trim();
  if (!appId) return json({ error: "appId が必要です" }, 400);
  let instruction = b.debug ? "このアプリの動作確認（デバッグ）を行う。計算式・ボタンのイベント・画面遷移・入力検証・推論などに不具合がないか点検し、見つかれば最小差分で直す。問題が無ければ変更せず確認結果を述べる。" : String(b.instruction ?? "").trim();
  if (b.image?.dataB64) {
    const { prepareDevAttachment } = await import("./chat-flow_CD0ZG1R9.mjs");
    const ref = await prepareDevAttachment(b.image, ses.uid, ses.ctx);
    if (!ref.ok) return json({ error: ref.error }, ref.status);
    instruction = (instruction ? instruction : "添付の参考資料を踏まえてアプリを更新する。") + ref.promptAdd;
  }
  if (!instruction) return json({ error: "指示が必要です" }, 400);
  const { modelId } = parseRequestModel(String(b.model ?? ""));
  const paid = await getWorkersPaid(env).catch(() => false);
  const buildId = await startAppEdit(locals.ctx, { owner: ses.uid, sessionId: b.sessionId || void 0, appId, instruction, model: modelId || void 0, paid });
  try {
    locals.cfContext?.waitUntil(processAppBuild(locals.ctx, buildId, new URL(request.url).origin).then(() => void 0).catch(() => void 0));
  } catch {
  }
  return json({ ok: true, queued: true, buildId });
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
