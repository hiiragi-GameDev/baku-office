globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession, canDevelopApps } from "./auth_DL5yvmzT.mjs";
import { l as loadDraft, c as checkDefinition, a as checkTransitions, b as checkSandbox, d as checkFabrication, e as checkRun, f as finalizePrecheck } from "./precheck_CojNKKMX.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ctx = locals.ctx;
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません（管理者または開発者のみ）" }, 403);
  const b = await request.json().catch(() => ({}));
  const draftId = String(b.draftId ?? "").trim();
  if (!draftId) return json({ error: "draftId が必要" }, 400);
  try {
    await (await import("./external-apps_Ltsw3Yx-.mjs").then((n) => n.B)).recheckDraft(ctx, draftId);
  } catch {
  }
  const loaded = await loadDraft(ctx, draftId);
  if (!loaded) return json({ error: "生成アプリが見つかりません" }, 404);
  const enc = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const send = (o) => {
    void writer.write(enc.encode(`data: ${JSON.stringify(o)}

`));
  };
  (async () => {
    try {
      const checks = [];
      send({ type: "phase", label: "アプリ定義を確認しています…" });
      const def = await checkDefinition(ctx, loaded.def, loaded.permissions, loaded.spec);
      checks.push(def);
      send({ type: "check", check: def });
      send({ type: "phase", label: "画面遷移・ボタンの参照先を確認しています…" });
      const tr = checkTransitions(loaded.def);
      checks.push(tr);
      send({ type: "check", check: tr });
      const sb = checkSandbox(loaded.def);
      checks.push(sb);
      send({ type: "check", check: sb });
      const fab = checkFabrication(loaded.def);
      checks.push(fab);
      send({ type: "check", check: fab });
      send({ type: "phase", label: "サンプル入力で動作を確認しています…" });
      const runs = await checkRun(ctx, draftId, loaded.def, ses.uid);
      for (const c of runs) {
        checks.push(c);
        send({ type: "check", check: c });
      }
      const result = finalizePrecheck(checks);
      send({ type: "done", ok: result.ok, checks: result.checks });
    } catch (e) {
      const msg = e?.message ?? String(e);
      await (await import("./diag_CY3PJnOM.mjs")).logDiag(env, "error", "precheck", `失敗(draft=${draftId}): ${msg}`).catch(() => {
      });
      send({ type: "error", error: "動作確認の実行でエラーが発生しました。時間をおいて再度お試しください。" });
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
