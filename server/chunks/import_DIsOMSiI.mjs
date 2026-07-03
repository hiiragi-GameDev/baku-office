globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, F as Fragment, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const prerender = false;
const $$Import = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Import;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdmin = ses.role === "admin";
  const { cachedEntitlement } = await import("./client_F4fksau0.mjs");
  const hasPlus = atLeast(await cachedEntitlement(env), "plus");
  const { listImported } = await import("./import_DtV2QKSa.mjs");
  const { fmtBytes } = await import("./storage-usage_CAVmHTS3.mjs");
  const r2Enabled = !!env.MEDIA_R2;
  const imported = hasPlus ? await listImported(env) : [];
  const fmt = (s) => new Date(s * 1e3).toISOString().slice(0, 10);
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "書類の取り込み", "active": "/import" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>書類の取り込み</h1> ${!hasPlus && renderTemplate`<div class="card"> <div class="banner banner-warn">この機能は <strong>Plus 以上</strong>のプランで利用できます。</div> <p class="muted">Googleドライブなどの書類を取り込みます（既定はファイル名などの情報だけ）。</p> <a class="btn btn-primary" href="/billing">プラン・お支払いへ</a> </div>`}${hasPlus && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p class="muted">既定は<strong>ファイル名などの情報だけ</strong>を取り込みます。ファイル本体も取り込むには大容量ストレージが必要です（実行前に容量・費用を見積もります）。</p> ${!isAdmin && renderTemplate`<div class="banner banner-warn">取り込みの実行は管理者のみ可能です。</div>`}<div class="card"> <div class="row"> <label style="flex:1">取り込み元
<select id="src"><option value="drive">Googleドライブ</option><option value="notion">Notion</option></select> </label> <label style="flex:1;display:flex;align-items:center;gap:6px;margin-top:1.4rem"> <input type="checkbox" id="withFiles"${addAttribute(!r2Enabled, "disabled")}> ファイルデータを全て取り込む
</label> </div> ${!r2Enabled && renderTemplate`<div class="banner banner-warn" style="margin-top:.5rem;font-size:.85rem">
「ファイルデータを全て取り込む」は、ファイルの保存先（大容量ストレージ R2）が未設定のため選べません。<br>
有効にするには <a href="/settings/advanced">設定 → 高度なオプション</a> の「ファイル保存を強化（R2・高度モード）」で R2 を登録してください（手順を案内しています）。設定後は自動で選べるようになります。なお<strong>情報だけの取り込み</strong>は R2 がなくても利用できます。
</div>`} <div class="muted" style="font-size:.82rem;margin-top:6px">
取り込み元の準備：<a href="/drive">Googleドライブを連携・同期</a>（管理者）／<a href="/settings/keys">Notion トークンを登録</a>。準備が済むとここで取り込めます。Notion はページ情報の取り込みに対応します。
</div> <div class="row" style="margin-top:.5rem"> <button class="btn" id="sim">① 容量・費用を見積もる</button> ${isAdmin && renderTemplate`<button class="btn btn-primary" id="run" disabled title="先に「① 容量・費用を見積もる」を押すと、このボタンで取り込めるようになります">② この内容で取り込む</button>`} </div> ${isAdmin && renderTemplate`<div id="runhint" class="muted" style="font-size:.82rem;margin-top:6px">まず「① 容量・費用を見積もる」を押してください。見積りが出ると「② この内容で取り込む」が押せるようになります。</div>`} <div id="simout" class="banner banner-info" hidden style="margin-top:.6rem;white-space:pre-wrap"></div> </div> <h2>取り込み済み</h2> <div class="table-wrap"><table> <thead><tr><th>タイトル</th><th>取り込み元</th><th>種類</th><th>サイズ</th><th>取り込み方</th><th>取込日</th></tr></thead> <tbody> ${imported.map((it) => renderTemplate`<tr><td>${it.title}</td><td>${it.source}</td><td class="muted" style="font-size:.85rem">${it.mime ?? "—"}</td><td>${it.size ? fmtBytes(it.size) : "—"}</td><td>${it.file_id ? "ファイルごと" : "情報だけ"}</td><td class="muted">${fmt(it.imported_at)}</td></tr>`)} ${imported.length === 0 && renderTemplate`<tr><td colspan="6" class="muted">まだ取り込みがありません。</td></tr>`} </tbody> </table></div> ` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n        const out = document.getElementById("simout");\n        const runBtn = document.getElementById("run");\n        const body = () => ({ source: document.getElementById("src").value, withFiles: document.getElementById("withFiles").checked });\n        const yen = (n) => "¥" + (n || 0).toLocaleString("ja-JP");\n        const mb = (n) => (n / 1048576).toFixed(1) + "MB";\n        document.getElementById("sim")?.addEventListener("click", async (e) => {\n          const r = await window.bo.api("/api/import", { _action: "simulate", ...body() }, { btn: e.currentTarget, successMsg: null });\n          if (!r.ok) return;\n          const d = r.data;\n          out.hidden = false;\n          out.textContent =\n            "対象：" + d.count + " 件\\n" +\n            "情報の増加：約 " + mb(d.metaBytes) + (d.d1Over ? "  容量の上限を超える恐れ" : "") + "\\n" +\n            "ファイルそのもの：" + (d.withFiles && d.r2Enabled ? "約 " + mb(d.binaryBytes) + " / 概算 " + yen(d.r2CostYen) + "/月" + (d.r2Over ? "  容量の上限を超える恐れ" : "") : "取り込まない（情報だけ）") + "\\n\\n" +\n            "対策：\\n- " + (d.advice || []).join("\\n- ");\n          if (runBtn) {\n            runBtn.disabled = false;\n            runBtn.title = "";\n            const hint = document.getElementById("runhint");\n            if (hint) hint.textContent = "見積りが出ました。問題なければ「② この内容で取り込む」を押してください。";\n            window.bo.toast("見積りが出ました。下の「② この内容で取り込む」で実行できます。", "info");\n          }\n        });\n        if (runBtn) runBtn.addEventListener("click", async (e) => {\n          if (!(await window.bo.confirm("この内容で取り込みますか？", { confirmLabel: "取り込む" }))) return;\n          const r = await window.bo.api("/api/import", { _action: "run", ...body() }, { btn: e.currentTarget, successMsg: null });\n          if (r.ok) { window.bo.toast(r.data.imported + " 件取り込みました（ファイル " + r.data.files + " 件）"); setTimeout(() => location.reload(), 1000); }\n        });\n      <\/script>'], ['<script data-astro-rerun>\n        const out = document.getElementById("simout");\n        const runBtn = document.getElementById("run");\n        const body = () => ({ source: document.getElementById("src").value, withFiles: document.getElementById("withFiles").checked });\n        const yen = (n) => "¥" + (n || 0).toLocaleString("ja-JP");\n        const mb = (n) => (n / 1048576).toFixed(1) + "MB";\n        document.getElementById("sim")?.addEventListener("click", async (e) => {\n          const r = await window.bo.api("/api/import", { _action: "simulate", ...body() }, { btn: e.currentTarget, successMsg: null });\n          if (!r.ok) return;\n          const d = r.data;\n          out.hidden = false;\n          out.textContent =\n            "対象：" + d.count + " 件\\\\n" +\n            "情報の増加：約 " + mb(d.metaBytes) + (d.d1Over ? "  容量の上限を超える恐れ" : "") + "\\\\n" +\n            "ファイルそのもの：" + (d.withFiles && d.r2Enabled ? "約 " + mb(d.binaryBytes) + " / 概算 " + yen(d.r2CostYen) + "/月" + (d.r2Over ? "  容量の上限を超える恐れ" : "") : "取り込まない（情報だけ）") + "\\\\n\\\\n" +\n            "対策：\\\\n- " + (d.advice || []).join("\\\\n- ");\n          if (runBtn) {\n            runBtn.disabled = false;\n            runBtn.title = "";\n            const hint = document.getElementById("runhint");\n            if (hint) hint.textContent = "見積りが出ました。問題なければ「② この内容で取り込む」を押してください。";\n            window.bo.toast("見積りが出ました。下の「② この内容で取り込む」で実行できます。", "info");\n          }\n        });\n        if (runBtn) runBtn.addEventListener("click", async (e) => {\n          if (!(await window.bo.confirm("この内容で取り込みますか？", { confirmLabel: "取り込む" }))) return;\n          const r = await window.bo.api("/api/import", { _action: "run", ...body() }, { btn: e.currentTarget, successMsg: null });\n          if (r.ok) { window.bo.toast(r.data.imported + " 件取り込みました（ファイル " + r.data.files + " 件）"); setTimeout(() => location.reload(), 1000); }\n        });\n      <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/import.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/import.astro";
const $$url = "/import";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Import,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
