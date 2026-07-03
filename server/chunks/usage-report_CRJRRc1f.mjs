globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { monthCallAgg, FEATURE_LABEL } from "./usage_CfukLLAj.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const GET = async ({ request, url }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const month = /^\d{4}-\d{2}$/.test(url.searchParams.get("month") ?? "") ? url.searchParams.get("month") : (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const rows = await monthCallAgg(env, month);
  if (url.searchParams.get("format") === "csv") {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = "month,feature,feature_label,provider,model,calls,input_tokens,output_tokens,cache_read_tokens,cache_write_tokens,est_usd";
    const body = rows.map((r) => [month, r.feature, FEATURE_LABEL[r.feature] ?? r.feature, r.provider, r.model ?? "", r.calls, r.inputTokens, r.outputTokens, r.cacheRead, r.cacheWrite, r.estUsd].map(esc).join(",")).join("\n");
    return new Response("\uFEFF" + head + "\n" + body, {
      headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="ai-usage-${month}.csv"` }
    });
  }
  const totals = rows.reduce((a, r) => ({ calls: a.calls + r.calls, inputTokens: a.inputTokens + r.inputTokens, outputTokens: a.outputTokens + r.outputTokens, estUsd: a.estUsd + r.estUsd }), { calls: 0, inputTokens: 0, outputTokens: 0, estUsd: 0 });
  return json({ ok: true, month, rows, totals: { ...totals, estUsd: Math.round(totals.estUsd * 1e4) / 1e4 } });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
