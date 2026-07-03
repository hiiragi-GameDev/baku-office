globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, a as addAttribute, m as maybeRenderHead, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Legal = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Legal;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdmin = ses.role === "admin";
  const { buildDisclosure } = await import("./disclosure_Cv_kPxVT.mjs");
  const d = await buildDisclosure(env);
  const retentionText = d.retentionDays > 0 ? `${d.retentionDays}日（経過後は自動で物理削除）` : "無期限（手動削除まで保持）";
  const { buildLegalTemplates } = await import("./legal-templates_DcdGoCNh.mjs");
  const tpl = isAdmin ? await buildLegalTemplates(env) : null;
  const plain = [
    "【外部送信・AI利用・保存期間・削除方法のお知らせ】",
    "",
    "■ 外部送信先（現在の連携設定に基づく）",
    ...d.destinations.map((x) => `・${x.name}
  目的：${x.purpose}
  送信され得るデータ：${x.dataKinds}
  主な所在地：${x.region}${x.note ? `
  注意：${x.note}` : ""}`),
    "",
    "■ AI利用について",
    "・入力された内容は上記のAI提供元へ送信され、応答生成に利用されます。個人情報の入力可否は各団体の利用目的・同意の範囲で判断してください。",
    "",
    "■ ファイルの保存と暗号化",
    "・アップロードされたファイル本体は保存時に暗号化（AES-GCM）されます。",
    `・保持期間：${retentionText}`,
    "",
    "■ 削除方法",
    "・各画面から該当データを削除できます。ファイルは保持期間経過後に自動削除されます。削除のご依頼は管理者へご連絡ください。",
    "",
    "■ 責任の範囲（提供者／利用者／ご自身のAI契約）",
    d.responsibilityNote,
    ...d.limitedUse ? ["", "■ Google ユーザーデータの限定利用（Limited Use）", d.limitedUse] : [],
    "",
    d.generatedNote
  ].join("\n");
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "外部送信・AI利用の開示", "active": "/legal" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>外部送信・AI利用・保存期間・削除方法</h1> <div class="banner banner-warn">本ページは現在の連携設定から<strong>自動生成</strong>した開示素材です。法的有効性は専門家（弁護士等）のレビューを推奨します。</div> <h2>外部送信先一覧</h2> <div class="table-wrap"><table> <thead><tr><th>送信先</th><th>目的</th><th>送信され得るデータ</th><th>主な所在地</th></tr></thead> <tbody> ${d.destinations.map((x) => renderTemplate`<tr><td><strong>${x.name}</strong>${x.note && renderTemplate`<div class="muted" style="font-size:.8rem">${x.note}</div>`}</td><td>${x.purpose}</td><td>${x.dataKinds}</td><td>${x.region}</td></tr>`)} </tbody> </table></div> <p class="muted">${d.generatedNote}</p> <h2>責任の範囲（提供者／利用者／ご自身のAI契約）</h2> <div class="card"><ul style="margin:0"> ${d.responsibilityNote.split("\n").map((line) => renderTemplate`<li>${line.replace(/^・/, "")}</li>`)} </ul></div> ${d.limitedUse && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h2>Google ユーザーデータの限定利用（Limited Use）</h2> <div class="card"> <p class="muted" style="font-size:.85rem">Gmail 等との連携を利用中のため、Google の利用者データ方針（Google API Services User Data Policy）に基づく開示を表示しています。</p> <ul style="margin:0"> ${d.limitedUse.split("\n").slice(1).map((line) => renderTemplate`<li>${line.replace(/^・/, "")}</li>`)} </ul> <p class="muted" style="font-size:.8rem;margin-top:.4rem"><a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a></p> </div> ` })}`}<h2>AI利用・保存・削除</h2> <div class="card"> <ul> <li>入力内容は上記のAI提供元へ送信され、応答生成に利用されます。</li> <li>ファイル本体は保存時暗号化（AES-GCM）。${d.encryptedAtRest ? "" : "（未適用）"}</li> <li>ファイルの保持期間：<strong>${retentionText}</strong>（変更は使用量・上限画面）。</li> <li>削除：各画面から削除できます。保持期間経過後は自動削除されます。</li> </ul> </div> ${isAdmin && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h2>プライバシーポリシーへの転記用テキスト</h2> <p class="muted">以下を自社のプライバシーポリシー・利用者向け説明にコピーしてご利用ください（要・専門家確認）。</p> <textarea id="plain" readonly rows="16" style="width:100%;font-family:monospace;font-size:.8rem">${plain}</textarea> <button class="btn btn-primary" id="copy" style="margin-top:.5rem">コピー</button> ${tpl && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate` <h2>法務文書の記入式雛形</h2> <div class="banner banner-warn">以下は<strong>記入式の雛形（素材）</strong>です。〔 〕の事業者情報を記入し、<strong>必ず弁護士等の専門家の確認</strong>を経てご利用ください。現在の連携設定（サブプロセッサ・保持期間）を反映しています。</div> <p class="muted" style="font-size:.85rem">${tpl.note}</p> <details> <summary><strong>プライバシーポリシー（雛形）</strong></summary> <textarea class="tpl" readonly rows="18" style="width:100%;font-family:monospace;font-size:.78rem;margin-top:.4rem">${tpl.privacy}</textarea> <button class="btn btn-sm tpl-copy" type="button" style="margin-top:.3rem">コピー</button> </details> <details style="margin-top:.5rem"> <summary><strong>利用規約（雛形）</strong></summary> <textarea class="tpl" readonly rows="16" style="width:100%;font-family:monospace;font-size:.78rem;margin-top:.4rem">${tpl.terms}</textarea> <button class="btn btn-sm tpl-copy" type="button" style="margin-top:.3rem">コピー</button> </details> <details style="margin-top:.5rem"> <summary><strong>個人データ取扱いの取り決め（DPA・雛形）</strong></summary> <textarea class="tpl" readonly rows="16" style="width:100%;font-family:monospace;font-size:.78rem;margin-top:.4rem">${tpl.dpa}</textarea> <button class="btn btn-sm tpl-copy" type="button" style="margin-top:.3rem">コピー</button> </details> ` })}`}` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(["<script data-astro-rerun", '>\n    document.getElementById("copy")?.addEventListener("click", async () => {\n      const t = document.getElementById("plain");\n      try { await navigator.clipboard.writeText(t.value); window.bo?.toast?.("コピーしました"); }\n      catch { t.select(); document.execCommand("copy"); }\n    });\n    document.querySelectorAll(".tpl-copy").forEach((b) => b.addEventListener("click", async (e) => {\n      const ta = e.currentTarget.closest("details")?.querySelector(".tpl");\n      if (!ta) return;\n      try { await navigator.clipboard.writeText(ta.value); window.bo?.toast?.("コピーしました"); }\n      catch { ta.select(); document.execCommand("copy"); }\n    }));\n  <\/script>'])), addAttribute(Astro2.locals.cspNonce, "nonce")) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/legal.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/legal.astro";
const $$url = "/legal";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Legal,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
