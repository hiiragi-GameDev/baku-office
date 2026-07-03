globalThis.process ??= {};
globalThis.process.env ??= {};
import { cachedEntitlement, getApiKey } from "./client_F4fksau0.mjs";
import { DiscordInbound } from "./discord_MitODRRb.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { joinWithInvite } from "./users_DArBIlQW.mjs";
import { F as transcribeAudio, G as verifyLineSignature, H as lineReply, I as lineReplyQuick, t as cfEgressGateway } from "./ctx_D9xObGWH.mjs";
import { inboundFileLimitBytes, saveFile } from "./storage_BHLYBEBb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { logDiag, looksLikeLimit, PAID_HINT } from "./diag_CY3PJnOM.mjs";
import { getWorkersPaid } from "./settings_dTyIbTCR.mjs";
import { env } from "cloudflare:workers";
const ok = () => new Response("ok", { status: 200 });
class SlackInbound {
  id = "slack";
  gw;
  signingSecret;
  botToken;
  constructor(gw, creds) {
    this.gw = gw;
    this.signingSecret = creds.signingSecret;
    this.botToken = creds.botToken;
  }
  async handleInbound(req, ic) {
    const ts = req.headers.get("x-slack-request-timestamp") ?? "";
    const sig = req.headers.get("x-slack-signature") ?? "";
    const body = await req.text();
    if (!ts || !sig || !await verifySlack(this.signingSecret, ts, body, sig)) {
      return new Response("invalid signature", { status: 401 });
    }
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return new Response("bad request", { status: 400 });
    }
    if (data.type === "url_verification") return new Response(data.challenge ?? "", { status: 200 });
    const ev = data.event;
    const addressed = ev?.type === "app_mention" || ev?.type === "message" && ev.channel_type === "im";
    if (ev && !ev.bot_id && !ev.subtype && addressed) {
      const sender = ev.user;
      const text = stripMention(ev.text ?? "");
      const channel = ev.channel;
      if (sender && text && channel) {
        ic.waitUntil(
          (async () => {
            const out = await ic.respond({ connector: "slack", sender, text, channel });
            await this.postMessage(channel, out.text);
          })()
        );
      }
    }
    return ok();
  }
  async postMessage(channel, text) {
    await this.gw.fetch("slack", "https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${this.botToken}` },
      body: JSON.stringify({ channel, text })
    });
  }
}
function stripMention(text) {
  return text.replace(/<@[^>]+>/g, "").trim();
}
async function verifySlack(signingSecret, timestamp, body, signature, nowSec2) {
  const now = Math.floor(Date.now() / 1e3);
  if (!/^\d+$/.test(timestamp) || Math.abs(now - Number(timestamp)) > 60 * 5) return false;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(signingSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`v0:${timestamp}:${body}`));
    const expected = "v0=" + Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");
    return timingSafeEqual(expected, signature);
  } catch {
    return false;
  }
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const INTERNAL_PATH = /(^|[\s(（「『])(\/(?:app|apps|p|lp|site|approvals|settings|projects|project|billing|files|my-events|members|invoices)(?:\/[\w\-./%?=&#]*)?)/g;
function absolutizeInternalLinks(text, baseUrl) {
  if (!baseUrl) return text;
  const base = baseUrl.replace(/\/$/, "");
  return text.replace(INTERNAL_PATH, (_m, pre, path) => `${pre}${base}${path}`);
}
const MSG_NOT_MEMBER = "このアシスタントは登録メンバー専用です。管理者から招待コードを受け取り、ログインで参加してください。";
const MSG_PENDING = "参加申請を受け付けています。管理者の承認をお待ちください。承認されると利用できるようになります。";
const MSG_NOT_PRO = "この機能は現在ご利用いただけません。ご利用をご希望の場合は、担当者（管理者）にお問い合わせください。";
async function checkAccess(ctx, env2, connector, sender) {
  const member = await ctx.identity.memberOf(connector, sender);
  if (member?.status === "pending") return { ok: false, message: MSG_PENDING, gate: "pending" };
  if (!member || member.status !== "active") return { ok: false, message: MSG_NOT_MEMBER, gate: "not_member" };
  if (!atLeast(await cachedEntitlement(env2), "pro")) return { ok: false, message: MSG_NOT_PRO, gate: "not_pro" };
  return { ok: true, role: member.role, uid: member.id };
}
async function joinViaInvite(env2, connector, externalId, code, name) {
  const inv = await env2.DB.prepare("SELECT id,target_user_id,expires_at,max_uses,used_count FROM invites WHERE code=? AND status='active'").bind(code).first();
  const cj = connector === "line" ? "LINE" : connector === "discord" ? "Discord" : connector === "slack" ? "Slack" : connector;
  if (inv?.target_user_id) {
    if (nowSec() >= inv.expires_at) return { ok: false, message: "連携コードの有効期限が切れています。管理者に再発行を依頼してください。" };
    if (inv.used_count >= inv.max_uses) return { ok: false, message: "この連携コードは使用済みです。" };
    const { linkIdentity } = await import("./users_DArBIlQW.mjs");
    const r2 = await linkIdentity(env2, inv.target_user_id, connector, externalId);
    if (!r2.ok) return { ok: false, message: r2.error ?? "連携できませんでした。" };
    await env2.DB.prepare("UPDATE invites SET used_count=used_count+1, status='revoked' WHERE id=?").bind(inv.id).run();
    return { ok: true, message: `✅ ${cj} をあなたのアカウントに連携しました。以後この ${cj} でAIを使え、あなた宛の通知も届きます。` };
  }
  const r = await joinWithInvite(env2, code, name || `${connector}ユーザー`, { type: connector, externalId });
  if (!r.ok) return { ok: false, message: `参加できませんでした：${r.error}` };
  return { ok: true, message: "参加申請を受け付けました。管理者の承認後に利用できます。" };
}
const SESSION_TTL = 6 * 60 * 60;
const sessionKey = (connector, id) => `chatsess:${connector}:${id}`;
async function loadSession(env2, connector, id) {
  const raw = await env2.LICENSE.get(sessionKey(connector, id));
  if (!raw) return [];
  try {
    const t = JSON.parse(raw);
    if (!Array.isArray(t)) return [];
    await env2.LICENSE.put(sessionKey(connector, id), raw, { expirationTtl: SESSION_TTL }).catch(() => {
    });
    return t;
  } catch {
    return [];
  }
}
async function saveSession(env2, connector, id, turns) {
  await env2.LICENSE.put(sessionKey(connector, id), JSON.stringify(turns.slice(-20)), { expirationTtl: SESSION_TTL });
}
async function clearSession(env2, connector, id) {
  await env2.LICENSE.delete(sessionKey(connector, id)).catch(() => {
  });
}
async function respondInbound(ctx, env2, baseUrl, msg) {
  const acc = await checkAccess(ctx, env2, msg.connector, msg.sender);
  if (!acc.ok) return acc.gate === "pending" ? { text: acc.message } : { text: acc.message, gate: acc.gate };
  if (msg.sessionId && /^(リセット|reset)$/i.test((msg.text ?? "").trim())) {
    await clearSession(env2, msg.connector, msg.sessionId);
    return { text: "会話の文脈をリセットしました。", sessionId: msg.sessionId };
  }
  const owner = `${msg.connector}:${msg.sender}`;
  let prompt = msg.text;
  if (msg.audio) {
    const t = await transcribeAudio(env2, b64ToBytes(msg.audio.dataB64), msg.audio.mimeType).catch(() => null);
    if (t) prompt = prompt ? `${prompt}
${t}` : t;
    else if (!prompt && !msg.image && !msg.files?.length) return { text: "音声を認識できませんでした（Gemini 未設定の可能性があります）。" };
  }
  const sid = msg.sessionId;
  const uq = await import("./upload-queue_B0YYP6NN.mjs");
  const bins = [];
  const failedNames = [];
  const limitBytes = await inboundFileLimitBytes(env2).catch(() => 25 * 1024 * 1024);
  const limitMb = Math.max(1, Math.floor(limitBytes / (1024 * 1024)));
  const toFile = async (dataB64, name, mime) => {
    if (limitBytes && Math.floor(dataB64.length * 3 / 4) > limitBytes) {
      failedNames.push(name);
      return;
    }
    const f = new File([b64ToBytes(dataB64)], name, { type: mime });
    const s = await saveFile(env2, f, owner, "personal").catch(() => null);
    if (s) bins.push({ fileId: s.id, name, mime });
    else failedNames.push(name);
  };
  if (msg.image?.dataB64) await toFile(msg.image.dataB64, "画像.jpg", msg.image.mimeType);
  for (const file of msg.files ?? []) await toFile(file.dataB64, file.filename || "ファイル", file.mimeType);
  const failNote = failedNames.length ? `

⚠️ ${failedNames.length}件は大きすぎるなどの理由で受け取れませんでした（1件あたり${limitMb}MBまで）。圧縮・分割してお送りいただくか、担当者にご相談ください。` : "";
  if (bins.length) {
    if (prompt) await uq.resolveUploadText(ctx, owner, prompt).catch(() => void 0);
    let first;
    for (const b of bins) {
      const q = await uq.enqueueUpload(ctx, { owner, connector: msg.connector, role: acc.role, fileId: b.fileId, name: b.name, mime: b.mime });
      if (!first) first = q;
    }
    const ack = uq.uploadAck(first);
    const text2 = (ack.menu ? `📎 ${bins.length}件のファイルを受け取りました。どうしますか？（続けて送れます・あとでまとめて処理します）
返信で「読み込み」「保管する」「何もしない」のいずれかを送ってください。` : ack.text) + failNote;
    return sid ? { text: text2, sessionId: sid } : { text: text2 };
  }
  if (failedNames.length) {
    const text2 = `ファイルを受け取れませんでした（1件あたり${limitMb}MBまで）。圧縮・分割してお送りいただくか、担当者にご相談ください。`;
    return sid ? { text: text2, sessionId: sid } : { text: text2 };
  }
  if (prompt) {
    const u = await uq.resolveUploadText(ctx, owner, prompt).catch(() => ({ handled: false, reply: "" }));
    if (u.handled) return sid ? { text: u.reply, sessionId: sid } : { text: u.reply };
  }
  if (!prompt) return { text: "メッセージまたはファイルを送ってください。" };
  const history = sid ? await loadSession(env2, msg.connector, sid) : [];
  const { getMemberModel, parseRequestModel } = await import("./settings_dTyIbTCR.mjs");
  const { engine: model, modelId } = parseRequestModel(await getMemberModel(env2, acc.uid).catch(() => null) ?? "");
  let answer = "";
  const usedTools = [];
  try {
    answer = await ctx.agent.run({ owner, text: prompt, role: acc.role, baseUrl, history, model, modelId, sessionId: sid, audience: "messaging", onEvent: (ev) => {
      if (ev.type === "tool") usedTools.push(ev.name);
    } });
  } catch (e) {
    const emsg = e.message ?? String(e);
    const limit = looksLikeLimit(emsg);
    const paid = limit ? await getWorkersPaid(env2).catch(() => false) : false;
    await logDiag(env2, "error", limit ? "limit" : "ai", `inbound(${msg.connector}): ${emsg}`).catch(() => void 0);
    const text2 = limit && !paid ? "処理がサーバーの上限に達した可能性があります。\n" + PAID_HINT : limit ? "処理が一時的に混み合いました。少し時間をおいて、もう一度お試しください（内容を分けると安定します）。" : "処理中にエラーが発生しました。お手数ですが、時間をおいて再度お試しください。続く場合は内容を短く分けるとうまくいくことがあります。";
    return sid ? { text: text2, sessionId: sid } : { text: text2 };
  }
  const { recordTaskFromReply } = await import("./task-log_BGzViZew.mjs");
  const task = await recordTaskFromReply(env2, { owner, role: acc.role, source: msg.connector, userText: prompt, reply: answer, tools: usedTools, sessionId: sid ?? null });
  answer = task.reply;
  if (sid) await saveSession(env2, msg.connector, sid, [...history, { role: "user", text: prompt }, { role: "assistant", text: answer }]);
  const text = absolutizeInternalLinks(answer.replace(/<!--\s*bo-[\s\S]*?-->/g, "").trim(), baseUrl);
  return sid ? { text, sessionId: sid } : { text };
}
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
class LineInbound {
  id = "line";
  gw;
  ctx;
  env;
  secret;
  accessToken;
  constructor(gw, ctx, env2, creds) {
    this.gw = gw;
    this.ctx = ctx;
    this.env = env2;
    this.secret = creds.secret;
    this.accessToken = creds.accessToken;
  }
  async handleInbound(req, ic) {
    const body = await req.text();
    if (!await verifyLineSignature(this.secret, body, req.headers.get("x-line-signature") ?? "")) {
      return new Response("invalid signature", { status: 401 });
    }
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      return new Response("bad request", { status: 400 });
    }
    ic.waitUntil(this.process(payload.events ?? [], ic));
    return new Response("ok");
  }
  async process(events, ic) {
    for (const ev of events) {
      if (ev.type !== "message" || !ev.replyToken || !ev.source?.userId) continue;
      const userId = ev.source.userId;
      await this.env.LICENSE?.put("line_last_sender", userId, { expirationTtl: 3600 })?.catch(() => {
      });
      const reply = ev.replyToken;
      const m = ev.message;
      const send = (text) => lineReply(this.gw, this.accessToken, reply, text).catch(() => void 0);
      const sendQuick = (text, items) => lineReplyQuick(this.gw, this.accessToken, reply, text, items).catch(() => void 0);
      try {
        if (m.type === "text") {
          const text = (m.text ?? "").trim();
          const join = text.match(/^参加[\s　]+(\S+)/);
          if (join) {
            await send((await ic.link(userId, join[1].trim())).message);
            continue;
          }
          if (text === "リセット" || text === "reset") {
            await this.resetSession(userId);
            await send("会話の文脈をリセットしました。");
            continue;
          }
          if (await this.handleUploadText(userId, text, send)) continue;
          await send(await this.respond(ic, userId, text));
        } else if ((m.type === "image" || m.type === "file" || m.type === "audio") && m.id) {
          const acc = await checkAccess(this.ctx, this.env, "line", userId);
          if (!acc.ok) {
            await send(acc.message);
            continue;
          }
          const limit = await inboundFileLimitBytes(this.env).catch(() => 25 * 1024 * 1024);
          const limitMb = Math.max(1, Math.floor(limit / (1024 * 1024)));
          if (m.fileSize && m.fileSize > limit) {
            await send(`ファイルが大きすぎて受け取れません（1件あたり${limitMb}MBまで）。圧縮するか、分けてお送りください。`);
            continue;
          }
          const content = await this.fetchContent(m.id, limit);
          if (content === "too_large") {
            await send(`ファイルが大きすぎて受け取れません（1件あたり${limitMb}MBまで）。圧縮するか、分けてお送りください。`);
            continue;
          }
          if (!content) {
            await send("ファイルを取得できませんでした。もう一度お送りください。");
            continue;
          }
          const name = m.fileName ?? (m.type === "image" ? "画像.jpg" : m.type === "audio" ? "音声" : "ファイル");
          const file = new File([content.buf], name, { type: content.mime });
          const saved = await saveFile(this.env, file, `line:${userId}`, "personal").catch(() => null);
          if (!saved) {
            await send(`ファイルを保存できませんでした。大きすぎる場合は圧縮・分割してお送りいただくか、担当者にご相談ください（1件あたり${limitMb}MBまで）。`);
            continue;
          }
          const { enqueueUpload, uploadAck, MENU_ITEMS } = await import("./upload-queue_B0YYP6NN.mjs");
          const q = await enqueueUpload(this.ctx, { owner: `line:${userId}`, connector: "line", role: acc.role, fileId: saved.id, name, mime: content.mime });
          const ack = uploadAck(q);
          if (ack.menu) await sendQuick(ack.text, MENU_ITEMS);
          else await send(ack.text);
        }
      } catch (e) {
        const msg = e.message ?? String(e);
        const limit = looksLikeLimit(msg);
        const paid = limit ? await getWorkersPaid(this.env).catch(() => false) : false;
        await logDiag(this.env, "error", limit ? "limit" : "ai", `line inbound: ${msg}`).catch(() => void 0);
        await send(limit && !paid ? "処理が混み合い完了できませんでした。\n" + PAID_HINT : limit ? "処理が混み合い完了できませんでした。時間をおいて再度お試しください。" : "処理中にエラーが発生しました。時間をおいて再度お試しください。");
      }
    }
  }
  async respond(ic, userId, text, image) {
    return (await ic.respond({ connector: "line", sender: userId, text, image, sessionId: userId })).text;
  }
  // アップロードの選択（ボタンのタップ）／自然文の指示を処理。処理したら true（＝通常のAI応答へ回さない）。共通ロジックを使用。
  async handleUploadText(userId, text, send) {
    const { resolveUploadText } = await import("./upload-queue_B0YYP6NN.mjs");
    const r = await resolveUploadText(this.ctx, `line:${userId}`, text);
    if (r.handled) await send(r.reply);
    return r.handled;
  }
  // P1-07：会話セッション（直近履歴）を破棄。inbound.ts の sessionKey と同じ規約 `chatsess:line:<userId>`。
  async resetSession(userId) {
    await this.env.LICENSE.delete(`chatsess:line:${userId}`).catch(() => void 0);
  }
  async fetchContent(messageId, limitBytes = 0) {
    const r = await this.gw.fetch("line", `https://api-data.line.me/v2/bot/message/${messageId}/content`, { headers: { authorization: `Bearer ${this.accessToken}` } });
    if (!r.ok) return null;
    const len = Number(r.headers.get("content-length") ?? 0);
    if (limitBytes && len > limitBytes) return "too_large";
    return { buf: await r.arrayBuffer(), mime: r.headers.get("content-type") ?? "application/octet-stream" };
  }
}
async function resolveInboundHandler(ctx, env2, gw, connector) {
  if (connector === "discord") {
    const appId = await getApiKey(env2, "discord_app_id");
    const publicKey = await getApiKey(env2, "discord_public_key");
    if (!appId || !publicKey) return null;
    return new DiscordInbound(gw, { appId, publicKey });
  }
  if (connector === "slack") {
    const signingSecret = await getApiKey(env2, "slack_signing_secret");
    const botToken = await getApiKey(env2, "slack_bot_token");
    if (!signingSecret || !botToken) return null;
    return new SlackInbound(gw, { signingSecret, botToken });
  }
  if (connector === "line") {
    const secret = await getApiKey(env2, "line_secret");
    const accessToken = await getApiKey(env2, "line_token");
    if (!secret || !accessToken) return null;
    return new LineInbound(gw, ctx, env2, { secret, accessToken });
  }
  return null;
}
const prerender = false;
const POST = async ({ request, params, locals }) => {
  const connector = params.connector ?? "";
  const gw = cfEgressGateway(env);
  const handler = await resolveInboundHandler(locals.ctx, env, gw, connector);
  if (!handler) return new Response("connector not configured", { status: 404 });
  const origin = new URL(request.url).origin;
  return handler.handleInbound(request, {
    baseUrl: origin,
    waitUntil: (p) => locals.cfContext.waitUntil(p),
    respond: (msg) => respondInbound(locals.ctx, env, origin, msg),
    link: (externalId, code, name) => joinViaInvite(env, connector, externalId, code, name)
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
