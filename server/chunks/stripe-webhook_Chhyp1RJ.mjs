globalThis.process ??= {};
globalThis.process.env ??= {};
import { getApiKey } from "./client_F4fksau0.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { c as verifyStripeSig } from "./stripe_r-RFTlbb.mjs";
import { env } from "cloudflare:workers";
import { markSubmissionPaidBySession, getPublicPageAny, fireSubmitTriggers } from "./public-pages_DHQdIiIX.mjs";
const prerender = false;
const POST = async ({ request, locals }) => {
  const secret = await getApiKey(env, "stripe_webhook");
  if (!secret) return new Response("Stripe未設定（現金/手動運用）", { status: 400 });
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";
  if (!await verifyStripeSig(secret, payload, sig)) return new Response("署名不正", { status: 400 });
  let ev;
  try {
    ev = JSON.parse(payload);
  } catch {
    return new Response("不正なペイロード", { status: 400 });
  }
  const customer = ev.data?.object?.customer;
  const now = nowSec();
  const submissionId = ev.data?.object?.metadata?.submission_id;
  if (ev.type === "checkout.session.completed" && submissionId) {
    const r = await markSubmissionPaidBySession(env, submissionId);
    if (r.ok && r.slug) {
      const page2 = await getPublicPageAny(env, r.slug);
      const sub = await env.DB.prepare("SELECT data FROM public_submissions WHERE id=?").bind(submissionId).first();
      if (page2 && sub) {
        const data = (() => {
          try {
            return JSON.parse(sub.data);
          } catch {
            return {};
          }
        })();
        await fireSubmitTriggers(locals.ctx, page2, data).catch(() => void 0);
      }
    }
    return new Response("ok");
  }
  if (customer && ev.type === "checkout.session.completed") {
    await env.DB.prepare("UPDATE membership SET fee_status='paid', paid_at=?, status_changed_at=?, updated_at=? WHERE stripe_customer=?").bind(new Date(now * 1e3).toISOString(), now, now, customer).run();
  } else if (customer && ev.type === "customer.subscription.deleted") {
    await env.DB.prepare("UPDATE membership SET fee_status='withdrawn', status_changed_at=?, updated_at=? WHERE stripe_customer=?").bind(now, now, customer).run();
  }
  return new Response("ok");
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
