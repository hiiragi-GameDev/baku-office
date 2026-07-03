globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { getFile } from "./storage_BHLYBEBb.mjs";
import { n as notifyOwnerDirect } from "./ctx_D9xObGWH.mjs";
const WAIT_SEC = 30;
const MODE_TTL = 3600;
const MAX_AGE = 3 * 24 * 3600;
const MENU_ITEMS = ["読み込み", "保管する", "何もしない"];
function matchMenuChoice(text) {
  const t = (text || "").trim();
  if (/^読み込/.test(t) || /^読んで/.test(t)) return "read";
  if (/^保管|^保存/.test(t)) return "store";
  if (/^何もしない|^破棄|^削除/.test(t)) return "skip";
  return null;
}
function uploadAck(r) {
  if (r.mode) {
    const ja = r.mode === "read" ? `読み込み${r.context ? `（${r.context}）` : ""}` : r.mode === "store" ? "保管" : "破棄";
    return { text: `📎 ${r.idx}枚目を受け取りました（${ja}を予約済み）。続けて送れます。受信が落ち着いたらまとめて処理し、結果をまとめてお送りします。`, menu: false };
  }
  if (r.idx === 1) return { text: "📎 ファイルを受け取りました。どうしますか？　続けて送れます（あとでまとめて処理します）。", menu: true };
  return { text: `📎 ${r.idx}枚目を受け取りました（最初の選択をお待ちしています）。`, menu: false };
}
const COLS = "id,owner,connector,role,file_id,name,mime,idx,mode,context,status,deadline,attempts";
const b64 = (buf) => {
  const a = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < a.length; i += 32768) s += String.fromCharCode(...a.subarray(i, i + 32768));
  return btoa(s);
};
const modeKey = (owner) => `upload_mode:${owner}`;
async function getOwnerMode(env, owner) {
  try {
    const raw = await env.LICENSE.get(modeKey(owner));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
async function setOwnerMode(env, owner, mode, context) {
  const { kvPut } = await import("./kv_JIFmI05h.mjs");
  await kvPut(env, modeKey(owner), JSON.stringify({ mode, context: context ?? "" }), { expirationTtl: MODE_TTL });
}
async function clearOwnerMode(env, owner) {
  await env.LICENSE.delete(modeKey(owner)).catch(() => {
  });
}
async function enqueueUpload(ctx, a) {
  const now = nowSec();
  const existing = await ctx.db.all(
    "SELECT idx,mode,context FROM upload_queue WHERE owner=? AND status='queued' ORDER BY idx",
    [a.owner]
  );
  const idx = (existing.length ? Math.max(...existing.map((r) => r.idx)) : 0) + 1;
  const batchMode = existing.find((r) => r.mode)?.mode;
  const batchCtx = existing.find((r) => r.context)?.context ?? null;
  const kv = batchMode ? null : await getOwnerMode(ctx.env, a.owner);
  const mode = batchMode ?? kv?.mode ?? null;
  const context = batchCtx ?? kv?.context ?? null;
  const deadline = now + WAIT_SEC;
  await ctx.db.run(
    `INSERT INTO upload_queue (id,owner,connector,role,file_id,name,mime,idx,mode,context,status,deadline,attempts,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'queued', ?,0,?,?)`,
    [randomId(), a.owner, a.connector, a.role, a.fileId, a.name, a.mime, idx, mode, context, deadline, now, now]
  );
  await ctx.db.run("UPDATE upload_queue SET deadline=?, updated_at=? WHERE owner=? AND status='queued'", [deadline, now, a.owner]);
  return { idx, mode, context };
}
async function applyBatchMode(ctx, owner, mode, context) {
  const r = await ctx.db.run(
    "UPDATE upload_queue SET mode=?, context=COALESCE(?,context), updated_at=? WHERE owner=? AND status='queued'",
    [mode, context ?? null, nowSec(), owner]
  );
  return r.rowsWritten ?? 0;
}
async function pendingCount(ctx, owner) {
  try {
    const r = await ctx.db.first("SELECT COUNT(*) AS n FROM upload_queue WHERE owner=? AND status='queued'", [owner]);
    return r?.n ?? 0;
  } catch {
    return 0;
  }
}
async function interpretInstruction(env, text) {
  const t = (text || "").trim();
  if (!t || t.length > 200) return { action: "none", persist: false, context: "" };
  if (!/画像|写真|ファイル|資料|領収|レシート|請求|読み|読ん|保管|保存|破棄|要らない|いらない|何もしない|普通|これから|今から|全部|まとめて|スキャン|取り込/.test(t)) {
    return { action: "none", persist: false, context: "" };
  }
  const { inferApp } = await import("./ctx_D9xObGWH.mjs").then((n) => n.M);
  const sys = 'あなたはメッセンジャーでのファイル処理アシスタント。利用者の発話が、アップロードする/したファイルへの指示かを判定し、JSONのみで返す。出力: {"action":"read|store|skip|clear|none","persist":bool,"context":string}。read=読み込んで処理（要約/記録など）、store=保管だけ、skip=破棄、clear=以前の自動指示を解除して通常に戻す、none=ファイルへの指示ではない。「これから送る/今後の…は全部○○」のように今後のファイルにも適用する指示は persist=true。context は『領収書』『名刺』等の種別や補足（無ければ空）。JSON以外は出力しない。';
  let out = "";
  try {
    out = await inferApp(env, t, { system: sys, maxTokens: 200, feature: "doc_import" });
  } catch {
    return { action: "none", persist: false, context: "" };
  }
  try {
    const { parseJsonObject } = await import("./ctx_D9xObGWH.mjs").then((n) => n.R);
    const o = parseJsonObject(out);
    const action = ["read", "store", "skip", "clear", "none"].includes(String(o?.action)) ? o.action : "none";
    return { action, persist: !!o?.persist, context: typeof o?.context === "string" ? o.context.slice(0, 80) : "" };
  } catch {
    return { action: "none", persist: false, context: "" };
  }
}
async function resolveUploadText(ctx, owner, text) {
  return _resolveUploadText(ctx, owner, text).catch(() => ({ handled: false, reply: "" }));
}
async function _resolveUploadText(ctx, owner, text) {
  const pending = await pendingCount(ctx, owner);
  const choice = matchMenuChoice(text);
  if (choice && pending > 0) {
    await applyBatchMode(ctx, owner, choice);
    const reply = choice === "read" ? `✅ ${pending}件を読み込みます。受信が落ち着いたら結果をまとめてお送りします（少しお待ちください）。` : choice === "store" ? `🗂 ${pending}件を『資料』に保管します。` : `🗑 ${pending}件を破棄します。`;
    return { handled: true, reply };
  }
  const r = await interpretInstruction(ctx.env, text);
  if (r.action === "none") return { handled: false, reply: "" };
  if (r.action === "clear") {
    await clearOwnerMode(ctx.env, owner);
    return { handled: true, reply: "了解しました。以後はファイルごとに確認します。" };
  }
  const mode = r.action;
  if (r.persist || pending === 0) await setOwnerMode(ctx.env, owner, mode, r.context);
  if (pending > 0) await applyBatchMode(ctx, owner, mode, r.context);
  const ja = mode === "read" ? `読み込み${r.context ? `（${r.context}）` : ""}` : mode === "store" ? "保管" : "破棄";
  const scope = pending > 0 ? `保留中の${pending}件＋以後` : r.persist ? "以後の" : "次からの";
  return { handled: true, reply: `✅ ${scope}ファイルを「${ja}」で処理します。${mode === "read" ? "結果は受信が落ち着いてからまとめてお送りします。" : ""}「もう普通でいい」で解除できます。` };
}
async function readyOwners(ctx, limit = 5) {
  const now = nowSec();
  const rows = await ctx.db.all(
    "SELECT owner FROM upload_queue WHERE status='queued' AND mode IS NOT NULL GROUP BY owner HAVING MAX(deadline) < ? LIMIT ?",
    [now, limit]
  );
  return rows.map((r) => r.owner);
}
async function processOwnerBatch(ctx, owner, baseUrl) {
  const now = nowSec();
  const claim = await ctx.db.run("UPDATE upload_queue SET status='processing', attempts=attempts+1, updated_at=? WHERE owner=? AND status='queued' AND mode IS NOT NULL", [now, owner]);
  if (!claim.rowsWritten) return { processed: 0 };
  const rows = await ctx.db.all(`SELECT ${COLS} FROM upload_queue WHERE owner=? AND status='processing' ORDER BY idx`, [owner]);
  if (!rows.length) return { processed: 0 };
  const mode = rows.find((r) => r.mode)?.mode ?? "store";
  const context = rows.find((r) => r.context)?.context ?? "";
  const total = rows.length;
  const label = (r) => `${r.idx}枚目${r.name ? `（${r.name}）` : ""}`;
  let header = "";
  const parts = [];
  if (mode === "skip") {
    const { softDeleteFile } = await import("./storage_BHLYBEBb.mjs");
    for (const r of rows) await softDeleteFile(ctx.env, r.file_id).catch(() => {
    });
    header = `🗑 ${total}件のファイルを破棄しました。`;
  } else if (mode === "store") {
    header = `🗂 ${total}件のファイルを『資料』に保管しました（一覧：${baseUrl}/files）。`;
  } else {
    header = `📄 読み込み結果（${total}件${context ? `・${context}` : ""}）`;
    for (const r of rows) {
      const out = await readOne(ctx, r, context, baseUrl).catch((e) => `読み取りに失敗しました（${e.message}）。`);
      parts.push(`【${label(r)}】
${out}`);
    }
  }
  for (const r of rows) await ctx.db.run("UPDATE upload_queue SET status=?, updated_at=? WHERE id=?", [mode === "skip" ? "skipped" : "done", now, r.id]);
  const text = [header, ...parts].join("\n\n").slice(0, 4800);
  await notifyOwnerDirect(ctx, owner, text).catch(() => 0);
  return { processed: total };
}
async function readOne(ctx, r, context, baseUrl) {
  const f = await getFile(ctx.env, r.file_id);
  if (!f) return "ファイルを取得できませんでした。";
  const mime = (r.mime || f.mime || "").toLowerCase();
  if (mime.startsWith("audio/")) {
    const { transcribeAudio } = await import("./ctx_D9xObGWH.mjs").then((n) => n.M);
    return await transcribeAudio(ctx.env, f.buf, f.mime).catch(() => null) || "音声を認識できませんでした（Gemini 未設定の可能性）。";
  }
  if (mime.startsWith("image/")) {
    const prompt = context ? `この画像は「${context}」です。内容を読み取り、必要なら適切なツール（領収書/請求書なら記録）で処理し、結果を簡潔に報告してください。` : "この画像の内容を読み取り、要点を簡潔に教えてください。領収書・請求書であれば記録してください。";
    const ans = await ctx.agent.run({ owner: r.owner, text: prompt, image: { mimeType: f.mime, dataB64: b64(f.buf) }, role: r.role || "member", baseUrl, sessionId: r.owner }).catch((e) => `読み取りに失敗しました（${e.message}）。`);
    return (ans || "").replace(/<!--\s*bo-[\s\S]*?-->/g, "").trim() || "（結果が空でした）";
  }
  const { inferApp } = await import("./ctx_D9xObGWH.mjs").then((n) => n.M);
  const sys = context ? `この資料は「${context}」です。要点・数値・結論を漏れなく日本語で。` : "この資料の要点・数値・結論を漏れなく日本語で要約してください。";
  return await inferApp(ctx.env, "添付の資料を読み取って要約してください。", { system: sys, attachments: [{ mime: f.mime, buf: f.buf, name: f.name }], maxTokens: 2e3, feature: "doc_import" }).catch(() => "") || "資料を読み取れませんでした（対応AIキーが必要な場合があります）。";
}
async function processReadyUploads(ctx, baseUrl, limit = 5) {
  let n = 0;
  for (const owner of await readyOwners(ctx, limit)) {
    const r = await processOwnerBatch(ctx, owner, baseUrl).catch(() => ({ processed: 0 }));
    n += r.processed;
  }
  const old = await ctx.db.all("SELECT id,file_id FROM upload_queue WHERE status='queued' AND mode IS NULL AND created_at < ?", [nowSec() - MAX_AGE]);
  if (old.length) {
    const { softDeleteFile } = await import("./storage_BHLYBEBb.mjs");
    for (const o of old) {
      await softDeleteFile(ctx.env, o.file_id).catch(() => {
      });
      await ctx.db.run("UPDATE upload_queue SET status='skipped', updated_at=? WHERE id=?", [nowSec(), o.id]);
    }
  }
  return n;
}
export {
  MENU_ITEMS,
  WAIT_SEC,
  applyBatchMode,
  clearOwnerMode,
  enqueueUpload,
  getOwnerMode,
  interpretInstruction,
  matchMenuChoice,
  pendingCount,
  processOwnerBatch,
  processReadyUploads,
  readyOwners,
  resolveUploadText,
  setOwnerMode,
  uploadAck
};
