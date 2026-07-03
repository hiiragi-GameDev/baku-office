globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";
import { rateLimited, getPublicPage, honeypotTripped, validateSubmission, wouldWaitlist, createSubmission, fireSubmitTriggers, setSubmissionPayment, moderate } from "./public-pages_DHQdIiIX.mjs";
import { createCheckoutSession } from "./payments_BuytDk0e.mjs";
import { maxUploadMb, saveFile } from "./storage_BHLYBEBb.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const MAX_FILES = 5;
const ALLOWED_EXT = /\.(pdf|png|jpe?g|gif|webp|heic|heif|csv|txt|docx?|xlsx?|pptx?)$/i;
const POST = async ({ request, params, locals }) => {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (await rateLimited(env, ip)) return json({ error: "短時間に送信が集中しています。時間をおいて再度お試しください。" }, 429);
  const slug = String(params.slug ?? "");
  const page2 = await getPublicPage(env, slug);
  if (!page2) return json({ error: "ページが見つかりません" }, 404);
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "送信形式が不正です" }, 400);
  }
  let values = {};
  try {
    const v2 = JSON.parse(String(form.get("values") ?? "{}"));
    if (v2 && typeof v2 === "object") values = v2;
  } catch {
    values = {};
  }
  if (honeypotTripped(values)) return json({ ok: true, message: "送信しました。ありがとうございました。" });
  const v = validateSubmission(page2.fields, values);
  if (!v.ok) {
    await (await import("./diag_CY3PJnOM.mjs")).logDiag(env, "warn", "public", `公開フォーム送信NG slug=${slug}: ${v.error}`, `送信キー=[${Object.keys(values).join(",")}] / 必須項目=[${page2.fields.filter((f) => f.required).map((f) => f.name).join(",")}]`).catch(() => {
    });
    return json({ error: v.error }, 400);
  }
  const refs = [];
  if (page2.allow_files) {
    const files = form.getAll("file").filter((f) => f instanceof File && f.size > 0).slice(0, MAX_FILES);
    const limit = await maxUploadMb(env) * 1024 * 1024;
    for (const f of files) {
      if (f.size > limit) return json({ error: `ファイルが大きすぎます（上限 ${Math.round(limit / 1024 / 1024)}MB）。` }, 400);
      if (!ALLOWED_EXT.test(f.name)) return json({ error: "対応していないファイル形式です。" }, 400);
      const saved = await saveFile(env, f, `public:${slug}`);
      refs.push({ id: saved.id, name: f.name || "file", mime: f.type || "application/octet-stream", size: f.size });
    }
  }
  const waitlist = await wouldWaitlist(env, page2).catch(() => false);
  const sub = await createSubmission(env, page2, v.clean, refs, ip, waitlist ? "waitlist" : "pending");
  if (waitlist) {
    await fireSubmitTriggers(locals.ctx, page2, v.clean).catch(() => void 0);
    return json({ ok: true, waitlist: true, message: "満員のため、キャンセル待ちで受け付けました。空きが出ましたら主催者よりご連絡します。" });
  }
  if (page2.price > 0) {
    await setSubmissionPayment(env, sub.id, "unpaid", page2.price);
    const origin = new URL(request.url).origin;
    const cs = await createCheckoutSession(env, {
      amount: page2.price,
      currency: page2.currency,
      productName: page2.pay_label || page2.title,
      successUrl: `${origin}/p/${slug}?paid=1`,
      cancelUrl: `${origin}/p/${slug}`,
      metadata: { submission_id: sub.id, slug }
    });
    if (!cs.ok) return json({ error: cs.error }, 400);
    await setSubmissionPayment(env, sub.id, "unpaid", page2.price, cs.id);
    return json({ ok: true, checkoutUrl: cs.url, message: "決済ページへ移動します…" });
  }
  if (page2.auto_approve) await moderate(env, sub.id, "approve", "auto").catch(() => void 0);
  await fireSubmitTriggers(locals.ctx, page2, v.clean).catch(() => void 0);
  return json({ ok: true, message: "送信を受け付けました。ありがとうございました。" });
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
