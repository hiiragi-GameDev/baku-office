globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, a as addAttribute, c as renderHead } from "./sequence_BESBTeYg.mjs";
import { env } from "cloudflare:workers";
import { getSession } from "./auth_DL5yvmzT.mjs";
import { n as needsConsent, H as HOST_TERMS, a as HOST_PRIVACY, I as IMPORTANT_NOTES, P as PROVISIONAL_NOTICE, C as CONSENT_VERSION } from "./consent_pwDjHOqX.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Consent = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Consent;
  const ses = await getSession(env, Astro2.request);
  if (!ses || ses.role !== "admin") return Astro2.redirect("/", 302);
  if (!await needsConsent(env)) return Astro2.redirect("/", 302);
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
  const CSP = `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
  const docs = [
    { h: "利用規約", body: HOST_TERMS },
    { h: "プライバシーポリシー", body: HOST_PRIVACY },
    { h: "重要事項", body: IMPORTANT_NOTES }
  ];
  return renderTemplate(_a || (_a = __template(['<html lang="ja" data-astro-cid-4y5t3my7> <head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy"', '><meta name="viewport" content="width=device-width, initial-scale=1"><title>ご利用開始前のご確認</title>', '</head> <body data-astro-cid-4y5t3my7> <main class="wrap" data-astro-cid-4y5t3my7> <h1 data-astro-cid-4y5t3my7>ご利用開始前に、以下の内容をご確認ください</h1> <p class="sub" data-astro-cid-4y5t3my7>団体の管理者として、本サービスの利用条件・個人情報の取扱い・重要事項に同意のうえお進みください（版: ', "）。</p> ", " ", ' <div class="agree" data-astro-cid-4y5t3my7> <label data-astro-cid-4y5t3my7> <input type="checkbox" id="ck" data-astro-cid-4y5t3my7> <span data-astro-cid-4y5t3my7>上記の利用規約・プライバシーポリシー・重要事項をすべて読み、内容に同意します。</span> </label> <button id="go" disabled data-astro-cid-4y5t3my7>同意して続行</button> <button id="logout" type="button" style="background:var(--c-ghost-bg);color:var(--c-accent);border:1px solid var(--c-line);" data-astro-cid-4y5t3my7>ログアウト</button> <div class="msg" id="msg" role="status" aria-live="polite" data-astro-cid-4y5t3my7></div> </div> </main> <script', ' data-astro-rerun>\n      const ck = document.getElementById("ck");\n      const go = document.getElementById("go");\n      const msg = document.getElementById("msg");\n      ck.addEventListener("change", () => { go.disabled = !ck.checked; });\n      go.addEventListener("click", async () => {\n        go.disabled = true;\n        try {\n          const r = await fetch("/api/consent", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });\n          if (r.ok) { location.href = "/"; }\n          else { msg.textContent = "記録に失敗しました。再度お試しください。"; go.disabled = false; }\n        } catch { msg.textContent = "通信に失敗しました。"; go.disabled = false; }\n      });\n      document.getElementById("logout").addEventListener("click", async () => {\n        try { await fetch("/api/login", { method: "DELETE" }); } catch {}\n        location.href = "/login";\n      });\n    <\/script> </body> </html>'])), addAttribute(CSP, "content"), renderHead(), CONSENT_VERSION, renderTemplate`<p class="sub" style="background:var(--c-ghost-bg);border:1px solid var(--c-line);border-radius:8px;padding:10px 12px" data-astro-cid-4y5t3my7>${PROVISIONAL_NOTICE}</p>`, docs.map((d) => renderTemplate`<section class="doc" data-astro-cid-4y5t3my7> <h2 data-astro-cid-4y5t3my7>${d.h}</h2> <pre data-astro-cid-4y5t3my7>${d.body}</pre> </section>`), addAttribute(nonce, "nonce"));
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/consent.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/consent.astro";
const $$url = "/consent";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Consent,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
