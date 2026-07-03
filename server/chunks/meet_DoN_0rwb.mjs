globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, F as Fragment } from "./sequence_BESBTeYg.mjs";
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
const $$Meet = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Meet;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdmin = ses.role === "admin";
  const { cachedEntitlement } = await import("./client_F4fksau0.mjs");
  const hasPro = atLeast(await cachedEntitlement(env), "pro");
  const { googleConfigured, googleStatus } = await import("./google_DFar0IbF.mjs");
  const { linkLabel } = await import("./conn-status_DKuiC5qX.mjs");
  let configured = false, connected = false;
  let meetGranted = false, lastUsed = null, mode = null;
  let recs = [];
  if (hasPro) {
    configured = await googleConfigured(env);
    const st = await googleStatus(env);
    connected = st.connected;
    mode = st.mode;
    meetGranted = st.groups.includes("meet");
    lastUsed = st.lastUsed;
    recs = (await env.DB.prepare("SELECT id,title,summary,actions,created_at FROM meet_records ORDER BY created_at DESC LIMIT 50").all()).results;
  }
  const fmtDate = (s) => new Date(s * 1e3).toISOString().slice(0, 16).replace("T", " ");
  const parseActions = (s) => {
    try {
      const v = JSON.parse(s ?? "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "Meet議事録", "active": "/meet" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>Google Meet 議事録（会議後処理）</h1> ${!hasPro && renderTemplate`<div class="card"> <div class="banner banner-warn">この機能は <strong>Pro 以上</strong>のプランで利用できます。</div> <p class="muted">会議後に Google Meet のトランスクリプトから議事録要約を作成し、ナレッジ保存・タスク化します（リアルタイム参加はしません）。</p> <a class="btn btn-primary" href="/billing">プラン・課金へ</a> </div>`}${hasPro && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${!configured && renderTemplate`<div class="banner banner-warn">Google との連携が未設定のため利用できません。${isAdmin ? renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate`管理者は <a href="/settings/google-setup">Google との連携</a> から設定できます。` })}` : "管理者にご確認ください。"}</div>`}<div class="card"> <p>Meet 連携：<span class="pill">${linkLabel(meetGranted)}</span> ${connected && lastUsed && renderTemplate`<span class="muted" style="font-size:.8rem">最終利用：${fmtDate(lastUsed)} UTC</span>`}</p> <p class="muted" style="font-size:.85rem">Meet 会議の発行にはカレンダー権限も必要です（同時に要求します）。</p> ${isAdmin && configured && renderTemplate`<div class="row"> ${mode === "sa" ? renderTemplate`<a class="btn btn-primary" href="/settings/google-setup">${meetGranted ? "連携設定を開く" : "連携設定でMeetを有効化"}</a>` : renderTemplate`<a class="btn btn-primary" href="/api/google/start?groups=meet,calendar">${meetGranted ? "再連携" : "Meet を連携"}</a>`} ${connected && renderTemplate`<button class="btn" id="gdisc">連携を全解除</button>`} </div>`} ${!isAdmin && renderTemplate`<p class="muted">連携・解除の操作は管理者のみ可能です。</p>`} </div> ${connected && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate` <div class="card"> <p class="muted">AIチャットに「最近の会議を一覧して」「この会議を要約して議事録にして」と依頼すると、トランスクリプトから議事録を作成し、ナレッジ保存とアクションのリマインダ登録を行います。<br>※ 取得できるのは Meet の<strong>文字起こしが有効</strong>な会議のみです。</p> </div> <h2>作成済みの議事録</h2> ${recs.length === 0 && renderTemplate`<div class="card muted">まだ議事録はありません。会議後に AIチャットから要約を依頼してください。</div>`}${recs.map((r) => renderTemplate`<div class="card"> <strong>${r.title ?? "(無題)"}</strong> <span class="muted" style="font-size:.75rem">${fmtDate(r.created_at)}</span> <pre style="white-space:pre-wrap;font-size:.85rem">${(r.summary ?? "").slice(0, 1200)}</pre> ${parseActions(r.actions).length > 0 && renderTemplate`<details> <summary class="muted" style="font-size:.8rem">アクションアイテム（${parseActions(r.actions).length}）</summary> <ul>${parseActions(r.actions).map((a) => renderTemplate`<li>${a.content}${a.due ? `（期限 ${a.due}）` : ""}</li>`)}</ul> </details>`} </div>`)}` })}`}` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    const d = document.getElementById("gdisc");\n    if (d) d.addEventListener("click", async (e) => {\n      const r = await window.bo.api("/api/google", { _action: "disconnect" }, { btn: e.currentTarget, successMsg: "連携を解除しました" });\n      if (r.ok) setTimeout(() => location.reload(), 600);\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/meet.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/meet.astro";
const $$url = "/meet";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Meet,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
