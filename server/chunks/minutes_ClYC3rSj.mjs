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
const $$Minutes = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Minutes;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const { results } = await env.DB.prepare("SELECT id,title,body,created_at FROM knowledge WHERE tags='議事録' AND deleted_at IS NULL ORDER BY created_at DESC").all();
  const d = (s) => new Date(s * 1e3).toISOString().slice(0, 10);
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "議事録", "active": "/minutes" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>議事録</h1> <p class="muted">関連：<a href="/meet">Meet（自動議事録）</a>／ここでは手入力の議事録を管理します。</p> <div class="card"> <div class="field"><label for="title">タイトル</label><input id="title" placeholder="例：6月定例会"></div> <div class="field"><label for="body">本文・決定事項</label><textarea id="body" rows="4" placeholder="話し合った内容や決まったことを書きます"></textarea></div> <button class="btn btn-primary" id="add">保存</button> </div> <div style="margin-top:1rem"> ${results.map((r) => renderTemplate`<div class="card"${addAttribute(r.id, "data-id")} style="margin-bottom:.6rem"><div style="display:flex;justify-content:space-between;gap:8px"><strong>${r.title}</strong><span style="flex:0 0 auto;display:flex;gap:6px"><button class="btn btn-sm edit">編集</button><button class="btn btn-sm btn-danger del">削除</button></span></div><div class="muted">${d(r.created_at)}</div><p class="m-body" style="white-space:pre-wrap">${r.body}</p><div class="m-edit" hidden style="margin-top:.5rem"><div class="field"><label>タイトル<input class="e-title"${addAttribute(r.title, "value")}></label></div><div class="field"><label>本文・決定事項<textarea class="e-body" rows="4">${r.body}</textarea></label></div><button class="btn btn-primary btn-sm save">保存</button> <button class="btn btn-sm cancel" type="button">やめる</button></div></div>`)} ${results.length === 0 && renderTemplate`<p class="muted" style="text-align:center;padding:1.2rem">まだ議事録がありません。上の欄から最初の議事録を作成してみましょう。</p>`} </div>  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    const P=(b,btn,msg)=>window.bo.api("/api/docs",{kind:"minutes",...b},{btn,successMsg:msg});\n    document.getElementById("add").addEventListener("click",async(e)=>{const t=document.getElementById("title").value;if(!t){window.bo.toast("タイトルを入力してください","err");return;}const r=await P({title:t,body:document.getElementById("body").value},e.currentTarget,"保存しました");if(r.ok)setTimeout(()=>location.reload(),500);});\n    document.querySelectorAll("[data-id] .del").forEach(b=>b.addEventListener("click",async(e)=>{if(!(await window.bo.confirm("この議事録を削除しますか？",{confirmLabel:"削除",danger:true,irreversible:true})))return;const r=await P({_action:"delete",id:e.target.closest("[data-id]").dataset.id},e.target);if(r.ok)setTimeout(()=>location.reload(),400);}));\n    document.querySelectorAll("[data-id] .edit").forEach(b=>b.addEventListener("click",(e)=>{e.target.closest("[data-id]").querySelector(".m-edit").hidden=false;}));\n    document.querySelectorAll("[data-id] .cancel").forEach(b=>b.addEventListener("click",(e)=>{e.target.closest("[data-id]").querySelector(".m-edit").hidden=true;}));\n    document.querySelectorAll("[data-id] .save").forEach(b=>b.addEventListener("click",async(e)=>{const c=e.target.closest("[data-id]");const t=c.querySelector(".e-title").value;if(!t){window.bo.toast("タイトルを入力してください","err");return;}const r=await P({_action:"update",id:c.dataset.id,title:t,body:c.querySelector(".e-body").value},e.target,"更新しました");if(r.ok)setTimeout(()=>location.reload(),400);}));\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/minutes.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/minutes.astro";
const $$url = "/minutes";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Minutes,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
