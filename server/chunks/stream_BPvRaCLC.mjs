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
function toolStepLabel(name) {
  const M = {
    record_expense: "会計に記録しています…",
    list_expenses: "会計を確認しています…",
    register_invoice: "請求書を登録しています…",
    list_unpaid_invoices: "未払いの請求書を確認しています…",
    mark_invoice_paid: "支払い状況を更新しています…",
    search_members: "名簿を調べています…",
    set_reminder: "予定を登録しています…",
    list_reminders: "予定を確認しています…",
    list_events: "カレンダーを確認しています…",
    create_event: "予定を作成しています…",
    update_event: "予定を更新しています…",
    delete_event: "予定を削除しています…",
    search_messages: "メールを検索しています…",
    list_messages: "メールを確認しています…",
    get_message: "メールを読んでいます…",
    get_attachment: "添付を取得しています…",
    send_message: "メッセージを送信しています…",
    send_notice: "送信しています…",
    remember_fact: "記憶しています…",
    forget_fact: "記憶を整理しています…",
    list_conference_records: "会議の記録を確認しています…",
    get_transcript: "議事を読み込んでいます…",
    summarize_meeting: "会議をまとめています…",
    save_knowledge: "知識を保存しています…",
    search_knowledge: "資料を調べています…",
    save_memo: "メモを保存しています…",
    submit_receipt: "領収書を申請しています…",
    make_document: "書類を作成しています…",
    search: "情報を調べています…",
    generate_image: "画像を生成しています…",
    generate_video: "動画を生成しています…",
    synthesize_speech: "音声を作成しています…",
    run_subagent: "担当者に相談しています…",
    run_team: "複数の担当で分担しています…",
    run_skill: "登録済みの手順を実行しています…",
    install_skill: "手順を登録しています…",
    find_partner: "連携先を探しています…",
    call_partner: "連携先に問い合わせています…",
    find_app: "使えるアプリ/ツールを探しています…",
    read_spreadsheet: "スプレッドシートを読んでいます…",
    append_spreadsheet: "スプレッドシートに追記しています…",
    update_spreadsheet: "スプレッドシートを更新しています…",
    create_spreadsheet: "スプレッドシートを作成しています…",
    read_document: "ドキュメントを読んでいます…",
    create_document: "ドキュメントを作成しています…",
    append_document: "ドキュメントに追記しています…",
    read_presentation: "スライドを読んでいます…",
    create_presentation: "スライドを作成しています…",
    add_slide: "スライドを追加しています…",
    create_form: "フォームを作成しています…",
    add_form_question: "設問を追加しています…",
    list_form_responses: "フォームの回答を取得しています…",
    search_contacts: "連絡先を検索しています…",
    create_contact: "連絡先を追加しています…",
    list_tasks: "ToDoを確認しています…",
    add_task: "ToDoを追加しています…",
    complete_task: "ToDoを完了にしています…"
  };
  return M[name] ?? "情報を処理しています…";
}
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
  const enc = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const send = (o) => {
    void writer.write(enc.encode(`data: ${JSON.stringify(o)}

`));
  };
  (async () => {
    try {
      const origin = new URL(request.url).origin;
      const { tryPreAgentRouting, tryProHopsContinuation, finalizeAssistantReply } = await import("./chat-flow_CD0ZG1R9.mjs");
      const handled = await tryPreAgentRouting(ctx, locals.cfContext, { uid: ses.uid, role: ses.role, sesCtx: ses.ctx, sessionId, message, prior, mode: b.mode, hasVision: !!visionImage, modelId, origin });
      if (handled) {
        send({ type: "done", reply: handled.reply, actions: handled.actions, sessionId, ...handled.queued ? { queued: true } : {} });
        return;
      }
      const usedTools = [];
      const onEvent = (ev) => {
        if (ev.type === "thinking") send({ type: "step", label: "考えています…" });
        else {
          usedTools.push(ev.name);
          send({ type: "step", label: toolStepLabel(ev.name) });
        }
      };
      const reply = await ctx.agent.run({ owner: ses.uid, text: prompt, image: visionImage, role: ses.role, baseUrl: origin, history: toTurns(prior), model, modelId, sessionId, onEvent, signal: request.signal, mode: b.mode });
      const bg = await tryProHopsContinuation(ctx, locals.cfContext, { uid: ses.uid, role: ses.role, prompt, sessionId, origin, reply });
      if (bg) {
        send({ type: "done", reply: bg, sessionId, queued: true });
        return;
      }
      const fin = await finalizeAssistantReply(ctx, { uid: ses.uid, role: ses.role, message, sessionId, reply, tools: usedTools });
      send({ type: "done", reply: fin.content, actions: fin.actions, sessionId, messageId: fin.messageId });
    } catch (e) {
      if (request.signal.aborted || e?.name === "AbortError") {
        try {
          send({ type: "done", reply: "", sessionId, cancelled: true });
        } catch {
        }
        return;
      }
      const msg = e?.message ?? String(e);
      await (await import("./diag_CY3PJnOM.mjs")).logDiag(env, "error", "chat", `stream失敗(model=${b.model ?? "auto"}): ${msg}`).catch(() => {
      });
      const { explainStop } = await import("./errors_Cz86HmdL.mjs");
      const fallback = explainStop("system", `内部処理でエラーが発生しました（${msg.slice(0, 120)}）。`, "時間をおいて再度お試しください。続く場合は別のAIモデル（設定→連携 /settings/messaging）に切り替えるか、管理者へご連絡ください。");
      try {
        await appendMessage(ctx, sessionId, "assistant", fallback);
      } catch {
      }
      send({ type: "done", reply: fallback, sessionId });
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
