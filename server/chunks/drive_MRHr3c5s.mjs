globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, F as Fragment, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import { $ as $$DriveStatus } from "./DriveStatus_DTfKOXXx.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Drive = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Drive;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdmin = ses.role === "admin";
  const { cachedEntitlement } = await import("./client_F4fksau0.mjs");
  const hasPlus = atLeast(await cachedEntitlement(env), "plus");
  const { driveConnected, driveAvailable, driveStatus, listDriveFiles } = await import("./drive_BU5bDSNm.mjs");
  const q = Astro2.url.searchParams.get("q") ?? "";
  let connected = false, available = false, files = [];
  let dstat = { read: false, write: false, via: null };
  if (hasPlus) {
    connected = await driveConnected(env);
    available = await driveAvailable(env);
    dstat = await driveStatus(env).catch(() => dstat);
    files = available ? await listDriveFiles(env, q) : [];
  }
  const fmtSize = (n) => n == null ? "—" : n < 1024 ? n + "B" : n < 1048576 ? Math.round(n / 1024) + "KB" : (n / 1048576).toFixed(1) + "MB";
  const fmtDate = (s) => s ? s.slice(0, 16).replace("T", " ") : "—";
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "Google ドライブ", "active": "/drive" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>Google ドライブ</h1> ${!hasPlus && renderTemplate`<div class="card"> <div class="banner banner-warn">この機能は <strong>Plus 以上</strong>のプランで利用できます。</div> <p class="muted">ドライブ内ファイルのメタ情報を同期して検索・参照し、KV／R2 をドライブへ定期バックアップできます。</p> <a class="btn btn-primary" href="/billing">プラン・課金へ</a> </div>`}${hasPlus && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${!available && renderTemplate`<div class="banner banner-warn">まだ Google ドライブを利用できません。<a href="/settings/google-setup">Google 連携セットアップ</a> で、<strong>WIF</strong> または <strong>個人OAuth</strong> に「ドライブ」を含めて設定してください。</div>`}${available && isAdmin && renderTemplate`<div class="banner banner-info" style="font-size:.85rem">取り込み・書き込みは <strong>WIF（ドライブのスコープ承認）</strong> または <strong>個人OAuth（ドライブを選択）</strong> で使えます。設定は <a href="/settings/google-setup">Google 連携セットアップ</a> から。</div>`}<div class="card"> ${renderComponent($$result3, "DriveStatus", $$DriveStatus, { "status": dstat })} ${isAdmin && available && renderTemplate`<div class="row"><button class="btn btn-primary" id="sync">メタ情報を同期</button></div>`} ${isAdmin && !available && renderTemplate`<a class="btn btn-primary" href="/settings/google-setup">設定へ進む</a>`} ${!isAdmin && renderTemplate`<p class="muted">連携・同期の操作は管理者のみ可能です。</p>`} </div> ${connected && isAdmin && renderTemplate`<div class="banner banner-info" style="font-size:.85rem">Google ドライブへの自動バックアップ（全データのアーカイブ／ファイルの増分）は <a href="/backup">バックアップ</a> ページにまとめました。</div>`}${available && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate` <h2>ドライブ内ファイル（メタ情報）</h2> <form method="get" class="row" style="margin-bottom:.5rem"> <input name="q"${addAttribute(q, "value")} placeholder="ファイル名で検索"> <button class="btn" type="submit" style="flex:0 0 auto">検索</button> </form> <div class="table-wrap"><table> <thead><tr><th>名前</th><th>種類</th><th>サイズ</th><th>更新</th></tr></thead> <tbody> ${files.map((f) => renderTemplate`<tr><td>${f.name}</td><td class="muted" style="font-size:.8rem">${f.mime ?? "—"}</td><td>${fmtSize(f.size)}</td><td>${fmtDate(f.modified)}</td></tr>`)} ${files.length === 0 && renderTemplate`<tr><td colspan="4" class="muted">${q ? "該当なし" : "未同期です。「メタ情報を同期」を実行してください。"}</td></tr>`} </tbody> </table></div> ` })}`}` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    const sync = document.getElementById("sync");\n    if (sync) sync.addEventListener("click", async (e) => {\n      const r = await window.bo.api("/api/drive", { _action: "sync" }, { btn: e.currentTarget, successMsg: null });\n      if (r.ok) { window.bo.toast((r.data.synced ?? 0) + " 件を同期しました"); setTimeout(() => location.reload(), 800); }\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/drive.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/drive.astro";
const $$url = "/drive";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Drive,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
