globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, a as addAttribute, m as maybeRenderHead } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$EventPublic } from "./EventPublic_CaN2h5s9.mjs";
import { getPublishedPost } from "./news_BXvjBFaK.mjs";
import { brandName, getTheme } from "./theme_DFty9gzU.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const slug = Astro2.params.slug ?? "";
  const post = await getPublishedPost(env, slug);
  if (!post) return new Response("お知らせが見つかりません", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  const brand = brandName(await getTheme(Astro2.locals.ctx).catch(() => ({})));
  const desc = (post.body ?? "").replace(/\s+/g, " ").slice(0, 120);
  const fmt = (s) => new Date(s * 1e3).toLocaleDateString("ja-JP");
  return renderTemplate`${renderComponent($$result, "EventPublic", $$EventPublic, { "title": post.title + " — " + brand, "desc": desc, "pageType": "article" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main style="max-width:760px;margin:0 auto;padding:32px 20px"> <a href="/news" style="font-size:.85rem;color:var(--muted)">← お知らせ一覧</a> <div id="tr-bar" style="margin-top:14px;display:flex;gap:6px;flex-wrap:wrap;align-items:center"> <span style="font-size:.78rem;color:var(--muted)">翻訳：</span> <button class="tr-btn" data-lang="ja" style="font-size:.78rem;border:1px solid var(--line);background:transparent;border-radius:20px;padding:3px 10px;cursor:pointer">日本語</button> <button class="tr-btn" data-lang="en" style="font-size:.78rem;border:1px solid var(--line);background:transparent;border-radius:20px;padding:3px 10px;cursor:pointer">EN</button> <button class="tr-btn" data-lang="zh" style="font-size:.78rem;border:1px solid var(--line);background:transparent;border-radius:20px;padding:3px 10px;cursor:pointer">中文</button> <button class="tr-btn" data-lang="ko" style="font-size:.78rem;border:1px solid var(--line);background:transparent;border-radius:20px;padding:3px 10px;cursor:pointer">한국어</button> <span id="tr-msg" style="font-size:.78rem;color:var(--muted)"></span> </div> <article style="margin-top:8px"> <time style="font-size:.82rem;color:var(--muted)">${fmt(post.created_at)}</time> <h1 id="tr-title"${addAttribute(post.title, "data-orig")} style="font-family:var(--font-serif);margin:6px 0 20px">${post.title}</h1> <div id="tr-body"${addAttribute(post.body, "data-orig")} style="white-space:pre-wrap;line-height:1.9">${post.body}</div> </article> </main>  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(["<script", ' data-astro-rerun>\n    (function () {\n      const titleEl = document.getElementById("tr-title");\n      const bodyEl = document.getElementById("tr-body");\n      const msg = document.getElementById("tr-msg");\n      const tr = async (text, lang) => { const r = await fetch("/api/translate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, lang }) }); const j = await r.json().catch(() => ({})); return j.ok ? j.text : null; };\n      document.querySelectorAll(".tr-btn").forEach((b) => b.addEventListener("click", async () => {\n        const lang = b.getAttribute("data-lang");\n        if (lang === "ja") { titleEl.textContent = titleEl.dataset.orig; bodyEl.textContent = bodyEl.dataset.orig; msg.textContent = ""; return; }\n        msg.textContent = "翻訳中…";\n        const [t, bd] = await Promise.all([tr(titleEl.dataset.orig, lang), tr(bodyEl.dataset.orig, lang)]);\n        if (t) titleEl.textContent = t; if (bd) bodyEl.textContent = bd;\n        msg.textContent = (t || bd) ? "" : "翻訳できませんでした";\n      }));\n    })();\n  <\/script>'])), addAttribute(Astro2.locals.cspNonce, "nonce")) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/news/[slug].astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/news/[slug].astro";
const $$url = "/news/[slug]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
