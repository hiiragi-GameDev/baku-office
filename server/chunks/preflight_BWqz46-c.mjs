globalThis.process ??= {};
globalThis.process.env ??= {};
import { ALLOWED_PERMISSIONS, PRIVILEGED_PERMISSIONS } from "./apps_qko8nJrR.mjs";
import { APP_SCHEMA, validateDefinition } from "./appdef_CBJw5awM.mjs";
import { getApiKey } from "./client_F4fksau0.mjs";
import { getStorageUsage } from "./storage-usage_CAVmHTS3.mjs";
import { getLimits, monthUsd, estimateUsd } from "./usage_CfukLLAj.mjs";
function isRunnableDefinition(definition) {
  if (!definition || typeof definition !== "object") return false;
  const d = definition;
  if (d.schema !== APP_SCHEMA) return false;
  if (typeof d.render?.html === "string" && d.render.html.trim().length > 0) return true;
  if (Array.isArray(d.screens) && d.screens.length > 0) {
    return d.screens.every((s) => s != null && Array.isArray(s.steps) && s.steps.length > 0 && s.output != null);
  }
  if (!Array.isArray(d.steps) || d.steps.length === 0) return false;
  return d.output != null;
}
const DESTRUCTIVE = /\b(drop\s+table|delete\s+from|truncate|alter\s+table|attach\s+database|pragma|update\s+\w+\s+set(?![^;]*\bwhere\b))/i;
async function preflight(ctx, d) {
  const env = ctx.env;
  const perms = d.permissions ?? [];
  const defStr = typeof d.definition === "string" ? d.definition : JSON.stringify(d.definition ?? "");
  const checks = [];
  const structured = d.definition && typeof d.definition === "object" && d.definition.schema === APP_SCHEMA ? validateDefinition(d.definition) : null;
  const isPermIssue = (i) => i.path === "permissions" || i.path.endsWith(".op");
  const defPermIssues = structured ? structured.issues.filter(isPermIssue) : [];
  const defSafetyIssues = structured ? structured.issues.filter((i) => !isPermIssue(i)) : [];
  const fmtIssues = (xs) => xs.slice(0, 4).map((i) => `${i.path || "定義"}: ${i.message}`).join(" / ");
  const needsAi = perms.includes("ai") || perms.includes("agent");
  const hasAi = needsAi ? !!await getApiKey(env, "gemini") || !!await getApiKey(env, "claude") || !!await getApiKey(env, "openai") || !!env.LOCAL_AI_BASE_URL : true;
  const storage = await getStorageUsage(env).catch(() => []);
  const near = storage.filter((s) => s.enabled && s.limit > 0 && s.used >= 0 && s.used / s.limit >= 0.9);
  if (needsAi && !hasAi) checks.push({ key: "env", label: "環境確認", status: "fail", detail: "AI能力が必要ですが Gemini/Claude/OpenAI/ローカルLLM のいずれも未設定です。" });
  else if (near.length) checks.push({ key: "env", label: "環境確認", status: "warn", detail: `容量が逼迫しています（90%超）：${near.map((s) => s.key.toUpperCase()).join(", ")}。` });
  else checks.push({ key: "env", label: "環境確認", status: "ok", detail: "この環境で実行可能・容量に余裕あり。" });
  const isAdmin = d.role === "admin";
  const unknown = perms.filter((p) => !ALLOWED_PERMISSIONS.has(p));
  const priv = perms.filter((p) => PRIVILEGED_PERMISSIONS.has(p));
  if (unknown.length || defPermIssues.length) checks.push({ key: "permission", label: "権限確認", status: "fail", detail: [unknown.length ? `未知/不許可の権限：${unknown.join(", ")}` : "", defPermIssues.length ? fmtIssues(defPermIssues) : ""].filter(Boolean).join(" / ") + "（破壊的・特権操作はアプリに付与されません）。" });
  else if (priv.length && !isAdmin) checks.push({ key: "permission", label: "権限確認", status: "warn", detail: `管理者承認が必要な権限を含みます：${priv.join(", ")}。` });
  else if (priv.length) checks.push({ key: "permission", label: "権限確認", status: "ok", detail: `管理者権限で実行中のため、影響の大きい権限（${priv.join(", ")}）も承認なしで付与できます。` });
  else checks.push({ key: "permission", label: "権限確認", status: "ok", detail: "クライアント権限内で実行可能。" });
  if (structured ? defSafetyIssues.length > 0 : DESTRUCTIVE.test(defStr)) checks.push({ key: "safety", label: "安全確認", status: "fail", detail: structured ? `定義に不備があります：${fmtIssues(defSafetyIssues)}` : "破壊的操作の痕跡（DROP/DELETE/TRUNCATE/ALTER/WHERE無しUPDATE 等）を検出しました。" });
  else if (perms.includes("net")) checks.push({ key: "safety", label: "安全確認", status: "warn", detail: "外部送信（net）を含みます。送信先 allowlist と内容を要確認。" });
  else checks.push({ key: "safety", label: "安全確認", status: "ok", detail: "DB/ストレージへの破壊的操作なし（スコープ済み ctx・owner 限定で動作）。" });
  const tokens = d.estTokens && d.estTokens > 0 ? d.estTokens : Math.min(2e4, Math.ceil(defStr.length / 3) + 2e3);
  const limits = await getLimits(env).catch(() => ({}));
  const month = await monthUsd(env).catch(() => ({}));
  const estJobUsd = Math.max(estimateUsd(env, "claude", tokens, tokens), estimateUsd(env, "gemini", tokens, tokens));
  const usdCap = limits.gemini?.monthlyUsdCap ?? limits.claude?.monthlyUsdCap;
  const usedUsd = (month.gemini ?? 0) + (month.claude ?? 0);
  const fmtUsd = (n) => "$" + n.toFixed(n < 1 ? 4 : 2);
  let costStatus = "ok";
  let costDetail = `推定消費 ~${tokens.toLocaleString()} tokens/実行（推定 ~${fmtUsd(estJobUsd)}）。`;
  if (usdCap && usdCap > 0) {
    const remain = usdCap - usedUsd;
    costDetail += ` 当月予算 残り ~${fmtUsd(Math.max(0, remain))}/${fmtUsd(usdCap)}。`;
    if (remain <= 0) {
      costStatus = "fail";
      costDetail += " 予算超過のため実行不可。";
    } else if (estJobUsd > remain) {
      costStatus = "warn";
      costDetail += " 1実行で予算を超える可能性。";
    }
  } else {
    costDetail += " 月次の費用上限は［高度なオプション → API使用量］で設定・確認できます。";
  }
  checks.push({ key: "cost", label: "コスト計算", status: costStatus, detail: costDetail });
  return { ok: checks.every((c) => c.status !== "fail"), checks };
}
export {
  isRunnableDefinition as i,
  preflight as p
};
