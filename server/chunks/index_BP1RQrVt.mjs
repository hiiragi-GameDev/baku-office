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
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const { listFilesForSession, storageMode } = await import("./storage_BHLYBEBb.mjs");
  const files = await listFilesForSession(env, ses);
  const mode = storageMode(env);
  const kb = (n) => n < 1024 ? n + " B" : (n / 1024).toFixed(1) + " KB";
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "ファイル", "active": "/files" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>ファイル</h1> <p class="muted">保存方法：<strong>${mode === "r2" ? "大容量に対応" : "標準（追加費用なし）"}</strong></p> <div class="card"> <label for="file">ファイルを選ぶ</label> <div class="row" style="margin-top:6px"> <input type="file" id="file" aria-label="アップロードするファイルを選ぶ"> <button class="btn btn-primary" id="up" style="flex:0 0 auto">アップロード</button> </div> <div id="fileName" class="muted" style="margin-top:6px;font-size:.85rem">選択中のファイル：なし</div> </div> <div class="table-wrap" style="margin-top:1rem"> <table> <thead><tr><th>名前</th><th>サイズ</th><th>種類</th><th>操作</th></tr></thead> <tbody> ${files.map((f) => renderTemplate`<tr${addAttribute(f.id, "data-id")}> <td>${f.name}</td><td>${kb(f.size)}</td><td>${f.mime ?? ""}</td> <td><a class="btn btn-sm"${addAttribute(`/files/${f.id}`, "href")}>ダウンロード</a> <button class="btn btn-sm btn-danger del">削除</button></td> </tr>`)} ${files.length === 0 && renderTemplate`<tr><td colspan="4" class="muted" style="text-align:center;padding:1.2rem">まだファイルがありません。上の欄からアップロードしてみましょう。</td></tr>`} </tbody> </table> </div>  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    // 選択中ファイル名を表示（選んだものが分かるように）。\n    document.getElementById("file").addEventListener("change", (e) => {\n      const f = e.target.files && e.target.files[0];\n      document.getElementById("fileName").textContent = "選択中のファイル：" + (f ? f.name : "なし");\n    });\n    document.getElementById("up").addEventListener("click", async (e) => {\n      const f = document.getElementById("file").files[0];\n      if (!f) { window.bo.toast("ファイルを選択してください", "err"); return; }\n      const btn = e.currentTarget; window.bo.busy(btn, true);\n      try {\n        const fd = new FormData(); fd.append("file", f);\n        const r = await fetch("/api/files", { method: "POST", body: fd });\n        const j = await r.json().catch(() => ({}));\n        if (!r.ok || j.error) { window.bo.toast("失敗：" + (j.error || r.status), "err"); }\n        else { window.bo.toast("アップロードしました（" + j.mode + "）"); setTimeout(() => location.reload(), 700); }\n      } finally { window.bo.busy(btn, false); }\n    });\n    document.querySelectorAll("tr[data-id] .del").forEach((b) => b.addEventListener("click", async (e) => {\n      if (!(await window.bo.confirm("このファイルをゴミ箱へ移動しますか？", { confirmLabel: "削除", danger: true, auditHref: "/diagnostics" }))) return;\n      const r = await window.bo.api("/api/files", { _action: "delete", id: e.target.closest("tr").dataset.id }, { btn: e.target, successMsg: "ゴミ箱へ移動しました" });\n      if (r.ok) setTimeout(() => location.reload(), 600);\n    }));\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/files/index.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/files/index.astro";
const $$url = "/files";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
