globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Diagnostics = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Diagnostics;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const { recentDiagnostics, hasRecentLimitError } = await import("./diag_CY3PJnOM.mjs");
  const { listReplies } = await import("./reports_CwNccJnM.mjs");
  const diags = await recentDiagnostics(env);
  const limit = await hasRecentLimitError(env);
  const replies = await listReplies(env).catch(() => []);
  const t = (s) => new Date(s * 1e3).toISOString().slice(0, 16).replace("T", " ");
  const { detectProfile } = await import("./profiles_D3vLhBYo.mjs");
  const prof = detectProfile(env);
  const hasError = diags.some((d) => d.level === "error");
  const status = prof.keyStore === "missing-prod" ? "要対応" : hasError || limit ? "注意が必要です" : "正常に動作しています";
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "診断・サポート", "active": "/diagnostics" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>診断・サポート</h1> <div class="card"> <p style="margin:0">いまの状態：<strong>${status}</strong></p> ${status === "注意が必要です" && renderTemplate`<p class="muted" style="margin:.4rem 0 0">直近にエラーの記録があります。下の一覧をご確認ください。対応可能なものは自動でサポートへ報告されます。</p>`} <details class="adv" style="margin-top:.6rem"> <summary>技術的な構成（くわしく）</summary> <p class="adv-note">システムの内部構成です。通常は確認の必要はありません。</p> <p>Profile <strong>${prof.label}</strong>／AI=<strong>${prof.ai === "local" ? "ローカルLLM" : "クラウド"}</strong>／ストレージ=<strong>${prof.storage.toUpperCase()}</strong>／鍵=<strong>${prof.keyStore === "secret" ? "Worker Secret" : prof.keyStore === "missing-prod" ? "未設定（本番・暗号処理ブロック中）" : "KV自動生成（要対応）"}</strong></p> ${prof.keyStore === "missing-prod" && renderTemplate`<div class="banner banner-danger"><strong>MASTER_KEY が本番で未設定です。</strong>暗号処理（APIキー/PII/ファイル）はブロック中で正常動作しません。<code>wrangler secret put MASTER_KEY --env production</code> で投入してください。</div>`} ${prof.keyStore === "kv-autogen" && renderTemplate`<div class="banner banner-warn">MASTER_KEY が Worker Secret 未設定です。本番は <code>wrangler secret put MASTER_KEY</code> を推奨（鍵と暗号文の同居回避）。</div>`} </details> </div> ${limit && renderTemplate`<div class="banner banner-warn">直近に処理が混み合った記録があります。重い処理を安定させたい場合は <a href="/settings/advanced">設定 → 高度なオプション</a> をご確認ください（管理者向け）。</div>`}<div class="table-wrap"><table><thead><tr><th>日時</th><th>区分</th><th>レベル</th><th>内容</th></tr></thead><tbody> ${diags.map((d) => renderTemplate`<tr><td>${t(d.created_at)}</td><td><span class="pill"${addAttribute(d.category === "limit" ? "background:#fee2e2;color:#b91c1c" : "", "style")}${addAttribute(d.category === "limit" ? "区分: 上限到達" : `区分: ${d.category}`, "aria-label")}>${d.category === "limit" ? "" : ""}${d.category}</span></td><td>${d.level}</td><td>${d.message}</td></tr>`)} ${diags.length === 0 && renderTemplate`<tr><td colspan="4" class="muted">記録はありません（正常）。</td></tr>`} </tbody></table></div> <p class="muted" style="margin-top:1rem">エラーは自動でサポート（ホスト）へ報告され、クラウドで対応可能なものは修正されます。本文に個人情報は含めません（PIIなし）。</p> <h2 style="margin-top:1.5rem">不具合・要望のリクエスト</h2> <p class="muted">不具合や「こうしてほしい」をサポートへ送れます。クラウドで対応できるものは自動で修正され、対応状況は下に表示されます。</p> <div class="card"> <div class="field"><label>件名（任意）<input id="fb-title" placeholder="例：会計のCSV取込でエラー"></label></div> <div class="field"><label>内容<textarea id="fb-msg" rows="4" placeholder="状況・再現手順・要望などをご記入ください（個人情報は書かないでください）"></textarea></label></div> <button class="btn btn-primary" id="fb-send">送信する</button> </div> ${replies.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h2 style="margin-top:1.5rem">サポートからの対応</h2> <div class="table-wrap"><table><thead><tr><th>日時</th><th>種別</th><th>件名</th><th>状況</th><th>対応メモ</th></tr></thead><tbody> ${replies.map((r) => renderTemplate`<tr> <td>${t(r.received_at)}</td> <td>${r.kind === "error" ? "エラー" : "要望"}</td> <td>${r.title ?? "—"}</td> <td><span class="pill"${addAttribute(r.status === "resolved" ? "background:#dcfce7;color:#166534" : "background:#f3f4f6;color:#374151", "style")}${addAttribute(`状態: ${r.status === "resolved" ? "修正済み" : r.status === "wontfix" ? "見送り" : r.status}`, "aria-label")}>${r.status === "resolved" ? "✓ 修正済み" : r.status === "wontfix" ? "見送り" : r.status}</span></td> <td>${r.resolution ?? "—"}${r.pr_url && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate` <a${addAttribute(r.pr_url, "href")} target="_blank" rel="noreferrer">変更内容</a>` })}`}</td> </tr>`)} </tbody></table></div> ` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    document.getElementById("fb-send")?.addEventListener("click", async (e) => {\n      const title = document.getElementById("fb-title").value.trim();\n      const message = document.getElementById("fb-msg").value.trim();\n      if (!message) { window.bo.toast("内容を入力してください", "err"); return; }\n      const r = await window.bo.api("/api/report", { title, message }, { btn: e.currentTarget, successMsg: "送信しました。ありがとうございます。" });\n      if (r.ok) { document.getElementById("fb-title").value = ""; document.getElementById("fb-msg").value = ""; }\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/diagnostics.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/diagnostics.astro";
const $$url = "/diagnostics";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Diagnostics,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
