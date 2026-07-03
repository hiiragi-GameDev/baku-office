globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { o as ownedSession, g as getMessages, l as listSessions, c as createSession, b as deleteSession } from "./chat-sessions_DJA_I8xR.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const GET = async ({ request, url, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要" }, 401);
  const id = url.searchParams.get("id");
  if (id) {
    if (!await ownedSession(locals.ctx, ses.uid, id)) return json({ error: "not found" }, 404);
    return json({ ok: true, messages: await getMessages(locals.ctx, id) });
  }
  return json({ ok: true, sessions: await listSessions(locals.ctx, ses.uid) });
};
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要" }, 401);
  const b = await request.json().catch(() => ({}));
  if (b._action === "create") return json({ ok: true, id: await createSession(locals.ctx, ses.uid, b.model) });
  if (b._action === "delete") {
    await deleteSession(locals.ctx, ses.uid, String(b.id ?? ""));
    return json({ ok: true });
  }
  return json({ error: "不明な操作" }, 400);
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
