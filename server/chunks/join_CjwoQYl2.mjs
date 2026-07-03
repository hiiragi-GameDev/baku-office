globalThis.process ??= {};
globalThis.process.env ??= {};
import { createMember, JOIN_CONSENT_VERSION } from "./membership_DQ1fLu2V.mjs";
import { getPublishedSite } from "./sites_DMFBMYur.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { r as rateLimited } from "./rate-limit_B3Jlq_2x.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (await rateLimited(env, `join:${ip}`, 10, 3600)) return json({ error: "短時間に申込が集中しています。時間をおいて再度お試しください。" }, 429);
  const b = await request.json().catch(() => ({}));
  const name = (b.name ?? "").trim();
  const contact = (b.contact ?? "").trim();
  const slug = (b.slug ?? "").trim().slice(0, 60);
  if (!name) return json({ error: "お名前が必要です" }, 400);
  if (name.length > 100 || contact.length > 200) return json({ error: "入力が長すぎます" }, 400);
  if (!contact) return json({ error: "連絡先（メール / 電話）が必要です" }, 400);
  if (b.consent !== true) return json({ error: "個人情報の取扱いへの同意が必要です" }, 400);
  if (!slug) return json({ error: "申込元のページが特定できません" }, 400);
  const site = await getPublishedSite(env, slug);
  if (!site || site.show_join !== 1) return json({ error: "このページは現在お申し込みを受け付けていません" }, 400);
  const now = nowSec();
  const extra = JSON.stringify({ source: "public_form", slug, submitted_at: now });
  await createMember(env, { name, contact: contact.slice(0, 200), fee_status: "unpaid", extra, consent_version: JOIN_CONSENT_VERSION, consent_at: now });
  return json({ ok: true });
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
