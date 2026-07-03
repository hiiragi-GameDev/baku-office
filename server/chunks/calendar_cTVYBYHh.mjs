globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
const CAL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const TZ = "Asia/Tokyo";
const NEED_CONNECT = "Google 連携が未設定です。連携設定（カレンダー画面）から連携してください。";
function fmtWhen(e) {
  if (e.start?.date && !e.start?.dateTime) return e.start.date;
  const j = toJstNaive(e.start);
  return j ? j.replace("T", " ") : "?";
}
async function listEvents(ctx, a) {
  const u = new URL(CAL);
  u.searchParams.set("singleEvents", "true");
  u.searchParams.set("orderBy", "startTime");
  u.searchParams.set("maxResults", String(Math.min(a.max ?? 20, 50)));
  u.searchParams.set("timeMin", a.time_min || (/* @__PURE__ */ new Date()).toISOString());
  if (a.time_max) u.searchParams.set("timeMax", a.time_max);
  if (a.query) u.searchParams.set("q", a.query);
  const r = await ctx.google.fetch(u.toString());
  if (!r) return NEED_CONNECT;
  if (!r.ok) return `カレンダー取得に失敗しました（${r.status}）。`;
  const d = await r.json();
  const items = d.items ?? [];
  if (!items.length) return "該当する予定はありません。";
  return items.map((e) => {
    const meet = e.hangoutLink || e.conferenceData?.entryPoints?.find((p) => p.uri)?.uri;
    return `・${fmtWhen(e)} ${e.summary ?? "(無題)"}${meet ? `
  Meet: ${meet}` : ""}（id:${e.id}）`;
  }).join("\n");
}
async function createEvent(ctx, a) {
  const body = {
    summary: a.title,
    description: a.description ?? void 0,
    start: { dateTime: a.start, timeZone: TZ },
    end: { dateTime: a.end, timeZone: TZ }
  };
  if (a.with_meet) {
    body.conferenceData = { createRequest: { requestId: randomId(), conferenceSolutionKey: { type: "hangoutsMeet" } } };
  }
  const u = new URL(CAL);
  if (a.with_meet) u.searchParams.set("conferenceDataVersion", "1");
  const r = await ctx.google.fetch(u.toString(), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r) return NEED_CONNECT;
  if (!r.ok) return `予定作成に失敗しました（${r.status}）。`;
  const e = await r.json();
  const meet = e.hangoutLink || e.conferenceData?.entryPoints?.find((p) => p.uri)?.uri;
  return `予定を作成しました：${fmtWhen(e)} ${e.summary ?? a.title}${meet ? `
Meet: ${meet}` : ""}`;
}
async function updateEvent(ctx, a) {
  const body = {};
  if (a.title !== void 0) body.summary = a.title;
  if (a.description !== void 0) body.description = a.description;
  if (a.start) body.start = { dateTime: a.start, timeZone: TZ };
  if (a.end) body.end = { dateTime: a.end, timeZone: TZ };
  const r = await ctx.google.fetch(`${CAL}/${encodeURIComponent(a.event_id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r) return NEED_CONNECT;
  if (!r.ok) return `予定の更新に失敗しました（${r.status}）。`;
  return "予定を更新しました。";
}
async function deleteEvent(ctx, a) {
  const r = await ctx.google.fetch(`${CAL}/${encodeURIComponent(a.event_id)}`, { method: "DELETE" });
  if (!r) return NEED_CONNECT;
  if (!r.ok && r.status !== 410) return `予定の削除に失敗しました（${r.status}）。`;
  return "予定を削除しました。";
}
function toJstNaive(v) {
  if (!v) return "";
  if (v.date && !v.dateTime) return `${v.date}T00:00`;
  const iso = v.dateTime ?? "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const g = (t) => parts.find((p) => p.type === t)?.value ?? "";
  const hh = g("hour") === "24" ? "00" : g("hour");
  return `${g("year")}-${g("month")}-${g("day")}T${hh}:${g("minute")}`;
}
async function listEventsRaw(ctx, a) {
  const u = new URL(CAL);
  u.searchParams.set("singleEvents", "true");
  u.searchParams.set("orderBy", "startTime");
  u.searchParams.set("maxResults", String(Math.min(a.max ?? 250, 250)));
  u.searchParams.set("timeMin", a.time_min || (/* @__PURE__ */ new Date()).toISOString());
  if (a.time_max) u.searchParams.set("timeMax", a.time_max);
  const r = await ctx.google.fetch(u.toString());
  if (!r) return { ok: false, events: [], error: NEED_CONNECT };
  if (!r.ok) return { ok: false, events: [], error: `カレンダー取得に失敗しました（${r.status}）。` };
  const d = await r.json();
  const events = (d.items ?? []).filter((e) => e.id && (e.start?.dateTime || e.start?.date)).map((e) => ({
    id: e.id,
    summary: e.summary ?? "(無題)",
    description: e.description ?? "",
    start: toJstNaive(e.start),
    end: toJstNaive(e.end)
  }));
  return { ok: true, events };
}
async function createEventStructured(ctx, a) {
  const body = { summary: a.title, description: a.description ?? void 0, start: { dateTime: a.start, timeZone: TZ }, end: { dateTime: a.end, timeZone: TZ } };
  const r = await ctx.google.fetch(CAL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r) return { ok: false, error: NEED_CONNECT };
  if (!r.ok) return { ok: false, error: `予定作成に失敗しました（${r.status}）。` };
  const e = await r.json();
  return { ok: true, id: e.id };
}
async function deleteEventById(ctx, eventId) {
  const res = await deleteEvent(ctx, { event_id: eventId });
  return res === "予定を削除しました。";
}
const ISO = { type: "string", description: "ISO8601日時（例 2026-06-20T10:00:00）" };
const calendarPart = {
  id: "calendar",
  name: "カレンダー",
  version: "1.0.0",
  category: "庶務",
  description: "Google カレンダーの予定を閲覧・作成（Meet付き会議の発行）・編集・削除。",
  permissions: ["net"],
  minPlan: "pro",
  // ランチャー（標準アプリ）には出さない＝Google連携の接続設定は設定→「Googleとの連携」(/settings/google-setup)
  // に集約。AI操作（予定の閲覧・作成・編集・削除）は agentTools として維持する。
  agentTools: [
    {
      name: "list_events",
      description: "Googleカレンダーの予定を一覧（既定は今後の予定）",
      parameters: { type: "object", properties: { time_min: ISO, time_max: ISO, query: { type: "string" }, max: { type: "number" } } },
      run: (ctx, _owner, _b, a) => listEvents(ctx, { time_min: a.time_min, time_max: a.time_max, query: a.query, max: a.max })
    },
    {
      name: "create_event",
      description: "Googleカレンダーに予定を作成。with_meet=true で Google Meet 付き会議を発行",
      parameters: { type: "object", properties: { title: { type: "string" }, start: ISO, end: ISO, description: { type: "string" }, with_meet: { type: "boolean", description: "Meetリンクを発行する" } }, required: ["title", "start", "end"] },
      run: (ctx, _owner, _b, a) => createEvent(ctx, { title: String(a.title), start: String(a.start), end: String(a.end), description: a.description, with_meet: !!a.with_meet })
    },
    {
      name: "update_event",
      description: "既存の予定を更新（event_id 指定）",
      unattended: false,
      // 無人ジョブで既存予定を改変させない
      parameters: { type: "object", properties: { event_id: { type: "string" }, title: { type: "string" }, start: ISO, end: ISO, description: { type: "string" } }, required: ["event_id"] },
      run: (ctx, _owner, _b, a) => updateEvent(ctx, { event_id: String(a.event_id), title: a.title, start: a.start, end: a.end, description: a.description })
    },
    {
      name: "delete_event",
      description: "予定を削除（event_id 指定）",
      unattended: false,
      // 無人ジョブで予定削除させない（破壊系）
      parameters: { type: "object", properties: { event_id: { type: "string" } }, required: ["event_id"] },
      run: (ctx, _owner, _b, a) => deleteEvent(ctx, { event_id: String(a.event_id) })
    }
  ]
};
export {
  calendarPart,
  createEvent,
  createEventStructured,
  deleteEventById,
  listEvents,
  listEventsRaw
};
