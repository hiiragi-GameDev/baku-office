globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
import { aiSiteNav, getSiteNav, setSiteNav } from "./site-nav_BtEfeAEe.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b._action === "ai") {
    const prompt = String(b.prompt ?? "").trim();
    if (!prompt) return json({ error: "調整したい内容を入力してください" }, 400);
    const { getMemberModel, parseRequestModel } = await import("./settings_dTyIbTCR.mjs");
    const { modelId } = parseRequestModel(await getMemberModel(env, ses.uid).catch(() => null) ?? "");
    const r = await aiSiteNav(env, { prompt, current: await getSiteNav(env), modelId: modelId || void 0 });
    if (!r.ok) return json({ error: r.error }, 400);
    return json({ ok: true, nav: r.nav, note: r.note });
  }
  const saved = await setSiteNav(env, { menu: b.menu, footer: b.footer, langs: b.langs, builtin: b.builtin, eventsLabel: b.eventsLabel, style: b.style });
  return json({ ok: true, nav: saved });
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
