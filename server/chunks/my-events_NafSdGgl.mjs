globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$MyEvents = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$MyEvents;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const { listMyRegistrations } = await import("./events_DvycExYH.mjs");
  const regs = await listMyRegistrations(env, ses.uid);
  const yen = (n) => n != null ? "¥" + n.toLocaleString("ja-JP") : "—";
  const PAY_LABEL = { paid: "支払済", unpaid: "未払い" };
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "参加イベント", "active": "/my-events" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>参加イベント</h1> <p class="muted">お申し込みいただいたイベントと、お支払い状況を確認できます。</p> ${regs.length === 0 && renderTemplate`<div class="card"><p class="muted" style="margin:0">参加申込はまだありません。<a href="/events">イベント一覧</a>から申し込めます。</p></div>`}${regs.map((r) => renderTemplate`<div class="card" style="margin-bottom:.8rem"${addAttribute(r.id, "data-reg")}${addAttribute(r.amount ?? 0, "data-amount")}> <div class="spread" style="flex-wrap:wrap;gap:8px;align-items:baseline"> <h2 style="margin:0;border:0;font-size:1.2rem">${r.event_title}</h2> <span${addAttribute("pill " + (r.pay_status === "paid" ? "ok" : ""), "class")}>${PAY_LABEL[r.pay_status] ?? r.pay_status}</span> </div> <div class="muted" style="font-size:.88rem;margin-top:4px">${r.event_date ?? "日程調整中"}・${r.plan_name ?? "参加"}・${r.headcount}名・${yen(r.amount)}</div> <div style="margin-top:.7rem"> <a class="btn btn-sm"${addAttribute("/event/" + r.event_slug, "href")} target="_blank" rel="noreferrer">イベントページ</a> ${r.pay_status !== "paid" && renderTemplate`<button class="btn btn-sm btn-primary r-pay">お支払い（デモ）</button>`} </div> </div>`)} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    document.querySelectorAll("[data-reg]").forEach((el) => {\n      const regId = el.getAttribute("data-reg");\n      el.querySelector(".r-pay")?.addEventListener("click", async (e) => {\n        const r = await window.bo.api("/api/event/pay", { registrationId: regId }, { btn: e.currentTarget, successMsg: "お支払いが完了しました（デモ）" });\n        if (r.ok) setTimeout(() => location.reload(), 700);\n      });\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/my-events.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/my-events.astro";
const $$url = "/my-events";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$MyEvents,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
