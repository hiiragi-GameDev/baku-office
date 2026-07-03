globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId, e as encryptField, d as decryptField } from "./stripe_r-RFTlbb.mjs";
import { masterKey } from "./client_F4fksau0.mjs";
import { saveFile } from "./storage_BHLYBEBb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { recordUsage } from "./usage_CfukLLAj.mjs";
const CAPABILITY_LABEL = { image_gen: "画像生成", tts: "音声合成", video_gen: "動画生成", embed: "埋め込み(検索)", custom: "カスタムAPI" };
async function listCapabilities(env, onlyEnabled = false) {
  const sql = onlyEnabled ? "SELECT id,capability,provider,endpoint,model,enabled,created_at FROM capabilities WHERE enabled=1 ORDER BY capability" : "SELECT id,capability,provider,endpoint,model,enabled,created_at FROM capabilities ORDER BY created_at DESC";
  return (await env.DB.prepare(sql).all()).results;
}
async function createCapability(env, a) {
  const id = randomId();
  const enc = a.api_key ? await encryptField(await masterKey(env), a.api_key, "api-keys") : null;
  await env.DB.prepare("INSERT INTO capabilities (id,capability,provider,endpoint,model,api_key,enabled,created_at) VALUES (?,?,?,?,?,?,0,?)").bind(id, a.capability, a.provider ?? null, a.endpoint ?? null, a.model ?? null, enc, nowSec()).run();
  return id;
}
async function setCapabilityEnabled(env, id, enabled) {
  await env.DB.prepare("UPDATE capabilities SET enabled=? WHERE id=?").bind(enabled ? 1 : 0, id).run();
}
async function deleteCapability(env, id) {
  await env.DB.prepare("DELETE FROM capabilities WHERE id=?").bind(id).run();
}
async function capKey(env, id) {
  const row = await env.DB.prepare("SELECT api_key FROM capabilities WHERE id=?").bind(id).first();
  if (!row?.api_key) return null;
  try {
    return await decryptField(await masterKey(env), row.api_key, "api-keys");
  } catch {
    return null;
  }
}
async function capabilitySummary(env) {
  const caps = await listCapabilities(env, true);
  if (!caps.length) return "";
  return "利用可能な追加能力：" + caps.map((c) => `${CAPABILITY_LABEL[c.capability] ?? c.capability}(${c.provider ?? ""})`).join("、");
}
async function invokeCapability(env, owner, baseUrl, capability, input) {
  const cap = (await listCapabilities(env, true)).find((c) => c.capability === capability);
  if (!cap) return `${CAPABILITY_LABEL[capability]}は未設定です（高度なオプションで追加・有効化してください）。`;
  const key = await capKey(env, cap.id);
  if (!key) return `${CAPABILITY_LABEL[capability]}のAPIキーが未設定です。`;
  await recordUsage(env, capability);
  try {
    if (capability === "image_gen") {
      const url = cap.endpoint || "https://api.openai.com/v1/images/generations";
      const r = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ model: cap.model || "gpt-image-1", prompt: input, n: 1, size: "1024x1024" }) });
      if (!r.ok) return `画像生成APIエラー：${r.status}`;
      const d = await r.json();
      const item = d.data?.[0];
      let buf = null;
      if (item?.b64_json) buf = Uint8Array.from(atob(item.b64_json), (c) => c.charCodeAt(0)).buffer;
      else if (item?.url) buf = await (await fetch(item.url)).arrayBuffer();
      if (!buf) return "画像を取得できませんでした。";
      const saved = await saveFile(env, new File([buf], "image.png", { type: "image/png" }), owner);
      return `画像を生成しました：${baseUrl}/files/${saved.id}`;
    }
    if (capability === "tts") {
      const url = cap.endpoint || "https://api.openai.com/v1/audio/speech";
      const r = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ model: cap.model || "tts-1", voice: "alloy", input }) });
      if (!r.ok) return `音声合成APIエラー：${r.status}`;
      const saved = await saveFile(env, new File([await r.arrayBuffer()], "speech.mp3", { type: "audio/mpeg" }), owner);
      return `音声を生成しました：${baseUrl}/files/${saved.id}`;
    }
    {
      const url = cap.endpoint;
      if (!url) return "動画生成のエンドポイント（作成API）が未設定です（高度なオプション）。";
      const r = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ model: cap.model || void 0, prompt: input }) });
      if (!r.ok) return `動画生成APIエラー：${r.status}`;
      const d = await r.json();
      const jobId = d.id || d.task_id || "";
      const statusUrl = d.status_url || (jobId ? `${url.replace(/\/$/, "")}/${jobId}` : "");
      const eta = nowSec() + (d.eta_seconds || 60);
      await env.DB.prepare("INSERT INTO video_jobs (id,owner,cap_id,job_id,status_url,prompt,status,eta,created_at,updated_at) VALUES (?,?,?,?,?,?,'pending',?,?,?)").bind(randomId(), owner, cap.id, jobId, statusUrl, input, eta, nowSec(), nowSec()).run();
      return `🎬 動画生成を開始しました（目安 約${d.eta_seconds || 60}秒）。完成したらファイル一覧へ保存し、LINEにURLをお知らせします。「動画できた？」で確認もできます。`;
    }
  } catch (e) {
    return `${CAPABILITY_LABEL[capability]}の実行に失敗：${e.message}`;
  }
}
async function synthesizeSpeechBytes(env, text, voice = "alloy") {
  const cap = (await listCapabilities(env, true)).find((c) => c.capability === "tts");
  if (!cap) return null;
  const key = await capKey(env, cap.id);
  if (!key) return null;
  await recordUsage(env, "tts");
  const url = cap.endpoint || "https://api.openai.com/v1/audio/speech";
  const r = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ model: cap.model || "tts-1", voice, input: text.slice(0, 4e3), response_format: "mp3" }) });
  if (!r.ok) return null;
  return { buf: await r.arrayBuffer(), mime: r.headers.get("content-type") || "audio/mpeg" };
}
async function ttsConfigured(env) {
  const cap = (await listCapabilities(env, true)).find((c) => c.capability === "tts");
  return cap ? !!await capKey(env, cap.id) : false;
}
async function pollVideoJobs(env, accessToken, limit = 5) {
  const now = nowSec();
  const { results } = await env.DB.prepare("SELECT id,owner,cap_id,status_url,eta FROM video_jobs WHERE status='pending' AND eta<=? ORDER BY eta LIMIT ?").bind(now, limit).all();
  let done = 0, pending = 0;
  for (const job of results) {
    if (!job.status_url) {
      await env.DB.prepare("UPDATE video_jobs SET status='error',updated_at=? WHERE id=?").bind(now, job.id).run();
      continue;
    }
    const key = await capKey(env, job.cap_id);
    try {
      const r = await fetch(job.status_url, { headers: key ? { authorization: `Bearer ${key}` } : {} });
      if (!r.ok) {
        pending++;
        await env.DB.prepare("UPDATE video_jobs SET eta=?,updated_at=? WHERE id=?").bind(now + 30, now, job.id).run();
        continue;
      }
      const d = await r.json();
      const st = (d.status || d.state || "").toLowerCase();
      const outUrl = d.url || (typeof d.output === "string" ? d.output : d.output?.url);
      if ((st === "succeeded" || st === "completed" || st === "done") && outUrl) {
        const buf = await (await fetch(outUrl)).arrayBuffer();
        const saved = await saveFile(env, new File([buf], "video.mp4", { type: "video/mp4" }), job.owner);
        await env.DB.prepare("UPDATE video_jobs SET status='done',file_id=?,updated_at=? WHERE id=?").bind(saved.id, now, job.id).run();
        done++;
        if (accessToken && job.owner.startsWith("line:")) {
          await fetch("https://api.line.me/v2/bot/message/push", { method: "POST", headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" }, body: JSON.stringify({ to: job.owner.slice(5), messages: [{ type: "text", text: `🎬 動画が完成しました。ファイル一覧またはこちら：/files/${saved.id}` }] }) });
        }
      } else if (st === "failed" || st === "error") {
        await env.DB.prepare("UPDATE video_jobs SET status='error',updated_at=? WHERE id=?").bind(now, job.id).run();
      } else {
        pending++;
        await env.DB.prepare("UPDATE video_jobs SET eta=?,updated_at=? WHERE id=?").bind(now + 30, now, job.id).run();
      }
    } catch {
      pending++;
      await env.DB.prepare("UPDATE video_jobs SET eta=?,updated_at=? WHERE id=?").bind(now + 30, now, job.id).run();
    }
  }
  return { done, pending };
}
async function videoStatusText(env, owner, baseUrl) {
  const { results } = await env.DB.prepare("SELECT status,file_id FROM video_jobs WHERE owner=? ORDER BY created_at DESC LIMIT 5").bind(owner).all();
  if (!results.length) return "動画生成の依頼はありません。";
  return results.map((j) => j.status === "done" && j.file_id ? `✅ 完成：${baseUrl}/files/${j.file_id}` : j.status === "error" ? "❌ 失敗" : "⏳ 生成中…").join("\n");
}
export {
  CAPABILITY_LABEL,
  capabilitySummary,
  createCapability,
  deleteCapability,
  invokeCapability,
  listCapabilities,
  pollVideoJobs,
  setCapabilityEnabled,
  synthesizeSpeechBytes,
  ttsConfigured,
  videoStatusText
};
