globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { seedDemoEvent, markRegistrationPaid, deleteRegistration, deleteEvent, saveEvent } from "./events_DvycExYH.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  switch (b._action) {
    case "save": {
      const r = await saveEvent(env, {
        id: b.id ? String(b.id) : void 0,
        slug: String(b.slug ?? ""),
        title: String(b.title ?? ""),
        lead: b.lead != null ? String(b.lead) : void 0,
        body: b.body != null ? String(b.body) : void 0,
        location: b.location != null ? String(b.location) : void 0,
        event_date: b.event_date != null ? String(b.event_date) : void 0,
        capacity: b.capacity,
        plans: Array.isArray(b.plans) ? b.plans : void 0,
        image: b.image,
        published: !!b.published
      });
      return r.ok ? json({ ok: true, id: r.id }) : json({ error: r.error }, 400);
    }
    case "delete":
      if (b.id) await deleteEvent(env, String(b.id));
      return json({ ok: true });
    case "delete_registration":
      if (b.regId) await deleteRegistration(env, String(b.regId));
      return json({ ok: true });
    case "mark_paid": {
      if (!b.regId) return json({ error: "regId が必要" }, 400);
      const r = await markRegistrationPaid(env, String(b.regId));
      return r.ok ? json({ ok: true, amount: r.amount }) : json({ error: r.error }, 400);
    }
    case "seed": {
      const id = await seedDemoEvent(env);
      return json({ ok: true, id });
    }
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
