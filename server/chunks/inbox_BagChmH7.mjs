globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
const prerender = false;
const $$Inbox = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Inbox;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const { results } = await env.DB.prepare("SELECT id,name,email,message,page,created_at FROM contact_messages ORDER BY created_at DESC LIMIT 200").all();
  const fmt = (s) => new Date(s * 1e3).toLocaleString("ja-JP");
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "問い合わせ", "active": "/settings" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>問い合わせ</h1> <p class="muted" style="font-size:.9rem">サイトの「問い合わせフォーム」ブロックに届いたメッセージです。</p> ${(!results || results.length === 0) && renderTemplate`<p class="muted">まだ問い合わせはありません。</p>`}${(results ?? []).map((m) => renderTemplate`<div class="card" style="padding:16px;margin:10px 0"> <div style="font-size:.8rem;color:#6E7179">${fmt(m.created_at)}${m.page ? `・${m.page}` : ""}</div> <div style="font-weight:600;margin-top:4px">${m.name || "（名前なし）"}${m.email ? ` <${m.email}>` : ""}</div> <div style="white-space:pre-wrap;margin-top:6px;line-height:1.8">${m.message}</div> ${m.email && renderTemplate`<a class="btn btn-ghost btn-sm"${addAttribute(`mailto:${m.email}`, "href")} style="margin-top:8px;display:inline-block">返信メール</a>`} </div>`)}` })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/inbox.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/inbox.astro";
const $$url = "/settings/inbox";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Inbox,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
