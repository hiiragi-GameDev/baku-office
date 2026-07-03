globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { audit } from "./storage_BHLYBEBb.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要" }, 401);
  const b = await request.json().catch(() => ({}));
  if (b.kind === "schedule") {
    if (b._action === "delete") {
      if (b.id) {
        const row = await env.DB.prepare("SELECT google_event_id FROM schedules WHERE id=?").bind(b.id).first();
        if (row?.google_event_id) {
          try {
            const { deleteEventById } = await import("./calendar_cTVYBYHh.mjs");
            await deleteEventById(locals.ctx, row.google_event_id);
          } catch {
          }
        }
      }
      await env.DB.prepare("UPDATE schedules SET deleted_at=? WHERE id=?").bind(nowSec(), b.id).run();
      return json({ ok: true });
    }
    if (!b.title || !b.start_at) return json({ error: "title と start_at が必要" }, 400);
    const id = randomId();
    await env.DB.prepare("INSERT INTO schedules (id,title,start_at,end_at,body,created_by,created_at) VALUES (?,?,?,?,?,?,?)").bind(id, b.title, b.start_at, b.end_at ?? null, b.body ?? null, ses.uid, nowSec()).run();
    await audit(env, ses.uid, "schedule.create", id);
    let googlePushed = false, googleError = "";
    if (b.to_google) {
      try {
        const { createEventStructured } = await import("./calendar_cTVYBYHh.mjs");
        const withSec = (s) => /T\d{2}:\d{2}$/.test(s) ? `${s}:00` : s;
        const start = withSec(b.start_at);
        let end = b.end_at ? withSec(b.end_at) : "";
        if (!end) {
          const d = /* @__PURE__ */ new Date(`${start}Z`);
          if (!Number.isNaN(d.getTime())) {
            d.setUTCHours(d.getUTCHours() + 1);
            const p = (n) => String(n).padStart(2, "0");
            end = `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:00`;
          } else end = start;
        }
        const res = await createEventStructured(locals.ctx, { title: b.title, start, end, description: b.body });
        googlePushed = res.ok;
        if (res.ok && res.id) await env.DB.prepare("UPDATE schedules SET google_event_id=?, google_synced_at=? WHERE id=?").bind(res.id, nowSec(), id).run();
        if (!res.ok) googleError = res.error ?? "Googleカレンダーへの登録に失敗しました。";
      } catch (e) {
        googleError = e.message;
      }
    }
    return json({ ok: true, id, googlePushed, googleError });
  }
  if (b.kind === "minutes") {
    if (b._action === "delete") {
      await env.DB.prepare("UPDATE knowledge SET deleted_at=? WHERE id=?").bind(nowSec(), b.id).run();
      return json({ ok: true });
    }
    if (b._action === "update") {
      if (!b.id || !b.title) return json({ error: "id と title が必要" }, 400);
      await env.DB.prepare("UPDATE knowledge SET title=?, body=? WHERE id=? AND tags='議事録' AND deleted_at IS NULL").bind(b.title, b.body ?? "", b.id).run();
      await audit(env, ses.uid, "minutes.update", b.id);
      return json({ ok: true });
    }
    if (!b.title) return json({ error: "title が必要" }, 400);
    const id = randomId();
    await env.DB.prepare("INSERT INTO knowledge (id,title,body,file_ref,tags,created_by,created_at) VALUES (?,?,?,?,?,?,?)").bind(id, b.title, b.body ?? "", null, "議事録", ses.uid, nowSec()).run();
    await audit(env, ses.uid, "minutes.create", id);
    return json({ ok: true, id });
  }
  return json({ error: "kind が不正" }, 400);
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
