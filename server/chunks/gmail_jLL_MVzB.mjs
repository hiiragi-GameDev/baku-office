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
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Gmail = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Gmail;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdmin = ses.role === "admin";
  const { cachedEntitlement } = await import("./client_F4fksau0.mjs");
  const hasPro = atLeast(await cachedEntitlement(env), "pro");
  const { googleConfigured, googleStatus, SCOPE_GROUPS } = await import("./google_DFar0IbF.mjs");
  const { linkLabel } = await import("./conn-status_DKuiC5qX.mjs");
  let configured = false, connected = false;
  let granted = [];
  let lastUsed = null;
  let mode = null;
  if (hasPro) {
    configured = await googleConfigured(env);
    const st = await googleStatus(env);
    connected = st.connected;
    granted = st.groups;
    lastUsed = st.lastUsed;
    mode = st.mode;
  }
  const fmtTs = (s) => s ? new Date(s * 1e3).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—";
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "Gmail", "active": "/gmail" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>Gmail 連携</h1> ${!hasPro && renderTemplate`<div class="card"> <div class="banner banner-warn">この機能は <strong>Pro 以上</strong>のプランで利用できます。</div> <p class="muted">Gmail のメールを一覧・検索・閲覧・送信できます。AIチャットから操作します。</p> <a class="btn btn-primary" href="/billing">プラン・課金へ</a> </div>`}${hasPro && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${!configured && renderTemplate`<div class="banner banner-warn">Google との連携が未設定のため利用できません。${isAdmin ? renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate`管理者は <a href="/settings/google-setup">Google との連携</a> から設定できます。` })}` : "管理者にご確認ください。"}</div>`}<div class="card"> ${(() => {
    const linked = granted.includes("gmail_read") || granted.includes("gmail_send");
    return renderTemplate`<p>Gmail 連携：<span class="pill"${addAttribute(linkLabel(linked), "aria-label")}>${linkLabel(linked)}</span></p>`;
  })()} <p class="muted" style="font-size:.85rem">Gmail の <strong>閲覧</strong>と<strong>送信</strong>は機微な権限のため、既定では付与されず、明示的に有効化したときのみ要求します。${connected && renderTemplate`<span> 最終利用：${fmtTs(lastUsed)}</span>`}</p> ${connected && renderTemplate`<p class="muted" style="font-size:.8rem">付与済み：${granted.length ? granted.map((g) => SCOPE_GROUPS[g]?.label).join(" / ") : "（不明）"}</p>`}  <div class="banner banner-warn" style="margin-top:.5rem"> <strong>連携前にご確認ください</strong> <ul style="margin:.4rem 0 0;padding-left:1.2rem;font-size:.85rem"> <li>アクセス範囲：${SCOPE_GROUPS.gmail_read.risk}</li> <li>送信を含める場合：${SCOPE_GROUPS.gmail_send.risk}</li> <li>外部送信：閲覧/送信の操作時、対象メール本文・添付・付帯情報が Google のサービス（米国等・越境の可能性）へ送信されます。AIに依頼した場合は要約等のため外部のAIサービスにも送信され得ます。</li> <li>費用：Gmail との連携自体は無料の範囲内。AI処理を伴う場合は <a href="/usage">利用状況・上限</a> の従量・上限が適用されます。</li> <li>保存・削除：取得データの扱いは <a href="/legal">外部送信・AI利用の開示</a> を参照。連携は下の「全解除」でいつでも失効できます。</li> </ul> <p class="muted" style="font-size:.8rem;margin:.4rem 0 0">Google ユーザーデータの利用は Google API Services User Data Policy（Limited Use 要件含む）に準拠します。</p> </div> ${isAdmin && configured && mode === "sa" && renderTemplate`<div class="banner banner-info" style="margin-top:.5rem">
Gmail を有効にするには、<a href="/settings/google-setup">Google連携設定</a>で「<strong>Gmail 閲覧</strong>」（必要なら「Gmail 送信」）を選んで登録し、<strong>ドメイン全体の委任で Gmail のスコープを承認</strong>してください（サービスアカウント方式では、機能の有効化は設定画面に集約しています）。
${connected && renderTemplate`<div class="row" style="margin-top:.5rem"><button class="btn" id="gdisc">連携を全解除</button></div>`} </div>`} ${isAdmin && configured && mode !== "sa" && renderTemplate`<div class="row"> <a class="btn btn-primary" id="glnk-read" href="/api/google/start?groups=gmail_read">閲覧のみ連携</a> <a class="btn btn-primary" id="glnk-send" href="/api/google/start?groups=gmail_read,gmail_send">閲覧＋送信を連携</a> ${connected && renderTemplate`<button class="btn" id="gdisc">連携を全解除</button>`} </div>`} ${!isAdmin && renderTemplate`<p class="muted">連携・解除の操作は管理者のみ可能です。</p>`} </div> ${connected && renderTemplate`<div class="card"> <h2 style="margin-top:0;border:0">使い方</h2> <p class="muted">メールの確認・検索・送信は AIチャットに依頼してください。例：</p> <ul class="muted"> <li>「未読メールを一覧して」</li> <li>「山田さんからの先週のメールを探して」</li> <li>「○○さんに会議のお礼メールを送って」</li> </ul> </div>`}` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    // 機微な権限（Gmail閲覧/送信）の付与前に一段の確認＋リスク要約を表示（§高リスク設定）。\n    const gl = [\n      ["glnk-read", "Gmail の閲覧を有効化します。AIがメール本文・添付を読み取れるようになります。よろしいですか？"],\n      ["glnk-send", "Gmail の閲覧と送信を有効化します。AIがあなたの団体の代わりにメールを送信できるようになります。よろしいですか？"],\n    ];\n    for (const [id, msg] of gl) {\n      const a = document.getElementById(id);\n      if (a) a.addEventListener("click", async (e) => { e.preventDefault(); if (await window.bo.confirm(msg, { confirmLabel: "有効にする", danger: true, auditHref: "/legal" })) location.href = a.getAttribute("href"); });\n    }\n    const d = document.getElementById("gdisc");\n    if (d) d.addEventListener("click", async (e) => {\n      const r = await window.bo.api("/api/google", { _action: "disconnect" }, { btn: e.currentTarget, successMsg: "連携を解除しました" });\n      if (r.ok) setTimeout(() => location.reload(), 600);\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/gmail.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/gmail.astro";
const $$url = "/gmail";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Gmail,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
