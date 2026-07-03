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
const $$Update = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Update;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const { pollHost, APP_VERSION } = await import("./client_F4fksau0.mjs");
  const { hasDeployHook, cmpVersion, getAutoUpdate, getAutoUpdateStatus } = await import("./update_BZb99hDh.mjs");
  const check = await pollHost(env, Astro2.url.origin);
  const latest = check?.latestVersion ?? APP_VERSION;
  const updateAvailable = cmpVersion(latest, APP_VERSION) > 0;
  const displayLatest = cmpVersion(latest, APP_VERSION) < 0 ? APP_VERSION : latest;
  const configured = await hasDeployHook(env);
  const autoOn = await getAutoUpdate(env);
  const status = await getAutoUpdateStatus(env);
  const ageMin = status ? Math.max(0, Math.round((Math.floor(Date.now() / 1e3) - status.at) / 60)) : null;
  const ageLabel = ageMin === null ? "" : ageMin < 1 ? "たった今" : ageMin < 60 ? `約${ageMin}分前` : `約${Math.round(ageMin / 60)}時間前`;
  const REASON_LABEL = {
    "off": "自動更新はオフ",
    "no-hook": "フック未登録",
    "up-to-date": "最新の状態です",
    "pending": "更新中（ビルド反映待ち）",
    "retried": "反映されないため再試行しました",
    "stalled": "更新が繰り返し反映されていません",
    "hook-error": "フック発火に失敗（ネットワーク）"
  };
  const reasonLabel = status ? status.triggered ? "更新を開始しました" : REASON_LABEL[status.reason ?? ""] ?? (String(status.reason ?? "").startsWith("hook-") ? "フック発火に失敗（フックURLの再登録が必要かも）" : status.reason ?? "—") : null;
  const needsRecovery = !!status && (status.reason === "stalled" || String(status.reason ?? "").startsWith("hook-"));
  const SETTINGS = "https://dash.cloudflare.com/?to=/:account/workers/services/view/baku-office/production/settings";
  const DEPLOYMENTS = "https://dash.cloudflare.com/?to=/:account/workers/services/view/baku-office/production/deployments";
  const FALLBACK = "https://dash.cloudflare.com/?to=/:account/workers-and-pages";
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "アプリの更新", "active": "/settings", "data-astro-cid-curm2vkq": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-curm2vkq>アプリの更新</h1> <p class="muted" data-astro-cid-curm2vkq>現在のバージョン：<span class="pill" data-astro-cid-curm2vkq>${APP_VERSION}</span> ／ 最新：<span class="pill" data-astro-cid-curm2vkq>${displayLatest}</span> ／ 自動更新：<strong data-astro-cid-curm2vkq>${configured ? "設定済み" : "未設定"}</strong></p> ${autoOn && status && renderTemplate`<p class="muted small" data-astro-cid-curm2vkq>自動更新の最終チェック：${ageLabel} ／ 結果：<strong data-astro-cid-curm2vkq>${reasonLabel}</strong><br data-astro-cid-curm2vkq><span style="font-size:.8rem" data-astro-cid-curm2vkq>数分おきに最新版を確認しています（プッシュではなく定期チェック方式）。</span></p>`}${needsRecovery && renderTemplate`<div class="banner banner-warn" data-astro-cid-curm2vkq> <strong data-astro-cid-curm2vkq>更新が反映されていないようです。</strong> <p class="muted small" style="margin:.3rem 0 0" data-astro-cid-curm2vkq>手動で <a${addAttribute(DEPLOYMENTS, "href")} target="_blank" rel="noreferrer" data-astro-cid-curm2vkq>Cloudflare の Deployments</a> を開き「<strong data-astro-cid-curm2vkq>Create deployment</strong>」または「<strong data-astro-cid-curm2vkq>Retry</strong>」を1回押すと再ビルドされます（数分後に上部のバージョンが上がれば完了・データ/設定は保持）。フック発火が続けて失敗する場合はフックを再登録してください。それでも版が上がらない場合は導入が古い可能性があるためサポートへご連絡ください。</p> </div>`}${updateAvailable ? renderTemplate`<div class="banner banner-warn" data-astro-cid-curm2vkq>新しいバージョン <strong data-astro-cid-curm2vkq>${latest}</strong> があります。下のボタンで更新してください（データ・設定は保持されます）。</div>` : renderTemplate`<div class="banner banner-info" data-astro-cid-curm2vkq>最新の状態です。更新があるとここに表示されます。</div>`}${configured ? (
    /* 設定済み＝1タップ更新がメイン */
    renderTemplate`<div class="card" data-astro-cid-curm2vkq> <h2 style="margin-top:0;border:0" data-astro-cid-curm2vkq>今すぐ更新（1タップ）</h2> <p class="muted" data-astro-cid-curm2vkq>登録済みの再ビルドフックで最新版へ。数分で反映され、データ・設定は保持されます。</p> <button class="btn btn-primary" id="trigger" style="font-size:1.02rem;padding:.6rem 1.4rem" data-astro-cid-curm2vkq>今すぐ更新する</button> <div id="trigmsg" style="margin-top:.5rem" data-astro-cid-curm2vkq></div> <label style="display:flex;align-items:center;gap:.5rem;margin-top:.9rem;padding-top:.8rem;border-top:1px solid var(--line)" data-astro-cid-curm2vkq> <input type="checkbox" id="auto-toggle"${addAttribute(autoOn, "checked")} data-astro-cid-curm2vkq> <span data-astro-cid-curm2vkq><strong data-astro-cid-curm2vkq>新しいバージョンが出たら自動で更新する</strong><br data-astro-cid-curm2vkq><span class="muted small" data-astro-cid-curm2vkq>数分おきに最新版を確認し、新版があれば登録済みフックで自動的に再ビルドします（データ・設定は保持）。手動操作は不要になります。</span></span> </label> <span class="muted small" id="automsg" style="display:block;margin-top:.3rem" data-astro-cid-curm2vkq></span> <details style="margin-top:.9rem" data-astro-cid-curm2vkq><summary class="muted" data-astro-cid-curm2vkq>手動で更新する／自動更新を解除する</summary> <p class="muted small" style="margin-top:.5rem" data-astro-cid-curm2vkq>手動更新：<a${addAttribute(DEPLOYMENTS, "href")} target="_blank" rel="noreferrer" data-astro-cid-curm2vkq>Deployments</a> で「Create deployment」または「Retry」を1回押すと再ビルドされます。</p> <button class="btn btn-warn" id="clearhook" data-astro-cid-curm2vkq>自動更新を解除</button> </details> </div>`
  ) : (
    /* 未設定＝1タップ準備をメイン、手動はサブ（折りたたみ） */
    renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="card" data-astro-cid-curm2vkq> <h2 style="margin-top:0;border:0" data-astro-cid-curm2vkq>1タップ更新を準備（おすすめ・初回のみ2〜3分）</h2> <p class="muted" data-astro-cid-curm2vkq>一度だけ Cloudflare で「再ビルド用フックURL」を作って貼るだけ。次回からは<strong data-astro-cid-curm2vkq>ボタン1つ</strong>で更新できます。</p> <ol class="upd-steps" data-astro-cid-curm2vkq> <li data-astro-cid-curm2vkq> <strong data-astro-cid-curm2vkq>① Cloudflare の Worker 設定を開く</strong> <div style="margin:.35rem 0" data-astro-cid-curm2vkq><a class="btn btn-primary btn-sm"${addAttribute(SETTINGS, "href")} target="_blank" rel="noreferrer" data-astro-cid-curm2vkq>Worker 設定を開く ↗</a></div> <span class="muted small" data-astro-cid-curm2vkq>複数アカウントは最初に選択。開けない場合は <a${addAttribute(FALLBACK, "href")} target="_blank" rel="noreferrer" data-astro-cid-curm2vkq>Workers &amp; Pages</a> → <code data-astro-cid-curm2vkq>baku-office</code> → Settings。</span> </li> <li data-astro-cid-curm2vkq> <strong data-astro-cid-curm2vkq>② Deploy Hook を作成</strong> <span class="muted small" data-astro-cid-curm2vkq>「<strong data-astro-cid-curm2vkq>Build（ビルド）</strong> → <strong data-astro-cid-curm2vkq>Deploy Hooks</strong> → 作成」。名前は任意、ブランチは <strong data-astro-cid-curm2vkq>main</strong> を選択。</span> </li> <li data-astro-cid-curm2vkq> <strong data-astro-cid-curm2vkq>③ 表示された「フックURL」をコピーして貼り付け → 有効化</strong> <div class="field" style="margin:.35rem 0 .3rem" data-astro-cid-curm2vkq><input id="hookurl" placeholder="https://api.cloudflare.com/.../deploy_hooks/..." data-astro-cid-curm2vkq></div> <button class="btn btn-primary" id="savehook" data-astro-cid-curm2vkq>この内容で 1タップ更新を有効にする</button> </li> </ol> <p class="muted" style="font-size:.78rem;margin-top:.4rem" data-astro-cid-curm2vkq>フックURLはこのアプリ内（あなたのCF）にのみ暗号化保存され、当社へは送信されません。</p> </div> <details class="card" style="margin-top:1rem" data-astro-cid-curm2vkq><summary style="font-weight:600;cursor:pointer" data-astro-cid-curm2vkq>今すぐ手動で更新する（フック設定なしでも可）</summary> <ol class="muted" style="padding-left:1.2rem;margin-top:.6rem" data-astro-cid-curm2vkq> <li data-astro-cid-curm2vkq><a${addAttribute(DEPLOYMENTS, "href")} target="_blank" rel="noreferrer" data-astro-cid-curm2vkq>Cloudflare の「Deployments」を開く</a>（開けない場合は <a${addAttribute(FALLBACK, "href")} target="_blank" rel="noreferrer" data-astro-cid-curm2vkq>Workers &amp; Pages</a> → <code data-astro-cid-curm2vkq>baku-office</code> → Deployments）。</li> <li data-astro-cid-curm2vkq>「<strong data-astro-cid-curm2vkq>Create deployment</strong>」または直近失敗の「<strong data-astro-cid-curm2vkq>Retry</strong>」を1回押す。</li> <li data-astro-cid-curm2vkq>数分で最新版に再ビルドされます（データ・設定は保持）。</li> </ol> </details> ` })}`
  )}<div class="banner banner-info" style="font-size:.84rem;margin-top:1rem" data-astro-cid-curm2vkq>更新は<strong data-astro-cid-curm2vkq>同じプロジェクトの再ビルド</strong>です。Deploy ボタンの押し直し（最初からやり直し）は行わないでください（データが切り離されます）。</div>   `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template([`<script data-astro-rerun>
    const trig = document.getElementById("trigger");
    if (trig) trig.addEventListener("click", async (e) => {
      const r = await window.bo.api("/api/update", { _action: "trigger" }, { btn: e.currentTarget, successMsg: null });
      const box = document.getElementById("trigmsg");
      if (r.ok && r.data.ok) box.innerHTML = '<div class="banner banner-info">更新中です。数分で反映されます。反映後にこのページを再読み込みしてください。</div>';
      else if (r.ok && r.data.needGuide) box.innerHTML = '<div class="banner banner-warn">自動更新が未設定です。ページを再読み込みして手動の手順をご利用ください。</div>';
      else window.bo.toast("更新の発火に失敗しました：" + ((r.data && r.data.error) || ""), "err");
    });
    const autoT = document.getElementById("auto-toggle");
    if (autoT) autoT.addEventListener("change", async (e) => {
      const on = e.currentTarget.checked;
      const r = await window.bo.api("/api/update", { _action: "set_auto", on }, { successMsg: null });
      const msg = document.getElementById("automsg");
      if (r.ok && r.data.ok) { msg.textContent = on ? "✓ 自動更新を有効にしました。新版が出ると数分以内に自動で更新されます。" : "自動更新をオフにしました（更新は手動の「今すぐ更新」で行えます）。"; }
      else { e.currentTarget.checked = !on; window.bo.toast((r.data && r.data.error) || "切り替えに失敗しました", "err"); }
    });
    const clr = document.getElementById("clearhook");
    if (clr) clr.addEventListener("click", async (e) => {
      if (!(await window.bo.confirm("自動更新の設定を解除しますか？", { confirmLabel: "解除", danger: true }))) return;
      const r = await window.bo.api("/api/update", { _action: "delete" }, { btn: e.currentTarget, successMsg: "解除しました" });
      if (r.ok) setTimeout(() => location.reload(), 600);
    });
    const save = document.getElementById("savehook");
    if (save) save.addEventListener("click", async (e) => {
      const hookUrl = document.getElementById("hookurl").value.trim();
      if (!hookUrl) { window.bo.toast("フックURLを貼り付けてください", "err"); return; }
      const r = await window.bo.api("/api/update", { hookUrl }, { btn: e.currentTarget, successMsg: null });
      if (r.ok && r.data.ok) { window.bo.toast("自動更新を有効にしました"); setTimeout(() => location.reload(), 800); }
      else window.bo.toast((r.data && r.data.error) || "保存に失敗しました", "err");
    });
  <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/update.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/update.astro";
const $$url = "/settings/update";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Update,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
