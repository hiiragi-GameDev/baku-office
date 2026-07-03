globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
import { i as inferApp } from "./ctx_D9xObGWH.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  const b = await request.json().catch(() => ({}));
  const appId = String(b.appId ?? "");
  const question = String(b.question ?? "").trim().slice(0, 500);
  if (!appId || !question) return json({ error: "appId と question が必要です" }, 400);
  const isAdminOrg = ses.role === "admin";
  const where = isAdminOrg ? "app_id=?" : "app_id=? AND owner=?";
  const params = isAdminOrg ? [appId] : [appId, ses.uid];
  const { results } = await env.DB.prepare(
    `SELECT data, created_at FROM app_records WHERE ${where} ORDER BY created_at DESC LIMIT 300`
  ).bind(...params).all();
  if (!results || results.length === 0) return json({ ok: true, answer: "このアプリにはまだデータがありません。" });
  const lines = results.map((r) => `- ${(r.data ?? "").slice(0, 400)}（${new Date(r.created_at * 1e3).toISOString().slice(0, 10)}）`).join("\n").slice(0, 24e3);
  const prompt = `次は業務アプリに蓄積されたデータ（1行=1レコード・JSON/テキスト）です。これだけを根拠に、日本語で簡潔に質問へ答えてください。集計が必要なら数えて答え、データに無いことは「データからは分かりません」と答えること。

【データ（${results.length}件）】
${lines}

【質問】${question}`;
  const answer = await inferApp(env, prompt, { maxTokens: 1200, feature: "app_infer" });
  return json({ ok: true, answer: answer || "回答を生成できませんでした。", count: results.length });
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
