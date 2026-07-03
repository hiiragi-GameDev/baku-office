globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, a as addAttribute, c as renderHead } from "./sequence_BESBTeYg.mjs";
import { env } from "cloudflare:workers";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Data = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Data;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const trashTx = (await env.DB.prepare("SELECT id,date,amount,description FROM transactions WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 100").all()).results;
  const trashFiles = (await env.DB.prepare("SELECT id,name,size FROM files WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 100").all()).results;
  const audit = (await env.DB.prepare("SELECT actor,action,target,timestamp FROM audit_log ORDER BY timestamp DESC LIMIT 50").all()).results;
  const t = (s) => new Date(s * 1e3).toISOString().slice(0, 16).replace("T", " ");
  return renderTemplate(_a || (_a = __template(['<html lang="ja" data-astro-cid-jgkmvpmt><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>直接DB操作 — baku-office</title>', '</head> <body data-astro-cid-jgkmvpmt> <header data-astro-cid-jgkmvpmt><a href="/" data-astro-cid-jgkmvpmt>ホーム</a><a href="/settings/members" data-astro-cid-jgkmvpmt>人・ロール管理</a><a href="/admin/data" data-astro-cid-jgkmvpmt>直接DB操作</a></header> <main data-astro-cid-jgkmvpmt> <h1 data-astro-cid-jgkmvpmt>直接DB／ストレージ操作（自己責任）</h1> <p class="muted" data-astro-cid-jgkmvpmt>削除は一旦ゴミ箱（30日保持目安）。復元・完全削除が可能。すべて監査ログに記録されます。</p> <h2 data-astro-cid-jgkmvpmt>ゴミ箱：取引</h2> <table data-astro-cid-jgkmvpmt><thead data-astro-cid-jgkmvpmt><tr data-astro-cid-jgkmvpmt><th data-astro-cid-jgkmvpmt>日付</th><th data-astro-cid-jgkmvpmt>金額</th><th data-astro-cid-jgkmvpmt>摘要</th><th data-astro-cid-jgkmvpmt>操作</th></tr></thead><tbody data-astro-cid-jgkmvpmt> ', " ", " </tbody></table> <h2 data-astro-cid-jgkmvpmt>ゴミ箱：ファイル</h2> <table data-astro-cid-jgkmvpmt><thead data-astro-cid-jgkmvpmt><tr data-astro-cid-jgkmvpmt><th data-astro-cid-jgkmvpmt>名前</th><th data-astro-cid-jgkmvpmt>サイズ</th><th data-astro-cid-jgkmvpmt>操作</th></tr></thead><tbody data-astro-cid-jgkmvpmt> ", " ", " </tbody></table> <h2 data-astro-cid-jgkmvpmt>操作監査ログ</h2> <table data-astro-cid-jgkmvpmt><thead data-astro-cid-jgkmvpmt><tr data-astro-cid-jgkmvpmt><th data-astro-cid-jgkmvpmt>日時</th><th data-astro-cid-jgkmvpmt>実行者</th><th data-astro-cid-jgkmvpmt>操作</th><th data-astro-cid-jgkmvpmt>対象</th></tr></thead><tbody data-astro-cid-jgkmvpmt> ", " ", ' </tbody></table> <script type="module">\n  const post=(b)=>fetch("/api/data",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(b)}).then(r=>r.json());\n  document.querySelectorAll("tr[data-id]").forEach(tr=>{\n    const table=tr.dataset.t,id=tr.dataset.id;\n    tr.querySelector(".restore").onclick=async()=>{await post({_action:"restore",table,id});location.reload();};\n    tr.querySelector(".purge").onclick=async()=>{if(confirm("このレコードを完全削除しますか？元に戻せません。")){await post({_action:"purge",table,id});location.reload();}};\n  });\n<\/script> </main></body></html>'])), renderHead(), trashTx.map((r) => renderTemplate`<tr data-t="transactions"${addAttribute(r.id, "data-id")} data-astro-cid-jgkmvpmt><td data-astro-cid-jgkmvpmt>${r.date}</td><td data-astro-cid-jgkmvpmt>¥${r.amount.toLocaleString("ja-JP")}</td><td data-astro-cid-jgkmvpmt>${r.description ?? ""}</td><td data-astro-cid-jgkmvpmt><button class="restore" style="background:#16a34a;color:#fff" data-astro-cid-jgkmvpmt>復元</button> <button class="purge" style="background:#ef4444;color:#fff" data-astro-cid-jgkmvpmt>完全削除</button></td></tr>`), trashTx.length === 0 && renderTemplate`<tr data-astro-cid-jgkmvpmt><td colspan="4" class="muted" data-astro-cid-jgkmvpmt>空</td></tr>`, trashFiles.map((r) => renderTemplate`<tr data-t="files"${addAttribute(r.id, "data-id")} data-astro-cid-jgkmvpmt><td data-astro-cid-jgkmvpmt>${r.name}</td><td data-astro-cid-jgkmvpmt>${r.size}B</td><td data-astro-cid-jgkmvpmt><button class="restore" style="background:#16a34a;color:#fff" data-astro-cid-jgkmvpmt>復元</button> <button class="purge" style="background:#ef4444;color:#fff" data-astro-cid-jgkmvpmt>完全削除</button></td></tr>`), trashFiles.length === 0 && renderTemplate`<tr data-astro-cid-jgkmvpmt><td colspan="3" class="muted" data-astro-cid-jgkmvpmt>空</td></tr>`, audit.map((a) => renderTemplate`<tr data-astro-cid-jgkmvpmt><td data-astro-cid-jgkmvpmt>${t(a.timestamp)}</td><td data-astro-cid-jgkmvpmt>${a.actor}</td><td data-astro-cid-jgkmvpmt>${a.action}</td><td data-astro-cid-jgkmvpmt>${a.target}</td></tr>`), audit.length === 0 && renderTemplate`<tr data-astro-cid-jgkmvpmt><td colspan="4" class="muted" data-astro-cid-jgkmvpmt>記録なし</td></tr>`);
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/admin/data.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/admin/data.astro";
const $$url = "/admin/data";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Data,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
