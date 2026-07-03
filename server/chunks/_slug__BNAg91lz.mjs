globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, a as addAttribute, u as unescapeHTML, c as renderHead } from "./sequence_BESBTeYg.mjs";
import { env } from "cloudflare:workers";
import { getPublicPage, getPublicPageAny, seatsTaken } from "./public-pages_DHQdIiIX.mjs";
import { b as buildPublicFullPage, a as buildFrameSrcdoc, P as PUBLIC_BRIDGE_SDK, c as FRAME_ALLOW, F as FRAME_SANDBOX } from "./app-frame_NWC0ZR-C.mjs";
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
  let page2 = await getPublicPage(env, slug);
  let preview = false;
  if (!page2 && Astro2.url.searchParams.get("preview") === "1") {
    const { getSession, canDevelopApps } = await import("./auth_DL5yvmzT.mjs");
    const ses = await getSession(env, Astro2.request);
    if (ses && canDevelopApps(ses.role, ses.ctx)) {
      page2 = await getPublicPageAny(env, slug);
      preview = !!page2;
    }
  }
  if (!page2) {
    return new Response("ページが見つかりません", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  if (!preview && Astro2.url.searchParams.get("preview") !== "1" && !Astro2.locals.publicHost) {
    const { getSiteHosts, getPublicHomeSlug } = await import("./custom-domain_BlEKJqw-.mjs");
    const hosts = await getSiteHosts(Astro2.locals.ctx);
    if (hosts && hosts.active) {
      const { publicUrlFor } = await import("./site-routing_D_cHuHu3.mjs");
      return Astro2.redirect(publicUrlFor(slug, hosts.publicHost, await getPublicHomeSlug(Astro2.locals.ctx)), 301);
    }
  }
  let capacityNote = null;
  if (page2.capacity != null && page2.capacity > 0) {
    const taken = await seatsTaken(env, slug).catch(() => 0);
    const remaining = page2.capacity - taken;
    if (remaining <= 0) capacityNote = "満員のため、現在は<strong>キャンセル待ち</strong>を受け付けています。空きが出ましたら主催者よりご連絡します。";
    else if (remaining <= Math.max(3, Math.ceil(page2.capacity * 0.1))) capacityNote = `<strong>残りわずか</strong>です（あと約${remaining}名）。`;
  }
  let pubIsolation;
  let pubAllowHosts;
  try {
    const row = await env.DB.prepare("SELECT definition FROM external_apps WHERE id=? UNION ALL SELECT definition FROM app_drafts WHERE id=? LIMIT 1").bind(page2.app_id, page2.app_id).first();
    const r = row?.definition ? JSON.parse(row.definition).render : null;
    if (r?.isolation === "relaxed") {
      pubIsolation = "relaxed";
      pubAllowHosts = Array.isArray(r.allowHosts) ? r.allowHosts : [];
    }
  } catch {
  }
  if (Astro2.locals.publicHost) {
    const { isReservedSlug } = await import("./site-routing_D_cHuHu3.mjs");
    if (!isReservedSlug(slug)) return Astro2.redirect("/" + encodeURIComponent(slug), 301);
    Astro2.locals.publicSiteAllowHosts = pubAllowHosts ?? [];
    const canonical = Astro2.url.origin + "/p/" + encodeURIComponent(slug);
    return new Response(buildPublicFullPage(page2.html, { slug, title: page2.title, canonical, params: Object.fromEntries(Astro2.url.searchParams), nonce: Astro2.locals.cspNonce }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  const frameDoc = buildFrameSrcdoc(page2.html, PUBLIC_BRIDGE_SDK, Object.fromEntries(Astro2.url.searchParams), {}, { isolation: pubIsolation, allowHosts: pubAllowHosts, nonce: Astro2.locals.cspNonce });
  return renderTemplate(_a || (_a = __template(['<html lang="ja" data-astro-cid-f3iwrppf> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="robots"', "><title>", "</title>", "</head> <body data-astro-cid-f3iwrppf> ", " ", ' <div class="bo-public" data-astro-cid-f3iwrppf> <iframe id="bo-frame"', "", "", "", ' height="600" data-astro-cid-f3iwrppf></iframe> </div> <footer data-astro-cid-f3iwrppf>Powered by baku-office</footer> <script type="application/json" id="bo-slug">', "<\/script> <script data-astro-rerun", '>\n      (function () {\n        var slug = JSON.parse(document.getElementById("bo-slug").textContent);\n        var frame = document.getElementById("bo-frame");\n        function reply(ok, message, error) {\n          try { frame.contentWindow.postMessage({ __bo: 1, type: "submitResult", ok: ok, message: message, error: error }, "*"); } catch (_) {}\n        }\n        window.addEventListener("message", async function (e) {\n          if (e.source !== frame.contentWindow) return;\n          var m = e.data; if (!m || m.__bo !== 1) return;\n          if (m.type === "resize" && m.height) { frame.style.height = Math.max(200, m.height + 24) + "px"; return; }\n          // 音声認識（bo.listen）：iframe では not-allowed のため親（通常オリジン）で認識し結果を返す。\n          if (m.type === "listen") {\n            window.__boRec = window.__boRec || {};\n            var recs = window.__boRec;\n            var back = function (o) { o.__bo = 1; o.reqId = m.reqId; try { frame.contentWindow.postMessage(o, "*"); } catch (_) {} };\n            if (m.action === "stop") { try { recs[m.reqId] && recs[m.reqId].stop(); } catch (_) {} return; }\n            var SR = window.SpeechRecognition || window.webkitSpeechRecognition;\n            if (!SR) { back({ type: "listenError", error: "unsupported" }); return; }\n            try {\n              var rec = new SR();\n              rec.lang = m.lang || "ja-JP"; rec.interimResults = m.interim !== false; rec.continuous = m.continuous !== false;\n              rec.onresult = function (ev) { var interim = "", final = ""; for (var i = ev.resultIndex; i < ev.results.length; i++) { var t = ev.results[i][0].transcript; if (ev.results[i].isFinal) final += t; else interim += t; } if (final) back({ type: "listenResult", text: final, isFinal: true }); if (interim) back({ type: "listenResult", text: interim, isFinal: false }); };\n              rec.onerror = function (ev) { back({ type: "listenError", error: ev.error || "error" }); };\n              rec.onend = function () { delete recs[m.reqId]; back({ type: "listenEnd" }); };\n              recs[m.reqId] = rec; rec.start();\n            } catch (err) { back({ type: "listenError", error: String(err && err.message || err) }); }\n            return;\n          }\n          if (m.type === "submit") {\n            try {\n              var fd = new FormData();\n              fd.append("values", JSON.stringify(m.values || {}));\n              var files = m.files || [];\n              for (var i = 0; i < files.length; i++) { if (files[i] && files[i].file) fd.append("file", files[i].file, (files[i].file.name || "file")); }\n              var r = await fetch("/api/p/" + encodeURIComponent(slug), { method: "POST", body: fd });\n              var j = await r.json().catch(function () { return {}; });\n              if (r.ok && j.ok && j.checkoutUrl) { window.top.location.href = j.checkoutUrl; return; } // 有料：Stripe決済へ遷移\n              if (r.ok && j.ok) reply(true, j.message); else reply(false, null, j.error || "送信に失敗しました。");\n            } catch (err) { reply(false, null, "通信に失敗しました。時間をおいて再度お試しください。"); }\n          }\n        });\n      })();\n    <\/script> </body> </html>'])), addAttribute(preview ? "noindex,nofollow" : "index,follow", "content"), preview ? `【プレビュー】${page2.title}` : page2.title, renderHead(), preview && renderTemplate`<div style="max-width:720px;margin:8px auto 0;padding:10px 14px;border:1px solid #C9A86A;background:#F4EDDD;color:#946F2C;border-radius:12px;font:13px system-ui,-apple-system,sans-serif" data-astro-cid-f3iwrppf>
🔒 これは<strong data-astro-cid-f3iwrppf>内部プレビュー（非公開）</strong>です。外部の人には表示されません。問題なければ「設定 → 公開ページ」または アプリ画面の「🌐 顧客向け公開URL」から<strong data-astro-cid-f3iwrppf>公開</strong>してください。
</div>`, capacityNote && renderTemplate`<div style="max-width:720px;margin:8px auto 0;padding:10px 14px;border:1px solid #C9A86A;background:#F4EDDD;color:#946F2C;border-radius:12px;font:13px system-ui,-apple-system,sans-serif" data-astro-cid-f3iwrppf>${unescapeHTML(capacityNote)}</div>`, addAttribute(page2.title, "title"), addAttribute(FRAME_SANDBOX, "sandbox"), addAttribute(FRAME_ALLOW, "allow"), addAttribute(frameDoc, "srcdoc"), unescapeHTML(JSON.stringify(slug)), addAttribute(Astro2.locals.cspNonce, "nonce"));
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/p/[slug].astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/p/[slug].astro";
const $$url = "/p/[slug]";
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
