globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { cachedEntitlement } from "./client_F4fksau0.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { o as ownedSession, c as createSession, g as getMessages, a as appendMessage, e as ensureTitle, t as toTurns } from "./chat-sessions_DJA_I8xR.mjs";
import { parseRequestModel } from "./settings_dTyIbTCR.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ctx = locals.ctx;
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要" }, 401);
  if (!atLeast(await cachedEntitlement(env), "plus")) return json({ error: "AIチャットは Plus 以上のプランで利用できます" }, 403);
  if (Number(request.headers.get("content-length") ?? 0) > 16 * 1024 * 1024) return json({ error: "リクエストが大きすぎます（添付は8MBまでです）。" }, 413);
  const b = await request.json().catch(() => ({}));
  const message = (b.message ?? "").trim();
  if (!message && !b.image?.dataB64) return json({ error: "メッセージが必要" }, 400);
  const { engine: model, modelId } = parseRequestModel(String(b.model ?? ""));
  let prompt = message || "(添付ファイルを確認してください)";
  let visionImage;
  if (b.image?.dataB64) {
    const { prepareAttachment } = await import("./chat-flow_CD0ZG1R9.mjs");
    const att = await prepareAttachment(b.image, ses.uid, ses.ctx);
    if (!att.ok) return json({ error: att.error }, att.status);
    prompt = `${prompt}${att.promptAdd}`;
    visionImage = att.vision;
  }
  let sessionId = b.sessionId && await ownedSession(ctx, ses.uid, b.sessionId) ? b.sessionId : "";
  if (!sessionId) sessionId = await createSession(ctx, ses.uid, model);
  const prior = await getMessages(ctx, sessionId);
  await appendMessage(ctx, sessionId, "user", message || "(画像を添付)");
  await ensureTitle(ctx, sessionId, message || "画像の確認");
  const origin = new URL(request.url).origin;
  if (b.background) {
    if (!atLeast(await cachedEntitlement(env), "pro")) return json({ error: "バックグラウンド実行は Pro 以上で利用できます" }, 403);
    const { enqueueAgentJob, processAgentJobs } = await import("./agent-jobs_DaGtU1F5.mjs");
    await enqueueAgentJob(ctx, { owner: ses.uid, sessionId, prompt, role: ses.role });
    try {
      locals.cfContext?.waitUntil(processAgentJobs(ctx, origin));
    } catch {
    }
    return json({ ok: true, queued: true, sessionId, reply: "バックグラウンドで実行を開始しました。完了するとこの会話に結果が表示され、通知（ベル）でもお知らせします（画面を離れても続行します）。" });
  }
  const { tryPreAgentRouting, tryProHopsContinuation, finalizeAssistantReply } = await import("./chat-flow_CD0ZG1R9.mjs");
  const handled = await tryPreAgentRouting(ctx, locals.cfContext, { uid: ses.uid, role: ses.role, sesCtx: ses.ctx, sessionId, message, prior, mode: b.mode, hasVision: !!visionImage, modelId, origin });
  if (handled) return json({ ok: true, sessionId, reply: handled.reply, actions: handled.actions, ...handled.queued ? { queued: true } : {} });
  const usedTools = [];
  let reply;
  try {
    reply = await ctx.agent.run({ owner: ses.uid, text: prompt, image: visionImage, role: ses.role, baseUrl: origin, history: toTurns(prior), model, modelId, sessionId, mode: b.mode, onEvent: (ev) => {
      if (ev.type === "tool") usedTools.push(ev.name);
    } });
  } catch (e) {
    const msg = e?.message ?? String(e);
    await (await import("./diag_CY3PJnOM.mjs")).logDiag(env, "error", "chat", `agent.run失敗(model=${b.model ?? "auto"}): ${msg}`);
    const { explainStop } = await import("./errors_Cz86HmdL.mjs");
    reply = explainStop("system", `内部処理でエラーが発生しました（${msg.slice(0, 120)}）。`, "時間をおいて再度お試しください。続く場合は別のAIモデル（設定→連携 /settings/messaging）に切り替えるか、管理者へご連絡ください。");
  }
  const bg = await tryProHopsContinuation(ctx, locals.cfContext, { uid: ses.uid, role: ses.role, prompt, sessionId, origin, reply });
  if (bg) return json({ ok: true, queued: true, reply: bg, sessionId });
  const fin = await finalizeAssistantReply(ctx, { uid: ses.uid, role: ses.role, message, sessionId, reply, tools: usedTools });
  return json({ ok: true, reply: fin.content, actions: fin.actions, sessionId, messageId: fin.messageId });
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
