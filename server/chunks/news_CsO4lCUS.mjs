globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
import { deletePost, upsertPost } from "./news_BXvjBFaK.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b._action === "delete") {
    if (!b.id) return json({ error: "id が必要です" }, 400);
    await deletePost(env, b.id);
    return json({ ok: true });
  }
  if (!b.title?.trim()) return json({ error: "タイトルが必要です" }, 400);
  const r = await upsertPost(env, { id: b.id, slug: b.slug ?? "", title: b.title, body: b.body, published: b.published });
  return json(r, r.ok ? 200 : 400);
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
