globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
const prerender = false;
const $$Analytics = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Analytics;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const since = new Date(Date.now() - 30 * 86400 * 1e3).toISOString().slice(0, 10);
  const byPath = await env.DB.prepare("SELECT path, SUM(count) c FROM pageviews WHERE day>=? GROUP BY path ORDER BY c DESC LIMIT 30").bind(since).all();
  const byDay = await env.DB.prepare("SELECT day, SUM(count) c FROM pageviews WHERE day>=? GROUP BY day ORDER BY day DESC LIMIT 30").bind(since).all();
  const total = (byDay.results ?? []).reduce((s, r) => s + (r.c ?? 0), 0);
  const maxDay = Math.max(1, ...(byDay.results ?? []).map((r) => r.c ?? 0));
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "アクセス解析", "active": "/settings" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>アクセス解析</h1> <p class="muted" style="font-size:.9rem">公開ページ（HP/LP・お知らせ・イベント）の閲覧数です（直近30日・内蔵カウンタ・個人は記録しません）。</p> <div class="card" style="padding:20px;margin-top:12px"><div style="font-size:2rem;font-weight:800;color:#1B1D22">${total.toLocaleString("ja-JP")}<span style="font-size:1rem;color:#946F2C;margin-left:6px">PV / 30日</span></div></div> <h2 style="font-size:1rem;margin:16px 0 8px">日別</h2> <div class="card" style="padding:16px"> ${(byDay.results ?? []).length === 0 && renderTemplate`<p class="muted">まだデータがありません。</p>`} ${(byDay.results ?? []).map((r) => renderTemplate`<div style="display:flex;align-items:center;gap:10px;margin:4px 0;font-size:.85rem"> <span style="width:90px;color:#6E7179">${r.day}</span> <span${addAttribute(`display:inline-block;height:14px;border-radius:4px;background:#C9A86A;width:${Math.round(r.c / maxDay * 240)}px`, "style")}></span> <span>${r.c}</span> </div>`)} </div> <h2 style="font-size:1rem;margin:16px 0 8px">ページ別</h2> <div class="card" style="padding:16px"> ${(byPath.results ?? []).length === 0 && renderTemplate`<p class="muted">まだデータがありません。</p>`} ${(byPath.results ?? []).map((r) => renderTemplate`<div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #E3E1E6;font-size:.88rem"> <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.path}</span><strong>${r.c}</strong> </div>`)} </div> ` })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/analytics.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/analytics.astro";
const $$url = "/settings/analytics";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Analytics,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
