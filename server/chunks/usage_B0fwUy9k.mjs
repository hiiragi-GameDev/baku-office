globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { cachedEntitlement } from "./client_F4fksau0.mjs";
import { setLimits, getLimits } from "./usage_CfukLLAj.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  if (!atLeast(await cachedEntitlement(env), "plus")) return json({ error: "API使用量は Plus 以上で利用できます" }, 403);
  const b = await request.json().catch(() => ({}));
  const incoming = b.limits ?? {};
  const clean = {};
  for (const [prov, v] of Object.entries(incoming)) {
    const fq = Number(v?.freeQuota);
    const mc = Number(v?.monthlyCap);
    const uc = Number(v?.monthlyUsdCap);
    const nc = Number(v?.monthlyNeuronCap);
    const onExceed = v?.onExceed === "switch_free" ? "switch_free" : "pause";
    clean[prov] = {
      ...Number.isFinite(fq) && fq > 0 ? { freeQuota: Math.round(fq) } : {},
      ...Number.isFinite(mc) && mc > 0 ? { monthlyCap: Math.round(mc) } : {},
      ...Number.isFinite(uc) && uc > 0 ? { monthlyUsdCap: Math.round(uc * 100) / 100 } : {},
      ...Number.isFinite(nc) && nc > 0 ? { monthlyNeuronCap: Math.round(nc) } : {},
      onExceed
    };
  }
  await setLimits(env, clean);
  return json({ ok: true, limits: await getLimits(env) });
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
