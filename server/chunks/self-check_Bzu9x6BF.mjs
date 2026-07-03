globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { loadDraftForCheck, deterministicSelfChecks, aiSelfChecks, mergeChecks, finalize, persistSelfCheck } from "./self-check_CChoVSYc.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ctx = locals.ctx;
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  const { canDevelopApps } = await import("./auth_DL5yvmzT.mjs");
  if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません（管理者または開発者のみ）" }, 403);
  const b = await request.json().catch(() => ({}));
  const draftId = String(b.draftId ?? "").trim();
  if (!draftId) return json({ error: "draftId が必要" }, 400);
  const input = await loadDraftForCheck(ctx, draftId);
  if (!input) return json({ error: "草案が見つかりません" }, 404);
  const enc = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const send = (o) => {
    void writer.write(enc.encode(`data: ${JSON.stringify(o)}

`));
  };
  (async () => {
    try {
      send({ type: "phase", label: "基本チェックを実行しています…" });
      const det = await deterministicSelfChecks(ctx, input);
      for (const c of det) send({ type: "check", check: c });
      send({ type: "phase", label: "AIが公序良俗・法的問題などを審査しています…" });
      const ai = await aiSelfChecks(ctx, input);
      const merged = mergeChecks(det, ai);
      const detKeys = new Set(det.map((c) => c.key));
      for (const c of merged) {
        if (c.ai || !detKeys.has(c.key)) send({ type: "check", check: c });
      }
      const result = finalize(merged);
      await persistSelfCheck(ctx, draftId, result);
      send({ type: "done", ok: result.ok, checks: result.checks, checkedAt: result.checkedAt });
    } catch (e) {
      const msg = e?.message ?? String(e);
      await (await import("./diag_CY3PJnOM.mjs")).logDiag(env, "error", "self-check", `失敗(draft=${draftId}): ${msg}`).catch(() => {
      });
      send({ type: "error", error: "セルフチェックの実行でエラーが発生しました。時間をおいて再度お試しください。" });
    } finally {
      await writer.close().catch(() => {
      });
    }
  })();
  return new Response(readable, {
    headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", "x-accel-buffering": "no" }
  });
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
