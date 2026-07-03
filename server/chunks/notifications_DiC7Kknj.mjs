globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { listNotifications, countUnread, markNotificationsRead } from "./notifications_DKh03i2Y.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const GET = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要" }, 401);
  const items = await listNotifications(locals.ctx, ses.uid, { limit: 30 });
  const unread = await countUnread(locals.ctx, ses.uid);
  return json({ ok: true, items, unread });
};
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要" }, 401);
  const b = await request.json().catch(() => ({}));
  if (b._action === "read") {
    await markNotificationsRead(locals.ctx, ses.uid, b.id);
    return json({ ok: true, unread: await countUnread(locals.ctx, ses.uid) });
  }
  return json({ error: "unknown action" }, 400);
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
