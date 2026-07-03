globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession, canAccess } from "./auth_DL5yvmzT.mjs";
import { deleteMember, updateMember, createMember } from "./membership_DQ1fLu2V.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "権限がありません" }, 403);
  if (!canAccess(ses.role, "accounting")) return json({ error: "会計担当または管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  switch (b._action) {
    case "create":
      if (!b.name) return json({ error: "氏名が必要" }, 400);
      return json({ ok: true, id: await createMember(env, { name: b.name, contact: b.contact, fee_status: b.fee_status, paid_at: b.paid_at, extra: b.extra, fee_amount: b.fee_amount, rank: b.rank }) });
    case "update":
      if (!b.id) return json({ error: "id が必要" }, 400);
      await updateMember(env, b.id, { name: b.name, contact: b.contact, fee_status: b.fee_status, paid_at: b.paid_at, extra: b.extra, fee_amount: b.fee_amount, rank: b.rank });
      return json({ ok: true });
    case "delete":
      if (b.id) await deleteMember(env, b.id);
      return json({ ok: true });
    default:
      return json({ error: "不明な操作" }, 400);
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
