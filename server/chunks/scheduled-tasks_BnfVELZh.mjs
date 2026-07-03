globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { cachedEntitlement } from "./client_F4fksau0.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { listScheduledTasks, deleteScheduledTask, toggleScheduledTask, createScheduledTask } from "./scheduled-tasks_DLesrd8F.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const GET = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "認証が必要" }, 401);
  if (!atLeast(await cachedEntitlement(env), "plus")) return json({ tasks: [] });
  return json({ tasks: await listScheduledTasks(locals.ctx, ses.uid).catch(() => []) });
};
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "認証が必要" }, 401);
  if (!atLeast(await cachedEntitlement(env), "plus")) return json({ error: "定期実行は Plus 以上で利用できます" }, 403);
  const b = await request.json().catch(() => ({}));
  switch (b._action) {
    case "create": {
      const r = await createScheduledTask(locals.ctx, ses.uid, {
        prompt: String(b.prompt ?? ""),
        freq: b.freq ?? "daily",
        at_min: Number(b.at_min ?? 540),
        dow: b.dow,
        dom: b.dom,
        role: ses.role
      });
      return json(r, r.ok ? 200 : 400);
    }
    case "toggle":
      if (b.id) await toggleScheduledTask(locals.ctx, ses.uid, b.id, !!b.enabled);
      return json({ ok: true });
    case "delete":
      if (b.id) await deleteScheduledTask(locals.ctx, ses.uid, b.id);
      return json({ ok: true });
    default:
      return json({ error: "不明な操作" }, 400);
  }
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
