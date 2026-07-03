globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession, currentAuthState, revokedSince, canDevelopApps } from "./auth_DL5yvmzT.mjs";
import { listApprovals, getApproval, decideApproval } from "./approvals_CEi6BOlb.mjs";
import { b as runApprovedTool } from "./ctx_D9xObGWH.mjs";
import { a as authorizeAppRun, b as authorizeDraftRun, v as verifyApprovalIntegrity } from "./app-runtime_CwwWS9oK.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals, url }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b._action === "list") {
    return json({ ok: true, pending: await listApprovals(env, "pending") });
  }
  if (b._action === "approve" || b._action === "reject") {
    const id = String(b.id ?? "");
    const a = await getApproval(env, id);
    if (!a) return json({ error: "承認が見つかりません" }, 404);
    const requesterRole = a.requester_role || "member";
    const r = await decideApproval(env, id, b._action === "approve", ses.uid, async (tool, args) => {
      const isApp = typeof args.__appId === "string";
      const isDraft = typeof args.__draftId === "string";
      const state = await currentAuthState(env, a.owner);
      if (state.kind === "error") {
        return { ok: false, error: "申請者の権限状態を確認できないため実行できません。時間をおいて再度お試しください。" };
      }
      let effectiveRole = requesterRole;
      if (state.kind === "user") {
        if (!state.active || !state.role) {
          return { ok: false, error: "申請者のアカウントが無効化または削除されているため実行できません。" };
        }
        effectiveRole = state.role;
      } else if (isApp || isDraft) {
        return { ok: false, error: "申請者のアカウントを確認できないため実行できません。" };
      }
      if (await revokedSince(env, a.owner, a.created_at)) {
        return { ok: false, error: "申請後に起案者の権限が変更（降格・除名等）されたため実行できません。再申請してください。" };
      }
      if (isDraft && !canDevelopApps(effectiveRole)) {
        return { ok: false, error: "アプリ開発の権限がないため、この実送信テストは実行できません。" };
      }
      if (isApp || isDraft) {
        const subjectType = isApp ? "installed" : "draft";
        const subjectId = isApp ? String(args.__appId) : String(args.__draftId);
        const reauth = isApp ? await authorizeAppRun(locals.ctx, subjectId, a.screen_id ?? void 0, effectiveRole) : await authorizeDraftRun(locals.ctx, subjectId, a.screen_id ?? void 0, effectiveRole);
        if (!reauth.ok) return { ok: false, error: `承認時の再確認に失敗しました：${reauth.error}` };
        if (a.def_hash && a.perms_hash) {
          const integ = await verifyApprovalIntegrity(locals.ctx, subjectType, subjectId, a.def_hash, a.perms_hash);
          if (!integ.ok) return { ok: false, error: integ.error ?? "承認対象の内容が変更されています。再申請してください。" };
        } else if (isApp && a.app_version && reauth.appVersion && a.app_version !== reauth.appVersion) {
          return { ok: false, error: "申請後にアプリ定義が更新されました。内容が変わっている可能性があるため、お手数ですが再申請してください。" };
        }
      }
      return runApprovedTool(locals.ctx, a.owner, url.origin, effectiveRole, tool, args);
    });
    return r.ok ? json({ ok: true, result: r.result }) : json({ error: r.error }, 400);
  }
  return json({ error: "不明な操作" }, 400);
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
