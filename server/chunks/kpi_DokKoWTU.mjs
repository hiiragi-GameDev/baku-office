globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { monthKpi } from "./kpi_BmbE7XHM.mjs";
import { setLaborSettings } from "./settings_dTyIbTCR.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const GET = async ({ request, url }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const month = /^\d{4}-\d{2}$/.test(url.searchParams.get("month") ?? "") ? url.searchParams.get("month") : (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const kpi = await monthKpi(env, month);
  if (url.searchParams.get("format") === "csv") {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = "month,kind,kind_label,total,ai_completed,rework,good,bad,saved_minutes,saved_jpy";
    const body = kpi.byKind.map((r) => [month, r.kind, r.label, r.total, r.completed, r.rework, r.good, r.bad, r.savedMinutes, r.savedJpy].map(esc).join(",")).join("\n");
    return new Response("\uFEFF" + head + "\n" + body, {
      headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="kpi-${month}.csv"` }
    });
  }
  return json({ ok: true, kpi });
};
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  const saved = await setLaborSettings(env, { hourlyJpy: b.hourlyJpy, minutesByKind: b.minutesByKind });
  return json({ ok: true, labor: saved });
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
