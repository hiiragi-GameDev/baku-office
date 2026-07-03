globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, b as renderSlot, m as maybeRenderHead, a as addAttribute, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { kvPut } from "./kv_JIFmI05h.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import "./stripe_r-RFTlbb.mjs";
import { p as planLabel } from "./types_BVJxqWI9.mjs";
const mods = /* @__PURE__ */ Object.assign({});
const keyOf = (name) => `/src/overrides/${name}.astro`;
function overrideComponent(name) {
  return mods[keyOf(name)]?.default ?? null;
}
const $$Slot = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Slot;
  const { name } = Astro2.props;
  const Override = overrideComponent(name);
  return renderTemplate`${Override ? renderTemplate`${renderComponent($$result, "Override", Override, {})}` : renderTemplate`${renderSlot($$result, $$slots["default"])}`}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/components/Slot.astro", void 0);
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Dashboard;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const ctx = Astro2.locals.ctx;
  const isOrgAdmin = ses.role === "admin";
  const isOrg = ses.ctx === "org";
  const homeActions = isOrg ? [
    { href: "/accounting", label: "お金の記録", sub: "入金・出金・残高", icon: "M3 6h18v12H3zM3 10h18M7 15h4", tone: "money" },
    { href: "/schedule", label: "予定", sub: "行事・スケジュール", icon: "M4 5h16v15H4zM4 9h16M8 3v4M16 3v4", tone: "cal" },
    { href: "/membership", label: "名簿", sub: "会員の一覧・管理", icon: "M9 11a3 3 0 100-6 3 3 0 000 6M3 19a6 6 0 0112 0M17 11a3 3 0 000-6M21 19a6 6 0 00-4-5.7", tone: "people" },
    { href: "/import", label: "書類の取り込み", sub: "ファイル・資料を取込", icon: "M12 3v10M8 9l4 4 4-4M5 21h14", tone: "doc" }
  ] : [
    { href: "/personal", label: "メモ", sub: "メモ・領収書・予定", icon: "M12 12a4 4 0 100-8 4 4 0 000 8M4 21a8 8 0 0116 0", tone: "memo" },
    { href: "/schedule", label: "予定", sub: "行事・スケジュール", icon: "M4 5h16v15H4zM4 9h16M8 3v4M16 3v4", tone: "cal" },
    { href: "/", label: "AI", sub: "質問・相談・作成", icon: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", tone: "ai" },
    { href: "/apps", label: "アプリ", sub: "使えるアプリ一覧", icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z", tone: "apps" }
  ];
  const { pollHost, cachedEntitlement, APP_VERSION, nowSec, hasApiKey } = await import("./client_F4fksau0.mjs");
  const AI_PROVIDERS = [
    { key: "gemini", label: "Gemini" },
    { key: "claude", label: "Claude" },
    { key: "openai", label: "ChatGPT" },
    { key: "grok", label: "Grok" },
    { key: "groq", label: "Groq" },
    { key: "cerebras", label: "Cerebras" },
    { key: "github_models", label: "GitHub Models" }
  ];
  const registeredProviders = isOrgAdmin ? (await Promise.all(AI_PROVIDERS.map(async (p) => await hasApiKey(env, p.key).catch(() => false) ? p.label : null))).filter(Boolean) : [];
  const { cmpVersion } = await import("./update_BZb99hDh.mjs");
  await import("./index_pgwuXuOD.mjs");
  const { appCatalog, installedAppIds } = await import("./apps_qko8nJrR.mjs");
  const { getStorageUsage, fmtBytes } = await import("./storage-usage_CAVmHTS3.mjs");
  const { kvWritesToday, KV_WRITE_FREE_LIMIT, kvWriteLimit } = await import("./kv_JIFmI05h.mjs");
  const { scopedWidgets, enabledParts } = await import("./parts_BnninK9G.mjs").then((n) => n.f);
  const { getHomeLayout, orderedSections, HOME_SECTIONS } = await import("./home_iZZVavtW.mjs");
  const { brandName, getTheme } = await import("./theme_DFty9gzU.mjs");
  const { reviewQueue } = await import("./users_DArBIlQW.mjs");
  const { backupAlert } = await import("./backup_CQuZgyNM.mjs");
  const onboardingDismissed = isOrgAdmin ? await env.LICENSE.get("onboarding_dismissed").catch(() => null) === "1" : true;
  const instSet = new Set(await installedAppIds(ctx).catch(() => []));
  const ym = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const _apps = appCatalog().filter((a) => instSet.has(a.id)).map((a) => ({ id: a.id, version: a.version }));
  try {
    Astro2.locals.cfContext.waitUntil(pollHost(env, Astro2.url.origin, _apps).catch(() => {
    }));
  } catch {
    pollHost(env, Astro2.url.origin, _apps).catch(() => {
    });
  }
  const widgetDefs = scopedWidgets(enabledParts([...instSet]));
  const { installedAppLaunchers } = await import("./external-apps_Ltsw3Yx-.mjs").then((n) => n.B);
  const homeApps = await installedAppLaunchers(ctx, ses.role).catch(() => []);
  const [entitlement, homeLayout, theme, latestVersion, noticesRaw, lastAtRaw, backupAlertState, widgetData, kpiRaw] = await Promise.all([
    cachedEntitlement(env).catch(() => "free"),
    getHomeLayout(ctx).catch(() => null),
    getTheme(ctx).catch(() => ({})),
    env.LICENSE.get("latest_version").catch(() => null),
    env.LICENSE.get("notices_cache").catch(() => null),
    env.LICENSE.get("entitlement_at").catch(() => null),
    isOrgAdmin ? backupAlert(env).catch(() => ({ alert: false, never: false, lastAt: null })) : Promise.resolve({ alert: false, never: false, lastAt: null }),
    Promise.all(widgetDefs.map(async (w) => {
      try {
        return { title: w.title, span: w.span, ...await w.run(ctx, ses.uid) };
      } catch {
        return null;
      }
    })).then((a) => a.filter(Boolean)),
    env.LICENSE.get("kpi_cache").catch(() => null)
  ]);
  const monthStart = ym + "-01";
  const _d = /* @__PURE__ */ new Date();
  const nextMonthStart = new Date(Date.UTC(_d.getUTCFullYear(), _d.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
  let kpi = null;
  try {
    if (kpiRaw) {
      const o = JSON.parse(kpiRaw);
      if (nowSec() - o.at < 120) kpi = o;
    }
  } catch {
  }
  if (!kpi) {
    const [balanceRow, monthAgg, pending, st] = await Promise.all([
      env.DB.prepare("SELECT COALESCE(SUM(opening_balance),0) AS b FROM wallets").first().catch(() => null),
      env.DB.prepare("SELECT kind, COALESCE(SUM(amount),0) AS s FROM transactions WHERE deleted_at IS NULL AND kind IN ('income','expense') AND date >= ? AND date < ? GROUP BY kind").bind(monthStart, nextMonthStart).all().catch(() => ({ results: [] })),
      reviewQueue(env).then((r) => r.length).catch(() => 0),
      getStorageUsage(env).catch(() => [])
    ]);
    let mi = 0, me = 0;
    for (const row of monthAgg.results) {
      if (row.kind === "income") mi = row.s;
      else if (row.kind === "expense") me = row.s;
    }
    kpi = { balance: balanceRow?.b ?? 0, monthIncome: mi, monthExpense: me, pending, storage: st, at: nowSec() };
    const blob = JSON.stringify(kpi);
    try {
      Astro2.locals.cfContext.waitUntil(kvPut(env, "kpi_cache", blob).catch(() => {
      }));
    } catch {
    }
  }
  const balance = kpi.balance;
  const monthIncome = kpi.monthIncome, monthExpense = kpi.monthExpense;
  const monthNet = monthIncome - monthExpense;
  const pendingCount = kpi.pending;
  const storage = kpi.storage;
  const updateAvailable = !!latestVersion && cmpVersion(latestVersion, APP_VERSION) > 0;
  let notices = [];
  try {
    notices = JSON.parse(noticesRaw ?? "[]");
  } catch {
  }
  const lastAt = Number(lastAtRaw);
  const online = Number.isFinite(lastAt) && nowSec() - lastAt < 86400;
  const pct = (u, l) => u < 0 || l <= 0 ? 0 : Math.min(100, Math.round(u / l * 100));
  const kvWrites = isOrgAdmin ? await kvWritesToday(env).catch(() => 0) : 0;
  const kvLimit = isOrgAdmin ? await kvWriteLimit(env) : KV_WRITE_FREE_LIMIT;
  const kvPaid = kvLimit > KV_WRITE_FREE_LIMIT;
  const kvPct = kvLimit > 0 ? Math.min(100, Math.round(kvWrites / kvLimit * 100)) : 0;
  const { storageMode } = await import("./storage_BHLYBEBb.mjs");
  const { getWorkersPaid } = await import("./settings_dTyIbTCR.mjs");
  const { monthNeurons, monthUsd, monthTokens } = await import("./usage_CfukLLAj.mjs");
  const { NEURON_USD } = await import("./config_2o5HV4Wj.mjs");
  let cf = null;
  if (isOrgAdmin) {
    const [wp, neurons, usdMap, tokMap] = await Promise.all([
      getWorkersPaid(env).catch(() => false),
      monthNeurons(env).catch(() => 0),
      monthUsd(env).catch(() => ({})),
      monthTokens(env).catch(() => ({}))
    ]);
    const prov = (k, free) => ({ tokens: tokMap[k] ?? 0, usd: usdMap[k] ?? 0, free });
    const byok = { gemini: prov("gemini", true), claude: prov("claude", false), openai: prov("openai", false) };
    const byokUsd = byok.gemini.usd + byok.claude.usd + byok.openai.usd;
    cf = {
      mode: storageMode(env),
      workersPaid: wp,
      hasR2: !!env.MEDIA_R2,
      hasAI: !!env.AI,
      neurons,
      neuronUsd: Math.max(0, neurons) * NEURON_USD,
      neuronFreeMonth: 1e4 * 30,
      byok,
      byokUsd
    };
  }
  const measurable = storage.filter((s) => s.enabled && s.used >= 0 && s.limit > 0);
  const totalUsed = measurable.reduce((a, s) => a + s.used, 0);
  const totalLimit = measurable.reduce((a, s) => a + s.limit, 0);
  const totalPct = pct(totalUsed, totalLimit);
  const yen = (n) => "¥" + n.toLocaleString("ja-JP");
  const fmtDay = (s) => new Date(s * 1e3).toISOString().slice(0, 10);
  const jstHour = ((/* @__PURE__ */ new Date()).getUTCHours() + 9) % 24;
  const greeting = jstHour < 11 ? "おはようございます" : jstHour < 18 ? "こんにちは" : "おつかれさまです";
  const dispName = ses.name ? `${ses.name} さん` : "";
  const brandLabel = brandName(theme);
  const sections = orderedSections(homeLayout);
  const hiddenSet = new Set(homeLayout?.hidden ?? []);
  const clampSpan = (n) => Math.max(1, Math.min(3, Number(n) || 1));
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "ダッシュボード", "active": "/dashboard", "data-astro-cid-3nssi2tu": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Slot", $$Slot, { "name": "home-hero", "data-astro-cid-3nssi2tu": true })} ${maybeRenderHead()}<div class="home-head" data-astro-cid-3nssi2tu> <div data-astro-cid-3nssi2tu> <div class="eyebrow" data-astro-cid-3nssi2tu>${brandLabel}</div> <h1 class="h1 home-greet" style="margin:.2rem 0 0" data-astro-cid-3nssi2tu>${greeting}${dispName && renderTemplate`<span style="color:var(--muted);font-weight:600" data-astro-cid-3nssi2tu>、${dispName}</span>`}</h1> </div> <div class="home-head-right" data-astro-cid-3nssi2tu> ${isOrgAdmin && renderTemplate`<span class="pill brand" data-astro-cid-3nssi2tu>${planLabel(entitlement)}</span>`} <span class="pill"${addAttribute(online ? "24時間以内にこのアプリの利用がありました" : "24時間以上、利用記録がありません", "title")} data-astro-cid-3nssi2tu><span class="dot"${addAttribute(`background:${online ? "var(--ok)" : "var(--faint)"}`, "style")} data-astro-cid-3nssi2tu></span>${online ? "オンライン" : "未接続"}</span> ${isOrgAdmin && renderTemplate`<button class="btn btn-ghost btn-sm" id="editHome" data-astro-cid-3nssi2tu>ホームを編集</button>`} </div> </div>  <nav class="home-actions" aria-label="よく使う操作" data-astro-cid-3nssi2tu> ${homeActions.map((a) => renderTemplate`<a class="ha"${addAttribute(a.href, "href")} data-astro-cid-3nssi2tu> <span${addAttribute(`ha-ico tone-${a.tone}`, "class")} data-astro-cid-3nssi2tu><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-3nssi2tu><path${addAttribute(a.icon, "d")} data-astro-cid-3nssi2tu></path></svg></span> <span class="ha-txt" data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>${a.label}</strong><small data-astro-cid-3nssi2tu>${a.sub}</small></span> </a>`)} </nav>  <section class="home-fixed" data-astro-cid-3nssi2tu> ${isOrgAdmin && !onboardingDismissed && renderTemplate`<div class="banner banner-info" data-astro-cid-3nssi2tu>はじめにいくつか設定すると、もっと便利に使えます。<a href="/setup" data-astro-cid-3nssi2tu>はじめの設定ガイド</a>（AI・ブランド・Google連携・バックアップ）を開く。</div>`} <h2 data-astro-cid-3nssi2tu>お知らせ</h2> ${notices.length === 0 && !updateAvailable && renderTemplate`<p class="muted" data-astro-cid-3nssi2tu>現在、新しいお知らせはありません。</p>`} ${notices.map((n) => renderTemplate`<div${addAttribute(`banner ${n.severity === "critical" ? "banner-danger" : n.severity === "important" ? "banner-warn" : "banner-info"}`, "class")}${addAttribute(n.severity, "data-sev")}${addAttribute(n.id, "data-id")} data-astro-cid-3nssi2tu>${n.body}</div>`)} ${updateAvailable && renderTemplate`<div class="banner banner-warn" data-astro-cid-3nssi2tu>新しいバージョン <strong data-astro-cid-3nssi2tu>${latestVersion}</strong> があります（現在 ${APP_VERSION}）。${isOrgAdmin ? renderTemplate`<a href="/settings/update" data-astro-cid-3nssi2tu>更新する</a>` : "管理者にアプリの更新をご依頼ください。"}</div>`} ${backupAlertState.alert && renderTemplate`<div class="banner banner-warn" data-astro-cid-3nssi2tu>${backupAlertState.never ? "データのバックアップがまだ実行されていません。" : `最終バックアップから7日以上経過しています（最終：${backupAlertState.lastAt ? fmtDay(backupAlertState.lastAt) : "—"}）。`}<a href="/backup" data-astro-cid-3nssi2tu>今すぐバックアップ</a></div>`} ${cf && !hiddenSet.has("server") && renderTemplate`<div class="card cf-card" data-astro-cid-3nssi2tu>  <details class="cf-fold" data-astro-cid-3nssi2tu> <summary class="cf-head" data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>サーバー構成・使用状況（Cloudflare）</strong> <span class="muted" style="font-size:.78rem;font-weight:400" data-astro-cid-3nssi2tu>契約状況・使用量・課金の目安（開いて確認）</span></summary> <p class="muted" style="font-size:.8rem;margin:.2rem 0 .6rem" data-astro-cid-3nssi2tu>現在のサーバー（Cloudflare）の契約状況と使用量・課金の目安です。表示のみで機能には影響しません。表示/非表示は上部の「ホームを編集」から切り替えられます（他のサーバーで運用する場合は非表示に）。</p>  <div class="cf-status" data-astro-cid-3nssi2tu> <span${addAttribute("cf-badge " + (cf.mode === "r2" ? "meter" : "free"), "class")} data-astro-cid-3nssi2tu>ファイル保存：${cf.mode === "r2" ? "高度モード（R2・従量）" : "標準モード（KV・無料枠）"}</span> <span${addAttribute("cf-badge " + (cf.workersPaid ? "fixed" : "free"), "class")} data-astro-cid-3nssi2tu>Workers：${cf.workersPaid ? "Paid（月$5〜・定額）" : "無料枠"}</span> <span${addAttribute("cf-badge " + (cf.hasAI ? "meter" : "ext"), "class")} data-astro-cid-3nssi2tu>クラウドAI：${cf.hasAI ? "有効（従量）" : "未使用"}</span> </div>  <div class="cf-meters" data-astro-cid-3nssi2tu> <div class="cf-meter" data-astro-cid-3nssi2tu> <div class="cf-meter-h" data-astro-cid-3nssi2tu><span data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>保存できる容量</strong></span><span class="muted small" data-astro-cid-3nssi2tu>${totalLimit > 0 ? `${fmtBytes(totalUsed)} / ${fmtBytes(totalLimit)}（${totalPct}%）` : "計測中"}</span></div> <div class="gauge" data-astro-cid-3nssi2tu><div${addAttribute(`gfill ${totalPct >= 80 ? "hot" : ""}`, "class")}${addAttribute(`width:${totalPct}%`, "style")} data-astro-cid-3nssi2tu></div></div> <div class="muted" style="font-size:.74rem;margin-top:3px" data-astro-cid-3nssi2tu>${cf.mode === "r2" ? "R2（高度モード）は上限なし・従量課金（無料枠あり）。" : `残り ${totalLimit > 0 ? fmtBytes(Math.max(0, totalLimit - totalUsed)) : "—"}。標準モード(KV)は無料枠内。`}</div> <details class="cf-break" data-astro-cid-3nssi2tu><summary class="muted small" data-astro-cid-3nssi2tu>内訳・拡張</summary> <div class="cf-brk" data-astro-cid-3nssi2tu> ${storage.map((s) => renderTemplate`<div class="cf-brk-row" data-astro-cid-3nssi2tu> <div class="cf-meter-h" data-astro-cid-3nssi2tu><span class="small" data-astro-cid-3nssi2tu>${s.label}${!s.enabled && (s.key === "r2" ? "（未使用）" : s.key === "drive" ? "（未連携）" : "")}</span><span class="muted small" data-astro-cid-3nssi2tu>${s.used < 0 ? "計測不可" : `${fmtBytes(s.used)} / ${fmtBytes(s.limit)}`}</span></div> <div class="gauge sm" data-astro-cid-3nssi2tu><div${addAttribute(`gfill ${pct(s.used, s.limit) >= 80 ? "hot" : ""}`, "class")}${addAttribute(`width:${pct(s.used, s.limit)}%`, "style")} data-astro-cid-3nssi2tu></div></div> ${(s.hint === "paid" || s.hint === "r2") && renderTemplate`<a class="muted small" href="/settings/advanced#cloudflare" data-astro-cid-3nssi2tu>${s.hint === "r2" ? "R2を有効化" : "容量を拡張"}</a>`} ${s.key === "drive" && !s.enabled && renderTemplate`<a class="muted small" href="/drive" data-astro-cid-3nssi2tu>連携する</a>`} </div>`)} </div> </details> </div> <div class="cf-meter" data-astro-cid-3nssi2tu> <div class="cf-meter-h" data-astro-cid-3nssi2tu><span data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>通信量（保存・更新の回数／日）</strong></span><span class="muted small" data-astro-cid-3nssi2tu>本日 ${kvWrites.toLocaleString()}${kvPaid ? "（上限拡張）" : ` / ${KV_WRITE_FREE_LIMIT.toLocaleString()} 回（${kvPct}%）`}</span></div> <div class="gauge" data-astro-cid-3nssi2tu><div${addAttribute(`gfill ${kvPct >= 80 ? "hot" : ""}`, "class")}${addAttribute(`width:${kvPaid ? 0 : kvPct}%`, "style")} data-astro-cid-3nssi2tu></div></div> <div class="muted" style="font-size:.74rem;margin-top:3px" data-astro-cid-3nssi2tu>無料枠：1日 ${KV_WRITE_FREE_LIMIT.toLocaleString()} 回・毎日 午前9時（日本時間）にリセット。</div> </div> ${cf.hasAI && renderTemplate`<div class="cf-meter" data-astro-cid-3nssi2tu> <div class="cf-meter-h" data-astro-cid-3nssi2tu><span data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>クラウドAI（Workers AI）</strong></span><span class="muted small" data-astro-cid-3nssi2tu>今月 ${cf.neurons.toLocaleString()} ニューロン・概算 $${cf.neuronUsd.toFixed(2)}</span></div> <div class="gauge" data-astro-cid-3nssi2tu><div${addAttribute(`gfill ${cf.neurons / cf.neuronFreeMonth >= 0.8 ? "hot" : ""}`, "class")}${addAttribute(`width:${Math.min(100, Math.round(cf.neurons / cf.neuronFreeMonth * 100))}%`, "style")} data-astro-cid-3nssi2tu></div></div> <div class="muted" style="font-size:.74rem;margin-top:3px" data-astro-cid-3nssi2tu>無料枠の目安：1日1万ニューロン（当月 約${cf.neuronFreeMonth.toLocaleString()}）。超過分のみ従量課金（$0.011 / 1,000 ニューロン）。</div> </div>`} </div>  <div class="cf-byok" data-astro-cid-3nssi2tu> <div class="label" style="margin-bottom:6px" data-astro-cid-3nssi2tu>AI APIキー（BYOK）— 各社へ直接課金（Cloudflare外）・今月合計 概算 $${cf.byokUsd.toFixed(2)}</div> <div class="muted" style="font-size:.78rem;margin:-2px 0 8px" data-astro-cid-3nssi2tu>登録中のAIプロバイダー：${registeredProviders.length ? renderTemplate`<strong data-astro-cid-3nssi2tu>${registeredProviders.join("、")}</strong>` : renderTemplate`<span data-astro-cid-3nssi2tu>未登録（<a href="/settings/keys" data-astro-cid-3nssi2tu>連携設定で登録</a>）</span>`}</div> <div class="cf-byok-grid" data-astro-cid-3nssi2tu> ${[["Gemini", "gemini"], ["Claude", "claude"], ["ChatGPT", "openai"]].map(([name, key]) => renderTemplate`<div class="cf-byok-item" data-astro-cid-3nssi2tu> <div class="cf-byok-h" data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>${name}</strong><span${addAttribute("cf-badge " + (cf.byok[key].free ? "free" : "ext"), "class")} data-astro-cid-3nssi2tu>${cf.byok[key].free ? "無料枠あり" : "従量（無料枠なし）"}</span></div> <div class="muted small" data-astro-cid-3nssi2tu>今月 ${cf.byok[key].tokens.toLocaleString()} トークン</div> <div class="cf-byok-usd" data-astro-cid-3nssi2tu>概算 $${cf.byok[key].usd.toFixed(2)}</div> </div>`)} </div> <div class="muted" style="font-size:.74rem;margin-top:4px" data-astro-cid-3nssi2tu>概算は当システムの推定です。正確な請求額・無料枠の残りは各社の管理画面でご確認ください。</div> </div> <div class="muted" style="font-size:.8rem;margin-top:.6rem" data-astro-cid-3nssi2tu><a href="/usage" data-astro-cid-3nssi2tu>使用量を詳しく見る</a> ／ <a href="/settings/advanced#cloudflare" data-astro-cid-3nssi2tu>Cloudflare 設定</a></div> </details> </div>`} </section> ${sections.map((sec) => sec === "summary" ? renderTemplate`<section data-sec="summary" data-astro-cid-3nssi2tu> <div class="grid" data-astro-cid-3nssi2tu> <a class="card link" href="/accounting" data-astro-cid-3nssi2tu><div class="label" data-astro-cid-3nssi2tu>口座残高（期首合計）</div><div class="num" data-astro-cid-3nssi2tu>${yen(balance)}</div></a> <a class="card link" href="/accounting" data-astro-cid-3nssi2tu><div class="label" data-astro-cid-3nssi2tu>当月収支（${ym}）</div><div class="num"${addAttribute(`color:${monthNet < 0 ? "var(--danger)" : monthNet > 0 ? "var(--ok)" : "inherit"}`, "style")} data-astro-cid-3nssi2tu>${(monthNet < 0 ? "-¥" : "¥") + Math.abs(monthNet).toLocaleString("ja-JP")}</div><div class="muted" style="font-size:.78rem" data-astro-cid-3nssi2tu>収入 ${yen(monthIncome)}／支出 ${yen(monthExpense)}</div></a> <a class="card link" href="/review" data-astro-cid-3nssi2tu><div class="label" data-astro-cid-3nssi2tu>未処理伝票（承認待ち）</div><div class="num" data-astro-cid-3nssi2tu>${pendingCount}</div><div class="muted" style="font-size:.78rem" data-astro-cid-3nssi2tu>${pendingCount > 0 ? "確認してください" : "なし"}</div></a> <div class="card" data-astro-cid-3nssi2tu><div class="label" data-astro-cid-3nssi2tu>プラン / ライセンス</div><div class="num" style="font-size:1.1rem" data-astro-cid-3nssi2tu>${planLabel(entitlement)}</div></div> </div> </section>` : sec === "widgets" ? widgetData.length > 0 && renderTemplate`<section data-sec="widgets" data-astro-cid-3nssi2tu> <h2 data-astro-cid-3nssi2tu>アプリの状況</h2> <div class="grid wgrid" data-astro-cid-3nssi2tu> ${widgetData.map((w) => renderTemplate`<div class="card"${addAttribute(`grid-column:span ${clampSpan(w.span)}`, "style")} data-astro-cid-3nssi2tu><div class="label" data-astro-cid-3nssi2tu>${w.title}</div><div class="num" data-astro-cid-3nssi2tu>${w.value}</div>${w.sub && renderTemplate`<div class="muted" style="font-size:.82rem" data-astro-cid-3nssi2tu>${w.sub}</div>`}</div>`)} </div> </section>` : sec === "storage" ? cf ? null : renderTemplate`<section data-sec="storage" data-astro-cid-3nssi2tu> <h2 data-astro-cid-3nssi2tu>保存できる容量</h2> ${totalPct >= 80 && renderTemplate`<div class="banner banner-warn" data-astro-cid-3nssi2tu>保存できる容量が残りわずかです（${totalPct}% 使用）。${isOrgAdmin ? "下の「内訳」から拡張をご検討ください。" : "管理者にご相談ください。"}</div>`} <div class="card" data-astro-cid-3nssi2tu> <div class="label" data-astro-cid-3nssi2tu>いまの使用状況</div> <div class="gauge" data-astro-cid-3nssi2tu><div${addAttribute(`gfill ${totalPct >= 80 ? "hot" : ""}`, "class")}${addAttribute(`width:${totalPct}%`, "style")} data-astro-cid-3nssi2tu></div></div> <div class="muted" style="margin-top:6px" data-astro-cid-3nssi2tu>${totalLimit > 0 ? `${fmtBytes(totalUsed)} / ${fmtBytes(totalLimit)}（${totalPct}%）` : "計測中"}</div> </div> ${isOrgAdmin && renderTemplate`<div class="card" style="margin-top:.6rem" data-astro-cid-3nssi2tu> <div class="label" data-astro-cid-3nssi2tu>通信量（保存・更新の回数）${kvPct >= 80 && renderTemplate`<span class="muted" style="font-weight:400" data-astro-cid-3nssi2tu> 残りわずか</span>`}</div> <div class="gauge" data-astro-cid-3nssi2tu><div${addAttribute(`gfill ${kvPct >= 80 ? "hot" : ""}`, "class")}${addAttribute(`width:${kvPct}%`, "style")} data-astro-cid-3nssi2tu></div></div> <div class="muted" style="margin-top:6px" data-astro-cid-3nssi2tu>本日 ${kvWrites.toLocaleString()} 回${kvPaid ? "（有料プラン・上限拡張）" : ` / ${KV_WRITE_FREE_LIMIT.toLocaleString()} 回（${kvPct}%）`}・毎日 午前9時（日本時間）にリセット ・ <a href="/usage" data-astro-cid-3nssi2tu>使用量を見る</a></div> </div>`} ${isOrgAdmin && renderTemplate`<details class="adv" data-astro-cid-3nssi2tu> <summary data-astro-cid-3nssi2tu>保存容量の内訳・拡張（管理者向け）</summary> <p class="adv-note" data-astro-cid-3nssi2tu>保存先ごとの内訳です。容量の拡張・外部ストレージの有効化はこちらから行えます。</p> <div class="grid" data-astro-cid-3nssi2tu> ${storage.map((s) => renderTemplate`<div class="card" data-astro-cid-3nssi2tu> <div class="label" data-astro-cid-3nssi2tu>${s.label}${!s.enabled && (s.key === "r2" ? "（未使用）" : s.key === "drive" ? "（未連携）" : "")}</div> <div class="gauge" data-astro-cid-3nssi2tu><div${addAttribute(`gfill ${pct(s.used, s.limit) >= 80 ? "hot" : ""}`, "class")}${addAttribute(`width:${pct(s.used, s.limit)}%`, "style")} data-astro-cid-3nssi2tu></div></div> <div class="muted" style="font-size:.85rem;margin-top:4px" data-astro-cid-3nssi2tu>${s.used < 0 ? "計測不可" : `${fmtBytes(s.used)} / ${fmtBytes(s.limit)}（${pct(s.used, s.limit)}%）`}</div> ${(s.hint === "paid" || s.hint === "r2") && renderTemplate`<div class="muted" style="font-size:.85rem;margin-top:2px" data-astro-cid-3nssi2tu><a href="/settings/advanced" data-astro-cid-3nssi2tu>${s.hint === "r2" ? "外部ストレージを有効化" : "容量プランを拡張"}</a></div>`} ${s.key === "drive" && !s.enabled && renderTemplate`<div class="muted" style="font-size:.85rem;margin-top:2px" data-astro-cid-3nssi2tu><a href="/drive" data-astro-cid-3nssi2tu>連携する</a></div>`} </div>`)} </div> </details>`} </section>` : sec === "quicklinks" ? renderTemplate`<section data-sec="quicklinks" data-astro-cid-3nssi2tu> ${homeApps.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-3nssi2tu": true }, { "default": async ($$result3) => renderTemplate` <h2 data-astro-cid-3nssi2tu>導入アプリ</h2> <div class="grid" style="margin-bottom:1rem" data-astro-cid-3nssi2tu> ${homeApps.map((a) => renderTemplate`<a class="card home-app"${addAttribute(a.href, "href")} style="text-decoration:none;color:inherit" data-astro-cid-3nssi2tu><span class="ha-icon" aria-hidden="true" data-astro-cid-3nssi2tu>${a.icon}</span><span data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>${a.name}</strong><div class="muted" style="font-size:.82rem" data-astro-cid-3nssi2tu>${a.category}</div></span></a>`)} </div> ` })}`} <h2 data-astro-cid-3nssi2tu>そのほかの機能</h2> <div class="grid" data-astro-cid-3nssi2tu> <a class="card" href="/files" style="text-decoration:none;color:inherit" data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>ファイル</strong><div class="muted" data-astro-cid-3nssi2tu>アップロード・共有</div></a> <a class="card" href="/minutes" style="text-decoration:none;color:inherit" data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>議事録</strong><div class="muted" data-astro-cid-3nssi2tu>作成・一覧</div></a> <a class="card" href="/apps" style="text-decoration:none;color:inherit" data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>アプリ</strong><div class="muted" data-astro-cid-3nssi2tu>機能の追加</div></a> <a class="card" href="/settings" style="text-decoration:none;color:inherit" data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>設定</strong><div class="muted" data-astro-cid-3nssi2tu>表示・アカウント</div></a> </div> </section>` : null)}${isOrgAdmin && renderTemplate`<div class="modal" id="homeModal" data-astro-cid-3nssi2tu><div class="box" data-astro-cid-3nssi2tu> <h2 style="margin-top:0;border:0" data-astro-cid-3nssi2tu>ホームの表示を編集</h2> <p class="muted" style="font-size:.85rem" data-astro-cid-3nssi2tu>セクションの表示/非表示と並び順を変更します（お知らせは固定）。</p> <div id="secList" class="sec-list" data-astro-cid-3nssi2tu>  ${HOME_SECTIONS.filter((s) => s.id !== "storage").map((s) => renderTemplate`<div class="sec-row"${addAttribute(s.id, "data-id")} data-astro-cid-3nssi2tu> <label style="flex:1" data-astro-cid-3nssi2tu><input type="checkbox" class="sec-on"${addAttribute(!hiddenSet.has(s.id), "checked")} data-astro-cid-3nssi2tu> ${s.label}</label> <button class="btn btn-sm sec-up" title="上へ" data-astro-cid-3nssi2tu>↑</button> <button class="btn btn-sm sec-down" title="下へ" data-astro-cid-3nssi2tu>↓</button> </div>`)} </div> <div class="row" style="margin-top:1rem" data-astro-cid-3nssi2tu> <button class="btn btn-primary" id="saveHome" style="flex:1" data-astro-cid-3nssi2tu>保存</button> <button class="btn btn-ghost" id="closeHome" style="flex:0 0 auto" data-astro-cid-3nssi2tu>閉じる</button> </div> </div></div>`}<div class="modal" id="critModal" data-astro-cid-3nssi2tu><div class="box" data-astro-cid-3nssi2tu><h2 style="margin-top:0;border:0" data-astro-cid-3nssi2tu>重要なお知らせ</h2><div id="critBody" data-astro-cid-3nssi2tu></div><button class="btn btn-primary" id="critAck" style="margin-top:1rem" data-astro-cid-3nssi2tu>確認しました</button></div></div>   `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template([`<script data-astro-rerun>
    (function () {
      // 重要なお知らせの確認モーダル。
      const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const crit = [...document.querySelectorAll('.banner[data-sev="critical"]')].filter((n) => !localStorage.getItem("ack:" + n.dataset.id));
      if (crit.length) {
        const m = document.getElementById("critModal");
        // notice 本文の textContent を再び HTML として挿入するためエスケープ（mXSS/装飾再解釈の防止）。
        document.getElementById("critBody").innerHTML = crit.map((n) => "<p>" + esc(n.textContent) + "</p>").join("");
        m.classList.add("open");
        document.getElementById("critAck").onclick = () => { crit.forEach((n) => localStorage.setItem("ack:" + n.dataset.id, "1")); m.classList.remove("open"); window.bo.toast("確認しました"); };
      }
      // ホーム編集（管理者のみ要素が存在）。
      const edit = document.getElementById("editHome");
      const modal = document.getElementById("homeModal");
      if (edit && modal) {
        const list = document.getElementById("secList");
        const refresh = () => list.querySelectorAll(".sec-row").forEach((r) => r.classList.toggle("off", !r.querySelector(".sec-on").checked));
        edit.addEventListener("click", () => { modal.classList.add("open"); refresh(); });
        document.getElementById("closeHome")?.addEventListener("click", () => modal.classList.remove("open"));
        list.querySelectorAll(".sec-row").forEach((row) => {
          row.querySelector(".sec-on")?.addEventListener("change", refresh);
          row.querySelector(".sec-up")?.addEventListener("click", () => { const p = row.previousElementSibling; if (p) list.insertBefore(row, p); });
          row.querySelector(".sec-down")?.addEventListener("click", () => { const n = row.nextElementSibling; if (n) list.insertBefore(n, row); });
        });
        document.getElementById("saveHome")?.addEventListener("click", async (e) => {
          const rows = [...list.querySelectorAll(".sec-row")];
          const order = rows.map((r) => r.dataset.id);
          const hidden = rows.filter((r) => !r.querySelector(".sec-on").checked).map((r) => r.dataset.id);
          const r = await window.bo.api("/api/settings", { _action: "home_layout", layout: { order, hidden } }, { btn: e.currentTarget, successMsg: "ホームの表示を保存しました" });
          if (r.ok) setTimeout(() => location.reload(), 600);
        });
      }
    })();
  <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/dashboard.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/dashboard.astro";
const $$url = "/dashboard";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
