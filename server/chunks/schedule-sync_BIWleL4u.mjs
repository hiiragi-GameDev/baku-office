globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { audit } from "./storage_BHLYBEBb.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const DAY = 86400 * 1e3;
const TZ = "Asia/Tokyo";
function jstNaive(ms) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(ms));
  const g = (t) => parts.find((p) => p.type === t)?.value ?? "";
  const hh = g("hour") === "24" ? "00" : g("hour");
  return `${g("year")}-${g("month")}-${g("day")}T${hh}:${g("minute")}`;
}
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "権限がありません" }, 403);
  const ctx = locals.ctx;
  const { listEventsRaw, createEventStructured } = await import("./calendar_cTVYBYHh.mjs");
  const nowMs = Date.now();
  const timeMin = new Date(nowMs - DAY).toISOString();
  const timeMax = new Date(nowMs + 90 * DAY).toISOString();
  const winStart = jstNaive(nowMs - DAY);
  const winEnd = jstNaive(nowMs + 90 * DAY);
  const pulled = await listEventsRaw(ctx, { time_min: timeMin, time_max: timeMax, max: 250 });
  if (!pulled.ok) return json({ error: pulled.error ?? "Googleカレンダーに接続できません。" }, 400);
  let imported = 0, updated = 0;
  for (const e of pulled.events) {
    const row = await env.DB.prepare("SELECT id,title,start_at,end_at,deleted_at FROM schedules WHERE google_event_id=? LIMIT 1").bind(e.id).first();
    if (row) {
      if (row.deleted_at) continue;
      if (row.title !== e.summary || row.start_at !== e.start || (row.end_at ?? "") !== (e.end ?? "")) {
        await env.DB.prepare("UPDATE schedules SET title=?, start_at=?, end_at=?, google_synced_at=? WHERE id=?").bind(e.summary, e.start, e.end || null, nowSec(), row.id).run();
        updated++;
      }
    } else {
      await env.DB.prepare("INSERT INTO schedules (id,title,start_at,end_at,body,created_by,created_at,google_event_id,google_synced_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(randomId(), e.summary, e.start, e.end || null, e.description || null, ses.uid, nowSec(), e.id, nowSec()).run();
      imported++;
    }
  }
  const unpushed = (await env.DB.prepare(
    "SELECT id,title,start_at,end_at,body FROM schedules WHERE deleted_at IS NULL AND google_event_id IS NULL AND start_at >= ? AND start_at <= ? ORDER BY start_at LIMIT 100"
  ).bind(winStart, winEnd).all()).results;
  let pushed = 0, pushErrors = 0;
  for (const s of unpushed) {
    const withSec = (x) => /T\d{2}:\d{2}$/.test(x) ? `${x}:00` : x;
    const start = withSec(s.start_at);
    let end = s.end_at ? withSec(s.end_at) : "";
    if (!end) {
      const d = /* @__PURE__ */ new Date(`${start}Z`);
      if (!Number.isNaN(d.getTime())) {
        d.setUTCHours(d.getUTCHours() + 1);
        const p = (n) => String(n).padStart(2, "0");
        end = `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:00`;
      } else end = start;
    }
    const res = await createEventStructured(ctx, { title: s.title, start, end, description: s.body ?? void 0 });
    if (res.ok && res.id) {
      await env.DB.prepare("UPDATE schedules SET google_event_id=?, google_synced_at=? WHERE id=?").bind(res.id, nowSec(), s.id).run();
      pushed++;
    } else pushErrors++;
  }
  await audit(env, ses.uid, "schedule.sync_google", `imported=${imported} updated=${updated} pushed=${pushed} pushErrors=${pushErrors}`);
  return json({ ok: true, imported, updated, pushed, pushErrors });
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
