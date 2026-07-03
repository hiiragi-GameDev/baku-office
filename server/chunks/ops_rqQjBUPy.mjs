globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
const prerender = false;
const $$Ops = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Ops;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdminOrg = ses.role === "admin";
  const { cachedEntitlement } = await import("./client_F4fksau0.mjs");
  const hasPlus = atLeast(await cachedEntitlement(env).catch(() => "free"), "plus");
  const items = [
    { href: "/backup", label: "データの保存（バックアップ）", desc: "データの保存と、もとに戻す操作", show: isAdminOrg },
    { href: "/usage", label: "利用状況・上限", desc: "今の利用量と上限の確認", show: isAdminOrg && hasPlus },
    { href: "/reports", label: "実績レポート", desc: "AIによる削減時間・完了率・改善ポイント", show: isAdminOrg },
    { href: "/diagnostics", label: "状態の確認・サポート", desc: "稼働状況の確認・困ったときに", show: true },
    { href: "/settings/update", label: "アプリの更新", desc: "最新版への更新", show: isAdminOrg },
    { href: "/legal", label: "外部送信・AI利用について", desc: "外部への送信やAI利用についての説明", show: true }
  ].filter((i) => i.show);
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "データ・運用", "active": "/settings", "denseMobile": true, "data-astro-cid-fj7qes35": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-fj7qes35>データ・運用</h1> <p class="muted" data-astro-cid-fj7qes35>バックアップ・利用状況・稼働状態の確認・更新など、運用まわりをここでまとめて管理します（公開ページのアクセス解析は「WEB・公開サイト」にあります）。</p> <div class="hub-grid" data-astro-cid-fj7qes35> ${items.map((i) => renderTemplate`<a class="card link hub-card"${addAttribute(i.href, "href")} data-astro-cid-fj7qes35><strong data-astro-cid-fj7qes35>${i.label}</strong><span class="muted small" data-astro-cid-fj7qes35>${i.desc}</span></a>`)} </div> ` })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/ops.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/ops.astro";
const $$url = "/settings/ops";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Ops,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
