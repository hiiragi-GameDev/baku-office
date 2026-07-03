globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { setMaxUploadMb, setRetentionDays } from "./storage_BHLYBEBb.mjs";
import { setMemberModel, toggleFavApp, setAppFolders, setAiEngine, setSmartRouting, setWorkersAiModel, setBookkeepingMode, setCustomPrompt, setNotifyWebhook, setWorkersPaid } from "./settings_dTyIbTCR.mjs";
import { setAutonomy, saveAutonomyConfig } from "./autonomy_BR9KrOCt.mjs";
import { setStorageLimits } from "./storage-usage_CAVmHTS3.mjs";
import { s as setEnabledPartIds, p as partCatalog, e as enabledPartIds } from "./parts_BnninK9G.mjs";
import { setTheme } from "./theme_DFty9gzU.mjs";
import { setNavOverrides } from "./nav_CqD0IXOG.mjs";
import { setHomeLayout } from "./home_iZZVavtW.mjs";
import { setCustomDomain, setSiteConfig } from "./custom-domain_BlEKJqw-.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { installApp, uninstallApp, installedAppIds, appCatalog } from "./apps_qko8nJrR.mjs";
import { f as fetchAndInstall, u as uninstallExternal, b as listExternalApps, c as forkExternalApp, l as listDrafts, s as submitDraft, p as proposeUpstreamMerge, d as applyUpstreamMerge, e as deleteDraft, i as installLocalApp, a as activeAppDefinition, h as appVersions, j as activateAppVersion, k as deleteLocalApp } from "./external-apps_Ltsw3Yx-.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  const b = await request.json().catch(() => ({}));
  if (b._action === "member_model") {
    const v = await setMemberModel(env, ses.uid, String(b.model ?? "gemini"));
    return json({ ok: true, model: v });
  }
  if (b._action === "fav_toggle") {
    const favs = await toggleFavApp(env, ses.uid, String(b.appId ?? "").trim());
    return json({ ok: true, favs, fav: favs.includes(String(b.appId ?? "").trim()) });
  }
  if (b._action === "set_app_folders") {
    const folders = await setAppFolders(env, ses.uid, b.folders);
    return json({ ok: true, folders });
  }
  const DEV_ACTIONS = /* @__PURE__ */ new Set([
    "fetch_app",
    "uninstall_external",
    "list_external",
    "fork_app",
    "list_drafts",
    "submit_draft",
    "merge_check",
    "merge_apply",
    "delete_draft",
    "install_local",
    "app_versions",
    "activate_version",
    "delete_local_app",
    "set_app_meta",
    "ai_retag",
    "set_app_roles",
    "app_dev_log",
    "allow_relaxed_host"
  ]);
  const { canDevelopApps } = await import("./auth_DL5yvmzT.mjs");
  if (DEV_ACTIONS.has(b._action ?? "")) {
    if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません（管理者または開発者のみ）" }, 403);
  } else if (ses.role !== "admin") {
    return json({ error: "管理者のみ" }, 403);
  }
  if (b._action === "max_upload") {
    const v = await setMaxUploadMb(env, Number(b.mb));
    return json({ ok: true, mb: v });
  }
  if (b._action === "file_retention") {
    const v = await setRetentionDays(env, Number(b.days));
    return json({ ok: true, days: v });
  }
  if (b._action === "agent_approval") {
    const { setApprovalMode } = await import("./approvals_CEi6BOlb.mjs");
    const v = await setApprovalMode(env, b.on === true);
    return json({ ok: true, on: v });
  }
  if (b._action === "ai_engine") {
    const v = await setAiEngine(env, String(b.engine ?? "gemini"));
    return json({ ok: true, engine: v });
  }
  if (b._action === "smart_routing") {
    await setSmartRouting(env, !!b.on);
    return json({ ok: true, on: !!b.on });
  }
  if (b._action === "workers_ai_model") {
    const v = await setWorkersAiModel(env, String(b.model ?? ""));
    return json({ ok: true, model: v });
  }
  if (b._action === "bookkeeping_mode") {
    const v = await setBookkeepingMode(env, String(b.mode ?? "single"));
    return json({ ok: true, mode: v });
  }
  if (b._action === "custom_prompt") {
    const v = await setCustomPrompt(env, String(b.prompt ?? ""));
    return json({ ok: true, prompt: v });
  }
  if (b._action === "notify_webhook") {
    const url = String(b.webhook ?? "").trim();
    if (url) {
      const { isPublicHttpsUrl } = await import("./egress_5_OuCaR0.mjs");
      if (!isPublicHttpsUrl(url)) return json({ error: "公開された https の Webhook URL を入力してください。" }, 400);
    }
    const v = await setNotifyWebhook(env, url);
    return json({ ok: true, webhook: v });
  }
  if (b._action === "notify_webhook_test") {
    const typed = String(b.webhook ?? "").trim();
    const msg = "✅ baku-office：通知テストです。これが見えていれば設定OKです。";
    const { pushWebhook, notifyHook } = await import("./notifications_DKh03i2Y.mjs");
    let sent = false;
    let okHost = false;
    try {
      const u = new URL(typed);
      okHost = u.protocol === "https:" && (/* @__PURE__ */ new Set(["discord.com", "discordapp.com", "hooks.slack.com"])).has(u.hostname.toLowerCase());
    } catch {
      okHost = false;
    }
    if (okHost) {
      const { cfEgressGateway } = await import("./ctx_D9xObGWH.mjs").then((n) => n.K);
      try {
        await pushWebhook(cfEgressGateway(env), typed, msg);
        sent = true;
      } catch {
        sent = false;
      }
    } else {
      sent = await notifyHook(env, msg);
    }
    return json({ ok: true, sent });
  }
  if (b._action === "notify_line_test") {
    const { notifyOwnerDirect } = await import("./ctx_D9xObGWH.mjs").then((n2) => n2.P);
    const n = await notifyOwnerDirect(locals.ctx, ses.uid, "✅ baku-office：LINE通知テストです。これが見えていれば、あなた宛の通知はLINEに届きます。").catch(() => 0);
    return json({ ok: true, sent: n > 0 });
  }
  if (b._action === "workers_paid") {
    const v = await setWorkersPaid(env, b.workersPaid === true);
    return json({ ok: true, workersPaid: v });
  }
  if (b._action === "autonomy_toggle") {
    await setAutonomy(env, b.on === true);
    return json({ ok: true, on: b.on === true });
  }
  if (b._action === "autonomy_config") {
    await saveAutonomyConfig(env, { cfToken: b.cfToken, cfAccount: b.cfAccount, ghToken: b.ghToken, ghRepo: b.ghRepo });
    return json({ ok: true });
  }
  if (b._action === "storage_limits") {
    const inc = b.limits ?? {};
    const clean = {};
    for (const k of ["d1", "kv", "r2", "drive"]) {
      const v = Number(inc[k]);
      if (Number.isFinite(v) && v > 0) clean[k] = v;
    }
    await setStorageLimits(env, clean);
    return json({ ok: true });
  }
  if (b._action === "enabled_parts") {
    const v = await setEnabledPartIds(locals.ctx, Array.isArray(b.parts) ? b.parts : []);
    return json({ ok: true, enabled: v, catalog: partCatalog() });
  }
  if (b._action === "list_parts") {
    return json({ ok: true, enabled: await enabledPartIds(locals.ctx), catalog: partCatalog() });
  }
  if (b._action === "ui_theme") {
    try {
      const v = await setTheme(locals.ctx, b.theme);
      return json({ ok: true, theme: v });
    } catch (e) {
      return json({ error: "テーマの保存に失敗しました：" + e.message }, 500);
    }
  }
  if (b._action === "onboarding_guides") {
    const guides = (Array.isArray(b.guides) ? b.guides : []).map((g) => ({ title: String(g?.title ?? "").slice(0, 80).trim(), url: String(g?.url ?? "").trim() })).filter((g) => g.title && /^https?:\/\//.test(g.url)).slice(0, 20);
    await env.LICENSE.put("onboarding_guides", JSON.stringify(guides));
    return json({ ok: true, guides });
  }
  if (b._action === "onboarding_dismiss") {
    if (ses.ctx !== "org") return json({ error: "団体管理者のみ" }, 403);
    if (b.show) {
      await env.LICENSE.delete("onboarding_dismissed");
      await env.LICENSE.delete("setup_redirected").catch(() => {
      });
    } else {
      await env.LICENSE.put("onboarding_dismissed", "1");
    }
    return json({ ok: true });
  }
  if (b._action === "nav_overrides") {
    const v = await setNavOverrides(locals.ctx, b.nav ?? {});
    return json({ ok: true, nav: v });
  }
  if (b._action === "home_layout") {
    const v = await setHomeLayout(locals.ctx, b.layout ?? {});
    return json({ ok: true, layout: v });
  }
  if (b._action === "custom_domain") {
    const v = await setCustomDomain(locals.ctx, b.domain ?? "", nowSec());
    return json({ ok: true, domain: v });
  }
  if (b._action === "site_config") {
    const r = await setSiteConfig(locals.ctx, { publicHost: b.publicHost, adminHost: b.adminHost, homeSlug: b.homeSlug, active: b.siteActive });
    return json(r, r.ok ? 200 : 400);
  }
  if (b._action === "cf_provision") {
    const { getCustomDomain, siteHostsOf } = await import("./custom-domain_BlEKJqw-.mjs");
    const cfg = await getCustomDomain(locals.ctx);
    if (!cfg?.domain) return json({ ok: false, error: "先にカスタムドメインを保存してください。" }, 400);
    const hosts = siteHostsOf(cfg);
    const { buildCfClient, provisionCaseA } = await import("./cf-provision_C2s8s1mc.mjs");
    const c = await buildCfClient(env);
    if (!c) return json({ ok: false, error: "Cloudflare API トークンが未設定です。設定→高度なオプション（自動化）でトークンを登録してください。" }, 400);
    const service = "baku-office-app";
    const environment = env.ENVIRONMENT || "production";
    const r = await provisionCaseA(c, { domain: cfg.domain, publicHost: hosts.publicHost, adminHost: hosts.adminHost, service, environment });
    return json({ ok: r.ok, steps: r.steps, dsRecord: r.dsRecord });
  }
  if (b._action === "install_app") {
    const installed = await installApp(locals.ctx, String(b.appId ?? ""));
    return json({ ok: true, installed });
  }
  if (b._action === "uninstall_app") {
    try {
      const installed = await uninstallApp(locals.ctx, String(b.appId ?? ""));
      return json({ ok: true, installed });
    } catch (e) {
      return json({ error: e.message }, 400);
    }
  }
  if (b._action === "list_apps") {
    return json({ ok: true, catalog: appCatalog(), installed: await installedAppIds(locals.ctx) });
  }
  if (b._action === "fetch_app") {
    const r = await fetchAndInstall(locals.ctx, String(b.appId ?? ""));
    return json(r, r.ok ? 200 : 400);
  }
  if (b._action === "uninstall_external") {
    await uninstallExternal(locals.ctx, String(b.appId ?? ""));
    return json({ ok: true });
  }
  if (b._action === "list_external") {
    return json({ ok: true, external: await listExternalApps(locals.ctx) });
  }
  if (b._action === "fork_app") {
    const r = await forkExternalApp(locals.ctx, String(b.appId ?? ""), String(b.newName ?? ""), ses.uid);
    return json(r, r.ok ? 200 : 400);
  }
  if (b._action === "list_drafts") {
    return json({ ok: true, drafts: await listDrafts(locals.ctx) });
  }
  if (b._action === "submit_draft") {
    const r = await submitDraft(locals.ctx, String(b.draftId ?? ""));
    return json(r, r.ok ? 200 : 400);
  }
  if (b._action === "merge_check") {
    const r = await proposeUpstreamMerge(locals.ctx, String(b.draftId ?? ""));
    return json(r, r.ok ? 200 : 400);
  }
  if (b._action === "merge_apply") {
    const r = await applyUpstreamMerge(locals.ctx, String(b.draftId ?? ""), ses.uid);
    return json(r, r.ok ? 200 : 400);
  }
  if (b._action === "delete_draft") {
    await deleteDraft(locals.ctx, String(b.draftId ?? ""));
    return json({ ok: true });
  }
  if (b._action === "install_local") {
    const r = await installLocalApp(locals.ctx, String(b.draftId ?? ""), ses.uid);
    return json(r, r.ok ? 200 : 400);
  }
  if (b._action === "app_versions") {
    return json({ ok: true, versions: await appVersions(locals.ctx, String(b.appId ?? "")), active: (await activeAppDefinition(locals.ctx, String(b.appId ?? "")))?.version ?? null });
  }
  if (b._action === "app_dev_log") {
    const appId = String(b.appId ?? "").trim();
    if (!appId) return json({ error: "対象がありません" }, 400);
    const { getMessages } = await import("./chat-sessions_DJA_I8xR.mjs").then((n) => n.i);
    const msgs = await getMessages(locals.ctx, `appdev:${appId}`);
    return json({ ok: true, log: msgs.map((m) => ({ role: m.role, content: m.content, created_at: m.created_at })) });
  }
  if (b._action === "allow_relaxed_host") {
    const appId = String(b.appId ?? "").trim();
    const hosts = Array.isArray(b.hosts) ? b.hosts.map(String) : [];
    if (!appId || !hosts.length) return json({ error: "対象がありません" }, 400);
    const { enableRelaxedForApp } = await import("./external-apps_Ltsw3Yx-.mjs").then((n) => n.B);
    const r = await enableRelaxedForApp(locals.ctx, appId, hosts);
    return json(r, r.ok ? 200 : 400);
  }
  if (b._action === "activate_version") {
    const r = await activateAppVersion(locals.ctx, String(b.appId ?? ""), String(b.version ?? ""));
    return json(r, r.ok ? 200 : 400);
  }
  if (b._action === "delete_local_app") {
    await deleteLocalApp(locals.ctx, String(b.appId ?? ""), b.deleteData === true);
    return json({ ok: true });
  }
  if (b._action === "set_app_meta") {
    const id = String(b.appId ?? b.draftId ?? "").trim();
    if (!id) return json({ error: "対象がありません" }, 400);
    const { setAppMeta, getAppMeta } = await import("./external-apps_Ltsw3Yx-.mjs").then((n) => n.A);
    await setAppMeta(locals.ctx, id, { ...b.category !== void 0 ? { category: String(b.category ?? "") } : {}, ...b.tags !== void 0 ? { tags: Array.isArray(b.tags) ? b.tags.map(String) : String(b.tags ?? "").split(/[,、\s]+/) } : {} });
    return json({ ok: true, meta: await getAppMeta(locals.ctx, id) });
  }
  if (b._action === "set_app_roles") {
    const id = String(b.appId ?? "").trim();
    if (!id) return json({ error: "対象がありません" }, 400);
    const roles = Array.isArray(b.roles) ? b.roles.map(String) : [];
    const { setAppAllowedRoles } = await import("./external-apps_Ltsw3Yx-.mjs").then((n) => n.B);
    await setAppAllowedRoles(locals.ctx, id, roles);
    return json({ ok: true });
  }
  if (b._action === "ai_retag") {
    const id = String(b.appId ?? b.draftId ?? "").trim();
    if (!id) return json({ error: "対象がありません" }, 400);
    const { getAppDesign } = await import("./external-apps_Ltsw3Yx-.mjs").then((n) => n.B);
    const { suggestAppMeta, setAppMeta } = await import("./external-apps_Ltsw3Yx-.mjs").then((n) => n.A);
    const d = await getAppDesign(locals.ctx, id);
    if (!d) return json({ error: "アプリが見つかりません" }, 404);
    const meta = await suggestAppMeta(locals.ctx, { name: d.name, spec: d.spec, definition: d.definition });
    await setAppMeta(locals.ctx, id, meta);
    return json({ ok: true, meta });
  }
  return json({ error: "不明な操作" }, 400);
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
