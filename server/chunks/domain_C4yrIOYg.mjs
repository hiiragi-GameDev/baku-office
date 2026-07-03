globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, F as Fragment, a as addAttribute } from "./sequence_BESBTeYg.mjs";
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
const $$Domain = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Domain;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const entitlement = await (await import("./client_F4fksau0.mjs")).cachedEntitlement(env);
  const hasPlus = atLeast(entitlement, "plus");
  const { getCustomDomain } = await import("./custom-domain_BlEKJqw-.mjs");
  const cfg = hasPlus ? await getCustomDomain(Astro2.locals.ctx) : null;
  const t = (n) => new Date(n * 1e3).toLocaleString("ja-JP");
  const pubPages = cfg ? await (await import("./public-pages_DHQdIiIX.mjs")).listPublicPages(env) : [];
  const defPublic = cfg?.publicHost || cfg?.domain || "";
  const defAdmin = cfg?.adminHost || (cfg?.domain ? "app." + cfg.domain : "");
  const cfTokenReady = cfg ? await (await import("./autonomy_BR9KrOCt.mjs")).getAutonomyConfig(env).then((a) => a.cfToken).catch(() => false) : false;
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "カスタムドメイン", "active": "/settings" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>カスタムドメイン</h1> ${!hasPlus && renderTemplate`<div class="card"> <div class="banner banner-warn">この機能は <strong>Plus 以上</strong>のプランで利用できます。</div> <p class="muted">独自ドメイン（例 <code>office.example.org</code>）でアプリを公開できます。</p> <a class="btn btn-primary" href="/billing">プラン・課金へ</a> </div>`}${hasPlus && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p class="muted">アプリを独自ドメインで公開します。ここで希望ドメインを保存し、実際の紐付けは下記手順に従って <strong>あなたの Cloudflare アカウント</strong>で行ってください（当社はあなたのアカウントに入りません）。</p> <div class="card"> <div class="field"><label>カスタムドメイン<input id="cd"${addAttribute(cfg?.domain ?? "", "value")} placeholder="office.example.org"></label></div> ${cfg && renderTemplate`<p class="muted" style="font-size:.82rem">登録：${cfg.domain}（保存 ${t(cfg.registeredAt)}）</p>`} <button class="btn btn-primary" id="saveDomain">保存</button> <p class="muted" style="font-size:.82rem;margin-top:.4rem">空欄で保存すると設定を解除します。</p> </div> <h2>紐付け手順（Cloudflare ダッシュボード）</h2> <div class="card"> <ol style="margin:0;padding-left:1.2rem;line-height:1.9"> <li>Cloudflare ダッシュボード → <strong>Workers &amp; Pages</strong> → このアプリの Worker（<code>baku-office-app</code>）を開く。</li> <li><strong>Settings → Domains &amp; Routes → Add → Custom Domain</strong> を選び、上で保存したドメインを入力。</li> <li>ドメインが Cloudflare で管理されていれば、DNS と証明書は自動で設定されます（数分〜）。</li> <li>反映後、独自ドメインでアプリが開けることを確認してください。</li> </ol> <p class="muted" style="font-size:.82rem;margin-top:.5rem">※ Worker への紐付けはお客様の Cloudflare 操作です。当社は手順案内のみを行います。</p> </div> <h2>ドメインをお持ちでない場合</h2> <div class="banner banner-info">
ドメインは <strong>Cloudflare Registrar</strong> で取得すると、上記の紐付けがスムーズです（原価提供・更新も簡単）。
<a href="https://www.cloudflare.com/products/registrar/" target="_blank" rel="noopener">Cloudflare Registrar を見る</a>。
        もちろん他社で取得済み／取得するドメインでも、Cloudflare に追加すれば利用できます。
</div> ${cfg && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate` <h2>公開サイト構成（独自ドメインでフルページ公開）</h2> <div class="card"> <p class="muted" style="font-size:.85rem">独自ドメインで公開HPを<strong>フルページ配信</strong>します。<strong>公開サイト</strong>と<strong>管理画面</strong>を別ホストに分けます（既定＝公開はドメイン直下 <code>${cfg.domain}</code>、管理は <code>app.${cfg.domain}</code>）。<strong>両ホストを上の手順で CF の Custom Domain に紐付けてから</strong>「有効化」してください。</p> <div class="field"><label>公開サイトのホスト<input id="publicHost"${addAttribute(defPublic, "value")}${addAttribute(cfg.domain, "placeholder")}></label></div> <div class="field"><label>管理画面のホスト<input id="adminHost"${addAttribute(defAdmin, "value")}${addAttribute("app." + cfg.domain, "placeholder")}></label></div> <div class="field"><label>トップページ（<code>/</code> に出す公開ページ）
<select id="homeSlug"> <option value="">（未設定＝準備中ページ）</option> ${pubPages.map((p) => renderTemplate`<option${addAttribute(p.slug, "value")}${addAttribute(cfg.homeSlug === p.slug, "selected")}>${p.title}（/${p.slug}）</option>`)} </select> </label></div> <label style="display:flex;align-items:center;gap:.5rem;margin:.7rem 0;font-weight:600"><input type="checkbox" id="siteActive"${addAttribute(cfg.active === true, "checked")}${addAttribute(cfg.domain, "data-domain")}> 公開サイトを有効化（別origin配信を開始）</label> <div class="banner banner-warn" style="font-size:.82rem">有効化すると管理画面は <strong>${defAdmin || "app." + cfg.domain}</strong> に移ります（一度だけ再ログインが必要）。公開ホストには <code>/login</code> 等の管理面は出ません。Google ログインの戻り先（許可ホスト）に管理ホストの追加が必要な場合があります。</div> <button class="btn btn-primary" id="saveSite">公開サイト構成を保存</button> </div> <h2>Cloudflare 自動構成（任意）</h2> <div class="card"> ${cfTokenReady ? renderTemplate`${renderComponent($$result4, "Fragment", Fragment, {}, { "default": async ($$result5) => renderTemplate` <p class="muted" style="font-size:.85rem">CF API トークン連携済みです。下のボタンで<strong>ゾーン確認・両ホストの Custom Domain 紐付け・推奨SEO/セキュリティ設定・DNSSEC</strong>を自動適用します（手動の CF 操作を省けます）。</p> <button class="btn btn-ghost" id="cfProvision">Cloudflare を自動構成</button> <div id="cfReport" style="margin-top:.7rem;font-size:.85rem"></div> ` })}` : renderTemplate`<div class="banner banner-info" style="font-size:.85rem">CF API トークンを連携すると、ここから自動構成できます（手動の CF 操作が不要に）。<a href="/settings/advanced">設定 → 高度なオプション（自動化）</a>でトークンを登録してください。未連携でも上記の手動手順で利用できます。</div>`} </div> ` })}`}` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n        (function () {\n          const btn = document.getElementById("saveDomain");\n          if (!btn) return;\n          btn.addEventListener("click", async (e) => {\n            const domain = document.getElementById("cd").value.trim();\n            const r = await window.bo.api("/api/settings", { _action: "custom_domain", domain }, { btn: e.currentTarget, successMsg: "保存しました" });\n            if (r.ok) setTimeout(() => location.reload(), 700);\n          });\n          const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };\n          const sbtn = document.getElementById("saveSite");\n          if (sbtn) sbtn.addEventListener("click", async (e) => {\n            const activeEl = document.getElementById("siteActive");\n            const nowActive = activeEl.checked, wasActive = activeEl.defaultChecked;\n            const domain = activeEl.getAttribute("data-domain") || "";\n            const adminHost = val("adminHost") || ("app." + domain);\n            // 無効化（active→非active）：独自ドメインの公開URL・SEO/外部リンクが切れる旨を警告。\n            if (wasActive && !nowActive && !confirm("公開サイトを無効化すると、独自ドメインの公開URLが使えなくなり、検索インデックスや外部リンクが切れる可能性があります。よろしいですか？")) return;\n            const r = await window.bo.api("/api/settings", { _action: "site_config", publicHost: val("publicHost"), adminHost: val("adminHost"), homeSlug: val("homeSlug"), siteActive: nowActive }, { btn: e.currentTarget, successMsg: "保存しました" });\n            if (!r.ok) return;\n            // 有効化（非active→active）：管理画面が別ホストへ移るので再ログインへ誘導（OAuth許可ホストの注意も）。\n            if (!wasActive && nowActive && adminHost) {\n              alert("有効化しました。管理画面は https://" + adminHost + " に移ります。そちらで再ログインしてください（Google ログインの戻り先にこのホストの登録が必要な場合があります）。");\n              location.href = "https://" + adminHost + "/settings/domain";\n              return;\n            }\n            setTimeout(() => location.reload(), 700);\n          });\n          const pbtn = document.getElementById("cfProvision");\n          if (pbtn) pbtn.addEventListener("click", async (e) => {\n            const rep = document.getElementById("cfReport");\n            rep.textContent = "自動構成中…";\n            const r = await window.bo.api("/api/settings", { _action: "cf_provision" }, { btn: e.currentTarget });\n            const steps = (r && r.steps) || [];\n            // 安全：innerHTML 補間を避け DOM 構築（detail はホスト名/CFエラー等の外部由来を含むため textContent）。\n            rep.replaceChildren();\n            if (steps.length) { steps.forEach((s) => { const p = document.createElement("div"); p.textContent = (s.ok ? "✅ " : "⚠️ ") + s.detail; rep.appendChild(p); }); }\n            else { const p = document.createElement("div"); p.textContent = (r && r.error) ? "⚠️ " + r.error : "結果を取得できませんでした"; rep.appendChild(p); }\n            if (r && r.dsRecord) { const d = document.createElement("div"); d.style.cssText = "margin-top:.6rem;padding:8px;background:#F4EDDD;border-radius:8px;word-break:break-all"; d.textContent = "外部レジストラ取得時は次の DS レコードをレジストラに登録してください：" + r.dsRecord; rep.appendChild(d); }\n          });\n        })();\n      <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/domain.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/domain.astro";
const $$url = "/settings/domain";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Domain,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
