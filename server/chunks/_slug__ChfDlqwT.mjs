globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, a as addAttribute, u as unescapeHTML, c as renderHead } from "./sequence_BESBTeYg.mjs";
import { env } from "cloudflare:workers";
import { getPublicPage } from "./public-pages_DHQdIiIX.mjs";
import { a as buildFrameSrcdoc, P as PUBLIC_BRIDGE_SDK, c as FRAME_ALLOW, F as FRAME_SANDBOX } from "./app-frame_NWC0ZR-C.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  Astro2.locals.cspStrict = true;
  const slug = Astro2.params.slug ?? "";
  const page2 = await getPublicPage(env, slug);
  if (!page2) return new Response("ページが見つかりません", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  const frameDoc = buildFrameSrcdoc(page2.html, PUBLIC_BRIDGE_SDK, Object.fromEntries(Astro2.url.searchParams), {}, { nonce: Astro2.locals.cspNonce });
  return renderTemplate(_a || (_a = __template(['<html lang="ja" data-astro-cid-dyap5gvz> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', "</title>", '</head> <body data-astro-cid-dyap5gvz> <iframe id="bo-frame"', "", "", "", ' height="600" data-astro-cid-dyap5gvz></iframe> <script type="application/json" id="bo-slug">', "<\/script> <script data-astro-rerun", '>\n      (function () {\n        var slug = JSON.parse(document.getElementById("bo-slug").textContent);\n        var frame = document.getElementById("bo-frame");\n        function reply(ok, message, error) { try { frame.contentWindow.postMessage({ __bo: 1, type: "submitResult", ok: ok, message: message, error: error }, "*"); } catch (_) {} }\n        window.addEventListener("message", async function (e) {\n          if (e.source !== frame.contentWindow) return;\n          var m = e.data; if (!m || m.__bo !== 1) return;\n          if (m.type === "resize" && m.height) {\n            var h = Math.max(160, m.height + 16);\n            frame.style.height = h + "px";\n            // HP/LP の app ブロック等に外枠 iframe として埋め込まれている場合、親へ高さを通知して追従させる。\n            try { if (window.parent !== window) window.parent.postMessage({ __boEmbed: 1, height: h + 8 }, "*"); } catch (_) {}\n            return;\n          }\n          if (m.type === "submit") {\n            try {\n              var fd = new FormData();\n              fd.append("values", JSON.stringify(m.values || {}));\n              var files = m.files || [];\n              for (var i = 0; i < files.length; i++) { if (files[i] && files[i].file) fd.append("file", files[i].file, (files[i].file.name || "file")); }\n              var r = await fetch("/api/p/" + encodeURIComponent(slug), { method: "POST", body: fd });\n              var j = await r.json().catch(function () { return {}; });\n              if (r.ok && j.ok && j.checkoutUrl) { window.top.location.href = j.checkoutUrl; return; }\n              if (r.ok && j.ok) reply(true, j.message); else reply(false, null, j.error || "送信に失敗しました。");\n            } catch (err) { reply(false, null, "通信に失敗しました。"); }\n          }\n        });\n      })();\n    <\/script> </body> </html>'])), page2.title, renderHead(), addAttribute(page2.title, "title"), addAttribute(FRAME_SANDBOX, "sandbox"), addAttribute(FRAME_ALLOW, "allow"), addAttribute(frameDoc, "srcdoc"), unescapeHTML(JSON.stringify(slug)), addAttribute(Astro2.locals.cspNonce, "nonce"));
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/embed/[slug].astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/embed/[slug].astro";
const $$url = "/embed/[slug]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
