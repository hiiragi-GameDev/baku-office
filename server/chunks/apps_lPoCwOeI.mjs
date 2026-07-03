globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const prerender = false;
const $$Apps = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Apps;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const ctx = Astro2.locals.ctx;
  const { canDevelopApps } = await import("./auth_DL5yvmzT.mjs");
  const isAdminOrg = canDevelopApps(ses.role, ses.ctx);
  const { atLeast, planLabel } = await import("./ctx_D9xObGWH.mjs").then((n) => n.J);
  const entitlement = await (await import("./client_F4fksau0.mjs")).cachedEntitlement(env).catch(() => "free");
  const okPlan = (minPlan) => !minPlan || atLeast(entitlement, minPlan);
  await import("./index_pgwuXuOD.mjs");
  const { appCatalog, installedAppIds, MANDATORY_APPS } = await import("./apps_qko8nJrR.mjs");
  const { registeredParts } = await import("./parts_BnninK9G.mjs").then((n) => n.f);
  const { listExternalApps, listDrafts, installedAppLaunchers, isRegisteredPart, reconcileInstalledParts } = await import("./external-apps_Ltsw3Yx-.mjs").then((n) => n.B);
  const { storeCatalog, myApps } = await import("./store_D30lmPXJ.mjs");
  const cat = appCatalog();
  if (isAdminOrg) await reconcileInstalledParts(ctx).catch(() => 0);
  const [installedIds, externalApps, drafts, extLaunch, store, mine] = await Promise.all([
    installedAppIds(ctx),
    isAdminOrg ? listExternalApps(ctx) : Promise.resolve([]),
    isAdminOrg ? listDrafts(ctx) : Promise.resolve([]),
    installedAppLaunchers(ctx, ses.role).catch(() => []),
    storeCatalog(env).catch(() => []),
    isAdminOrg ? myApps(env).catch(() => []) : Promise.resolve([])
  ]);
  const installed = new Set(installedIds);
  const isOn = (id) => installed.has(id);
  const genDrafts = (() => {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const d of drafts) {
      if (d.gate_status === "blocked") continue;
      if (seen.has(d.name)) continue;
      seen.add(d.name);
      out.push(d);
    }
    return out;
  })();
  const draftById = new Map(genDrafts.map((d) => [d.id, d]));
  const extIds = new Set(externalApps.map((a) => a.id));
  const draftOnly = genDrafts.filter((d) => !extIds.has(d.id));
  const registeredCards = externalApps.map((a) => ({ ext: a, draft: draftById.get(a.id) ?? null }));
  const isMust = (id) => MANDATORY_APPS.includes(id);
  const isOrg = ses.ctx === "org";
  const launch = registeredParts().filter((p) => installed.has(p.id) && (p.menu?.length ?? 0) > 0 && okPlan(p.minPlan) && (isOrg || !p.orgOnly)).flatMap((p) => (p.menu ?? []).map((m) => ({ app: p.name, href: m.href, label: m.label, icon: p.icon })));
  const firstChar = (s) => [...s || ""][0] ?? "□";
  const allItems = [
    ...launch.map((l) => ({ href: l.href, label: l.label, app: l.app, icon: l.icon || firstChar(l.label) })),
    ...extLaunch.map((a) => ({ href: a.href, label: a.name, app: a.category, icon: a.icon || firstChar(a.name) }))
  ];
  const launcherItems = [...new Map(allItems.map((i) => [i.href, i])).values()];
  const folders = await (await import("./settings_dTyIbTCR.mjs")).getAppFolders(env, ses.uid).catch(() => []);
  const projectsList = isAdminOrg ? await import("./projects_B_gexkwU.mjs").then((m) => Promise.all([m.listProjects(env), m.projectAppCounts(env)])).catch(() => [[], {}]) : [[], {}];
  const [projectsRows, projectsCounts] = projectsList;
  const ENT_OPTS = ["free", "plus", "pro", "nonprofit", "enterprise"];
  const ACCESS_ROLES = [["accounting", "会計"], ["clerical", "庶務"], ["other", "その他"], ["member", "メンバー"]];
  const ROLE_LABEL = { accounting: "会計", clerical: "庶務", other: "その他", member: "メンバー", admin: "管理者", developer: "開発者" };
  const accessLabel = (roles) => {
    if (!roles || roles.length === 0) return "現在：全員つかえる（未設定）";
    if (roles.length === 1 && roles[0] === "admin") return "現在：管理者のみ";
    if (roles.includes("member")) return "現在：全員（一般メンバー）";
    return "現在：" + roles.map((r) => ROLE_LABEL[r] ?? r).join("・") + " のみ";
  };
  const hueOf = (s) => {
    let h = 0;
    for (const ch of s) h = h * 31 + (ch.codePointAt(0) ?? 0) >>> 0;
    return h % 360;
  };
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "アプリ", "active": "/apps", "denseMobile": true, "data-astro-cid-lo5sges7": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="spread" style="flex-wrap:wrap;gap:12px" data-astro-cid-lo5sges7> <h1 style="margin:0" data-astro-cid-lo5sges7>アプリ</h1> ${isAdminOrg && renderTemplate`<div class="seg" id="apps-seg" role="group" aria-label="表示切替" data-astro-cid-lo5sges7> <button class="seg-opt on" type="button" data-tab="apps" data-astro-cid-lo5sges7>アプリ</button> <button class="seg-opt" type="button" data-tab="store" data-astro-cid-lo5sges7>ストア</button> </div>`} </div> <div class="apps-panel" data-panel="apps" data-astro-cid-lo5sges7> ${isAdminOrg && renderTemplate`<div class="card" style="margin-bottom:12px" data-astro-cid-lo5sges7> <div class="spread" style="align-items:center;flex-wrap:wrap;gap:8px" data-astro-cid-lo5sges7> <strong data-astro-cid-lo5sges7>プロジェクト</strong> <a class="btn btn-sm btn-ghost" href="/projects" data-astro-reload data-astro-cid-lo5sges7>すべて見る / 新規作成</a> </div> <p class="muted" style="font-size:.82rem;margin:.2rem 0 .5rem" data-astro-cid-lo5sges7>事業・イベント単位でアプリと公開ページ（LP）を束ね、横断で集計・管理できます。</p> ${projectsRows.length === 0 ? renderTemplate`<p class="muted" style="font-size:.85rem;margin:0" data-astro-cid-lo5sges7>まだプロジェクトはありません。<a href="/projects" data-astro-reload data-astro-cid-lo5sges7>作成する</a></p>` : renderTemplate`<div style="display:flex;gap:8px;flex-wrap:wrap" data-astro-cid-lo5sges7> ${projectsRows.map((p) => renderTemplate`<a class="btn btn-sm btn-ghost"${addAttribute(`/project/${p.id}`, "href")} data-astro-reload data-astro-cid-lo5sges7>📁 ${p.name}（${projectsCounts[p.id] ?? 0}）</a>`)} </div>`} </div>`} <div class="card launcher" data-astro-cid-lo5sges7> <div class="launcher-head" data-astro-cid-lo5sges7> <strong data-astro-cid-lo5sges7>アプリ</strong> <div class="launcher-tools" data-astro-cid-lo5sges7> <input id="lf-q" type="search" placeholder="アプリを検索" aria-label="アプリを検索" data-astro-cid-lo5sges7> <button class="btn btn-sm btn-ghost" id="lf-newfolder" type="button" hidden data-astro-cid-lo5sges7>＋ フォルダ</button> <button class="btn btn-sm btn-ghost" id="lf-organize" type="button" aria-pressed="false" data-astro-cid-lo5sges7>整理</button> </div> </div> <p class="muted lf-hint" id="lf-hint" hidden style="font-size:.82rem;margin:.2rem 0 .6rem" data-astro-cid-lo5sges7>「整理」中：各アプリの <strong data-astro-cid-lo5sges7>📁</strong> でフォルダに入れ、フォルダ名で並べ替えできます。もう一度「整理」で完了。</p>  <div id="launcher-root" class="launch-grid"${addAttribute(isAdminOrg ? "1" : "0", "data-admin")} data-astro-cid-lo5sges7></div> <p class="muted" id="launcher-empty" style="font-size:.9rem" hidden data-astro-cid-lo5sges7></p> <div id="launcher-data" hidden${addAttribute(JSON.stringify({ items: launcherItems, folders }), "data-launcher")} data-astro-cid-lo5sges7></div> <noscript> <div class="launch-grid" data-astro-cid-lo5sges7> ${launcherItems.map((l) => renderTemplate`<a class="launch-card"${addAttribute(l.href, "href")}${addAttribute(`--lc-h:${hueOf(l.label)}`, "style")} data-astro-reload data-astro-cid-lo5sges7><span class="lc-icon" aria-hidden="true" data-astro-cid-lo5sges7>${l.icon}</span><span class="lc-label" data-astro-cid-lo5sges7>${l.label}</span><span class="lc-app" data-astro-cid-lo5sges7>${l.app !== l.label ? l.app : " "}</span></a>`)} </div> </noscript> </div> ${isAdminOrg && renderTemplate`<section class="app-manage" data-astro-cid-lo5sges7> <div class="manage-head" data-astro-cid-lo5sges7> <h2 style="margin:0" data-astro-cid-lo5sges7>アプリの管理</h2> <button class="btn btn-primary" id="add-app-btn" type="button" aria-expanded="false" data-astro-cid-lo5sges7>＋ アプリを追加</button> </div> <p class="muted" style="margin:.2rem 0 0" data-astro-cid-lo5sges7>使うアプリの追加・オンオフ・だれが使えるか・削除を、ここでまとめて行えます。</p>  <div class="add-menu card" id="add-menu" hidden data-astro-cid-lo5sges7> <p class="muted" style="margin:0 0 .6rem" data-astro-cid-lo5sges7>どの方法で追加しますか？</p> <div class="add-choices" data-astro-cid-lo5sges7> <button class="add-choice" type="button" id="add-store" data-astro-cid-lo5sges7><span class="ac-emoji" aria-hidden="true" data-astro-cid-lo5sges7>🛍️</span><span class="ac-t" data-astro-cid-lo5sges7>ストアからさがす</span><span class="ac-d" data-astro-cid-lo5sges7>公開されているアプリから選ぶ</span></button> <a class="add-choice" href="/" data-astro-cid-lo5sges7><span class="ac-emoji" aria-hidden="true" data-astro-cid-lo5sges7>✨</span><span class="ac-t" data-astro-cid-lo5sges7>AIに作ってもらう</span><span class="ac-d" data-astro-cid-lo5sges7>「〜するアプリを作って」と相談</span></a> <button class="add-choice" type="button" id="add-csv-btn" data-astro-cid-lo5sges7><span class="ac-emoji" aria-hidden="true" data-astro-cid-lo5sges7>📄</span><span class="ac-t" data-astro-cid-lo5sges7>表（CSV）から作る</span><span class="ac-d" data-astro-cid-lo5sges7>手元の表をアプリに変換</span></button> <button class="add-choice" type="button" id="add-id-btn" data-astro-cid-lo5sges7><span class="ac-emoji" aria-hidden="true" data-astro-cid-lo5sges7>🔗</span><span class="ac-t" data-astro-cid-lo5sges7>配布アプリIDで追加</span><span class="ac-d" data-astro-cid-lo5sges7>配られたアプリIDを入れて追加</span></button> </div>  <div class="add-form" id="add-csv" hidden data-astro-cid-lo5sges7> <p class="muted" style="margin:0 0 .4rem;font-size:.85rem" data-astro-cid-lo5sges7>表（CSV）の1行目を見出しとして読み取り、登録・一覧・編集・削除ができるアプリをAIが作ります。</p> <div class="row" style="flex-wrap:wrap;gap:8px" data-astro-cid-lo5sges7> <input id="csv-name" placeholder="アプリ名（例 顧客台帳）" style="flex:1 1 160px" data-astro-cid-lo5sges7> <input id="csv-file" type="file" accept=".csv,text/csv" style="flex:1 1 200px" data-astro-cid-lo5sges7> <button class="btn btn-primary" id="csv-go" style="flex:0 0 auto" data-astro-cid-lo5sges7>この表から作る</button> </div> <div class="muted" id="csv-msg" style="margin-top:6px;font-size:.85rem" data-astro-cid-lo5sges7></div> </div>  <div class="add-form" id="add-id" hidden data-astro-cid-lo5sges7> <div class="row" data-astro-cid-lo5sges7><input id="ext-id" placeholder="アプリID（例 inventory）" style="flex:1" data-astro-cid-lo5sges7><button class="btn btn-primary" id="fetchApp" style="flex:0 0 auto" data-astro-cid-lo5sges7>追加する</button></div> <p class="muted" style="margin:.4rem 0 0;font-size:.78rem" data-astro-cid-lo5sges7>ほかで配布されたアプリを、IDを入れて追加します（配布元の署名を検証して取り込みます。再デプロイ不要）。</p> </div> </div>  <details class="collapse" data-ck="parts" open data-astro-cid-lo5sges7> <summary class="manage-sub" data-astro-cid-lo5sges7><span data-astro-cid-lo5sges7>使う機能をえらぶ</span><span class="muted" style="font-size:.8rem" data-astro-cid-lo5sges7>${cat.filter((p) => isOn(p.id)).length}/${cat.length} 使用中</span></summary> <div class="card app-install" data-mgmt-list data-astro-cid-lo5sges7> <p class="muted" data-astro-cid-lo5sges7>使う機能を選びます。外すと画面・道具とも消えます（<strong data-astro-cid-lo5sges7>AIチャットは Plus 以上で必須</strong>）。</p> <div class="mgmt-toolbar" data-astro-cid-lo5sges7> <input type="search" class="mgmt-q" placeholder="機能を検索" aria-label="機能を検索" data-astro-cid-lo5sges7> <select class="mgmt-sort" aria-label="並べ替え" data-astro-cid-lo5sges7><option value="default" data-astro-cid-lo5sges7>既定の順</option><option value="name-asc" data-astro-cid-lo5sges7>名前順（あ→ん）</option><option value="name-desc" data-astro-cid-lo5sges7>名前順（ん→あ）</option></select> </div> <div class="mgmt-items" data-astro-cid-lo5sges7> ${cat.map((p) => renderTemplate`<div class="field"${addAttribute(p.name, "data-name")}${addAttribute(`${p.name} ${p.category ?? ""} ${p.description ?? ""}`.toLowerCase(), "data-search")} data-astro-cid-lo5sges7><label data-astro-cid-lo5sges7> <input type="checkbox" class="app-chk"${addAttribute(`appchk-${p.id}`, "id")} name="app-feature"${addAttribute(p.id, "value")}${addAttribute(isOn(p.id), "checked")}${addAttribute(isMust(p.id) || !okPlan(p.minPlan), "disabled")} data-astro-cid-lo5sges7> <strong data-astro-cid-lo5sges7>${p.name}</strong> <span class="muted" data-astro-cid-lo5sges7>v${p.version}${p.category ? `・${p.category}` : ""}${isMust(p.id) ? "・必須" : ""}${p.minPlan && !okPlan(p.minPlan) ? `・要${planLabel(p.minPlan)}` : ""}</span> ${p.description && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-lo5sges7": true }, { "default": async ($$result3) => renderTemplate`<br data-astro-cid-lo5sges7><span class="muted" style="font-size:.85rem" data-astro-cid-lo5sges7>${p.description}</span>` })}`} ${p.permissions.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-lo5sges7": true }, { "default": async ($$result3) => renderTemplate`<br data-astro-cid-lo5sges7><span class="muted" style="font-size:.8rem" data-astro-cid-lo5sges7>権限: ${p.permissions.join(" / ")}</span>` })}`} </label></div>`)} </div> <button class="btn btn-primary" id="saveApps" data-astro-cid-lo5sges7>この内容で保存</button> </div> </details>  <p class="admin-zone-label" data-astro-cid-lo5sges7>管理者向け<span class="muted" data-astro-cid-lo5sges7>（つくる・公開・配布・権限）</span></p>  <details class="collapse" data-ck="ext" data-astro-cid-lo5sges7> <summary class="manage-sub" data-astro-cid-lo5sges7><span data-astro-cid-lo5sges7>追加・生成したアプリ</span><span class="muted" style="font-size:.8rem" data-astro-cid-lo5sges7>${draftOnly.length + registeredCards.length} 件</span></summary> ${draftOnly.length + registeredCards.length === 0 && renderTemplate`<p class="muted" data-astro-cid-lo5sges7>まだアプリはありません。上の「＋ アプリを追加」（AIに相談／表(CSV)から作る）から増やせます。</p>`} ${draftOnly.length + registeredCards.length > 0 && renderTemplate`<div data-mgmt-list data-astro-cid-lo5sges7> <p class="muted" style="font-size:.82rem;margin:.2rem 0 .6rem" data-astro-cid-lo5sges7><span class="pill warn" style="margin-right:2px" data-astro-cid-lo5sges7>未登録</span> はAIが生成した草案です。プレビューで動作確認して登録するか、セルフチェックを通してストアへ公開申請できます。登録すると <span class="pill ok" style="margin:0 2px" data-astro-cid-lo5sges7>登録済</span> になり、編集や公開申請は各カードの「開発・公開（草案）」から続けられます。</p> <div class="mgmt-toolbar" data-astro-cid-lo5sges7> <input type="search" class="mgmt-q" placeholder="アプリを検索（名前・ID・権限・状態）" aria-label="アプリを検索" data-astro-cid-lo5sges7> <select class="mgmt-sort" aria-label="並べ替え" data-astro-cid-lo5sges7><option value="default" data-astro-cid-lo5sges7>未登録→追加が新しい順</option><option value="name-asc" data-astro-cid-lo5sges7>名前順（あ→ん）</option><option value="name-desc" data-astro-cid-lo5sges7>名前順（ん→あ）</option></select> </div> <div class="mgmt-items" data-astro-cid-lo5sges7> ${draftOnly.map((d) => renderTemplate`<div class="card mgmt-card"${addAttribute(d.id, "data-draft")}${addAttribute(`app-${d.id}`, "id")}${addAttribute(d.name, "data-name")}${addAttribute(`${d.name} ${d.id} ${d.permissions.join(" ")} 未登録 草案 生成`.toLowerCase(), "data-search")} data-astro-cid-lo5sges7> <div class="mgmt-top" data-astro-cid-lo5sges7> <div class="mgmt-name" data-astro-cid-lo5sges7> <strong data-astro-cid-lo5sges7>${d.name}</strong> <span class="pill warn" style="margin-left:6px" data-astro-cid-lo5sges7>未登録</span> <span${addAttribute("pill " + (d.gate_status === "ready" ? "ok" : d.gate_status === "blocked" ? "danger" : ""), "class")} style="margin-left:4px"${addAttribute(`状態: ${d.gate_status === "ready" ? "実装可" : d.gate_status === "blocked" ? "ブロック" : "企画中"}`, "aria-label")} data-astro-cid-lo5sges7>${d.gate_status === "ready" ? "実装可" : d.gate_status === "blocked" ? "ブロック" : "企画中"}</span> ${d.selfcheck_status && renderTemplate`<span${addAttribute("pill " + (d.selfcheck_status === "pass" ? "ok" : "danger"), "class")} style="margin-left:4px" data-astro-cid-lo5sges7>${d.selfcheck_status === "pass" ? "セルフチェック通過" : "セルフチェック要修正"}</span>`} <div class="muted" style="font-size:.78rem;margin-top:2px" data-astro-cid-lo5sges7><code data-astro-cid-lo5sges7>${d.id}</code>・v${d.version}${d.forked_from_id ? `・派生元: ${d.forked_from_name || d.forked_from_id}${d.forked_from_version ? ` v${d.forked_from_version}` : ""}` : ""}</div> ${d.spec && renderTemplate`<div class="muted" style="font-size:.82rem;margin-top:2px" data-astro-cid-lo5sges7>仕様: ${d.spec}</div>`} <div class="muted" style="font-size:.78rem" data-astro-cid-lo5sges7>要求権限: ${d.permissions.join(" / ") || "なし"}</div> </div> </div>  <div class="meta-edit" style="margin-top:.4rem;display:flex;flex-wrap:wrap;gap:.4rem;align-items:center" data-astro-cid-lo5sges7> <span class="muted" style="font-size:.78rem" data-astro-cid-lo5sges7>分類</span> <input class="m-cat"${addAttribute(d.category ?? "", "value")} placeholder="例 集計" style="flex:0 0 130px;padding:5px 8px;font-size:.82rem" data-astro-cid-lo5sges7> <span class="muted" style="font-size:.78rem" data-astro-cid-lo5sges7>タグ</span> <input class="m-tags"${addAttribute((d.tags ?? []).join(", "), "value")} placeholder="カンマ区切り（例 CSV, 月次）" style="flex:1 1 200px;padding:5px 8px;font-size:.82rem" data-astro-cid-lo5sges7> <button class="btn btn-ghost btn-sm m-meta-save" style="flex:0 0 auto" data-astro-cid-lo5sges7>保存</button> <button class="btn btn-ghost btn-sm m-retag" style="flex:0 0 auto" title="AIに分類・タグを付け直してもらう" data-astro-cid-lo5sges7>AIで再付与</button> </div> ${d.preflight && renderTemplate`<ul style="margin:.4rem 0 0;padding-left:1.1rem;font-size:.82rem" data-astro-cid-lo5sges7>${d.preflight.checks.map((c) => renderTemplate`<li class="muted" data-astro-cid-lo5sges7>[${c.status === "ok" ? "可" : c.status === "warn" ? "注意" : "不可"}] ${c.label}：${c.detail}</li>`)}</ul>`} <div class="row" style="margin-top:.4rem;flex-wrap:wrap;gap:.4rem" data-astro-cid-lo5sges7><a${addAttribute("btn btn-primary d-preview" + (d.gate_status !== "ready" ? " is-disabled" : ""), "class")}${addAttribute(d.gate_status === "ready" ? `/app/${d.id}?preview=1` : "#", "href")} data-astro-reload style="flex:0 0 auto" data-astro-cid-lo5sges7>プレビュー・動作確認して登録</a><button class="btn d-local" style="flex:0 0 auto"${addAttribute(d.gate_status !== "ready", "disabled")} title="動作確認を省略して直接登録" data-astro-cid-lo5sges7>そのまま登録</button><button class="btn d-selfcheck" style="flex:0 0 auto"${addAttribute(d.gate_status !== "ready", "disabled")} data-astro-cid-lo5sges7>セルフチェックして公開申請</button>${d.forked_from_id && renderTemplate`<button class="btn btn-ghost d-merge" style="flex:0 0 auto" data-astro-cid-lo5sges7>フォーク元の更新を確認</button>`}<button class="btn btn-ghost d-del" style="flex:0 0 auto" data-astro-cid-lo5sges7>削除</button></div> ${d.forked_from_id && renderTemplate`<div class="mg-box" hidden style="margin-top:.5rem;border-top:1px dashed var(--line,#e5e5e5);padding-top:.5rem" data-astro-cid-lo5sges7><div class="mg-msg muted" style="font-size:.85rem" aria-live="polite" data-astro-cid-lo5sges7></div><div class="mg-actions" hidden style="margin-top:.4rem" data-astro-cid-lo5sges7><button class="btn btn-primary btn-sm mg-apply" style="flex:0 0 auto" data-astro-cid-lo5sges7>この内容で取り込む</button></div></div>`} <div class="sc-box" hidden style="margin-top:.6rem;border-top:1px solid var(--line,#e5e5e5);padding-top:.5rem" data-astro-cid-lo5sges7> <div class="sc-phase muted" style="font-size:.85rem" aria-live="polite" data-astro-cid-lo5sges7></div> <ul class="sc-list" style="margin:.4rem 0 0;padding:0;list-style:none;font-size:.84rem" data-astro-cid-lo5sges7></ul> <div class="sc-actions" hidden style="margin-top:.5rem" data-astro-cid-lo5sges7><button class="btn btn-primary d-submit" style="flex:0 0 auto" data-astro-cid-lo5sges7>この内容で公開申請</button></div> </div> </div>`)} ${registeredCards.map(({ ext: a, draft: d }) => renderTemplate`<div class="card mgmt-card"${addAttribute(a.id, "data-ext")}${addAttribute(a.id, "data-roleapp")}${addAttribute(d ? a.id : void 0, "data-draft")}${addAttribute(a.allow_fork === 1 && a.source === "store" ? "1" : "0", "data-fork")}${addAttribute(`app-${a.id}`, "id")}${addAttribute(a.name, "data-name")}${addAttribute(`${a.name} ${a.id} ${a.source} ${a.permissions.join(" ")} 登録済`.toLowerCase(), "data-search")} data-astro-cid-lo5sges7> <div class="mgmt-top" data-astro-cid-lo5sges7> <div class="mgmt-name" data-astro-cid-lo5sges7> <strong data-astro-cid-lo5sges7>${a.name}</strong> <span class="pill ok" style="margin-left:6px" data-astro-cid-lo5sges7>登録済</span> <span class="pill" style="margin-left:4px" data-astro-cid-lo5sges7>${a.source === "store" ? "ストア" : a.forked_from_id ? "自作（派生）" : a.source === "draft" || a.source === "local" ? "自作" : "取り込み"}</span> ${a.allow_fork === 1 && a.source === "store" && renderTemplate`<span class="pill brand" style="margin-left:4px" data-astro-cid-lo5sges7>拡張可</span>`} ${d && d.version !== a.version && renderTemplate`<span class="pill warn" style="margin-left:4px" title="草案に未登録の変更があります" data-astro-cid-lo5sges7>未登録の変更あり</span>`} <div class="muted" style="font-size:.78rem;margin-top:2px" data-astro-cid-lo5sges7><code data-astro-cid-lo5sges7>${a.id}</code>・v${a.version}${a.forked_from_id ? `・派生元: ${a.forked_from_name || a.forked_from_id}` : ""}</div> ${a.permissions.length > 0 && renderTemplate`<div class="muted" style="font-size:.78rem" data-astro-cid-lo5sges7>使う道具: ${a.permissions.join(" / ")}</div>`} </div> <div class="mgmt-actions" data-astro-cid-lo5sges7> <a class="btn btn-sm btn-ghost"${addAttribute("/app/" + a.id, "href")} data-astro-reload data-astro-cid-lo5sges7>開く</a> ${a.allow_fork === 1 && a.source === "store" && renderTemplate`<button class="btn btn-sm btn-ghost ext-fork" data-astro-cid-lo5sges7>派生して開発</button>`} <button class="btn btn-sm btn-ghost ext-hist" data-astro-cid-lo5sges7>履歴</button> <button class="btn btn-sm btn-ghost ext-del" data-astro-cid-lo5sges7>削除</button> </div> </div> <div class="mgmt-roles" data-astro-cid-lo5sges7> <span class="muted" style="font-size:.82rem;font-weight:600" data-astro-cid-lo5sges7>だれが使える：</span> ${ACCESS_ROLES.map(([val, label]) => renderTemplate`<label class="role-chk" data-astro-cid-lo5sges7><input type="checkbox" class="ra-role"${addAttribute(`role-${a.id}-${val}`, "id")}${addAttribute(`appRole-${a.id}`, "name")}${addAttribute(val, "value")}${addAttribute(Array.isArray(a.allowed_roles) && a.allowed_roles.includes(val), "checked")} data-astro-cid-lo5sges7> ${label}</label>`)} <button class="btn btn-sm btn-primary ra-save" style="flex:0 0 auto" data-astro-cid-lo5sges7>保存</button> <span class="muted" style="font-size:.78rem" data-astro-cid-lo5sges7>${accessLabel(a.allowed_roles)}</span> </div>  ${d && renderTemplate`<details class="collapse dev-fold"${addAttribute(`dev-${a.id}`, "data-ck")} style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line)" data-astro-cid-lo5sges7> <summary class="manage-sub" style="justify-content:flex-start;gap:6px" data-astro-cid-lo5sges7><span style="font-size:.9rem" data-astro-cid-lo5sges7>開発・公開（草案）</span>${d.selfcheck_status && renderTemplate`<span${addAttribute("pill " + (d.selfcheck_status === "pass" ? "ok" : "danger"), "class")} data-astro-cid-lo5sges7>${d.selfcheck_status === "pass" ? "セルフチェック通過" : "セルフチェック要修正"}</span>`}<span class="muted" style="font-size:.78rem" data-astro-cid-lo5sges7>草案 v${d.version}</span></summary> <p class="muted" style="font-size:.8rem;margin:.2rem 0 .5rem" data-astro-cid-lo5sges7>このアプリは登録済みです。内容の編集・分類/タグ・ストアへの公開申請はここから行えます。</p> <div class="meta-edit" style="margin-top:.2rem;display:flex;flex-wrap:wrap;gap:.4rem;align-items:center" data-astro-cid-lo5sges7> <span class="muted" style="font-size:.78rem" data-astro-cid-lo5sges7>分類</span> <input class="m-cat"${addAttribute(d.category ?? "", "value")} placeholder="例 集計" style="flex:0 0 130px;padding:5px 8px;font-size:.82rem" data-astro-cid-lo5sges7> <span class="muted" style="font-size:.78rem" data-astro-cid-lo5sges7>タグ</span> <input class="m-tags"${addAttribute((d.tags ?? []).join(", "), "value")} placeholder="カンマ区切り（例 CSV, 月次）" style="flex:1 1 200px;padding:5px 8px;font-size:.82rem" data-astro-cid-lo5sges7> <button class="btn btn-ghost btn-sm m-meta-save" style="flex:0 0 auto" data-astro-cid-lo5sges7>保存</button> <button class="btn btn-ghost btn-sm m-retag" style="flex:0 0 auto" title="AIに分類・タグを付け直してもらう" data-astro-cid-lo5sges7>AIで再付与</button> </div> ${d.preflight && renderTemplate`<ul style="margin:.4rem 0 0;padding-left:1.1rem;font-size:.82rem" data-astro-cid-lo5sges7>${d.preflight.checks.map((c) => renderTemplate`<li class="muted" data-astro-cid-lo5sges7>[${c.status === "ok" ? "可" : c.status === "warn" ? "注意" : "不可"}] ${c.label}：${c.detail}</li>`)}</ul>`} <div class="row" style="margin-top:.4rem;flex-wrap:wrap;gap:.4rem" data-astro-cid-lo5sges7><a${addAttribute("btn d-preview" + (d.gate_status !== "ready" ? " is-disabled" : ""), "class")}${addAttribute(d.gate_status === "ready" ? `/app/${d.id}?preview=1` : "#", "href")} data-astro-reload style="flex:0 0 auto" data-astro-cid-lo5sges7>プレビュー</a>${d.version !== a.version && renderTemplate`<button class="btn d-local" style="flex:0 0 auto"${addAttribute(d.gate_status !== "ready", "disabled")} title="草案の内容を登録版へ反映" data-astro-cid-lo5sges7>草案の変更を登録</button>`}<button class="btn d-selfcheck" style="flex:0 0 auto"${addAttribute(d.gate_status !== "ready", "disabled")} data-astro-cid-lo5sges7>セルフチェックして公開申請</button>${d.forked_from_id && renderTemplate`<button class="btn btn-ghost d-merge" style="flex:0 0 auto" data-astro-cid-lo5sges7>フォーク元の更新を確認</button>`}<button class="btn btn-ghost d-del" style="flex:0 0 auto" title="草案を破棄（登録済アプリは残ります）" data-astro-cid-lo5sges7>草案を破棄</button></div> ${d.forked_from_id && renderTemplate`<div class="mg-box" hidden style="margin-top:.5rem;border-top:1px dashed var(--line,#e5e5e5);padding-top:.5rem" data-astro-cid-lo5sges7><div class="mg-msg muted" style="font-size:.85rem" aria-live="polite" data-astro-cid-lo5sges7></div><div class="mg-actions" hidden style="margin-top:.4rem" data-astro-cid-lo5sges7><button class="btn btn-primary btn-sm mg-apply" style="flex:0 0 auto" data-astro-cid-lo5sges7>この内容で取り込む</button></div></div>`} <div class="sc-box" hidden style="margin-top:.6rem;border-top:1px solid var(--line,#e5e5e5);padding-top:.5rem" data-astro-cid-lo5sges7> <div class="sc-phase muted" style="font-size:.85rem" aria-live="polite" data-astro-cid-lo5sges7></div> <ul class="sc-list" style="margin:.4rem 0 0;padding:0;list-style:none;font-size:.84rem" data-astro-cid-lo5sges7></ul> <div class="sc-actions" hidden style="margin-top:.5rem" data-astro-cid-lo5sges7><button class="btn btn-primary d-submit" style="flex:0 0 auto" data-astro-cid-lo5sges7>この内容で公開申請</button></div> </div> </details>`} </div>`)} </div> <p class="muted" style="font-size:.78rem;margin:.4rem 0 0" data-astro-cid-lo5sges7>「だれが使える」を<strong data-astro-cid-lo5sges7>すべて外して保存すると「管理者のみ」</strong>になります（誤って全員に公開しないための既定）。全員に公開するには<strong data-astro-cid-lo5sges7>「メンバー」を選択</strong>します。特定の役割を選ぶと、その役割の人だけに表示されます。管理者・開発者は常に使えます。</p> <div id="ext-hist-box" class="card" style="margin-top:.5rem" hidden data-astro-cid-lo5sges7></div> </div>`} </details> </section>`} </div> ${isAdminOrg && renderTemplate`<div class="apps-panel" data-panel="store" hidden data-astro-cid-lo5sges7> <h2 data-astro-cid-lo5sges7>ストア</h2> <p class="muted" data-astro-cid-lo5sges7>ホストが配信する公開アプリ。お使いのプランで入手できるものが表示されます（DL数・評価順）。</p> <div class="row" style="margin:.2rem 0 .8rem" data-astro-cid-lo5sges7><input id="store-q" type="search" placeholder="ストアを検索（名前・説明・カテゴリ）" style="flex:1" aria-label="ストアを検索" data-astro-cid-lo5sges7></div> <div class="grid" id="store-grid" data-astro-cid-lo5sges7> ${store.map((a) => renderTemplate`<div class="card"${addAttribute(a.id, "data-store")}${addAttribute(`${a.name} ${a.description ?? ""} ${a.category ?? ""} ${isRegisteredPart(a.id) ? "ツール tool" : "アプリ app"}`.toLowerCase(), "data-search")} data-astro-cid-lo5sges7> <strong data-astro-cid-lo5sges7>${a.name}</strong> <span class="muted" data-astro-cid-lo5sges7>v${a.version}${a.category ? `・${a.category}` : ""}</span> ${isRegisteredPart(a.id) ? renderTemplate`<span class="pill" style="margin-left:4px;background:#1B1D22;color:#fff" title="画面を持たないAIアシスタント用ツール。チャットから使います" data-astro-cid-lo5sges7>🛠 ツール</span>` : renderTemplate`<span class="pill brand" style="margin-left:4px" title="画面を持つアプリ。開いて使います" data-astro-cid-lo5sges7>📱 アプリ</span>`} ${a.badges.map((bd) => renderTemplate`<span class="pill brand" style="margin-left:4px" data-astro-cid-lo5sges7>${bd}</span>`)} ${a.description && renderTemplate`<div class="muted" style="font-size:.85rem;margin-top:2px" data-astro-cid-lo5sges7>${a.description}</div>`} <div class="muted" style="font-size:.8rem;margin-top:4px" data-astro-cid-lo5sges7>DL ${a.downloads} 評価 ${a.avg_rating || "—"}（${a.reviews}）${a.min_entitlement !== "free" ? `　要${a.min_entitlement}` : ""}</div> <div class="row" style="margin-top:6px" data-astro-cid-lo5sges7> <button class="btn btn-primary btn-sm st-get" style="flex:0 0 auto" data-astro-cid-lo5sges7>入手</button> <select class="st-rate" style="flex:0 0 auto" data-astro-cid-lo5sges7><option value="" data-astro-cid-lo5sges7>評価…</option><option value="5" data-astro-cid-lo5sges7>★5</option><option value="4" data-astro-cid-lo5sges7>★4</option><option value="3" data-astro-cid-lo5sges7>★3</option><option value="2" data-astro-cid-lo5sges7>★2</option><option value="1" data-astro-cid-lo5sges7>★1</option></select> </div> </div>`)} ${store.length === 0 && renderTemplate`<p class="muted" data-astro-cid-lo5sges7>公開中のアプリはありません。</p>`} </div> <p class="muted" id="store-empty" style="display:none" data-astro-cid-lo5sges7>該当するアプリがありません。</p> ${mine.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-lo5sges7": true }, { "default": async ($$result3) => renderTemplate` <h2 data-astro-cid-lo5sges7>自分の提供アプリ（ストア公開）</h2> <div class="card" data-astro-cid-lo5sges7> <p class="muted" data-astro-cid-lo5sges7>承認済みのアプリを任意でストアに公開できます。DL可能な最低プランも設定します。</p> ${mine.map((a) => renderTemplate`<div class="field"${addAttribute(a.id, "data-mine")} data-astro-cid-lo5sges7> <strong data-astro-cid-lo5sges7>${a.name}</strong> <span class="muted" data-astro-cid-lo5sges7>v${a.version}・${a.status}・DL ${a.downloads}・評価 ${a.avg || "—"}</span> ${a.forked_from_id && renderTemplate`<span class="muted" style="font-size:.78rem" data-astro-cid-lo5sges7> 派生元: ${a.forked_from_name || a.forked_from_id}（${a.forked_from_id}）</span>`} ${a.removal_requested ? renderTemplate`<span class="muted" style="font-size:.8rem" data-astro-cid-lo5sges7>（ストア削除を申請済み。ホスト承認後に確定します）</span>` : a.status === "approved" ? renderTemplate`<span class="row" style="margin-top:4px;align-items:center;flex-wrap:wrap" data-astro-cid-lo5sges7> <label data-astro-cid-lo5sges7><input type="checkbox" class="m-listed"${addAttribute(`listed-${a.id}`, "id")}${addAttribute(`listed-${a.id}`, "name")}${addAttribute(a.listed === 1, "checked")} data-astro-cid-lo5sges7> ストアに公開</label> <select class="m-ent"${addAttribute(`ent-${a.id}`, "id")}${addAttribute(`ent-${a.id}`, "name")} aria-label="公開対象プラン" style="flex:0 0 auto" data-astro-cid-lo5sges7>${ENT_OPTS.map((o) => renderTemplate`<option${addAttribute(o, "value")}${addAttribute(a.min_entitlement === o, "selected")} data-astro-cid-lo5sges7>${o}</option>`)}</select> <label title="他の利用者が、このアプリを導入して派生（拡張開発）し、新しいアプリとして公開申請できるようにします" data-astro-cid-lo5sges7><input type="checkbox" class="m-fork"${addAttribute(`fork-${a.id}`, "id")}${addAttribute(`fork-${a.id}`, "name")}${addAttribute(a.allow_fork === 1, "checked")} data-astro-cid-lo5sges7> 拡張開発（派生）を許可</label> <button class="btn btn-primary btn-sm m-save" style="flex:0 0 auto" data-astro-cid-lo5sges7>保存</button> <button class="btn btn-ghost btn-sm m-remove" style="flex:0 0 auto" data-astro-cid-lo5sges7>ストアから削除を申請</button> </span>` : renderTemplate`<span class="muted" style="font-size:.8rem" data-astro-cid-lo5sges7>（承認待ち。ホスト承認後に公開できます）</span>`} </div>`)} </div> ` })}`} </div>`}  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template([`<script data-astro-rerun>
    // 動的テキスト（AI/外部/DB由来になりうる値）を innerHTML に差し込む際のエスケープ。XSS防止の最終層。
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
    // セグメント切替（アプリ／ストア）。選択タブは保存し、再読込後も維持する。
    (function () {
      const seg = document.getElementById("apps-seg");
      if (!seg) return;
      const panels = [...document.querySelectorAll(".apps-panel")];
      const activate = (tab) => {
        seg.querySelectorAll(".seg-opt").forEach((x) => x.classList.toggle("on", x.dataset.tab === tab));
        panels.forEach((p) => { p.hidden = p.dataset.panel !== tab; });
      };
      seg.querySelectorAll(".seg-opt").forEach((b) => b.addEventListener("click", () => {
        try { localStorage.setItem("bo_apps_tab", b.dataset.tab); } catch (e) { /* noop */ }
        activate(b.dataset.tab);
      }));
      // ディープリンク：?tab=gen（旧「生成アプリ」）/?tab=apps で「アプリ」を開き、#app-<id> の生成アプリへスクロール＆一時ハイライト。
      // （チャットの「ストア申請」ボタンや完了通知からの着地に使う。生成アプリは「アプリ」に統合済みのため gen は apps に読み替える。）
      const normTab = (t) => (t === "gen" ? "apps" : t);  // 旧「生成アプリ」タブ/保存値は「アプリ」へ統合
      let deepTab = "";
      try {
        const u = new URL(location.href);
        const qt = normTab(u.searchParams.get("tab"));
        if (qt && seg.querySelector('.seg-opt[data-tab="' + qt + '"]')) deepTab = qt;
      } catch (e) { /* noop */ }
      // 復元：?tab があればそれ、無ければ保存タブ（自動更新で再読込したときに同じタブのままにする）。
      try { const t = normTab(deepTab || localStorage.getItem("bo_apps_tab")); if (t && seg.querySelector('.seg-opt[data-tab="' + t + '"]')) activate(t); } catch (e) { /* noop */ }
      if (location.hash && /^#app-/.test(location.hash)) {
        setTimeout(() => {
          const el = document.querySelector(location.hash);
          if (el) {
            // 「管理者向け」を折りたたみ既定にしたため、着地先が details 内なら祖先を開いてから可視化する。
            let p = el.closest("details"); while (p) { p.open = true; p = p.parentElement && p.parentElement.closest("details"); }
            el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 2200);
          }
        }, 200);
      }

      // 草案（AI生成）の自動更新：定期的に要約を取得し、増減・版/状態変化があれば再読込。
      const sig = (list) => (list || []).map((d) => d.id + "@" + d.version + ":" + d.gate_status).sort().join("|");
      let baseline = null;
      // soft 遷移で別ページへ移った後もポーリングが残り、無関係なページを location.reload() するのを防ぐ。
      // 起点パスを記録し、離脱したら interval を止めて何もしない。
      const startPath = location.pathname;
      let pollTimerId = null;
      async function pollDrafts() {
        if (location.pathname !== startPath) { if (pollTimerId != null) { clearInterval(pollTimerId); pollTimerId = null; } return; }
        try {
          const r = await fetch("/api/app-drafts", { headers: { accept: "application/json" } });
          if (!r.ok) return;
          const d = await r.json();
          const s = sig(d.drafts);
          if (baseline === null) { baseline = s; return; }
          if (s !== baseline) { baseline = s; if (location.pathname === startPath) location.reload(); }
        } catch (e) { /* offline */ }
      }
      pollDrafts(); pollTimerId = (window.bo?.every ? window.bo.every(pollDrafts, 6000) : setInterval(pollDrafts, 6000));
    })();
    // ＋アプリを追加：開閉とサブフォーム（CSV／配布ID）の切替。誰でも迷わないよう1つの導線に集約。
    (function () {
      const btn = document.getElementById("add-app-btn");
      const menu = document.getElementById("add-menu");
      if (!btn || !menu) return;
      const csvForm = document.getElementById("add-csv");
      const idForm = document.getElementById("add-id");
      const toggleMenu = (open) => {
        const show = open ?? menu.hidden;
        menu.hidden = !show;
        btn.setAttribute("aria-expanded", show ? "true" : "false");
        if (!show) { if (csvForm) csvForm.hidden = true; if (idForm) idForm.hidden = true; }
      };
      btn.addEventListener("click", () => toggleMenu());
      // ストアからさがす＝既存のタブ切替を再利用。
      document.getElementById("add-store")?.addEventListener("click", () => {
        document.querySelector('#apps-seg [data-tab="store"]')?.click();
      });
      // CSV／配布ID は同じ追加メニュー内でその場展開（片方を開くと他方は閉じる）。
      const reveal = (target) => {
        if (csvForm) csvForm.hidden = target !== csvForm;
        if (idForm) idForm.hidden = target !== idForm;
        target?.querySelector("input")?.focus();
      };
      document.getElementById("add-csv-btn")?.addEventListener("click", () => reveal(csvForm));
      document.getElementById("add-id-btn")?.addEventListener("click", () => reveal(idForm));
    })();
    // ランチャー：フォルダ（個人単位）＋未分類アプリをスマホのホーム画面風に描画・編集する。
    (function () {
      const root = document.getElementById("launcher-root");
      const dataEl = document.getElementById("launcher-data");
      if (!root || !dataEl) return;
      const qEl = document.getElementById("lf-q");
      const organizeBtn = document.getElementById("lf-organize");
      const newFolderBtn = document.getElementById("lf-newfolder");
      const hintEl = document.getElementById("lf-hint");
      const emptyEl = document.getElementById("launcher-empty");
      const isAdmin = root.getAttribute("data-admin") === "1";

      let data = { items: [], folders: [] };
      try { data = JSON.parse(dataEl.getAttribute("data-launcher") || "{}"); } catch (e) { /* noop */ }
      const items = Array.isArray(data.items) ? data.items : [];
      let folders = Array.isArray(data.folders) ? data.folders : [];
      const itemByHref = new Map(items.map((i) => [i.href, i]));
      // 既存フォルダから、もう存在しないアプリ(href)を除去。
      folders = folders.map((f) => ({ id: String(f.id), name: String(f.name), apps: (Array.isArray(f.apps) ? f.apps : []).filter((h) => itemByHref.has(h)) }));

      let editing = false, query = "", openFolderId = null, menuFor = null;
      const hue = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h % 360; };
      const folderOf = (href) => folders.find((f) => f.apps.includes(href)) || null;
      const ungrouped = () => items.filter((i) => !folderOf(i.href));
      const uid = () => "f" + Math.abs((Date.now() ^ (folders.length * 2654435761)) >>> 0).toString(36);

      let saveTimer = 0;
      const persist = () => {
        clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => {
          window.bo.api("/api/settings", { _action: "set_app_folders", folders }, { successMsg: null }).catch(() => {});
        }, 500);
      };

      const matches = (it) => { const t = query.trim().toLowerCase(); return !t || (it.label + " " + (it.app || "")).toLowerCase().includes(t); };

      // 1枚のアプリカード（href リンク or 整理中はメニュー付き）を生成。
      function appCard(it) {
        const a = document.createElement(editing ? "div" : "a");
        a.className = "launch-card";
        a.style.setProperty("--lc-h", String(hue(it.label)));
        if (!editing) { a.href = it.href; a.setAttribute("data-astro-reload", ""); }
        a.innerHTML = '<span class="lc-icon" aria-hidden="true"></span><span class="lc-label"></span><span class="lc-app"></span>';
        a.querySelector(".lc-icon").textContent = it.icon || "□";
        a.querySelector(".lc-label").textContent = it.label;
        a.querySelector(".lc-app").textContent = (it.app && it.app !== it.label) ? it.app : " ";
        if (editing) {
          const move = document.createElement("button");
          move.type = "button"; move.className = "lc-move"; move.title = "フォルダへ"; move.textContent = "📁";
          move.addEventListener("click", (e) => { e.stopPropagation(); openMoveMenu(it, move); });
          a.appendChild(move);
        }
        return a;
      }

      // フォルダのタイル（中身の先頭4アイコンをプレビュー）。タップで展開。
      function folderTile(f) {
        const visible = f.apps.map((h) => itemByHref.get(h)).filter(Boolean).filter(matches);
        const tile = document.createElement("div");
        tile.className = "folder-tile";
        const prev = document.createElement("div"); prev.className = "ft-prev";
        f.apps.slice(0, 4).map((h) => itemByHref.get(h)).filter(Boolean).forEach((it) => {
          const mini = document.createElement("span"); mini.className = "ft-mini"; mini.style.setProperty("--lc-h", String(hue(it.label))); mini.textContent = it.icon || "□"; prev.appendChild(mini);
        });
        const name = document.createElement("span"); name.className = "ft-name"; name.textContent = f.name;
        const count = document.createElement("span"); count.className = "ft-count"; count.textContent = f.apps.length + "個";
        tile.appendChild(prev); tile.appendChild(name); tile.appendChild(count);
        tile.addEventListener("click", () => { openFolderId = f.id; render(); });
        if (editing) {
          const ren = document.createElement("button"); ren.type = "button"; ren.className = "ft-edit"; ren.title = "名前を変更・削除"; ren.textContent = "⋯";
          ren.addEventListener("click", (e) => { e.stopPropagation(); openFolderMenu(f, ren); });
          tile.appendChild(ren);
        }
        // 検索中で中身が0件なら隠す（未分類は別途）。
        if (query.trim() && visible.length === 0) tile.style.display = "none";
        return tile;
      }

      function closeMenus() { document.querySelectorAll(".lc-menu").forEach((m) => m.remove()); menuFor = null; }

      function openMoveMenu(it, anchor) {
        closeMenus();
        const m = document.createElement("div"); m.className = "lc-menu";
        const add = (label, fn, cls) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; if (cls) b.className = cls; b.addEventListener("click", (e) => { e.stopPropagation(); closeMenus(); fn(); }); m.appendChild(b); };
        const cur = folderOf(it.href);
        folders.forEach((f) => { if (f.id !== (cur && cur.id)) add("📁 " + f.name + " へ", () => { moveTo(it.href, f.id); }); });
        add("＋ 新しいフォルダへ", () => { const nm = (prompt("新しいフォルダの名前", "") || "").trim(); if (!nm) return; const f = { id: uid(), name: nm.slice(0, 40), apps: [] }; folders.push(f); moveTo(it.href, f.id); });
        if (cur) add("フォルダから出す", () => { moveTo(it.href, null); }, "danger");
        anchor.parentElement.appendChild(m); menuFor = m;
      }

      function openFolderMenu(f, anchor) {
        closeMenus();
        const m = document.createElement("div"); m.className = "lc-menu";
        const add = (label, fn, cls) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; if (cls) b.className = cls; b.addEventListener("click", (e) => { e.stopPropagation(); closeMenus(); fn(); }); m.appendChild(b); };
        add("名前を変更", () => { const nm = (prompt("フォルダ名", f.name) || "").trim(); if (!nm) return; f.name = nm.slice(0, 40); persist(); render(); });
        add("削除（中身は未分類へ）", () => { folders = folders.filter((x) => x.id !== f.id); if (openFolderId === f.id) openFolderId = null; persist(); render(); }, "danger");
        anchor.parentElement.appendChild(m); menuFor = m;
      }

      function moveTo(href, folderId) {
        folders.forEach((f) => { f.apps = f.apps.filter((h) => h !== href); });
        if (folderId) { const f = folders.find((x) => x.id === folderId); if (f) f.apps.push(href); }
        persist(); render();
      }

      function render() {
        closeMenus();
        root.replaceChildren();
        // フォルダを開いている時はその中身だけ表示（戻る導線つき）。
        if (openFolderId) {
          const f = folders.find((x) => x.id === openFolderId);
          if (!f) { openFolderId = null; return render(); }
          const head = document.createElement("div"); head.className = "folder-open-head";
          const back = document.createElement("button"); back.type = "button"; back.className = "btn btn-sm btn-ghost"; back.textContent = "← もどる"; back.addEventListener("click", () => { openFolderId = null; render(); });
          const ttl = document.createElement("strong"); ttl.textContent = f.name;
          head.appendChild(back); head.appendChild(ttl); root.appendChild(head);
          const grid = document.createElement("div"); grid.className = "launch-grid";
          const inner = f.apps.map((h) => itemByHref.get(h)).filter(Boolean).filter(matches);
          inner.forEach((it) => grid.appendChild(appCard(it)));
          if (inner.length === 0) { const p = document.createElement("p"); p.className = "muted"; p.style.fontSize = ".9rem"; p.textContent = "このフォルダは空です。"; grid.appendChild(p); }
          root.appendChild(grid);
          return;
        }
        // 通常表示：フォルダタイル → 未分類アプリ。
        folders.forEach((f) => root.appendChild(folderTile(f)));
        ungrouped().filter(matches).forEach((it) => root.appendChild(appCard(it)));
        if (emptyEl) {
          const none = items.length === 0;
          emptyEl.hidden = !none;
          emptyEl.textContent = isAdmin ? "登録済みのアプリがありません。「ストア」や「アプリの管理」から追加してください。" : "登録済みのアプリがありません。管理者にアプリの追加を依頼してください。";
        }
      }

      qEl?.addEventListener("input", () => { query = qEl.value; render(); });
      organizeBtn?.addEventListener("click", () => {
        editing = !editing; openFolderId = null;
        organizeBtn.classList.toggle("on", editing); organizeBtn.setAttribute("aria-pressed", editing ? "true" : "false");
        organizeBtn.textContent = editing ? "完了" : "整理";
        if (newFolderBtn) newFolderBtn.hidden = !editing;
        if (hintEl) hintEl.hidden = !editing;
        render();
      });
      newFolderBtn?.addEventListener("click", () => { const nm = (prompt("新しいフォルダの名前", "") || "").trim(); if (!nm) return; folders.push({ id: uid(), name: nm.slice(0, 40), apps: [] }); persist(); render(); });
      document.addEventListener("click", (e) => { if (menuFor && !e.target.closest(".lc-menu") && !e.target.closest(".lc-move") && !e.target.closest(".ft-edit")) closeMenus(); });
      render();
    })();
    // 管理セクションの検索・並べ替え（使う機能／追加したアプリ）。表示トグル＋DOM並べ替えのみ。
    (function () {
      document.querySelectorAll("[data-mgmt-list]").forEach((wrap) => {
        const list = wrap.querySelector(".mgmt-items");
        const q = wrap.querySelector(".mgmt-q");
        const sort = wrap.querySelector(".mgmt-sort");
        if (!list) return;
        const rows = [...list.children];
        const apply = () => {
          const t = (q && q.value || "").trim().toLowerCase();
          rows.forEach((r) => { const s = r.getAttribute("data-search") || r.textContent || ""; r.style.display = (!t || s.toLowerCase().includes(t)) ? "" : "none"; });
          const mode = sort && sort.value || "default";
          if (mode !== "default") {
            const sorted = [...rows].sort((a, b) => {
              const an = (a.getAttribute("data-name") || "").toLowerCase(), bn = (b.getAttribute("data-name") || "").toLowerCase();
              return mode === "name-desc" ? bn.localeCompare(an, "ja") : an.localeCompare(bn, "ja");
            });
            sorted.forEach((r) => list.appendChild(r));
          } else {
            rows.forEach((r) => list.appendChild(r));
          }
        };
        q?.addEventListener("input", apply);
        sort?.addEventListener("change", apply);
      });
      // 折り畳み状態を localStorage に記憶。
      document.querySelectorAll("details.collapse[data-ck]").forEach((d) => {
        const key = "bo_apps_collapse_" + d.getAttribute("data-ck");
        try { if (localStorage.getItem(key) === "1") d.open = true; else if (localStorage.getItem(key) === "0") d.open = false; } catch (e) { /* noop */ }
        d.addEventListener("toggle", () => { try { localStorage.setItem(key, d.open ? "1" : "0"); } catch (e) { /* noop */ } });
      });
    })();
    // ストア検索（名前・説明・カテゴリで絞り込み）。
    (function () {
      const q = document.getElementById("store-q");
      const grid = document.getElementById("store-grid");
      const empty = document.getElementById("store-empty");
      if (!q || !grid) return;
      q.addEventListener("input", () => {
        const v = q.value.trim().toLowerCase();
        let shown = 0;
        grid.querySelectorAll("[data-store]").forEach((el) => {
          const hit = !v || (el.getAttribute("data-search") || "").includes(v);
          el.style.display = hit ? "" : "none";
          if (hit) shown++;
        });
        if (empty) empty.style.display = shown === 0 ? "" : "none";
      });
    })();
    document.getElementById("saveApps")?.addEventListener("click", async (e) => {
      const parts = [...document.querySelectorAll(".app-chk")].filter((c) => c.checked).map((c) => c.value);
      const r = await window.bo.api("/api/settings", { _action: "enabled_parts", parts }, { btn: e.currentTarget, successMsg: "導入アプリを保存しました" });
      if (r.ok) setTimeout(() => location.reload(), 600);
    });
    // CSVからアプリを作る（C2）。
    document.getElementById("csv-go")?.addEventListener("click", async (e) => {
      const fileEl = document.getElementById("csv-file");
      const f = fileEl.files && fileEl.files[0];
      const msg = document.getElementById("csv-msg");
      if (!f) { msg.textContent = "CSVファイルを選んでください。"; return; }
      msg.textContent = "読み込み中…";
      const csv = await f.text();
      const r = await window.bo.api("/api/app-from-csv", { name: (document.getElementById("csv-name").value || "").trim(), csv }, { btn: e.currentTarget });
      msg.textContent = r.ok ? (r.data?.message || "作成を開始しました。") : (r.data?.error || "失敗しました。");
    });

    // アプリのアクセス権限（ロール）の保存。
    document.querySelectorAll("[data-roleapp] .ra-save").forEach((b) => b.addEventListener("click", async (e) => {
      const box = e.currentTarget.closest("[data-roleapp]");
      const id = box.getAttribute("data-roleapp");
      const roles = [...box.querySelectorAll(".ra-role")].filter((c) => c.checked).map((c) => c.value);
      const r = await window.bo.api("/api/settings", { _action: "set_app_roles", appId: id, roles }, { btn: e.currentTarget, successMsg: "アクセス権限を保存しました" });
      if (r.ok) setTimeout(() => location.reload(), 500);
    }));
    document.getElementById("fetchApp")?.addEventListener("click", async (e) => {
      const id = (document.getElementById("ext-id").value || "").trim();
      if (!id) { window.bo.toast("アプリIDを入力", "err"); return; }
      const r = await window.bo.api("/api/settings", { _action: "fetch_app", appId: id }, { btn: e.currentTarget, successMsg: "取り込みました" });
      if (r.ok) setTimeout(() => location.reload(), 700);
    });
    document.querySelectorAll("[data-ext]").forEach((tr) => {
      const id = tr.getAttribute("data-ext");
      tr.querySelector(".ext-fork")?.addEventListener("click", async (e) => {
        const newName = (prompt("派生（フォーク）して作る新しいアプリの名前を入力してください。\\n元アプリの定義をコピーした新しい生成アプリを作成します（来歴として元アプリが記録されます）。", "")) || "";
        if (!newName.trim()) return;
        const r = await window.bo.api("/api/settings", { _action: "fork_app", appId: id, newName: newName.trim() }, { btn: e.currentTarget, successMsg: "派生アプリを作成しました（「追加・生成したアプリ」で開発・申請できます）" });
        if (r.ok) { try { localStorage.setItem("bo_apps_tab", "apps"); } catch (_) { /* noop */ } setTimeout(() => location.reload(), 900); }
      });
      tr.querySelector(".ext-del")?.addEventListener("click", async (e) => { if (!(await window.bo.confirm("このアプリをこのテナントから削除しますか？", { confirmLabel: "削除", danger: true }))) return; const deleteData = await window.bo.confirm("このアプリが保存したデータ（登録した従業員・記録など）も削除しますか？「いいえ」を選ぶとデータは残し、再導入で復活できます。", { confirmLabel: "データも削除", cancelLabel: "データは残す" }); const r = await window.bo.api("/api/settings", { _action: "delete_local_app", appId: id, deleteData }, { btn: e.currentTarget, successMsg: deleteData ? "アプリと保存データを削除しました" : "アプリを削除しました（データは保持）" }); if (r.ok) setTimeout(() => location.reload(), 500); });
      tr.querySelector(".ext-hist")?.addEventListener("click", async (e) => {
        const box = document.getElementById("ext-hist-box"); const r = await window.bo.api("/api/settings", { _action: "app_versions", appId: id }, { btn: e.currentTarget });
        if (!r.ok) return; const vs = r.data?.versions || [];
        box.hidden = false;
        box.innerHTML = \`<strong>\${esc(id)} のバージョン履歴</strong>\` + (vs.length ? vs.map((v) => \`<div class="row" style="justify-content:space-between;margin:.3rem 0;gap:.5rem"><span><code>v\${esc(v.version)}</code> <span class="muted" style="font-size:.82rem">\${esc(v.changelog || "（変更ログなし）")}</span></span><button class="btn btn-ghost v-act" data-app="\${esc(id)}" data-ver="\${esc(v.version)}">この版を有効化</button></div>\`).join("") : '<p class="muted">履歴はありません。</p>');
        box.querySelectorAll(".v-act").forEach((b) => b.addEventListener("click", async (ev) => { const t = ev.currentTarget; const r2 = await window.bo.api("/api/settings", { _action: "activate_version", appId: t.dataset.app, version: t.dataset.ver }, { btn: t, successMsg: "この版を有効化しました" }); if (r2.ok) setTimeout(() => location.reload(), 600); }));
      });
    });
    // セルフチェックの1項目を描画/更新（key で upsert）。status＝ok/warn/fail/run。
    function scIcon(s) { return s === "ok" ? "✓" : s === "warn" ? "△" : s === "fail" ? "✗" : "…"; }
    function scColor(s) { return s === "ok" ? "#2e7d32" : s === "warn" ? "#b8860b" : s === "fail" ? "#c0392b" : "#888"; }
    function renderCheck(listEl, c) {
      let li = listEl.querySelector('[data-k="' + c.key + '"]');
      if (!li) { li = document.createElement("li"); li.setAttribute("data-k", c.key); li.style.cssText = "margin:.25rem 0;display:flex;gap:.5rem;align-items:flex-start"; listEl.appendChild(li); }
      li.innerHTML = '<span style="flex:0 0 1.1rem;font-weight:700;color:' + scColor(c.status) + '">' + scIcon(c.status) + '</span>'
        + '<span><strong>' + esc(c.label || c.key) + '</strong>' + (c.ai ? ' <span class="muted" style="font-size:.75rem">(AI審査)</span>' : '')
        + '<br><span class="muted">' + esc(c.detail || "") + '</span></span>';
    }
    async function runSelfCheck(el, id, btn) {
      const box = el.querySelector(".sc-box"), phase = el.querySelector(".sc-phase"), list = el.querySelector(".sc-list"), actions = el.querySelector(".sc-actions");
      box.hidden = false; actions.hidden = true; list.innerHTML = ""; phase.textContent = "セルフチェックを開始しています…";
      btn.disabled = true;
      try {
        const resp = await fetch("/api/self-check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draftId: id }) });
        if (!resp.ok || !resp.body) { phase.textContent = "セルフチェックを開始できませんでした。時間をおいて再度お試しください。"; btn.disabled = false; return; }
        const reader = resp.body.getReader(), dec = new TextDecoder(); let buf = "";
        for (;;) {
          const { value, done } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          let i; while ((i = buf.indexOf("\\n\\n")) >= 0) {
            const line = buf.slice(0, i); buf = buf.slice(i + 2);
            if (!line.startsWith("data: ")) continue;
            let ev; try { ev = JSON.parse(line.slice(6)); } catch (_) { continue; }
            if (ev.type === "phase") phase.textContent = ev.label;
            else if (ev.type === "check") renderCheck(list, ev.check);
            else if (ev.type === "error") { phase.innerHTML = '<span style="color:#c0392b">' + esc(ev.error) + '</span>'; btn.disabled = false; }
            else if (ev.type === "done") {
              (ev.checks || []).forEach((c) => renderCheck(list, c));
              if (ev.ok) { phase.innerHTML = '<span style="color:#2e7d32;font-weight:700">✓ セルフチェック通過。公開申請できます。</span>'; actions.hidden = false; }
              else { const bad = (ev.checks || []).filter((c) => c.status === "fail").map((c) => esc(c.label)); phase.innerHTML = '<span style="color:#c0392b;font-weight:700">✗ 申請できません。</span> <span class="muted">次の項目を修正してください：' + (bad.join("、") || "（詳細は上記）") + '。修正後にもう一度実行してください。</span>'; btn.disabled = false; }
            }
          }
        }
      } catch (_) { phase.textContent = "セルフチェック中にエラーが発生しました。時間をおいて再度お試しください。"; btn.disabled = false; }
    }
    document.querySelectorAll("[data-draft]").forEach((el) => {
      const id = el.getAttribute("data-draft");
      el.querySelector(".d-local")?.addEventListener("click", async (e) => { if (!(await window.bo.confirm("動作確認を省略してこのまま登録しますか？（プレビューで確認してからの登録を推奨します）", { confirmLabel: "登録" }))) return; const r = await window.bo.api("/api/settings", { _action: "install_local", draftId: id }, { btn: e.currentTarget, successMsg: "このテナントで登録しました（公開なし）" }); if (r.ok) setTimeout(() => location.reload(), 800); });
      el.querySelector(".d-selfcheck")?.addEventListener("click", (e) => runSelfCheck(el, id, e.currentTarget));
      // 分類・タグ：手動保存／AI再付与。
      el.querySelector(".m-meta-save")?.addEventListener("click", async (e) => {
        const category = (el.querySelector(".m-cat")?.value || "").trim();
        const tags = (el.querySelector(".m-tags")?.value || "").split(/[,、\\s]+/).map((s) => s.trim()).filter(Boolean);
        await window.bo.api("/api/settings", { _action: "set_app_meta", draftId: id, category, tags }, { btn: e.currentTarget, successMsg: "分類・タグを保存しました" });
      });
      el.querySelector(".m-retag")?.addEventListener("click", async (e) => {
        const r = await window.bo.api("/api/settings", { _action: "ai_retag", draftId: id }, { btn: e.currentTarget, successMsg: "AIが分類・タグを付け直しました" });
        if (r.ok && r.data && r.data.meta) { const c = el.querySelector(".m-cat"); const t = el.querySelector(".m-tags"); if (c) c.value = r.data.meta.category || ""; if (t) t.value = (r.data.meta.tags || []).join(", "); }
      });
      el.querySelector(".d-merge")?.addEventListener("click", async (e) => {
        const box = el.querySelector(".mg-box"), msg = el.querySelector(".mg-msg"), actions = el.querySelector(".mg-actions");
        box.hidden = false; actions.hidden = true; msg.textContent = "フォーク元の更新を確認し、AIが統合案を作成しています…";
        const r = await window.bo.api("/api/settings", { _action: "merge_check", draftId: id }, { btn: e.currentTarget });
        const dt = r.data || {};
        if (!r.ok) { msg.innerHTML = '<span style="color:#c0392b">' + esc(dt.error || "確認できませんでした。") + '</span>'; return; }
        if (!dt.updated) { msg.innerHTML = '<span style="color:#2e7d32">フォーク元(v' + esc(dt.upstreamVersion || "?") + ')に更新はありません。最新です。</span>'; return; }
        if (dt.recommend === "merge") { msg.innerHTML = '<strong>フォーク元 v' + esc(dt.upstreamVersion) + ' に更新があります（AI推奨：取り込み）。</strong><br><span class="muted">' + esc(dt.rationale || "") + '</span>'; actions.hidden = false; }
        else { msg.innerHTML = '<strong>フォーク元 v' + esc(dt.upstreamVersion) + ' に更新がありますが、AIは取り込みを見送りを推奨します。</strong><br><span class="muted">' + esc(dt.rationale || "") + '</span>'; }
      });
      el.querySelector(".mg-apply")?.addEventListener("click", async (e) => {
        const r = await window.bo.api("/api/settings", { _action: "merge_apply", draftId: id }, { btn: e.currentTarget, successMsg: "フォーク元の更新を取り込みました（再度セルフチェックのうえ申請してください）" });
        if (r.ok) setTimeout(() => location.reload(), 900);
      });
      el.querySelector(".d-submit")?.addEventListener("click", async (e) => { const r = await window.bo.api("/api/settings", { _action: "submit_draft", draftId: id }, { btn: e.currentTarget, successMsg: "公開申請しました（ホスト承認待ち）" }); if (r.ok) setTimeout(() => location.reload(), 800); });
      el.querySelector(".d-del")?.addEventListener("click", async (e) => { if (!(await window.bo.confirm("この草案を削除しますか？（元に戻せません）", { confirmLabel: "削除", danger: true }))) return; const r = await window.bo.api("/api/settings", { _action: "delete_draft", draftId: id }, { btn: e.currentTarget, successMsg: "削除しました" }); if (r.ok) setTimeout(() => location.reload(), 500); });
    });
    // ストア：入手（DL）・評価
    document.querySelectorAll("[data-store]").forEach((el) => {
      const id = el.getAttribute("data-store");
      el.querySelector(".st-get")?.addEventListener("click", async (e) => { const r = await window.bo.api("/api/settings", { _action: "fetch_app", appId: id }, { btn: e.currentTarget, successMsg: null }); if (r.ok) { window.bo.toast(r.data && r.data.kind === "tool" ? "ツールを入手しました（チャットからAIが使えます）" : "入手しました（アプリ管理で有効化できます）", "ok"); setTimeout(() => location.reload(), 800); } });
      el.querySelector(".st-rate")?.addEventListener("change", async (e) => { const rating = e.currentTarget.value; if (!rating) return; const r = await window.bo.api("/api/store", { _action: "rate", appId: id, rating: Number(rating) }, { btn: e.currentTarget, successMsg: "評価しました" }); if (r.ok) setTimeout(() => location.reload(), 600); });
    });
    // 自分の提供アプリ：ストア公開設定
    document.querySelectorAll("[data-mine]").forEach((el) => {
      const id = el.getAttribute("data-mine");
      el.querySelector(".m-save")?.addEventListener("click", async (e) => {
        const listed = el.querySelector(".m-listed")?.checked || false;
        const minEntitlement = el.querySelector(".m-ent")?.value || "free";
        const allowFork = el.querySelector(".m-fork")?.checked || false;
        const r = await window.bo.api("/api/store", { _action: "set_listed", appId: id, listed, minEntitlement }, { btn: e.currentTarget, successMsg: "公開設定を保存しました" });
        if (!r.ok) return;
        await window.bo.api("/api/store", { _action: "set_allow_fork", appId: id, allow: allowFork });
        setTimeout(() => location.reload(), 600);
      });
      el.querySelector(".m-remove")?.addEventListener("click", async (e) => {
        if (!confirm("このアプリのストア削除を申請します（掲載は即時停止、ホスト承認で確定）。よろしいですか？")) return;
        const r = await window.bo.api("/api/store", { _action: "remove_request", appId: id }, { btn: e.currentTarget, successMsg: "ストア削除を申請しました（ホスト承認待ち）" });
        if (r.ok) setTimeout(() => location.reload(), 800);
      });
    });
  <\/script>`], [`<script data-astro-rerun>
    // 動的テキスト（AI/外部/DB由来になりうる値）を innerHTML に差し込む際のエスケープ。XSS防止の最終層。
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
    // セグメント切替（アプリ／ストア）。選択タブは保存し、再読込後も維持する。
    (function () {
      const seg = document.getElementById("apps-seg");
      if (!seg) return;
      const panels = [...document.querySelectorAll(".apps-panel")];
      const activate = (tab) => {
        seg.querySelectorAll(".seg-opt").forEach((x) => x.classList.toggle("on", x.dataset.tab === tab));
        panels.forEach((p) => { p.hidden = p.dataset.panel !== tab; });
      };
      seg.querySelectorAll(".seg-opt").forEach((b) => b.addEventListener("click", () => {
        try { localStorage.setItem("bo_apps_tab", b.dataset.tab); } catch (e) { /* noop */ }
        activate(b.dataset.tab);
      }));
      // ディープリンク：?tab=gen（旧「生成アプリ」）/?tab=apps で「アプリ」を開き、#app-<id> の生成アプリへスクロール＆一時ハイライト。
      // （チャットの「ストア申請」ボタンや完了通知からの着地に使う。生成アプリは「アプリ」に統合済みのため gen は apps に読み替える。）
      const normTab = (t) => (t === "gen" ? "apps" : t);  // 旧「生成アプリ」タブ/保存値は「アプリ」へ統合
      let deepTab = "";
      try {
        const u = new URL(location.href);
        const qt = normTab(u.searchParams.get("tab"));
        if (qt && seg.querySelector('.seg-opt[data-tab="' + qt + '"]')) deepTab = qt;
      } catch (e) { /* noop */ }
      // 復元：?tab があればそれ、無ければ保存タブ（自動更新で再読込したときに同じタブのままにする）。
      try { const t = normTab(deepTab || localStorage.getItem("bo_apps_tab")); if (t && seg.querySelector('.seg-opt[data-tab="' + t + '"]')) activate(t); } catch (e) { /* noop */ }
      if (location.hash && /^#app-/.test(location.hash)) {
        setTimeout(() => {
          const el = document.querySelector(location.hash);
          if (el) {
            // 「管理者向け」を折りたたみ既定にしたため、着地先が details 内なら祖先を開いてから可視化する。
            let p = el.closest("details"); while (p) { p.open = true; p = p.parentElement && p.parentElement.closest("details"); }
            el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 2200);
          }
        }, 200);
      }

      // 草案（AI生成）の自動更新：定期的に要約を取得し、増減・版/状態変化があれば再読込。
      const sig = (list) => (list || []).map((d) => d.id + "@" + d.version + ":" + d.gate_status).sort().join("|");
      let baseline = null;
      // soft 遷移で別ページへ移った後もポーリングが残り、無関係なページを location.reload() するのを防ぐ。
      // 起点パスを記録し、離脱したら interval を止めて何もしない。
      const startPath = location.pathname;
      let pollTimerId = null;
      async function pollDrafts() {
        if (location.pathname !== startPath) { if (pollTimerId != null) { clearInterval(pollTimerId); pollTimerId = null; } return; }
        try {
          const r = await fetch("/api/app-drafts", { headers: { accept: "application/json" } });
          if (!r.ok) return;
          const d = await r.json();
          const s = sig(d.drafts);
          if (baseline === null) { baseline = s; return; }
          if (s !== baseline) { baseline = s; if (location.pathname === startPath) location.reload(); }
        } catch (e) { /* offline */ }
      }
      pollDrafts(); pollTimerId = (window.bo?.every ? window.bo.every(pollDrafts, 6000) : setInterval(pollDrafts, 6000));
    })();
    // ＋アプリを追加：開閉とサブフォーム（CSV／配布ID）の切替。誰でも迷わないよう1つの導線に集約。
    (function () {
      const btn = document.getElementById("add-app-btn");
      const menu = document.getElementById("add-menu");
      if (!btn || !menu) return;
      const csvForm = document.getElementById("add-csv");
      const idForm = document.getElementById("add-id");
      const toggleMenu = (open) => {
        const show = open ?? menu.hidden;
        menu.hidden = !show;
        btn.setAttribute("aria-expanded", show ? "true" : "false");
        if (!show) { if (csvForm) csvForm.hidden = true; if (idForm) idForm.hidden = true; }
      };
      btn.addEventListener("click", () => toggleMenu());
      // ストアからさがす＝既存のタブ切替を再利用。
      document.getElementById("add-store")?.addEventListener("click", () => {
        document.querySelector('#apps-seg [data-tab="store"]')?.click();
      });
      // CSV／配布ID は同じ追加メニュー内でその場展開（片方を開くと他方は閉じる）。
      const reveal = (target) => {
        if (csvForm) csvForm.hidden = target !== csvForm;
        if (idForm) idForm.hidden = target !== idForm;
        target?.querySelector("input")?.focus();
      };
      document.getElementById("add-csv-btn")?.addEventListener("click", () => reveal(csvForm));
      document.getElementById("add-id-btn")?.addEventListener("click", () => reveal(idForm));
    })();
    // ランチャー：フォルダ（個人単位）＋未分類アプリをスマホのホーム画面風に描画・編集する。
    (function () {
      const root = document.getElementById("launcher-root");
      const dataEl = document.getElementById("launcher-data");
      if (!root || !dataEl) return;
      const qEl = document.getElementById("lf-q");
      const organizeBtn = document.getElementById("lf-organize");
      const newFolderBtn = document.getElementById("lf-newfolder");
      const hintEl = document.getElementById("lf-hint");
      const emptyEl = document.getElementById("launcher-empty");
      const isAdmin = root.getAttribute("data-admin") === "1";

      let data = { items: [], folders: [] };
      try { data = JSON.parse(dataEl.getAttribute("data-launcher") || "{}"); } catch (e) { /* noop */ }
      const items = Array.isArray(data.items) ? data.items : [];
      let folders = Array.isArray(data.folders) ? data.folders : [];
      const itemByHref = new Map(items.map((i) => [i.href, i]));
      // 既存フォルダから、もう存在しないアプリ(href)を除去。
      folders = folders.map((f) => ({ id: String(f.id), name: String(f.name), apps: (Array.isArray(f.apps) ? f.apps : []).filter((h) => itemByHref.has(h)) }));

      let editing = false, query = "", openFolderId = null, menuFor = null;
      const hue = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h % 360; };
      const folderOf = (href) => folders.find((f) => f.apps.includes(href)) || null;
      const ungrouped = () => items.filter((i) => !folderOf(i.href));
      const uid = () => "f" + Math.abs((Date.now() ^ (folders.length * 2654435761)) >>> 0).toString(36);

      let saveTimer = 0;
      const persist = () => {
        clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => {
          window.bo.api("/api/settings", { _action: "set_app_folders", folders }, { successMsg: null }).catch(() => {});
        }, 500);
      };

      const matches = (it) => { const t = query.trim().toLowerCase(); return !t || (it.label + " " + (it.app || "")).toLowerCase().includes(t); };

      // 1枚のアプリカード（href リンク or 整理中はメニュー付き）を生成。
      function appCard(it) {
        const a = document.createElement(editing ? "div" : "a");
        a.className = "launch-card";
        a.style.setProperty("--lc-h", String(hue(it.label)));
        if (!editing) { a.href = it.href; a.setAttribute("data-astro-reload", ""); }
        a.innerHTML = '<span class="lc-icon" aria-hidden="true"></span><span class="lc-label"></span><span class="lc-app"></span>';
        a.querySelector(".lc-icon").textContent = it.icon || "□";
        a.querySelector(".lc-label").textContent = it.label;
        a.querySelector(".lc-app").textContent = (it.app && it.app !== it.label) ? it.app : " ";
        if (editing) {
          const move = document.createElement("button");
          move.type = "button"; move.className = "lc-move"; move.title = "フォルダへ"; move.textContent = "📁";
          move.addEventListener("click", (e) => { e.stopPropagation(); openMoveMenu(it, move); });
          a.appendChild(move);
        }
        return a;
      }

      // フォルダのタイル（中身の先頭4アイコンをプレビュー）。タップで展開。
      function folderTile(f) {
        const visible = f.apps.map((h) => itemByHref.get(h)).filter(Boolean).filter(matches);
        const tile = document.createElement("div");
        tile.className = "folder-tile";
        const prev = document.createElement("div"); prev.className = "ft-prev";
        f.apps.slice(0, 4).map((h) => itemByHref.get(h)).filter(Boolean).forEach((it) => {
          const mini = document.createElement("span"); mini.className = "ft-mini"; mini.style.setProperty("--lc-h", String(hue(it.label))); mini.textContent = it.icon || "□"; prev.appendChild(mini);
        });
        const name = document.createElement("span"); name.className = "ft-name"; name.textContent = f.name;
        const count = document.createElement("span"); count.className = "ft-count"; count.textContent = f.apps.length + "個";
        tile.appendChild(prev); tile.appendChild(name); tile.appendChild(count);
        tile.addEventListener("click", () => { openFolderId = f.id; render(); });
        if (editing) {
          const ren = document.createElement("button"); ren.type = "button"; ren.className = "ft-edit"; ren.title = "名前を変更・削除"; ren.textContent = "⋯";
          ren.addEventListener("click", (e) => { e.stopPropagation(); openFolderMenu(f, ren); });
          tile.appendChild(ren);
        }
        // 検索中で中身が0件なら隠す（未分類は別途）。
        if (query.trim() && visible.length === 0) tile.style.display = "none";
        return tile;
      }

      function closeMenus() { document.querySelectorAll(".lc-menu").forEach((m) => m.remove()); menuFor = null; }

      function openMoveMenu(it, anchor) {
        closeMenus();
        const m = document.createElement("div"); m.className = "lc-menu";
        const add = (label, fn, cls) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; if (cls) b.className = cls; b.addEventListener("click", (e) => { e.stopPropagation(); closeMenus(); fn(); }); m.appendChild(b); };
        const cur = folderOf(it.href);
        folders.forEach((f) => { if (f.id !== (cur && cur.id)) add("📁 " + f.name + " へ", () => { moveTo(it.href, f.id); }); });
        add("＋ 新しいフォルダへ", () => { const nm = (prompt("新しいフォルダの名前", "") || "").trim(); if (!nm) return; const f = { id: uid(), name: nm.slice(0, 40), apps: [] }; folders.push(f); moveTo(it.href, f.id); });
        if (cur) add("フォルダから出す", () => { moveTo(it.href, null); }, "danger");
        anchor.parentElement.appendChild(m); menuFor = m;
      }

      function openFolderMenu(f, anchor) {
        closeMenus();
        const m = document.createElement("div"); m.className = "lc-menu";
        const add = (label, fn, cls) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; if (cls) b.className = cls; b.addEventListener("click", (e) => { e.stopPropagation(); closeMenus(); fn(); }); m.appendChild(b); };
        add("名前を変更", () => { const nm = (prompt("フォルダ名", f.name) || "").trim(); if (!nm) return; f.name = nm.slice(0, 40); persist(); render(); });
        add("削除（中身は未分類へ）", () => { folders = folders.filter((x) => x.id !== f.id); if (openFolderId === f.id) openFolderId = null; persist(); render(); }, "danger");
        anchor.parentElement.appendChild(m); menuFor = m;
      }

      function moveTo(href, folderId) {
        folders.forEach((f) => { f.apps = f.apps.filter((h) => h !== href); });
        if (folderId) { const f = folders.find((x) => x.id === folderId); if (f) f.apps.push(href); }
        persist(); render();
      }

      function render() {
        closeMenus();
        root.replaceChildren();
        // フォルダを開いている時はその中身だけ表示（戻る導線つき）。
        if (openFolderId) {
          const f = folders.find((x) => x.id === openFolderId);
          if (!f) { openFolderId = null; return render(); }
          const head = document.createElement("div"); head.className = "folder-open-head";
          const back = document.createElement("button"); back.type = "button"; back.className = "btn btn-sm btn-ghost"; back.textContent = "← もどる"; back.addEventListener("click", () => { openFolderId = null; render(); });
          const ttl = document.createElement("strong"); ttl.textContent = f.name;
          head.appendChild(back); head.appendChild(ttl); root.appendChild(head);
          const grid = document.createElement("div"); grid.className = "launch-grid";
          const inner = f.apps.map((h) => itemByHref.get(h)).filter(Boolean).filter(matches);
          inner.forEach((it) => grid.appendChild(appCard(it)));
          if (inner.length === 0) { const p = document.createElement("p"); p.className = "muted"; p.style.fontSize = ".9rem"; p.textContent = "このフォルダは空です。"; grid.appendChild(p); }
          root.appendChild(grid);
          return;
        }
        // 通常表示：フォルダタイル → 未分類アプリ。
        folders.forEach((f) => root.appendChild(folderTile(f)));
        ungrouped().filter(matches).forEach((it) => root.appendChild(appCard(it)));
        if (emptyEl) {
          const none = items.length === 0;
          emptyEl.hidden = !none;
          emptyEl.textContent = isAdmin ? "登録済みのアプリがありません。「ストア」や「アプリの管理」から追加してください。" : "登録済みのアプリがありません。管理者にアプリの追加を依頼してください。";
        }
      }

      qEl?.addEventListener("input", () => { query = qEl.value; render(); });
      organizeBtn?.addEventListener("click", () => {
        editing = !editing; openFolderId = null;
        organizeBtn.classList.toggle("on", editing); organizeBtn.setAttribute("aria-pressed", editing ? "true" : "false");
        organizeBtn.textContent = editing ? "完了" : "整理";
        if (newFolderBtn) newFolderBtn.hidden = !editing;
        if (hintEl) hintEl.hidden = !editing;
        render();
      });
      newFolderBtn?.addEventListener("click", () => { const nm = (prompt("新しいフォルダの名前", "") || "").trim(); if (!nm) return; folders.push({ id: uid(), name: nm.slice(0, 40), apps: [] }); persist(); render(); });
      document.addEventListener("click", (e) => { if (menuFor && !e.target.closest(".lc-menu") && !e.target.closest(".lc-move") && !e.target.closest(".ft-edit")) closeMenus(); });
      render();
    })();
    // 管理セクションの検索・並べ替え（使う機能／追加したアプリ）。表示トグル＋DOM並べ替えのみ。
    (function () {
      document.querySelectorAll("[data-mgmt-list]").forEach((wrap) => {
        const list = wrap.querySelector(".mgmt-items");
        const q = wrap.querySelector(".mgmt-q");
        const sort = wrap.querySelector(".mgmt-sort");
        if (!list) return;
        const rows = [...list.children];
        const apply = () => {
          const t = (q && q.value || "").trim().toLowerCase();
          rows.forEach((r) => { const s = r.getAttribute("data-search") || r.textContent || ""; r.style.display = (!t || s.toLowerCase().includes(t)) ? "" : "none"; });
          const mode = sort && sort.value || "default";
          if (mode !== "default") {
            const sorted = [...rows].sort((a, b) => {
              const an = (a.getAttribute("data-name") || "").toLowerCase(), bn = (b.getAttribute("data-name") || "").toLowerCase();
              return mode === "name-desc" ? bn.localeCompare(an, "ja") : an.localeCompare(bn, "ja");
            });
            sorted.forEach((r) => list.appendChild(r));
          } else {
            rows.forEach((r) => list.appendChild(r));
          }
        };
        q?.addEventListener("input", apply);
        sort?.addEventListener("change", apply);
      });
      // 折り畳み状態を localStorage に記憶。
      document.querySelectorAll("details.collapse[data-ck]").forEach((d) => {
        const key = "bo_apps_collapse_" + d.getAttribute("data-ck");
        try { if (localStorage.getItem(key) === "1") d.open = true; else if (localStorage.getItem(key) === "0") d.open = false; } catch (e) { /* noop */ }
        d.addEventListener("toggle", () => { try { localStorage.setItem(key, d.open ? "1" : "0"); } catch (e) { /* noop */ } });
      });
    })();
    // ストア検索（名前・説明・カテゴリで絞り込み）。
    (function () {
      const q = document.getElementById("store-q");
      const grid = document.getElementById("store-grid");
      const empty = document.getElementById("store-empty");
      if (!q || !grid) return;
      q.addEventListener("input", () => {
        const v = q.value.trim().toLowerCase();
        let shown = 0;
        grid.querySelectorAll("[data-store]").forEach((el) => {
          const hit = !v || (el.getAttribute("data-search") || "").includes(v);
          el.style.display = hit ? "" : "none";
          if (hit) shown++;
        });
        if (empty) empty.style.display = shown === 0 ? "" : "none";
      });
    })();
    document.getElementById("saveApps")?.addEventListener("click", async (e) => {
      const parts = [...document.querySelectorAll(".app-chk")].filter((c) => c.checked).map((c) => c.value);
      const r = await window.bo.api("/api/settings", { _action: "enabled_parts", parts }, { btn: e.currentTarget, successMsg: "導入アプリを保存しました" });
      if (r.ok) setTimeout(() => location.reload(), 600);
    });
    // CSVからアプリを作る（C2）。
    document.getElementById("csv-go")?.addEventListener("click", async (e) => {
      const fileEl = document.getElementById("csv-file");
      const f = fileEl.files && fileEl.files[0];
      const msg = document.getElementById("csv-msg");
      if (!f) { msg.textContent = "CSVファイルを選んでください。"; return; }
      msg.textContent = "読み込み中…";
      const csv = await f.text();
      const r = await window.bo.api("/api/app-from-csv", { name: (document.getElementById("csv-name").value || "").trim(), csv }, { btn: e.currentTarget });
      msg.textContent = r.ok ? (r.data?.message || "作成を開始しました。") : (r.data?.error || "失敗しました。");
    });

    // アプリのアクセス権限（ロール）の保存。
    document.querySelectorAll("[data-roleapp] .ra-save").forEach((b) => b.addEventListener("click", async (e) => {
      const box = e.currentTarget.closest("[data-roleapp]");
      const id = box.getAttribute("data-roleapp");
      const roles = [...box.querySelectorAll(".ra-role")].filter((c) => c.checked).map((c) => c.value);
      const r = await window.bo.api("/api/settings", { _action: "set_app_roles", appId: id, roles }, { btn: e.currentTarget, successMsg: "アクセス権限を保存しました" });
      if (r.ok) setTimeout(() => location.reload(), 500);
    }));
    document.getElementById("fetchApp")?.addEventListener("click", async (e) => {
      const id = (document.getElementById("ext-id").value || "").trim();
      if (!id) { window.bo.toast("アプリIDを入力", "err"); return; }
      const r = await window.bo.api("/api/settings", { _action: "fetch_app", appId: id }, { btn: e.currentTarget, successMsg: "取り込みました" });
      if (r.ok) setTimeout(() => location.reload(), 700);
    });
    document.querySelectorAll("[data-ext]").forEach((tr) => {
      const id = tr.getAttribute("data-ext");
      tr.querySelector(".ext-fork")?.addEventListener("click", async (e) => {
        const newName = (prompt("派生（フォーク）して作る新しいアプリの名前を入力してください。\\\\n元アプリの定義をコピーした新しい生成アプリを作成します（来歴として元アプリが記録されます）。", "")) || "";
        if (!newName.trim()) return;
        const r = await window.bo.api("/api/settings", { _action: "fork_app", appId: id, newName: newName.trim() }, { btn: e.currentTarget, successMsg: "派生アプリを作成しました（「追加・生成したアプリ」で開発・申請できます）" });
        if (r.ok) { try { localStorage.setItem("bo_apps_tab", "apps"); } catch (_) { /* noop */ } setTimeout(() => location.reload(), 900); }
      });
      tr.querySelector(".ext-del")?.addEventListener("click", async (e) => { if (!(await window.bo.confirm("このアプリをこのテナントから削除しますか？", { confirmLabel: "削除", danger: true }))) return; const deleteData = await window.bo.confirm("このアプリが保存したデータ（登録した従業員・記録など）も削除しますか？「いいえ」を選ぶとデータは残し、再導入で復活できます。", { confirmLabel: "データも削除", cancelLabel: "データは残す" }); const r = await window.bo.api("/api/settings", { _action: "delete_local_app", appId: id, deleteData }, { btn: e.currentTarget, successMsg: deleteData ? "アプリと保存データを削除しました" : "アプリを削除しました（データは保持）" }); if (r.ok) setTimeout(() => location.reload(), 500); });
      tr.querySelector(".ext-hist")?.addEventListener("click", async (e) => {
        const box = document.getElementById("ext-hist-box"); const r = await window.bo.api("/api/settings", { _action: "app_versions", appId: id }, { btn: e.currentTarget });
        if (!r.ok) return; const vs = r.data?.versions || [];
        box.hidden = false;
        box.innerHTML = \\\`<strong>\\\${esc(id)} のバージョン履歴</strong>\\\` + (vs.length ? vs.map((v) => \\\`<div class="row" style="justify-content:space-between;margin:.3rem 0;gap:.5rem"><span><code>v\\\${esc(v.version)}</code> <span class="muted" style="font-size:.82rem">\\\${esc(v.changelog || "（変更ログなし）")}</span></span><button class="btn btn-ghost v-act" data-app="\\\${esc(id)}" data-ver="\\\${esc(v.version)}">この版を有効化</button></div>\\\`).join("") : '<p class="muted">履歴はありません。</p>');
        box.querySelectorAll(".v-act").forEach((b) => b.addEventListener("click", async (ev) => { const t = ev.currentTarget; const r2 = await window.bo.api("/api/settings", { _action: "activate_version", appId: t.dataset.app, version: t.dataset.ver }, { btn: t, successMsg: "この版を有効化しました" }); if (r2.ok) setTimeout(() => location.reload(), 600); }));
      });
    });
    // セルフチェックの1項目を描画/更新（key で upsert）。status＝ok/warn/fail/run。
    function scIcon(s) { return s === "ok" ? "✓" : s === "warn" ? "△" : s === "fail" ? "✗" : "…"; }
    function scColor(s) { return s === "ok" ? "#2e7d32" : s === "warn" ? "#b8860b" : s === "fail" ? "#c0392b" : "#888"; }
    function renderCheck(listEl, c) {
      let li = listEl.querySelector('[data-k="' + c.key + '"]');
      if (!li) { li = document.createElement("li"); li.setAttribute("data-k", c.key); li.style.cssText = "margin:.25rem 0;display:flex;gap:.5rem;align-items:flex-start"; listEl.appendChild(li); }
      li.innerHTML = '<span style="flex:0 0 1.1rem;font-weight:700;color:' + scColor(c.status) + '">' + scIcon(c.status) + '</span>'
        + '<span><strong>' + esc(c.label || c.key) + '</strong>' + (c.ai ? ' <span class="muted" style="font-size:.75rem">(AI審査)</span>' : '')
        + '<br><span class="muted">' + esc(c.detail || "") + '</span></span>';
    }
    async function runSelfCheck(el, id, btn) {
      const box = el.querySelector(".sc-box"), phase = el.querySelector(".sc-phase"), list = el.querySelector(".sc-list"), actions = el.querySelector(".sc-actions");
      box.hidden = false; actions.hidden = true; list.innerHTML = ""; phase.textContent = "セルフチェックを開始しています…";
      btn.disabled = true;
      try {
        const resp = await fetch("/api/self-check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draftId: id }) });
        if (!resp.ok || !resp.body) { phase.textContent = "セルフチェックを開始できませんでした。時間をおいて再度お試しください。"; btn.disabled = false; return; }
        const reader = resp.body.getReader(), dec = new TextDecoder(); let buf = "";
        for (;;) {
          const { value, done } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          let i; while ((i = buf.indexOf("\\\\n\\\\n")) >= 0) {
            const line = buf.slice(0, i); buf = buf.slice(i + 2);
            if (!line.startsWith("data: ")) continue;
            let ev; try { ev = JSON.parse(line.slice(6)); } catch (_) { continue; }
            if (ev.type === "phase") phase.textContent = ev.label;
            else if (ev.type === "check") renderCheck(list, ev.check);
            else if (ev.type === "error") { phase.innerHTML = '<span style="color:#c0392b">' + esc(ev.error) + '</span>'; btn.disabled = false; }
            else if (ev.type === "done") {
              (ev.checks || []).forEach((c) => renderCheck(list, c));
              if (ev.ok) { phase.innerHTML = '<span style="color:#2e7d32;font-weight:700">✓ セルフチェック通過。公開申請できます。</span>'; actions.hidden = false; }
              else { const bad = (ev.checks || []).filter((c) => c.status === "fail").map((c) => esc(c.label)); phase.innerHTML = '<span style="color:#c0392b;font-weight:700">✗ 申請できません。</span> <span class="muted">次の項目を修正してください：' + (bad.join("、") || "（詳細は上記）") + '。修正後にもう一度実行してください。</span>'; btn.disabled = false; }
            }
          }
        }
      } catch (_) { phase.textContent = "セルフチェック中にエラーが発生しました。時間をおいて再度お試しください。"; btn.disabled = false; }
    }
    document.querySelectorAll("[data-draft]").forEach((el) => {
      const id = el.getAttribute("data-draft");
      el.querySelector(".d-local")?.addEventListener("click", async (e) => { if (!(await window.bo.confirm("動作確認を省略してこのまま登録しますか？（プレビューで確認してからの登録を推奨します）", { confirmLabel: "登録" }))) return; const r = await window.bo.api("/api/settings", { _action: "install_local", draftId: id }, { btn: e.currentTarget, successMsg: "このテナントで登録しました（公開なし）" }); if (r.ok) setTimeout(() => location.reload(), 800); });
      el.querySelector(".d-selfcheck")?.addEventListener("click", (e) => runSelfCheck(el, id, e.currentTarget));
      // 分類・タグ：手動保存／AI再付与。
      el.querySelector(".m-meta-save")?.addEventListener("click", async (e) => {
        const category = (el.querySelector(".m-cat")?.value || "").trim();
        const tags = (el.querySelector(".m-tags")?.value || "").split(/[,、\\\\s]+/).map((s) => s.trim()).filter(Boolean);
        await window.bo.api("/api/settings", { _action: "set_app_meta", draftId: id, category, tags }, { btn: e.currentTarget, successMsg: "分類・タグを保存しました" });
      });
      el.querySelector(".m-retag")?.addEventListener("click", async (e) => {
        const r = await window.bo.api("/api/settings", { _action: "ai_retag", draftId: id }, { btn: e.currentTarget, successMsg: "AIが分類・タグを付け直しました" });
        if (r.ok && r.data && r.data.meta) { const c = el.querySelector(".m-cat"); const t = el.querySelector(".m-tags"); if (c) c.value = r.data.meta.category || ""; if (t) t.value = (r.data.meta.tags || []).join(", "); }
      });
      el.querySelector(".d-merge")?.addEventListener("click", async (e) => {
        const box = el.querySelector(".mg-box"), msg = el.querySelector(".mg-msg"), actions = el.querySelector(".mg-actions");
        box.hidden = false; actions.hidden = true; msg.textContent = "フォーク元の更新を確認し、AIが統合案を作成しています…";
        const r = await window.bo.api("/api/settings", { _action: "merge_check", draftId: id }, { btn: e.currentTarget });
        const dt = r.data || {};
        if (!r.ok) { msg.innerHTML = '<span style="color:#c0392b">' + esc(dt.error || "確認できませんでした。") + '</span>'; return; }
        if (!dt.updated) { msg.innerHTML = '<span style="color:#2e7d32">フォーク元(v' + esc(dt.upstreamVersion || "?") + ')に更新はありません。最新です。</span>'; return; }
        if (dt.recommend === "merge") { msg.innerHTML = '<strong>フォーク元 v' + esc(dt.upstreamVersion) + ' に更新があります（AI推奨：取り込み）。</strong><br><span class="muted">' + esc(dt.rationale || "") + '</span>'; actions.hidden = false; }
        else { msg.innerHTML = '<strong>フォーク元 v' + esc(dt.upstreamVersion) + ' に更新がありますが、AIは取り込みを見送りを推奨します。</strong><br><span class="muted">' + esc(dt.rationale || "") + '</span>'; }
      });
      el.querySelector(".mg-apply")?.addEventListener("click", async (e) => {
        const r = await window.bo.api("/api/settings", { _action: "merge_apply", draftId: id }, { btn: e.currentTarget, successMsg: "フォーク元の更新を取り込みました（再度セルフチェックのうえ申請してください）" });
        if (r.ok) setTimeout(() => location.reload(), 900);
      });
      el.querySelector(".d-submit")?.addEventListener("click", async (e) => { const r = await window.bo.api("/api/settings", { _action: "submit_draft", draftId: id }, { btn: e.currentTarget, successMsg: "公開申請しました（ホスト承認待ち）" }); if (r.ok) setTimeout(() => location.reload(), 800); });
      el.querySelector(".d-del")?.addEventListener("click", async (e) => { if (!(await window.bo.confirm("この草案を削除しますか？（元に戻せません）", { confirmLabel: "削除", danger: true }))) return; const r = await window.bo.api("/api/settings", { _action: "delete_draft", draftId: id }, { btn: e.currentTarget, successMsg: "削除しました" }); if (r.ok) setTimeout(() => location.reload(), 500); });
    });
    // ストア：入手（DL）・評価
    document.querySelectorAll("[data-store]").forEach((el) => {
      const id = el.getAttribute("data-store");
      el.querySelector(".st-get")?.addEventListener("click", async (e) => { const r = await window.bo.api("/api/settings", { _action: "fetch_app", appId: id }, { btn: e.currentTarget, successMsg: null }); if (r.ok) { window.bo.toast(r.data && r.data.kind === "tool" ? "ツールを入手しました（チャットからAIが使えます）" : "入手しました（アプリ管理で有効化できます）", "ok"); setTimeout(() => location.reload(), 800); } });
      el.querySelector(".st-rate")?.addEventListener("change", async (e) => { const rating = e.currentTarget.value; if (!rating) return; const r = await window.bo.api("/api/store", { _action: "rate", appId: id, rating: Number(rating) }, { btn: e.currentTarget, successMsg: "評価しました" }); if (r.ok) setTimeout(() => location.reload(), 600); });
    });
    // 自分の提供アプリ：ストア公開設定
    document.querySelectorAll("[data-mine]").forEach((el) => {
      const id = el.getAttribute("data-mine");
      el.querySelector(".m-save")?.addEventListener("click", async (e) => {
        const listed = el.querySelector(".m-listed")?.checked || false;
        const minEntitlement = el.querySelector(".m-ent")?.value || "free";
        const allowFork = el.querySelector(".m-fork")?.checked || false;
        const r = await window.bo.api("/api/store", { _action: "set_listed", appId: id, listed, minEntitlement }, { btn: e.currentTarget, successMsg: "公開設定を保存しました" });
        if (!r.ok) return;
        await window.bo.api("/api/store", { _action: "set_allow_fork", appId: id, allow: allowFork });
        setTimeout(() => location.reload(), 600);
      });
      el.querySelector(".m-remove")?.addEventListener("click", async (e) => {
        if (!confirm("このアプリのストア削除を申請します（掲載は即時停止、ホスト承認で確定）。よろしいですか？")) return;
        const r = await window.bo.api("/api/store", { _action: "remove_request", appId: id }, { btn: e.currentTarget, successMsg: "ストア削除を申請しました（ホスト承認待ち）" });
        if (r.ok) setTimeout(() => location.reload(), 800);
      });
    });
  <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/apps.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/apps.astro";
const $$url = "/apps";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Apps,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
