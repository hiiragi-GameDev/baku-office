globalThis.process ??= {};
globalThis.process.env ??= {};
const MODEL_REFUSED = "AI がこの内容への応答を見送りました（安全ポリシー）。表現を変えてお試しください。作成できない場合はエンタープライズプランをご検討ください。";
function classifyModelError(err) {
  const msg = (err.message ?? "").toLowerCase();
  const status = err.status;
  if (status === 402 || /insufficient[_ ]?quota|credit|billing|balance is too low|out of credit|payment required|purchase|クレジット|残高|請求|支払|利用枠が不足/.test(msg)) return "credit";
  if (status === 429 || status === 413 || /rate[_ ]?limit|too many requests|overloaded|resource has been exhausted|resource_exhausted|request too large|too large|context length|maximum context|tokens per minute|混雑/.test(msg)) return "rate";
  if (status === 401 || status === 403 || /invalid[_ ]?api[_ ]?key|authentication|unauthorized|api key not valid|permission denied/.test(msg)) return "auth";
  return "other";
}
function explainModelError(err) {
  const kind = classifyModelError(err);
  if (kind === "credit") {
    return "⚠️ AIのAPIクレジット（利用枠）が不足しています。\n・なぜ：利用中のAI（Claude / Gemini / ChatGPT）のAPI残高・利用枠が足りず、応答を生成できませんでした。\n・どうする：管理者が各AIプロバイダの請求・残高（クレジット）を確認して補充するか、別のAIモデルに切り替えてください（設定 → 連携 /settings/messaging）。";
  }
  if (kind === "rate") {
    return "⚠️ AIへのアクセスが混み合っています（レート制限）。\n・なぜ：短時間に要求が集中したか、AIプロバイダ側が一時的に混雑しています。\n・どうする：少し時間をおいて再送してください。続く場合は別のAIモデルに切り替えてください（設定 → 連携 /settings/messaging）。";
  }
  if (kind === "auth") {
    return "⚠️ AIのAPIキーが無効または未設定です。\n・なぜ：APIキーの認証に失敗しました（無効・期限切れ・権限不足など）。\n・どうする：管理者が設定 → 連携 /settings/messaging でAPIキーを再設定してください。";
  }
  return `⚠️ AI（応答・生成）側の問題で中断しました。
・なぜ：AIサービスへの通信または応答生成に失敗しました（${err.status ?? "通信エラー"}）。
・どうする：少し待って再送するか、別のAIモデル（設定 → 連携 /settings/messaging で Gemini / Claude / ChatGPT を切替）でお試しください。`;
}
async function runToolLoop(model, system, first, tools, exec, maxHops = 4, priorHistory = [], onUsage, abort, onEvent) {
  const history = [...priorHistory, { role: "user", text: first.text, image: first.image }];
  for (let h = 0; h < maxHops; h++) {
    const stop = abort?.();
    if (stop) return stop;
    onEvent?.({ type: "thinking" });
    const res = await model.turn(system, history, tools);
    if (res.usage && onUsage) onUsage(res.usage);
    if (!res.toolCalls?.length) {
      if (res.refusal && !res.text?.trim()) return MODEL_REFUSED;
      if (res.error && !res.text) return explainModelError(res.error);
      return (res.text ?? "").trim() || "（応答が空でした）";
    }
    for (const c of res.toolCalls) onEvent?.({ type: "tool", name: c.name });
    history.push({ role: "assistant", text: res.text, toolCalls: res.toolCalls });
    const calls = res.toolCalls;
    const results = calls.length > 1 ? await Promise.all(calls.map(async (c) => ({ id: c.id, name: c.name, content: await exec(c.name, c.args) }))) : [{ id: calls[0].id, name: calls[0].name, content: await exec(calls[0].name, calls[0].args) }];
    history.push({ role: "tool", results });
  }
  return HOPS_EXCEEDED;
}
const HOPS_EXCEEDED = "処理が長くなりました。もう一度お試しください。";
export {
  HOPS_EXCEEDED,
  MODEL_REFUSED,
  classifyModelError,
  explainModelError,
  runToolLoop
};
