globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, F as Fragment, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import { $ as $$ApprovalTabs } from "./ApprovalTabs_R8DoNXyE.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Approvals = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Approvals;
  const { getSession, canAccess } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdmin = ses.role === "admin";
  const canReview = canAccess(ses.role, "review_accounting") || canAccess(ses.role, "review_documents");
  const { listApprovals, getApprovalMode } = await import("./approvals_CEi6BOlb.mjs");
  const pending = isAdmin ? await listApprovals(env, "pending") : [];
  const recent = isAdmin ? [...await listApprovals(env, "approved", 20), ...await listApprovals(env, "rejected", 20), ...await listApprovals(env, "failed", 20)].sort((a, b) => (b.decided_at ?? 0) - (a.decided_at ?? 0)).slice(0, 20) : [];
  const statusLabel = (s) => s === "approved" ? "実行済み" : s === "rejected" ? "却下" : s === "failed" ? "承認したが実行失敗" : s;
  const mode = isAdmin ? await getApprovalMode(env) : true;
  const fmt = (s) => s ? new Date(s * 1e3).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—";
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "承認待ち", "active": "/approvals" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ApprovalTabs", $$ApprovalTabs, { "active": "approvals", "showReview": canReview, "showApprovals": isAdmin })} ${maybeRenderHead()}<h1>エージェント操作の承認</h1> ${!isAdmin && renderTemplate`<div class="card"><div class="banner banner-warn">この画面は管理者のみ利用できます。</div></div>`}${isAdmin && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="card"> <p class="muted">AIエージェントの<strong>対外/破壊系の操作</strong>（メール送信・予定の変更/削除・他団体連携）は、ここで承認したときだけ実行されます（プレビュー→承認→実行）。</p> <p>承認ゲート：<span class="pill">${mode ? "ON（推奨）" : "OFF"}</span> <button class="btn btn-sm" id="toggleMode"${addAttribute(String(mode), "data-mode")}>${mode ? "OFFにする" : "ONにする"}</button></p> ${!mode && renderTemplate`<div class="banner banner-danger">承認ゲートが OFF です。対外/破壊系の操作が確認なしで実行されます。信頼できる運用でのみ OFF にしてください。</div>`} </div> <h2>承認待ち（${pending.length}）</h2> <div class="table-wrap"><table> <thead><tr><th>起案</th><th>操作</th><th>内容</th><th>アクション</th></tr></thead> <tbody> ${pending.map((a) => renderTemplate`<tr${addAttribute(a.id, "data-id")}> <td class="muted">${fmt(a.created_at)}<br>${a.owner}</td> <td><code>${a.tool}</code></td> <td style="max-width:32rem">${a.preview}</td> <td><div class="row"><button class="btn btn-sm btn-ok ap">承認して実行</button><button class="btn btn-sm btn-danger rj">却下</button></div></td> </tr>`)} ${pending.length === 0 && renderTemplate`<tr><td colspan="4" class="muted">承認待ちはありません。</td></tr>`} </tbody> </table></div> <h2>最近の判定</h2> <div class="table-wrap"><table> <thead><tr><th>判定日時</th><th>操作</th><th>内容</th><th>状態</th><th>判定者</th></tr></thead> <tbody> ${recent.map((a) => renderTemplate`<tr> <td class="muted">${fmt(a.decided_at)}</td> <td><code>${a.tool}</code></td> <td style="max-width:28rem">${a.preview}${a.status === "failed" && a.error && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate`<br><span class="muted" style="color:var(--danger,#c0392b)">失敗理由：${a.error}（再申請で再試行できます）</span>` })}`}</td> <td>${statusLabel(a.status)}</td> <td class="muted">${a.decided_by ?? ""}</td> </tr>`)} ${recent.length === 0 && renderTemplate`<tr><td colspan="5" class="muted">記録はありません。</td></tr>`} </tbody> </table></div> ` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n        (function () {\n          document.getElementById("toggleMode")?.addEventListener("click", async (e) => {\n            const on = e.currentTarget.dataset.mode !== "true";\n            const r = await window.bo.api("/api/settings", { _action: "agent_approval", on }, { btn: e.currentTarget, successMsg: "更新しました" });\n            if (r.ok) setTimeout(() => location.reload(), 500);\n          });\n          document.querySelectorAll("tr[data-id]").forEach((tr) => {\n            const id = tr.dataset.id;\n            tr.querySelector(".ap")?.addEventListener("click", async (e) => {\n              const r = await window.bo.api("/api/agent-actions", { _action: "approve", id }, { btn: e.currentTarget, successMsg: "承認して実行しました" });\n              if (r.ok) setTimeout(() => location.reload(), 600);\n            });\n            tr.querySelector(".rj")?.addEventListener("click", async (e) => {\n              if (!(await window.bo.confirm("この承認待ち操作を却下しますか？", { confirmLabel: "却下", danger: true }))) return;\n              const r = await window.bo.api("/api/agent-actions", { _action: "reject", id }, { btn: e.currentTarget, successMsg: "却下しました" });\n              if (r.ok) setTimeout(() => location.reload(), 600);\n            });\n          });\n        })();\n      <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/approvals.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/approvals.astro";
const $$url = "/approvals";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Approvals,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
