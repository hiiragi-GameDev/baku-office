globalThis.process ??= {};
globalThis.process.env ??= {};
function detectProfile(env) {
  const ai = env.LOCAL_AI_BASE_URL ? "local" : "cloud";
  const storage = env.MEDIA_R2 ? "r2" : "kv";
  const keyStore = env.MASTER_KEY ? "secret" : env.ENVIRONMENT === "production" ? "missing-prod" : "kv-autogen";
  const id = ai === "local" ? "C" : "A";
  const label = id === "C" ? "C: オフライン寄り（ローカルLLM）" : "A: フルクラウド";
  return { id, label, ai, storage, keyStore };
}
export {
  detectProfile
};
