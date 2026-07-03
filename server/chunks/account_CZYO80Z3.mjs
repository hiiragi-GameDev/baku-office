globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import { getSession } from "./auth_DL5yvmzT.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Account = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Account;
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  let leaveRequested = false;
  if (ses.ctx === "org" && ses.uid !== "org") {
    const r = await env.DB.prepare("SELECT leave_requested_at AS t FROM users WHERE id=?").bind(ses.uid).first();
    leaveRequested = !!r?.t;
  }
  const canLeave = ses.ctx === "org" && ses.uid !== "org";
  const canEditProfile = ses.ctx === "personal" && ses.uid !== "org";
  const ROLE_JA = { admin: "管理者", accounting: "会計担当", clerical: "庶務", member: "メンバー", viewer: "閲覧", owner: "オーナー" };
  const roleJa = ROLE_JA[ses.role] ?? ses.role;
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "アカウント", "active": "/account" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>アカウント</h1> <div class="card"> <p style="margin:0"><strong>${ses.name ?? "（氏名未設定）"}</strong> <span class="muted">${roleJa}・${ses.ctx === "org" ? "組織" : "個人"}</span></p> </div> ${canEditProfile && renderTemplate`<div class="card" style="margin-top:1rem"> <h2 style="font-size:1.05rem">お名前の変更</h2> <div class="field"><label for="ac-name">お名前<input id="ac-name"${addAttribute(ses.name ?? "", "value")} placeholder="例：山田 太郎"></label></div> <button class="btn btn-primary btn-sm" id="ac-name-save">名前を保存</button> <p class="muted" style="font-size:.82rem;margin-top:.5rem">変更後、表示に反映するには一度ログインし直してください。</p> </div>`}${canEditProfile && renderTemplate`<div class="card" style="margin-top:1rem"> <h2 style="font-size:1.05rem">パスワードの変更</h2> <div class="field"><label for="ac-cur">現在のパスワード<input id="ac-cur" type="password" autocomplete="current-password"></label></div> <div class="field"><label for="ac-new">新しいパスワード（8文字以上）<input id="ac-new" type="password" autocomplete="new-password"></label></div> <button class="btn btn-primary btn-sm" id="ac-pw-save">パスワードを変更</button> <p class="muted" style="font-size:.82rem;margin-top:.5rem">パスワードログイン（ID/パスワード）のアカウントのみ変更できます。</p> </div>`}${canLeave && renderTemplate`<div class="card" style="margin-top:1rem"> <h2 style="font-size:1.05rem">退会（アカウントの無効化）</h2> <p class="muted">退会を申請すると管理者の承認後にアカウントが無効化されます。会計・名簿などの業務データは団体に帰属するため削除されません。</p> ${leaveRequested ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`<p>現在、脱退を申請中です（管理者の承認待ち）。</p><button class="btn btn-sm" id="cancelLeave">申請を取り消す</button>` })}` : renderTemplate`<button class="btn btn-sm btn-danger" id="reqLeave">退会を申請する</button>`} <div class="muted" id="leaveMsg" role="status" aria-live="polite" style="margin-top:8px"></div> </div>`}<div class="card" style="margin-top:1rem"> <h2 style="font-size:1rem;margin:0 0 .4rem">通知（この端末）</h2> <p class="muted" style="font-size:.86rem;margin:0 0 .6rem">この端末（ブラウザ/ホーム画面アプリ）でお知らせをプッシュ通知で受け取れます。</p> <button class="btn btn-sm" id="push-enable" type="button">この端末で通知を受け取る</button> <span class="muted" id="push-msg" style="margin-left:8px;font-size:.85rem"></span> </div>   `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    // Web Push 購読（B9）：許可を取り、購読を /api/push に登録する。\n    (function () {\n      const btn = document.getElementById("push-enable");\n      const msg = document.getElementById("push-msg");\n      if (!btn) return;\n      if (!("serviceWorker" in navigator) || !("PushManager" in window)) { btn.disabled = true; msg.textContent = "この端末は通知に対応していません。"; return; }\n      const urlB64ToU8 = (s) => { const pad = "=".repeat((4 - (s.length % 4)) % 4); const b = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/")); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };\n      btn.addEventListener("click", async () => {\n        btn.disabled = true; msg.textContent = "設定中…";\n        try {\n          const perm = await Notification.requestPermission();\n          if (perm !== "granted") { msg.textContent = "通知が許可されませんでした。"; btn.disabled = false; return; }\n          const reg = await navigator.serviceWorker.ready;\n          const keyRes = await (await fetch("/api/push")).json();\n          const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToU8(keyRes.publicKey) });\n          const j = sub.toJSON();\n          const r = await fetch("/api/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: j.endpoint, keys: j.keys }) });\n          msg.textContent = r.ok ? "この端末で通知を受け取ります。" : "登録に失敗しました。";\n        } catch (e) { msg.textContent = "設定に失敗しました：" + (e && e.message ? e.message : e); }\n        btn.disabled = false;\n      });\n    })();\n  <\/script><script data-astro-rerun>\n    const nameSave = document.getElementById("ac-name-save");\n    if (nameSave) nameSave.addEventListener("click", async (e) => {\n      const name = document.getElementById("ac-name").value.trim();\n      if (!name) { window.bo.toast("お名前を入力してください", "err"); return; }\n      await window.bo.api("/api/me/profile", { _action: "name", name }, { btn: e.currentTarget, successMsg: "お名前を保存しました" });\n    });\n    const pwSave = document.getElementById("ac-pw-save");\n    if (pwSave) pwSave.addEventListener("click", async (e) => {\n      const current = document.getElementById("ac-cur").value;\n      const next = document.getElementById("ac-new").value;\n      if (!current || !next) { window.bo.toast("現在と新しいパスワードを入力してください", "err"); return; }\n      const r = await window.bo.api("/api/me/profile", { _action: "password", current, next }, { btn: e.currentTarget, successMsg: "パスワードを変更しました" });\n      if (r.ok) { document.getElementById("ac-cur").value = ""; document.getElementById("ac-new").value = ""; }\n    });\n    const req = document.getElementById("reqLeave");\n    const cancel = document.getElementById("cancelLeave");\n    const msg = document.getElementById("leaveMsg");\n    if (req) req.addEventListener("click", async (e) => {\n      if (!confirm("退会を申請します。よろしいですか？")) return;\n      const r = await window.bo.api("/api/me/leave-request", {}, { btn: e.currentTarget, successMsg: null });\n      if (r.ok) { window.bo.toast("退会を申請しました"); setTimeout(() => location.reload(), 600); }\n      else if (msg) msg.textContent = (r.data && r.data.error) || "申請に失敗しました。";\n    });\n    if (cancel) cancel.addEventListener("click", async (e) => {\n      const r = await window.bo.api("/api/me/leave-request", null, { method: "DELETE", btn: e.currentTarget, successMsg: null });\n      if (r.ok) { window.bo.toast("申請を取り消しました"); setTimeout(() => location.reload(), 600); }\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/account.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/account.astro";
const $$url = "/account";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Account,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
