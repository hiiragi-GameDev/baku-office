globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const prerender = false;
const $$Directory = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Directory;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isOrgAdmin = ses.role === "admin";
  const { cachedEntitlement } = await import("./client_F4fksau0.mjs");
  const hasPlus = atLeast(await cachedEntitlement(env).catch(() => "free"), "plus");
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "公開ディレクトリ", "active": "/directory" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>公開ディレクトリ（団体を探す）</h1> ${!hasPlus && renderTemplate`<div class="card"><div class="banner banner-warn">この機能は <strong>Plus 以上</strong>で利用できます。</div><a class="btn btn-primary" href="/billing">プラン・課金へ</a></div>`}${hasPlus && !isOrgAdmin && renderTemplate`<div class="card"><p class="muted">団体検索は管理者が行えます。一般メンバーはAIチャットで「◯◯な団体を探して」と頼むこともできます。</p></div>`}${hasPlus && isOrgAdmin && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <p class="lead">公開している他団体を探して、招待コードなしで問い合わせ・連絡ができます。自団体を公開するには <a href="/settings/directory">エージェントを公開</a>。</p> <div class="card"> <div class="row"> <div style="flex:2"><label for="q">どんな団体を探していますか？</label><input id="q" placeholder="例：地域の花屋、PTA、会計を手伝ってくれる団体"></div> <div style="flex:1"><label for="qtags">タグ（任意・カンマ区切り）</label><input id="qtags" placeholder="例：花, ギフト"></div> <div style="flex:0 0 auto;align-self:end"><button class="btn btn-primary" id="q-go">探す</button></div> </div> <div class="field" style="margin-top:.5rem"><label><input type="checkbox" id="q-cert"> 貘公式認証の団体のみ表示（実際に確認済み・スパムやサクラの心配なし）</label></div> </div> <div id="results"></div> <style>.lead{color:var(--ink);margin:.2rem 0 1rem}</style> ` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template([`<script data-astro-rerun>
        const api = (b, opts) => window.bo.api("/api/directory", b, opts || {});
        const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
        document.getElementById("q-go")?.addEventListener("click", async (e) => {
          const tags = document.getElementById("qtags").value.split(",").map((s) => s.trim()).filter(Boolean);
          const r = await api({ _action: "search", query: document.getElementById("q").value, tags, certifiedOnly: document.getElementById("q-cert").checked }, { btn: e.currentTarget, successMsg: null });
          const box = document.getElementById("results");
          if (!r.ok || !r.results || !r.results.length) { box.innerHTML = '<p class="muted" style="padding:1rem">条件に合う公開団体は見つかりませんでした。</p>'; return; }
          box.innerHTML = r.results.map((c) => \`
            <div class="card" data-lic="\${esc(c.license_id)}">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <strong style="font-size:1.05rem">\${esc(c.org_name)}</strong>
                \${c.certified ? '<span class="pill brand">貘公式認証</span>' : ""}
                \${c.verified ? '<span class="pill brand">✓ 実在確認済み</span>' : '<span class="pill">未確認</span>'}
                <span class="muted" style="font-size:.82rem">信頼度 \${c.trust_score}</span>
              </div>
              <div class="muted" style="margin-top:4px">\${esc(c.summary)}</div>
              <div class="muted" style="font-size:.82rem;margin-top:4px">公開アクション: \${(c.public_actions || []).map((a) => esc(a.label || a.name)).join(", ") || "問い合わせのみ"}</div>
              <div class="row" style="margin-top:8px">
                <input class="msg" placeholder="問い合わせ内容（例：見積もりをお願いしたい）" style="flex:1" />
                <button class="btn btn-primary inq" style="flex:0 0 auto">問い合わせる</button>
                <button class="btn btn-ghost rep" style="flex:0 0 auto">通報</button>
              </div>
            </div>\`).join("");
          box.querySelectorAll(".inq").forEach((b) => b.addEventListener("click", async (ev) => {
            const card = ev.target.closest("[data-lic]"); const msg = card.querySelector(".msg").value.trim();
            if (!msg) { window.bo.toast("問い合わせ内容を入力してください", "err"); return; }
            const rr = await api({ _action: "send_inquiry", to: card.dataset.lic, message: msg }, { btn: ev.target, successMsg: null });
            window.bo.toast(rr.ok ? "相手の受付箱に届けました。先方の承認をお待ちください。" : ("失敗：" + (rr.error || "")), rr.ok ? "ok" : "err");
          }));
          box.querySelectorAll(".rep").forEach((b) => b.addEventListener("click", async (ev) => {
            if (!(await window.bo.confirm("この団体を通報しますか？（スパム・不適切など）", { confirmLabel: "通報", danger: true }))) return;
            const card = ev.target.closest("[data-lic]");
            const rr = await api({ _action: "report", target: card.dataset.lic, reason: "user_report" }, { btn: ev.target, successMsg: "通報しました" });
            if (rr.ok) ev.target.disabled = true;
          }));
        });
      <\/script>`], [`<script data-astro-rerun>
        const api = (b, opts) => window.bo.api("/api/directory", b, opts || {});
        const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
        document.getElementById("q-go")?.addEventListener("click", async (e) => {
          const tags = document.getElementById("qtags").value.split(",").map((s) => s.trim()).filter(Boolean);
          const r = await api({ _action: "search", query: document.getElementById("q").value, tags, certifiedOnly: document.getElementById("q-cert").checked }, { btn: e.currentTarget, successMsg: null });
          const box = document.getElementById("results");
          if (!r.ok || !r.results || !r.results.length) { box.innerHTML = '<p class="muted" style="padding:1rem">条件に合う公開団体は見つかりませんでした。</p>'; return; }
          box.innerHTML = r.results.map((c) => \\\`
            <div class="card" data-lic="\\\${esc(c.license_id)}">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <strong style="font-size:1.05rem">\\\${esc(c.org_name)}</strong>
                \\\${c.certified ? '<span class="pill brand">貘公式認証</span>' : ""}
                \\\${c.verified ? '<span class="pill brand">✓ 実在確認済み</span>' : '<span class="pill">未確認</span>'}
                <span class="muted" style="font-size:.82rem">信頼度 \\\${c.trust_score}</span>
              </div>
              <div class="muted" style="margin-top:4px">\\\${esc(c.summary)}</div>
              <div class="muted" style="font-size:.82rem;margin-top:4px">公開アクション: \\\${(c.public_actions || []).map((a) => esc(a.label || a.name)).join(", ") || "問い合わせのみ"}</div>
              <div class="row" style="margin-top:8px">
                <input class="msg" placeholder="問い合わせ内容（例：見積もりをお願いしたい）" style="flex:1" />
                <button class="btn btn-primary inq" style="flex:0 0 auto">問い合わせる</button>
                <button class="btn btn-ghost rep" style="flex:0 0 auto">通報</button>
              </div>
            </div>\\\`).join("");
          box.querySelectorAll(".inq").forEach((b) => b.addEventListener("click", async (ev) => {
            const card = ev.target.closest("[data-lic]"); const msg = card.querySelector(".msg").value.trim();
            if (!msg) { window.bo.toast("問い合わせ内容を入力してください", "err"); return; }
            const rr = await api({ _action: "send_inquiry", to: card.dataset.lic, message: msg }, { btn: ev.target, successMsg: null });
            window.bo.toast(rr.ok ? "相手の受付箱に届けました。先方の承認をお待ちください。" : ("失敗：" + (rr.error || "")), rr.ok ? "ok" : "err");
          }));
          box.querySelectorAll(".rep").forEach((b) => b.addEventListener("click", async (ev) => {
            if (!(await window.bo.confirm("この団体を通報しますか？（スパム・不適切など）", { confirmLabel: "通報", danger: true }))) return;
            const card = ev.target.closest("[data-lic]");
            const rr = await api({ _action: "report", target: card.dataset.lic, reason: "user_report" }, { btn: ev.target, successMsg: "通報しました" });
            if (rr.ok) ev.target.disabled = true;
          }));
        });
      <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/directory.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/directory.astro";
const $$url = "/directory";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Directory,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
