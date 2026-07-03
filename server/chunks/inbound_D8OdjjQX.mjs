globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { v as verifyEnvelope, i as importVerifyKey, p as payloadOf } from "./stripe_r-RFTlbb.mjs";
import { getVerifyJwk, nowSec } from "./client_F4fksau0.mjs";
import { resolveAction, runResolvedAction } from "./a2a-actions_EJRkCxpU.mjs";
import { isBlocked, addInquiry } from "./reception_cJlTAjNe.mjs";
import { getReceptionPolicy } from "./settings_dTyIbTCR.mjs";
import { a as reviewIncomingPartner } from "./ctx_D9xObGWH.mjs";
import { logDiag } from "./diag_CY3PJnOM.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ctx = locals.ctx;
  const envlp = await request.json().catch(() => null);
  if (!envlp || typeof envlp.body !== "string" || typeof envlp.sig !== "string") return json({ ok: false, error: "形式不正" }, 400);
  const jwk = await getVerifyJwk(env);
  if (!jwk) return json({ ok: false, error: "検証鍵が未設定" }, 503);
  if (!await verifyEnvelope(await importVerifyKey(jwk), envlp)) return json({ ok: false, error: "署名検証に失敗" }, 401);
  const p = payloadOf(envlp);
  if (!p || typeof p.exp !== "number" || p.exp < nowSec()) return json({ ok: false, error: "期限切れ" }, 401);
  const nonce = typeof p.nonce === "string" ? p.nonce : "";
  if (!nonce) return json({ ok: false, error: "nonce が必要" }, 401);
  const nk = "a2anonce:" + nonce;
  if (await env.LICENSE.get(nk)) return json({ ok: false, error: "リプレイ検出（使用済み nonce）" }, 409);
  await kvPut(env, nk, "1", { expirationTtl: 120 });
  const name = String(p.action ?? "");
  if (!name) return json({ ok: false, error: "action が必要" }, 400);
  const groupId = p.groupId ? String(p.groupId) : "";
  const publicPath = p.public === true;
  if (publicPath && p.from && await isBlocked(ctx, p.from)) {
    await logDiag(env, "warn", "other", `A2A ブロック済みからの公開接触を拒否（from ${p.from}）`);
    return json({ ok: false, error: "受信を拒否しています" }, 403);
  }
  if (publicPath && p.fromCertified !== true) {
    const pol = await getReceptionPolicy(env);
    if (pol.requireCertified) {
      await logDiag(env, "info", "other", `A2A 公認のみ設定により非公認の公開接触を拒否（from ${p.from ?? "?"}）`);
      return json({ ok: false, error: "公認団体のみ受け付けています" }, 403);
    }
  }
  if (publicPath && name === "__inquiry__") {
    await addInquiry(ctx, { fromLicense: String(p.from ?? ""), fromName: p.fromName, action: "inquiry", args: p.args, message: String(p.args?.message ?? ""), trust: { hostTrust: p.fromTrust ?? 0, verified: p.fromVerified === true, certified: p.fromCertified === true } });
    return json({ ok: true, queued: true, message: "受付しました。担当の承認をお待ちください。" });
  }
  const row = await resolveAction(ctx, name, { groupId: groupId || void 0, from: p.from, allowPublic: publicPath });
  if (!row) {
    await logDiag(env, "warn", "other", `A2A 未公開/対象外アクション拒否: ${name}（from ${p.from ?? "?"}${groupId ? ` / group ${groupId}` : ""}）`);
    return json({ ok: false, error: "このアクションは公開されていません" }, 403);
  }
  if (publicPath && row.scope === "public") {
    const policy = await getReceptionPolicy(env);
    const fromTrust = typeof p.fromTrust === "number" ? p.fromTrust : 0;
    let allowAuto = policy.mode === "auto" ? true : policy.mode === "hybrid" ? fromTrust >= policy.minHostTrust : false;
    if (allowAuto && policy.requireVerified && p.fromVerified !== true) allowAuto = false;
    if (allowAuto && policy.requireAiReview) {
      const rev = await reviewIncomingPartner(env, String(p.fromName ?? p.from ?? "")).catch(() => ({ ok: true, reason: "" }));
      if (!rev.ok) allowAuto = false;
    }
    if (!allowAuto) {
      await addInquiry(ctx, { fromLicense: String(p.from ?? ""), fromName: p.fromName, action: name, args: p.args, message: "", trust: { hostTrust: fromTrust, verified: p.fromVerified === true, certified: p.fromCertified === true } });
      return json({ ok: true, queued: true, message: "受付しました。担当の承認をお待ちください。" });
    }
  }
  try {
    const result = await runResolvedAction(ctx, row, p.args ?? {});
    await logDiag(env, "info", "other", `A2A 実行: ${name}（from ${p.from ?? "?"}${groupId ? ` / group ${groupId}` : ""}）`);
    return json({ ok: true, result });
  } catch (e) {
    return json({ ok: false, error: e.message ?? "実行に失敗" }, 400);
  }
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
