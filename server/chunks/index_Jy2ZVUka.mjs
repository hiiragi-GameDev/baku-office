globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
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
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const { cachedEntitlement, getApiKey } = await import("./client_F4fksau0.mjs");
  const entitlement = await cachedEntitlement(env).catch(() => "free");
  const isAdminOrg = ses.role === "admin";
  const hasPlus = atLeast(entitlement, "plus");
  let steps = [];
  let aiReady = false;
  let googleReady = false;
  if (isAdminOrg) {
    const { googleConfigured } = await import("./google_DFar0IbF.mjs");
    aiReady = !!await getApiKey(env, "gemini") || !!await getApiKey(env, "claude") || !!await getApiKey(env, "openai") || !!env.LOCAL_AI_BASE_URL;
    googleReady = await googleConfigured(env).catch(() => false);
    steps = [
      { label: "AIの接続", href: "/settings/keys", done: aiReady, hint: "AIを使うための接続設定" },
      { label: "プランの確認", href: "/billing", done: entitlement !== "free", hint: "上位プランでAI・連携機能が使えます" },
      { label: "Google との連携（任意）", href: "/settings/google-setup", done: googleReady, hint: "カレンダー・メール等との連携（任意）" }
    ];
  }
  const pendingSteps = steps.filter((s) => !s.done);
  const groups = [
    // アカウント・組織は単一入口（/settings/org ハブ）へ集約（項目5）。
    { title: "アカウント・組織", items: [
      { href: "/settings/org", label: "アカウント・組織（自分／メンバー／プラン／承認）", desc: "アカウント・メンバー権限・プラン・各種承認を1か所で", show: true }
    ] },
    // WEB公開系は単一の入口（/settings/web ハブ）へ集約。ハブ内のタブで HP/LP・申込フォーム・イベント・
    // お知らせ・問い合わせ・サイト設定（ナビ/解析/独自URL）へ導線する（入口の分散による混乱を解消・項目4）。
    { title: "WEB・公開サイト", items: [
      { href: "/settings/web", label: "WEB・公開サイト（HP/LP・申込・イベント・お知らせ）", desc: "外部公開の管理を1つの画面にまとめ、タブで切り替えます", show: isAdminOrg }
    ] },
    // 外部サービス（API/Google等）とエージェント関連（公開・A2A）を別々の単一入口に分離（項目2/3）。
    // AI/Discord/Slack/LINE/Google/保存 を束ねた入口のため「設定済み」を単一ドットで表せない（AIだけ設定済みでも
    // 緑になり誤解を招く）。ドットは出さない（done を省略）。
    { title: "外部サービス設定", items: [
      { href: "/settings/integrations", label: "外部サービス設定（AI／LINE・Discord・Slack／Google／Notion／SNS）", desc: "外部サービスとの接続設定を1か所で", show: isAdminOrg }
    ] },
    { title: "エージェント設定", items: [
      { href: "/settings/agent", label: "エージェント設定（公開・受付／他団体連携A2A）", desc: "団体エージェントの公開・他団体との連携を1か所で（管理者のみ）", show: isAdminOrg }
    ] },
    { title: "管理者向け（詳細設定）", items: [
      { href: "/settings/advanced", label: "高度なオプション", desc: "AIの詳細設定・容量プラン（上級者向け）", show: isAdminOrg && hasPlus }
    ] },
    // データ・運用は単一入口（/settings/ops ハブ）へ集約（項目5）。
    { title: "データ・運用", items: [
      { href: "/settings/ops", label: "データ・運用（バックアップ／利用状況／状態確認／更新）", desc: "運用まわりの管理を1か所で", show: true }
    ] },
    // 表示（配色・文字サイズ・相棒）は専用ページへ（項目1）。
    { title: "表示", items: [
      { href: "/settings/display", label: "表示（ダークモード・文字サイズ・相棒）", desc: "画面の見え方をこの端末向けに切り替えます", show: true }
    ] }
  ];
  const slugify = (s) => "g-" + s.replace(/[^\p{L}\p{N}]+/gu, "-");
  const catIcon = {
    "アカウント・組織": "M8 11a3.2 3.2 0 100-6.4A3.2 3.2 0 008 11zM2.5 19a5.5 5.5 0 0111 0M16 11a3 3 0 000-6M21.5 19a5.5 5.5 0 00-4-5.3",
    "WEB・公開サイト": "M12 3a9 9 0 100 18 9 9 0 000-18M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18",
    "外部サービス設定": "M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0zM12 17v4",
    "エージェント設定": "M12 2.5l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 7.7l5-.7z",
    "管理者向け（詳細設定）": "M5 6h14M5 12h14M5 18h14M9 6a1.6 1.6 0 100 .01M15 12a1.6 1.6 0 100 .01M8 18a1.6 1.6 0 100 .01",
    "データ・運用": "M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z",
    "表示": "M12 5c-5 0-8.5 4-9.5 7 1 3 4.5 7 9.5 7s8.5-4 9.5-7c-1-3-4.5-7-9.5-7zM12 15a3 3 0 100-6 3 3 0 000 6z"
  };
  const visGroups = groups.map((g) => ({ ...g, items: g.items.filter((i) => i.show) })).filter((g) => g.items.length > 0);
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "設定", "active": "/settings", "data-astro-cid-376iicvc": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-376iicvc>設定</h1> <p class="muted" data-astro-cid-376iicvc>このシステムの設定・オプションをまとめています。項目を選んでください。</p> ${isAdminOrg && pendingSteps.length > 0 && renderTemplate`<div class="card" style="border-left:3px solid var(--brand)" data-astro-cid-376iicvc> <strong data-astro-cid-376iicvc>初期設定（あと ${pendingSteps.length} 項目）</strong> <p class="muted" style="font-size:.85rem;margin:.2rem 0 .6rem" data-astro-cid-376iicvc>まず必須項目から段階的に設定すると、AI・連携機能を安全に有効化できます。</p> <ul style="margin:0;padding-left:1.2rem" data-astro-cid-376iicvc> ${steps.map((s) => renderTemplate`<li style="margin:.2rem 0" data-astro-cid-376iicvc> <span${addAttribute(s.done ? "設定済み" : "未設定", "aria-label")} data-astro-cid-376iicvc>${s.done ? "済" : "未"}</span>${" "} ${s.done ? renderTemplate`<span data-astro-cid-376iicvc>${s.label}</span>` : renderTemplate`<a${addAttribute(s.href, "href")} data-astro-cid-376iicvc>${s.label}</a>`} <span class="muted" style="font-size:.8rem" data-astro-cid-376iicvc> — ${s.hint}</span> </li>`)} </ul> </div>`}<div class="settings" data-astro-cid-376iicvc> <nav class="set-nav" aria-label="設定カテゴリ" data-astro-cid-376iicvc> ${visGroups.map((g, idx) => renderTemplate`<a${addAttribute("set-nav-btn" + (idx === 0 ? " on" : ""), "class")}${addAttribute("#" + slugify(g.title), "href")}${addAttribute(slugify(g.title), "data-spy")} data-astro-cid-376iicvc> <span class="sn-ico" data-astro-cid-376iicvc><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-376iicvc><path${addAttribute(catIcon[g.title] ?? "", "d")} data-astro-cid-376iicvc></path></svg></span> <span data-astro-cid-376iicvc><strong data-astro-cid-376iicvc>${g.title}</strong></span> ${g.done !== void 0 && renderTemplate`<span${addAttribute("set-dot" + (g.done ? " on" : ""), "class")}${addAttribute(g.done ? "設定済み" : "未設定", "title")}${addAttribute(g.done ? "設定済み" : "未設定", "aria-label")} data-astro-cid-376iicvc></span>`} </a>`)} </nav> <div class="set-pane" data-astro-cid-376iicvc> ${visGroups.map((g) => renderTemplate`<section class="set-sec"${addAttribute(slugify(g.title), "id")} data-astro-cid-376iicvc> <h2 style="margin-top:0" data-astro-cid-376iicvc>${g.title}</h2> ${g.lead && renderTemplate`<p class="muted" style="margin:.1rem 0 .9rem;font-size:.88rem;max-width:60ch" data-astro-cid-376iicvc>${g.lead}</p>`} <div class="grid" data-astro-cid-376iicvc> ${g.items.map((i) => renderTemplate`<a class="card link"${addAttribute(i.href, "href")} data-astro-cid-376iicvc> <strong data-astro-cid-376iicvc>${i.label}</strong> <div class="muted" style="font-size:.85rem;margin-top:.2rem" data-astro-cid-376iicvc>${i.desc}</div> </a>`)} </div> </section>`)} </div> </div>   `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n    (function () {\n      const btns = [...document.querySelectorAll(".set-nav-btn")];\n      const map = new Map(btns.map((b) => [b.dataset.spy, b]));\n      const secs = btns.map((b) => document.getElementById(b.dataset.spy)).filter(Boolean);\n      if (!secs.length) return;\n      // メニュー押下：該当セクションへスムーズスクロール（scroll-margin-top でヘッダーに隠れない位置に着地）。\n      // 押した項目を即ハイライトし、選択中の項目は固定メニュー内に見えるよう寄せる。\n      btns.forEach((b) => b.addEventListener("click", (e) => {\n        const sec = document.getElementById(b.dataset.spy);\n        if (!sec) return;\n        e.preventDefault();\n        sec.scrollIntoView({ behavior: "smooth", block: "start" });\n        history.replaceState(null, "", "#" + b.dataset.spy);\n        btns.forEach((x) => x.classList.remove("on")); b.classList.add("on");\n        b.scrollIntoView({ block: "nearest", inline: "nearest" });\n      }));\n      // スクロールスパイ：表示中セクションに応じてメニューをハイライト。\n      if (!("IntersectionObserver" in window)) return;\n      const io = new IntersectionObserver((ents) => {\n        ents.forEach((en) => { if (en.isIntersecting) { btns.forEach((b) => b.classList.remove("on")); map.get(en.target.id)?.classList.add("on"); } });\n      }, { rootMargin: "-20px 0px -70% 0px" });\n      secs.forEach((s) => io.observe(s));\n    })();\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/index.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/index.astro";
const $$url = "/settings";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
