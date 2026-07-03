globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { e as ensureSeed, c as currentPeriod } from "./accounting_D4tRmfws.mjs";
import { postCashOverShort, createClosure } from "./register_BlCGyPLB.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const jstToday = () => new Date(Date.now() + 9 * 3600 * 1e3).toISOString().slice(0, 10);
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  await ensureSeed(env);
  const period = await currentPeriod(env);
  if (!period) return json({ error: "会計期がありません" }, 400);
  const b = await request.json().catch(() => ({}));
  if (b._action === "adjust" && typeof b.id === "string") {
    const entryId = await postCashOverShort(env, b.id, jstToday());
    if (!entryId) return json({ error: "調整できる差異がありません（差異0 or 調整済み）" }, 400);
    return json({ ok: true, entryId });
  }
  const kind = ["daily", "monthly", "year_end"].includes(String(b.kind)) ? b.kind : "daily";
  const counted = Number(b.counted_amount);
  if (!b.wallet_id || !Number.isFinite(counted) || counted < 0) return json({ error: "口座と実査額（0以上）が必要" }, 400);
  const today = jstToday();
  let asOf = today;
  let label = today;
  if (kind === "monthly") {
    const d = /* @__PURE__ */ new Date(today + "T00:00:00Z");
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
    asOf = end.toISOString().slice(0, 10);
    label = today.slice(0, 7);
  } else if (kind === "year_end") {
    asOf = period.end_date;
    label = period.name;
  }
  const r = await createClosure(env, {
    fiscal_period_id: period.id,
    wallet_id: String(b.wallet_id),
    kind,
    period_label: label,
    asOf,
    counted_amount: Math.round(counted)
  });
  return json({ ok: true, ...r });
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
