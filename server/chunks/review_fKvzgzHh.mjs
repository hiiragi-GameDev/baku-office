globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession, canAccess } from "./auth_DL5yvmzT.mjs";
import { unapproveItem, approveItem, rejectItem } from "./users_DArBIlQW.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要" }, 401);
  const b = await request.json().catch(() => ({}));
  if (!b.id) return json({ error: "id が必要" }, 400);
  if (b._action === "unapprove") {
    if (ses.role !== "admin") return json({ error: "承認の取消は管理者のみ" }, 403);
    await unapproveItem(env, b.id, ses.uid);
    return json({ ok: true });
  }
  if (b._action !== "approve" && b._action !== "reject") return json({ error: "不明な操作" }, 400);
  const it = await env.DB.prepare("SELECT type FROM personal_items WHERE id=?").bind(b.id).first();
  if (!it) return json({ error: "対象が見つかりません" }, 404);
  const section = it.type === "receipt" ? "review_accounting" : "review_documents";
  if (!canAccess(ses.role, section)) return json({ error: "この種別を承認する権限がありません" }, 403);
  if (b._action === "approve") await approveItem(env, b.id, ses.uid);
  else await rejectItem(env, b.id, ses.uid, b.reason ?? "");
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
