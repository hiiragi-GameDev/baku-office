globalThis.process ??= {};
globalThis.process.env ??= {};
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { getSession } from "./auth_DL5yvmzT.mjs";
import { cachedEntitlement } from "./client_F4fksau0.mjs";
import { kvPut } from "./kv_JIFmI05h.mjs";
import { m as myDirectory, o as orgDisplayName, g as getPublicProfile, h as setPublicProfile, j as generateOrgProfile, v as verifyOrgExistence, k as publishDirectory, u as unpublishDirectory, l as searchDirectory, q as reportDirectory } from "./ctx_D9xObGWH.mjs";
import { listActions, createAction, deleteAction } from "./a2a-actions_EJRkCxpU.mjs";
import { getReceptionPolicy, setReceptionPolicy } from "./settings_dTyIbTCR.mjs";
import { listInquiries, getInquiry, addBlock, decideInquiry } from "./reception_cJlTAjNe.mjs";
import { sendInquiry, callPublic, establishPublicConnection } from "./a2a_CFW4H8ZE.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ctx = locals.ctx;
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  if (!atLeast(await cachedEntitlement(env), "plus")) return json({ error: "公開・探索は Plus 以上で利用できます" }, 402);
  const b = await request.json().catch(() => ({}));
  const a = String(b._action ?? "");
  if (a === "profile_get") return json({ ok: true, profile: await getPublicProfile(ctx), orgName: await orgDisplayName(ctx), policy: await getReceptionPolicy(env), actions: await listActions(ctx), verification: JSON.parse(await env.LICENSE.get("directory_verification") || "null"), mine: await myDirectory(env) });
  if (a === "profile_save") return json({ ok: true, profile: await setPublicProfile(ctx, { summary: b.summary, tags: b.tags, contact: b.contact, website: b.website }) });
  if (a === "profile_generate") {
    const draft = await generateOrgProfile(env, { orgName: await orgDisplayName(ctx), hints: String(b.hints ?? "") });
    return draft ? json({ ok: true, draft }) : json({ ok: true, draft: null });
  }
  if (a === "verify") {
    const p = await getPublicProfile(ctx);
    const v = await verifyOrgExistence(env, { orgName: await orgDisplayName(ctx), website: p.website });
    await kvPut(env, "directory_verification", JSON.stringify(v));
    return json({ ok: true, verification: v });
  }
  if (a === "publish") {
    const v = JSON.parse(await env.LICENSE.get("directory_verification") || "null");
    return json(await publishDirectory(env, ctx, { listed: true, verification: v ?? void 0 }));
  }
  if (a === "unpublish") return json(await unpublishDirectory(env));
  if (a === "search") return json(await searchDirectory(env, String(b.query ?? ""), Array.isArray(b.tags) ? b.tags : void 0, b.certifiedOnly === true));
  if (a === "report") return json(await reportDirectory(env, String(b.target ?? ""), String(b.reason ?? "spam"), b.detail ? String(b.detail) : void 0));
  if (a === "send_inquiry") return json(await sendInquiry(env, String(b.to ?? ""), String(b.message ?? "")));
  if (a === "call_public") return json(await callPublic(env, String(b.to ?? ""), String(b.action ?? ""), b.args ?? {}));
  if (a === "reception_get") return json({ ok: true, policy: await getReceptionPolicy(env) });
  if (a === "reception_set") return json({ ok: true, policy: await setReceptionPolicy(env, b) });
  if (a === "pub_add") {
    if (!b.name || !b.declType) return json({ error: "name / declType が必要" }, 400);
    const spec = { type: String(b.declType), config: b.config ?? {}, label: String(b.label ?? b.name) };
    return json({ ok: true, id: await createAction(ctx, { name: String(b.name), kind: "decl", spec, scope: "public" }) });
  }
  if (a === "pub_remove") {
    await deleteAction(ctx, String(b.id ?? ""));
    return json({ ok: true });
  }
  if (a === "inquiry_list") return json({ ok: true, inquiries: await listInquiries(ctx, b.status ? String(b.status) : void 0) });
  if (a === "inquiry_decide") {
    const inq = await getInquiry(ctx, String(b.id ?? ""));
    if (!inq) return json({ error: "見つかりません" }, 404);
    const decision = String(b.decision ?? "");
    if (decision === "blocked") await addBlock(ctx, inq.from_license, "受付箱でブロック");
    await decideInquiry(ctx, inq.id, decision === "approved" ? "approved" : decision === "blocked" ? "blocked" : "rejected");
    let established = false;
    if (decision === "approved" && inq.from_license) {
      const e = await establishPublicConnection(env, inq.from_license);
      established = e.ok;
    }
    return json({ ok: true, established });
  }
  return json({ error: "不明な操作" }, 400);
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
