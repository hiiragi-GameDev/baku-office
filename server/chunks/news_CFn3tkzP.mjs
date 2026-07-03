globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, a as addAttribute, m as maybeRenderHead } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$News = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$News;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const { listAllPosts } = await import("./news_BXvjBFaK.mjs");
  const posts = await listAllPosts(env);
  const origin = Astro2.url.origin;
  const fmt = (s) => new Date(s * 1e3).toLocaleDateString("ja-JP");
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "お知らせ", "active": "/settings" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<h1>お知らせ</h1> <p class="muted" style="font-size:.9rem">公開ページ <a href="/news" target="_blank">', '/news</a> に掲載されます（ログイン不要で誰でも閲覧）。</p> <div class="card" style="padding:20px;margin-top:12px"> <h2 style="font-size:1rem;margin:0 0 10px">新規／編集</h2> <form id="post-form"> <input type="hidden" name="id"> <div class="field" style="margin:.4rem 0"><label>タイトル</label><input name="title" required style="width:100%"></div> <div class="field" style="margin:.4rem 0"><label>URL（slug・任意）</label><input name="slug" placeholder="自動生成" style="width:100%"></div> <div class="field" style="margin:.4rem 0"><label>本文</label><textarea name="body" rows="8" style="width:100%"></textarea></div> <label style="display:inline-flex;gap:6px;align-items:center;margin:.4rem 0"><input type="checkbox" name="published"> 公開する</label> <div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-primary" type="submit">保存</button><button class="btn btn-ghost" type="button" id="post-reset">クリア</button></div> <span class="muted" id="post-msg" style="margin-left:8px;font-size:.85rem"></span> </form> </div> <h2 style="font-size:1rem;margin:16px 0 8px">一覧</h2> ', "", '<script data-astro-rerun>\n    (function () {\n      const form = document.getElementById("post-form");\n      const msg = document.getElementById("post-msg");\n      const post = (body) => fetch("/api/news", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());\n      form.addEventListener("submit", async (e) => {\n        e.preventDefault();\n        const f = new FormData(form);\n        msg.textContent = "保存中…";\n        const j = await post({ id: f.get("id") || undefined, title: f.get("title"), slug: f.get("slug"), body: f.get("body"), published: form.querySelector("[name=published]").checked });\n        if (j.ok) location.reload(); else { msg.textContent = j.error || "失敗しました"; }\n      });\n      document.getElementById("post-reset").addEventListener("click", () => { form.reset(); form.querySelector("[name=id]").value = ""; });\n      // document 委譲リスナーは1回だけ登録（SPA遷移での二重登録を防止）。フォームは毎回 id で取り直す（古い参照を避ける）。\n      if (!window.__boNewsBound) { window.__boNewsBound = true;\n      document.addEventListener("click", async (e) => {\n        const form = document.getElementById("post-form");\n        const ed = e.target.closest("[data-edit]");\n        if (ed && form) {\n          form.querySelector("[name=id]").value = ed.getAttribute("data-edit");\n          form.querySelector("[name=title]").value = ed.getAttribute("data-title");\n          form.querySelector("[name=slug]").value = ed.getAttribute("data-slug");\n          form.querySelector("[name=body]").value = ed.getAttribute("data-body");\n          form.querySelector("[name=published]").checked = ed.getAttribute("data-pub") === "1";\n          window.scrollTo({ top: 0, behavior: "smooth" });\n          return;\n        }\n        const del = e.target.closest("[data-del]");\n        if (del && confirm("このお知らせを削除しますか？")) {\n          const j = await post({ _action: "delete", id: del.getAttribute("data-del") });\n          if (j.ok) location.reload();\n        }\n      });\n      }\n    })();\n  <\/script> '])), maybeRenderHead(), origin, posts.length === 0 && renderTemplate`<p class="muted">まだお知らせはありません。</p>`, posts.map((p) => renderTemplate`<div class="card" style="padding:14px 16px;margin:8px 0;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"> <div> <strong>${p.title}</strong> <div style="font-size:.82rem;color:#6E7179">/news/${p.slug}・${fmt(p.created_at)}${p.published ? "" : "（非公開）"}</div> </div> <div style="display:flex;gap:6px"> <button class="btn btn-ghost btn-sm"${addAttribute(p.id, "data-edit")}${addAttribute(p.slug, "data-slug")}${addAttribute(p.title, "data-title")}${addAttribute(p.body ?? "", "data-body")}${addAttribute(p.published ? "1" : "0", "data-pub")}>編集</button> <button class="btn btn-ghost btn-sm"${addAttribute(p.id, "data-del")}>削除</button> </div> </div>`)) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/news.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/news.astro";
const $$url = "/settings/news";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$News,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
