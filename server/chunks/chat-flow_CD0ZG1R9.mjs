globalThis.process ??= {};
globalThis.process.env ??= {};
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { env } from "cloudflare:workers";
import { isTextAttachmentMime, saveChatAttachment } from "./storage_BHLYBEBb.mjs";
import { d as dedupeActions, f as filterAiActions, n as navGuidance, a as appendMessage } from "./chat-sessions_DJA_I8xR.mjs";
import { canDevelopApps } from "./auth_DL5yvmzT.mjs";
import { cachedEntitlement } from "./client_F4fksau0.mjs";
import { logDiag } from "./diag_CY3PJnOM.mjs";
const TEXT_ATTACH_MAX = 1e5;
async function prepareAttachment(image, uid, fileCtx) {
  const att = await saveChatAttachment(env, image, uid, fileCtx);
  if (!att.ok) return { ok: false, status: att.status, error: att.error };
  if (isTextAttachmentMime(image.mimeType ?? "")) {
    let txt = "";
    let truncated = false;
    try {
      const bin = atob(image.dataB64 ?? "");
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      const full = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      truncated = full.length > TEXT_ATTACH_MAX;
      txt = full.slice(0, TEXT_ATTACH_MAX);
    } catch {
    }
    const note = truncated ? `（長いため先頭 約${Math.floor(TEXT_ATTACH_MAX / 1e3)}千文字のみを載せています。全文は file_id=${att.id} を参照）` : "";
    const promptAdd = txt ? `

【添付ファイルの内容（file_id=${att.id}）${note}】
${txt}` : `

（添付ファイル file_id=${att.id} を保存しましたが、内容を読み取れませんでした）`;
    return { ok: true, promptAdd };
  }
  return {
    ok: true,
    promptAdd: `

（添付ファイルを保存しました: file_id=${att.id}。請求書/領収書なら register_invoice に file_id を渡して登録してください。）`,
    vision: { mimeType: image.mimeType ?? "application/octet-stream", dataB64: image.dataB64 ?? "" }
  };
}
const DEV_REF_MAX = 8e3;
async function prepareDevAttachment(image, uid, fileCtx) {
  const mime = (image.mimeType ?? "").toLowerCase();
  if (!isTextAttachmentMime(mime)) {
    return { ok: false, status: 400, error: "参考資料はテキスト系ファイル（txt / csv / tsv / json / md / yaml / xml）に対応しています。画像・PDF はこの開発チャットでは内容を読み取れません。" };
  }
  const att = await saveChatAttachment(env, image, uid, fileCtx);
  if (!att.ok) return { ok: false, status: att.status, error: att.error };
  let txt = "";
  try {
    const bin = atob(image.dataB64 ?? "");
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    txt = new TextDecoder("utf-8", { fatal: false }).decode(bytes).slice(0, DEV_REF_MAX);
  } catch {
  }
  if (!txt.trim()) return { ok: false, status: 400, error: "参考資料の内容を読み取れませんでした。" };
  const name = (image.fileName ?? "参考資料").slice(0, 80);
  return { ok: true, promptAdd: `

【参考資料「${name}」の内容（これを踏まえて反映する）】
${txt}` };
}
function buildReplyActions(rawAiActions, content, role) {
  return dedupeActions([...filterAiActions(rawAiActions, role), ...navGuidance(content, role)]).slice(0, 6);
}
async function tryHandleAppDelete(ctx, sessionId, role, sesCtx, message, prior) {
  if (!canDevelopApps(role)) return null;
  if (!atLeast(await cachedEntitlement(env), "pro")) return null;
  const { looksLikeAppDelete, looksLikeDeleteConfirmation } = await import("./ctx_D9xObGWH.mjs").then((n) => n.T);
  const priorAssistant = [...prior].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const wantsDelete = looksLikeAppDelete(message);
  const confirmsDelete = looksLikeDeleteConfirmation(message, priorAssistant);
  if (!wantsDelete && !confirmsDelete) return null;
  const { latestSessionApp } = await import("./ctx_D9xObGWH.mjs").then((n) => n.R);
  const appId = await latestSessionApp(ctx, sessionId);
  if (!appId) return null;
  const { getAppDesign, deleteGenApp } = await import("./external-apps_Ltsw3Yx-.mjs").then((n) => n.B);
  const design = await getAppDesign(ctx, appId).catch(() => null);
  const appName = design?.name ?? appId;
  if (confirmsDelete) {
    try {
      await deleteGenApp(ctx, appId);
    } catch (e) {
      await logDiag(env, "error", "chat", `deleteGenApp失敗(app=${appId}): ${e?.message ?? e}`).catch(() => {
      });
      throw e;
    }
    const reply2 = `「${appName}」を削除しました。下書き・導入版・公開ページ・蓄積データをまとめて削除しました（元に戻せません）。`;
    await appendMessage(ctx, sessionId, "assistant", reply2);
    return { reply: reply2, actions: [] };
  }
  const reply = `「${appName}」を削除しますか？
アプリ本体に加え、下書き・導入版・公開ページ・蓄積データもまとめて削除され、元に戻せません。よろしければ「削除する」を押してください。`;
  const actions = [
    { label: "削除する", kind: "reply", text: "削除する", style: "ghost" },
    { label: "やめる", kind: "reply", text: "やめる", style: "ghost" }
  ];
  await appendMessage(ctx, sessionId, "assistant", reply, actions);
  return { reply, actions };
}
async function tryPreAgentRouting(ctx, cfContext, args) {
  const { uid, role, sesCtx, sessionId, message, prior, mode, hasVision, modelId, origin } = args;
  const notPlan = mode !== "plan" && !hasVision;
  const priorAssistant = [...prior].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const { looksLikeBuildConfirmation, looksLikeUiModeChoice, UI_MODE_QUESTION, UI_MODE_ACTIONS } = await import("./ctx_D9xObGWH.mjs").then((n) => n.T);
  if (notPlan && canDevelopApps(role) && looksLikeBuildConfirmation(message, priorAssistant)) {
    const { startAppBuild, processAppBuild, buildModelGuide } = await import("./ctx_D9xObGWH.mjs").then((n) => n.R);
    const guide = await buildModelGuide(env);
    if (guide) {
      await appendMessage(ctx, sessionId, "assistant", guide);
      return { reply: guide, actions: [] };
    }
    const uiMode = looksLikeUiModeChoice(message);
    if (!uiMode) {
      await appendMessage(ctx, sessionId, "assistant", UI_MODE_QUESTION, UI_MODE_ACTIONS);
      return { reply: UI_MODE_QUESTION, actions: UI_MODE_ACTIONS };
    }
    const { getWorkersPaid } = await import("./settings_dTyIbTCR.mjs");
    const spec = ([...prior].map((m) => `${m.role === "user" ? "利用者" : "AI"}: ${m.content}`).join("\n").slice(-5e3) + "\n利用者: " + message).trim();
    const paid = await getWorkersPaid(env).catch(() => false);
    const buildId = await startAppBuild(ctx, { owner: uid, sessionId, spec, model: modelId || void 0, paid, uiMode });
    try {
      cfContext?.waitUntil(processAppBuild(ctx, buildId, origin).then(() => void 0).catch(() => void 0));
    } catch {
    }
    const bgMsg = "承知しました。仕様にそって実装を開始します。工程ごとに順に進め、完了するとこの会話に表示し、ベル（通知）でもお知らせします（画面を離れても続行します）。";
    await appendMessage(ctx, sessionId, "assistant", bgMsg);
    return { reply: bgMsg, actions: [], queued: true };
  }
  if (notPlan) {
    const del = await tryHandleAppDelete(ctx, sessionId, role, sesCtx, message, prior);
    if (del) return del;
  }
  if (notPlan && canDevelopApps(role) && atLeast(await cachedEntitlement(env), "pro")) {
    const { looksLikeAppEdit } = await import("./ctx_D9xObGWH.mjs").then((n) => n.T);
    if (looksLikeAppEdit(message)) {
      const { latestSessionApp, resolveAppByName, startAppEdit, processAppBuild, buildModelGuide } = await import("./ctx_D9xObGWH.mjs").then((n) => n.R);
      let appId = await latestSessionApp(ctx, sessionId);
      if (!appId) {
        const res = await resolveAppByName(ctx, message);
        if (res && "appId" in res) appId = res.appId;
        else if (res && "candidates" in res && res.candidates.length) {
          const actions = res.candidates.slice(0, 5).map((c) => ({ label: `「${c.name}」を修正`, kind: "reply", text: `「${c.name}」を${message}` }));
          const msg = "どのアプリを修正しますか？候補から選んでください。";
          await appendMessage(ctx, sessionId, "assistant", msg, actions);
          return { reply: msg, actions };
        }
      }
      if (appId) {
        const guide = await buildModelGuide(env);
        if (guide) {
          await appendMessage(ctx, sessionId, "assistant", guide);
          return { reply: guide, actions: [] };
        }
        const { getWorkersPaid } = await import("./settings_dTyIbTCR.mjs");
        const instruction = ([...prior].slice(-8).map((m) => `${m.role === "user" ? "利用者" : "AI"}: ${m.content}`).join("\n").slice(-4e3) + "\n利用者: " + message).trim();
        const paid = await getWorkersPaid(env).catch(() => false);
        const buildId = await startAppEdit(ctx, { owner: uid, sessionId, appId, instruction, model: modelId || void 0, paid });
        try {
          cfContext?.waitUntil(processAppBuild(ctx, buildId, origin).then(() => void 0).catch(() => void 0));
        } catch {
        }
        const bgMsg = "承知しました。アプリの修正を開始します。完了するとこの会話に表示し、ベル（通知）でもお知らせします（画面を離れても続行します）。";
        await appendMessage(ctx, sessionId, "assistant", bgMsg);
        return { reply: bgMsg, actions: [], queued: true };
      }
    }
  }
  return null;
}
async function tryProHopsContinuation(ctx, cfContext, args) {
  const { HOPS_EXCEEDED } = await import("./ai_Dn536Rzr.mjs");
  if (args.reply !== HOPS_EXCEEDED) return null;
  if (!atLeast(await cachedEntitlement(env), "pro")) return null;
  const { enqueueAgentJob, processAgentJobs } = await import("./agent-jobs_DaGtU1F5.mjs");
  await enqueueAgentJob(ctx, { owner: args.uid, sessionId: args.sessionId, prompt: args.prompt, role: args.role });
  try {
    cfContext?.waitUntil(processAgentJobs(ctx, args.origin));
  } catch {
  }
  const { getWorkersPaid } = await import("./settings_dTyIbTCR.mjs");
  const paidNote = await getWorkersPaid(env).catch(() => false) ? "" : "\n\n※ 長い処理が多い場合は Workers Paid の有効化をおすすめします（一度に長く処理でき、途中で止まりにくくなります）。設定→高度なオプションをご確認ください。";
  const bgMsg = "時間がかかっているため、バックグラウンドで続けています。完了するとこの会話に表示し、ベル（通知）でもお知らせします（画面を離れても続行します）。" + paidNote;
  await appendMessage(ctx, args.sessionId, "assistant", bgMsg);
  return bgMsg;
}
async function finalizeAssistantReply(ctx, args) {
  const { HOPS_EXCEEDED } = await import("./ai_Dn536Rzr.mjs");
  let text = args.reply;
  if (text === HOPS_EXCEEDED) {
    const { explainStop } = await import("./errors_Cz86HmdL.mjs");
    text = explainStop("ai", "ご依頼が大きく、一度のAI処理回数の上限内で完了できませんでした。", "依頼を小さく分けて（例：1つの機能・画面ずつ）再度お試しください。");
  }
  const { recordTaskFromReply, linkTaskMessage } = await import("./task-log_BGzViZew.mjs");
  const task = await recordTaskFromReply(env, { owner: args.uid, role: args.role, source: "chat", userText: args.message, reply: text, tools: args.tools, sessionId: args.sessionId });
  text = task.reply;
  const { extractActions } = await import("./chat-sessions_DJA_I8xR.mjs").then((n) => n.h);
  const ex = extractActions(text);
  const actions = buildReplyActions(ex.actions, ex.content, args.role);
  const mid = await appendMessage(ctx, args.sessionId, "assistant", ex.content, actions);
  if (task.taskId) await linkTaskMessage(env, task.taskId, mid);
  return { content: ex.content, actions, messageId: mid };
}
export {
  buildReplyActions,
  finalizeAssistantReply,
  prepareAttachment,
  prepareDevAttachment,
  tryHandleAppDelete,
  tryPreAgentRouting,
  tryProHopsContinuation
};
