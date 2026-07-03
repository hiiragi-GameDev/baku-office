globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Display = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Display;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdminOrg = ses.role === "admin" && ses.ctx === "org";
  const onboardingShown = isAdminOrg ? await env.LICENSE.get("onboarding_dismissed").catch(() => null) !== "1" : false;
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "表示", "active": "/settings" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>表示</h1> <p class="muted">画面の見え方（配色・文字サイズ・相棒の表示）を切り替えます。この設定はこの端末にだけ保存されます。</p> <div class="card" style="margin-top:1rem"> <div class="spread" style="flex-wrap:wrap;gap:14px"> <div><strong>ダークモード</strong><div class="muted" style="font-size:.82rem">画面全体の配色を切り替えます。</div></div> <label class="switch"><input type="checkbox" id="set-dark" aria-label="ダークモード"><span class="track"></span><span class="knob"></span></label> </div> <div class="hr"></div> <div class="spread" style="flex-wrap:wrap;gap:14px"> <div><strong>文字の大きさ</strong><div class="muted" style="font-size:.85rem">画面全体の文字を大きくできます（見えにくい方に）。</div></div> <div class="seg" id="set-fontsize" role="group" aria-label="文字の大きさ"> <button class="seg-opt" type="button" data-fs="std">標準</button> <button class="seg-opt" type="button" data-fs="large" style="font-size:1.12rem">大</button> <button class="seg-opt" type="button" data-fs="xl" style="font-size:1.28rem">特大</button> </div> </div> <div class="hr"></div> <div class="spread" style="flex-wrap:wrap;gap:14px"> <div><strong>相棒（キャラクター）を表示</strong><div class="muted" style="font-size:.85rem">画面の右下に表示される相棒のオン／オフ。</div></div> <label class="switch"><input type="checkbox" id="set-mascot" aria-label="相棒を表示"><span class="track"></span><span class="knob"></span></label> </div> </div> ${isAdminOrg && renderTemplate`<div class="card" style="margin-top:1rem"> <div class="spread" style="flex-wrap:wrap;gap:14px"> <div><strong>初回セットアップの案内を表示</strong><div class="muted" style="font-size:.85rem">ホーム/ダッシュボードに「はじめの設定ガイド」を表示します（団体共通の設定）。</div></div> <label class="switch"><input type="checkbox" id="set-onboarding"${addAttribute(onboardingShown, "checked")} aria-label="初回セットアップの案内を表示"><span class="track"></span><span class="knob"></span></label> </div> <div class="hr"></div> <a class="btn btn-sm" href="/setup">初回セットアップを今すぐ開く ↗</a> </div>`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    (function () {\n      const root = document.documentElement;\n      const dark = document.getElementById("set-dark");\n      if (dark) {\n        dark.checked = root.getAttribute("data-theme") === "dark";\n        dark.addEventListener("change", () => {\n          root.classList.add("theme-switching");\n          root.setAttribute("data-theme", dark.checked ? "dark" : "light");\n          try { localStorage.setItem("bo_theme", dark.checked ? "dark" : "light"); } catch (e) { /* noop */ }\n          requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));\n        });\n      }\n      const mascot = document.getElementById("set-mascot");\n      if (mascot) {\n        mascot.checked = root.getAttribute("data-mascot") !== "off";\n        mascot.addEventListener("change", () => {\n          if (mascot.checked) { root.removeAttribute("data-mascot"); try { localStorage.setItem("bo_mascot", "on"); } catch (e) { /* noop */ } }\n          else { root.setAttribute("data-mascot", "off"); try { localStorage.setItem("bo_mascot", "off"); } catch (e) { /* noop */ } }\n        });\n      }\n      const onb = document.getElementById("set-onboarding");\n      if (onb) {\n        onb.addEventListener("change", async () => {\n          // checked=表示（dismissedを解除）／unchecked=非表示（dismissed）。サーバ(org)に保存。\n          const r = await window.bo.api("/api/settings", { _action: "onboarding_dismiss", show: onb.checked }, { successMsg: onb.checked ? "初回セットアップを表示します" : "初回セットアップを非表示にしました" });\n          if (!r.ok) onb.checked = !onb.checked;\n        });\n      }\n      const fs = document.getElementById("set-fontsize");\n      if (fs) {\n        const curFs = root.getAttribute("data-fontsize") || "std";\n        fs.querySelectorAll(".seg-opt").forEach((b) => b.classList.toggle("on", b.dataset.fs === curFs));\n        fs.querySelectorAll(".seg-opt").forEach((b) => b.addEventListener("click", () => {\n          root.setAttribute("data-fontsize", b.dataset.fs);\n          try { localStorage.setItem("bo_fontsize", b.dataset.fs); } catch (e) { /* noop */ }\n          fs.querySelectorAll(".seg-opt").forEach((x) => x.classList.toggle("on", x === b));\n        }));\n      }\n    })();\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/display.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/display.astro";
const $$url = "/settings/display";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Display,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
