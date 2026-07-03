globalThis.process ??= {};
globalThis.process.env ??= {};
import { getApiKey } from "./client_F4fksau0.mjs";
async function stripeConfigured(env) {
  return !!await getApiKey(env, "stripe_secret");
}
function buildCheckoutForm(p) {
  const f = new URLSearchParams();
  f.set("mode", "payment");
  f.set("success_url", p.successUrl);
  f.set("cancel_url", p.cancelUrl);
  f.set("line_items[0][quantity]", "1");
  f.set("line_items[0][price_data][currency]", p.currency);
  f.set("line_items[0][price_data][product_data][name]", p.productName.slice(0, 250) || "お支払い");
  f.set("line_items[0][price_data][unit_amount]", String(Math.max(0, Math.round(p.amount))));
  for (const [k, v] of Object.entries(p.metadata)) f.set(`metadata[${k}]`, v);
  return f;
}
async function createCheckoutSession(env, p) {
  const key = await getApiKey(env, "stripe_secret");
  if (!key) return { ok: false, error: "決済には組織の Stripe 連携（シークレットキー）が必要です。設定→連携で登録してください。" };
  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded" },
      body: buildCheckoutForm(p).toString()
    });
    const d = await r.json();
    if (!r.ok || !d.url) return { ok: false, error: d.error?.message ? `決済セッションの作成に失敗しました：${d.error.message}` : "決済セッションの作成に失敗しました。" };
    return { ok: true, url: d.url, id: d.id };
  } catch (e) {
    return { ok: false, error: "決済サービスへの接続に失敗しました：" + (e.message ?? String(e)) };
  }
}
export {
  buildCheckoutForm,
  createCheckoutSession,
  stripeConfigured
};
