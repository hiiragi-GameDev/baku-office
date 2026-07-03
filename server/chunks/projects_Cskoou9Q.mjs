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
const $$Projects = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Projects;
  const { getSession, canDevelopApps } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdminOrg = canDevelopApps(ses.role, ses.ctx);
  if (!isAdminOrg) return Astro2.redirect("/forbidden", 302);
  const { listProjects, projectAppCounts, projectRecordCounts } = await import("./projects_B_gexkwU.mjs");
  const [projects, counts, recCounts] = await Promise.all([listProjects(env), projectAppCounts(env), projectRecordCounts(env)]);
  const hueOf = (p) => p.color && /^\d+$/.test(p.color) ? Number(p.color) : [...p.name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "プロジェクト", "active": "/projects", "data-astro-cid-aid3sr62": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="spread" style="flex-wrap:wrap;gap:12px;margin-bottom:14px" data-astro-cid-aid3sr62> <div data-astro-cid-aid3sr62> <h1 style="margin:0" data-astro-cid-aid3sr62>プロジェクト</h1> <p class="muted" style="margin:.2rem 0 0" data-astro-cid-aid3sr62>事業・イベント単位でアプリと公開ページ（LP）をまとめ、横断で集計・管理します。</p> </div> <button class="btn btn-primary" id="pj-new-btn" type="button" aria-expanded="false" data-astro-cid-aid3sr62>＋ 新しいプロジェクト</button> </div> <div class="card" id="pj-new" hidden style="margin-bottom:14px" data-astro-cid-aid3sr62> <div class="field" data-astro-cid-aid3sr62><label data-astro-cid-aid3sr62>プロジェクト名</label><input id="pj-name" type="text" placeholder="例：baku-office" data-astro-cid-aid3sr62></div> <div class="field" data-astro-cid-aid3sr62><label data-astro-cid-aid3sr62>説明（任意）</label><input id="pj-desc" type="text" placeholder="例：各種申込フォームの横断管理" data-astro-cid-aid3sr62></div> <button class="btn btn-primary" id="pj-create" type="button" data-astro-cid-aid3sr62>作成する</button> </div> ', ' <script>\n    document.addEventListener("astro:page-load", function () {\n      var newBtn = document.getElementById("pj-new-btn");\n      var panel = document.getElementById("pj-new");\n      if (!newBtn || newBtn.dataset.bound) return;\n      newBtn.dataset.bound = "1";\n      newBtn.addEventListener("click", function () {\n        var hidden = panel.hasAttribute("hidden");\n        if (hidden) panel.removeAttribute("hidden"); else panel.setAttribute("hidden", "");\n        newBtn.setAttribute("aria-expanded", hidden ? "true" : "false");\n      });\n      document.getElementById("pj-create").addEventListener("click", async function (e) {\n        var name = (document.getElementById("pj-name").value || "").trim();\n        var description = (document.getElementById("pj-desc").value || "").trim();\n        if (!name) { window.bo && window.bo.toast && window.bo.toast("プロジェクト名を入力してください"); return; }\n        var r = await window.bo.api("/api/projects", { action: "create", name: name, description: description }, { btn: e.currentTarget, successMsg: "プロジェクトを作成しました" });\n        if (r && r.ok && r.data && r.data.project) location.href = "/project/" + r.data.project.id;\n        else location.reload();\n      });\n    });\n  <\/script> '])), maybeRenderHead(), projects.length === 0 ? renderTemplate`<div class="pj-empty card" data-astro-cid-aid3sr62> <div class="pj-empty-ic" aria-hidden="true" data-astro-cid-aid3sr62>📁</div> <div data-astro-cid-aid3sr62> <strong data-astro-cid-aid3sr62>まだプロジェクトはありません</strong> <p class="muted" style="margin:.2rem 0 0" data-astro-cid-aid3sr62>事業・イベント単位でアプリと公開ページ（LP）を束ね、横断で集計・管理できます。<br data-astro-cid-aid3sr62>「＋ 新しいプロジェクト」から作成してください。</p> </div> </div>` : renderTemplate`<div class="pj-grid" data-astro-cid-aid3sr62> ${projects.map((p) => renderTemplate`<a class="pj-card"${addAttribute(`/project/${p.id}`, "href")} data-astro-reload${addAttribute(`--h:${hueOf(p)}`, "style")} data-astro-cid-aid3sr62> <div class="pj-card-accent" aria-hidden="true" data-astro-cid-aid3sr62></div> <div class="pj-card-head" data-astro-cid-aid3sr62> <span class="pj-card-ic" aria-hidden="true" data-astro-cid-aid3sr62>${p.icon || "📁"}</span> <span class="pj-card-name" data-astro-cid-aid3sr62>${p.name}</span> </div> ${p.description && renderTemplate`<p class="pj-card-desc" data-astro-cid-aid3sr62>${p.description}</p>`} <div class="pj-card-foot" data-astro-cid-aid3sr62> <span class="pj-stat" data-astro-cid-aid3sr62><b data-astro-cid-aid3sr62>${counts[p.id] ?? 0}</b> アプリ</span> <span class="pj-stat" data-astro-cid-aid3sr62><b data-astro-cid-aid3sr62>${recCounts[p.id] ?? 0}</b> 件</span> ${p.hub_enabled && renderTemplate`<span class="pj-tag" data-astro-cid-aid3sr62>公開ハブON</span>`} <span class="pj-go" data-astro-cid-aid3sr62>開く →</span> </div> </a>`)} </div>`) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/projects.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/projects.astro";
const $$url = "/projects";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Projects,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
