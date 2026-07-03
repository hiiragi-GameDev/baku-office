globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession, canDevelopApps } from "./auth_DL5yvmzT.mjs";
import { d as draftRunNeedsApproval, b as authorizeDraftRun, r as runDraftApp, c as appRunNeedsApproval, a as authorizeAppRun, f as runInstalledApp } from "./app-runtime_CwwWS9oK.mjs";
import { getApprovalMode, createApproval } from "./approvals_CEi6BOlb.mjs";
import { APP } from "./errors_Cz86HmdL.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  const b = await request.json().catch(() => ({}));
  const irreversibleApprovalOn = ses.role === "admin" ? false : await getApprovalMode(env);
  if (b.draftId) {
    if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません" }, 403);
    const dryRun = b.dryRun !== false;
    if (!dryRun) {
      const need2 = await draftRunNeedsApproval(locals.ctx, b.draftId, b.screenId, irreversibleApprovalOn);
      if (need2) {
        const auth = await authorizeDraftRun(locals.ctx, b.draftId, b.screenId, ses.role);
        if (!auth.ok) return json({ ok: false, code: auth.code, error: auth.error }, 403);
        const id = await createApproval(env, ses.uid, `draft:${b.draftId}`, { __draftId: b.draftId, __screenId: b.screenId, inputs: b.inputs ?? {} }, need2.preview, { role: ses.role, ctx: ses.ctx, screenId: b.screenId, subjectType: "draft", defHash: auth.defHash, permsHash: auth.permsHash });
        return json({ ok: false, code: APP.APPROVAL_REQUIRED, error: `この実送信テストは承認が必要です（${need2.reason}）。
${need2.preview}
承認ID: ${id}（管理者が「承認待ち」一覧で承認すると実行されます）` }, 200);
      }
    }
    const res2 = await runDraftApp(locals.ctx, b.draftId, b.inputs ?? {}, ses.uid, b.screenId, { role: ses.role, dryRun });
    return json(res2, res2.ok ? 200 : 400);
  }
  if (!b.appId) return json({ error: "appId が必要です" }, 400);
  const need = await appRunNeedsApproval(locals.ctx, b.appId, b.screenId, irreversibleApprovalOn);
  if (need) {
    const auth = await authorizeAppRun(locals.ctx, b.appId, b.screenId, ses.role);
    if (!auth.ok) return json({ ok: false, code: auth.code, error: auth.error }, 403);
    const id = await createApproval(env, ses.uid, b.appId, { __appId: b.appId, __screenId: b.screenId, inputs: b.inputs ?? {} }, need.preview, { role: ses.role, ctx: ses.ctx, appId: b.appId, screenId: b.screenId, appVersion: auth.appVersion, subjectType: "installed", defHash: auth.defHash, permsHash: auth.permsHash });
    return json({ ok: false, code: APP.APPROVAL_REQUIRED, error: `この操作は承認が必要です（${need.reason}）。
${need.preview}
承認ID: ${id}（管理者が「承認待ち」一覧で承認すると実行されます）` }, 200);
  }
  const res = await runInstalledApp(locals.ctx, b.appId, b.inputs ?? {}, ses.uid, b.screenId, ses.role);
  return json(res, res.ok ? 200 : 400);
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
