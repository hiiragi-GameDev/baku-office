globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { getApiKey } from "./client_F4fksau0.mjs";
import { saveFile } from "./storage_BHLYBEBb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { recordUsage, recordTokens } from "./usage_CfukLLAj.mjs";
import { geminiModelId, claudeModelId } from "./config_2o5HV4Wj.mjs";
async function listSkills(env, onlyEnabled = false) {
  const sql = onlyEnabled ? "SELECT * FROM skills WHERE enabled=1 ORDER BY name" : "SELECT * FROM skills ORDER BY created_at DESC";
  return (await env.DB.prepare(sql).all()).results;
}
async function searchSkills(env, query, limit = 8) {
  const q = (query || "").trim();
  const sql = q ? "SELECT name,description,enabled,mode FROM skills WHERE name LIKE ? OR description LIKE ? OR skill_md LIKE ? ORDER BY enabled DESC, name LIMIT ?" : "SELECT name,description,enabled,mode FROM skills ORDER BY enabled DESC, name LIMIT ?";
  const stmt = q ? env.DB.prepare(sql).bind(`%${q}%`, `%${q}%`, `%${q}%`, limit) : env.DB.prepare(sql).bind(limit);
  const r = await stmt.all().catch(() => ({ results: [] }));
  return r.results;
}
async function createSkill(env, by, a) {
  const id = randomId();
  await env.DB.prepare("INSERT INTO skills (id,name,description,skill_md,mode,enabled,created_by,created_at) VALUES (?,?,?,?,?,0,?,?)").bind(id, a.name, a.description ?? null, a.skill_md, a.mode === "code" ? "code" : "instruction", by, nowSec()).run();
  return id;
}
async function setSkillEnabled(env, id, enabled) {
  await env.DB.prepare("UPDATE skills SET enabled=? WHERE id=?").bind(enabled ? 1 : 0, id).run();
}
async function deleteSkill(env, id) {
  await env.DB.prepare("DELETE FROM skills WHERE id=?").bind(id).run();
}
function parseSkillJSON(raw) {
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const o = JSON.parse(m[0]);
    if (!o.name || !o.skill_md) return null;
    return {
      name: String(o.name).slice(0, 60),
      description: o.description ? String(o.description).slice(0, 200) : void 0,
      skill_md: String(o.skill_md).slice(0, 2e4),
      mode: o.mode === "code" ? "code" : "instruction"
    };
  } catch {
    return null;
  }
}
async function geminiJSON(env, key, sys, prompt) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModelId(env))}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 1500 } })
  });
  if (!r.ok) return "";
  const d = await r.json();
  await recordTokens(env, "gemini", { inputTokens: d.usageMetadata?.promptTokenCount ?? 0, outputTokens: d.usageMetadata?.candidatesTokenCount ?? 0 }, { feature: "skill", model: geminiModelId(env) });
  return d.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}
async function claudeJSON(env, key, sys, prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: claudeModelId(env), max_tokens: 1500, system: sys, messages: [{ role: "user", content: prompt }] })
  });
  if (!r.ok) return "";
  const d = await r.json();
  await recordTokens(env, "claude", { inputTokens: d.usage?.input_tokens ?? 0, outputTokens: d.usage?.output_tokens ?? 0 }, { feature: "skill", model: claudeModelId(env) });
  return (d.content ?? []).map((c) => c.text ?? "").join("");
}
async function generateSkill(env, by, request) {
  const gkey = await getApiKey(env, "gemini");
  const ckey = await getApiKey(env, "claude");
  if (!gkey && !ckey) return { ok: false, error: "AIキーが未設定です（連携設定で Gemini か Claude を登録してください）。" };
  const sys = "あなたは業務自動化スキルの設計者。ユーザーの要望から再利用可能な業務スキルを1つ設計する。";
  const prompt = `次の要望に応えるスキルを設計し、JSONのみ出力（前置き・コードフェンス無し）。
要望:${request}
形式:{"name":"短い日本語の呼び出し名","description":"用途の1行説明","mode":"instruction または code","skill_md":"# スキル名\\n手順・テンプレート(Markdown)"}
表計算・ファイルの本格生成・計算処理が要るなら mode=code、文書テンプレ中心なら instruction。`;
  const raw = gkey ? await geminiJSON(env, gkey, sys, prompt) : await claudeJSON(env, ckey, sys, prompt);
  await recordUsage(env, gkey ? "gemini" : "claude");
  const draft = parseSkillJSON(raw);
  if (!draft) return { ok: false, error: "スキル生成に失敗しました（応答を解釈できません）。" };
  const id = await createSkill(env, by, draft);
  return { ok: true, id, name: draft.name };
}
async function runSkill(env, owner, baseUrl, name, input) {
  const key = await getApiKey(env, "claude");
  if (!key) return "スキル実行には Claude APIキーが必要です（連携設定で登録）。";
  const skill = await env.DB.prepare("SELECT * FROM skills WHERE name=? AND enabled=1").bind(name).first();
  if (!skill) return `有効なスキル「${name}」が見つかりません（高度なオプションで追加・有効化してください）。`;
  if (skill.mode === "code") {
    const r2 = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-beta": "code-execution-2025-05-22", "content-type": "application/json" },
      body: JSON.stringify({
        model: claudeModelId(env),
        max_tokens: 4e3,
        tools: [{ type: "code_execution_20250522", name: "code_execution" }],
        messages: [{ role: "user", content: `次のスキル手順に従って処理してください。

# SKILL
${skill.skill_md}

# 入力
${input}` }]
      })
    });
    if (!r2.ok) {
      console.log("[skill-code]", r2.status, (await r2.text()).slice(0, 150));
      return "スキル実行（コード）に失敗しました。アカウントで code execution が有効か確認してください。";
    }
    const data2 = await r2.json();
    await recordTokens(env, "claude", { inputTokens: data2.usage?.input_tokens ?? 0, outputTokens: data2.usage?.output_tokens ?? 0 }, { feature: "skill", model: claudeModelId(env) });
    const text = (data2.content ?? []).map((c) => c.text ?? "").join("").trim();
    return text || "（実行は完了しましたが、テキスト出力はありません。生成ファイルの取得は次段で対応）";
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: claudeModelId(env), max_tokens: 4e3, system: `あなたは次のスキル手順に従う作成アシスタント。本文(Markdown)のみ出力。

${skill.skill_md}`, messages: [{ role: "user", content: input }] })
  });
  if (!r.ok) return "スキル実行に失敗しました。";
  const data = await r.json();
  await recordTokens(env, "claude", { inputTokens: data.usage?.input_tokens ?? 0, outputTokens: data.usage?.output_tokens ?? 0 }, { feature: "skill", model: claudeModelId(env) });
  const out = (data.content ?? []).map((c) => c.text ?? "").join("");
  const file = new File([new TextEncoder().encode(out)], `${skill.name}.md`, { type: "text/markdown" });
  const saved = await saveFile(env, file, owner);
  return `スキル「${skill.name}」を実行しました。
ダウンロード：${baseUrl}/files/${saved.id}`;
}
export {
  createSkill,
  deleteSkill,
  generateSkill,
  listSkills,
  runSkill,
  searchSkills,
  setSkillEnabled
};
