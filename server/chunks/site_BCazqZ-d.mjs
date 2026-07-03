globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { cachedEntitlement } from "./client_F4fksau0.mjs";
import { updatePageMeta, setSitePassword, clearLayout, restoreLayoutVersion, listLayoutVersions, publishLayout, saveLayoutDraft, deleteSite, upsertSite } from "./sites_DMFBMYur.mjs";
import { v as validateLayout } from "./site-layout_IGnF6pBC.mjs";
import { audit } from "./storage_BHLYBEBb.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  if (!atLeast(await cachedEntitlement(env), "pro")) return json({ error: "HP/LP は Pro プランで利用できます" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b._action === "save_page_settings") {
    const s = (b.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!s) return json({ error: "slug（英数字）が必要" }, 400);
    const t = (b.title ?? "").trim();
    if (!t) return json({ error: "ページタイトルが必要です" }, 400);
    await updatePageMeta(env, s, { title: t.slice(0, 120), show_join: !!b.show_join });
    return json({ ok: true, slug: s });
  }
  const slug = (b.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  switch (b._action) {
    case "save":
      if (!slug) return json({ error: "slug（英数字）が必要" }, 400);
      if (!b.title) return json({ error: "タイトルが必要" }, 400);
      await upsertSite(env, { slug, title: b.title, body: b.body, published: b.published, show_join: b.show_join });
      return json({ ok: true, slug });
    case "delete":
      if (slug) await deleteSite(env, slug);
      return json({ ok: true });
    // ページビルダー：下書き保存（layout_draft）。検証してから保存。
    case "save_layout": {
      if (!slug) return json({ error: "slug（英数字）が必要" }, 400);
      const r = validateLayout(b.layout);
      if (!r.ok) return json({ error: r.error }, 400);
      await saveLayoutDraft(env, slug, JSON.stringify(r.layout), b.title);
      return json({ ok: true, slug });
    }
    // AIでHP構成を生成/整形（H・AI生成）。説明文（prompt）または現在の下書き（base）から
    // ブロック構成を作り、検証して layout_draft に保存。プレビュー→確認→公開は既存フローのまま。
    case "ai_layout": {
      if (!slug) return json({ error: "slug（英数字）が必要" }, 400);
      let prompt = (b.prompt ?? "").trim();
      if (b.ref?.dataB64) {
        const { prepareDevAttachment } = await import("./chat-flow_CD0ZG1R9.mjs");
        const r = await prepareDevAttachment(b.ref, ses.uid, ses.ctx);
        if (!r.ok) return json({ error: r.error }, r.status);
        prompt = (prompt ? prompt : "添付の参考資料を踏まえてHPを作成・更新する。") + r.promptAdd;
      }
      const baseV = b.base != null ? validateLayout(b.base) : null;
      const base = baseV && baseV.ok ? baseV.layout ?? null : null;
      if (!prompt && !base) return json({ error: "作りたいHPの説明を入力してください" }, 400);
      const { getMemberModel, parseRequestModel } = await import("./settings_dTyIbTCR.mjs");
      const { modelId: siteModelId } = parseRequestModel(await getMemberModel(env, ses.uid).catch(() => null) ?? "");
      const { startSiteBuild, processSiteBuild } = await import("./ctx_D9xObGWH.mjs").then((n) => n.S);
      const buildId = await startSiteBuild(locals.ctx, { owner: ses.uid, slug, title: b.title, prompt, base, model: siteModelId || void 0 });
      try {
        locals.cfContext?.waitUntil(processSiteBuild(locals.ctx, buildId).then(() => void 0).catch(() => void 0));
      } catch {
      }
      await audit(env, ses.uid, "site.ai_layout", `${slug}:queued`);
      return json({ ok: true, slug, queued: true, buildId });
    }
    // AI生成の進捗ポーリング（background）。完了時は最新の下書きレイアウトも返す（builder がブロックへ反映）。
    case "ai_status": {
      if (!slug) return json({ error: "slug が必要" }, 400);
      const { siteBuildStatus } = await import("./ctx_D9xObGWH.mjs").then((n) => n.S);
      const st = await siteBuildStatus(locals.ctx, slug);
      let layout = null;
      if (st && st.status === "done") {
        const { getSite } = await import("./sites_DMFBMYur.mjs");
        const s = await getSite(env, slug);
        try {
          const v = s?.layout_draft ? JSON.parse(s.layout_draft) : null;
          if (v && Array.isArray(v.blocks)) layout = v;
        } catch {
        }
      }
      return json({ ok: true, status: st, layout });
    }
    // 公開：下書きを公開版へ反映。公開時点を版として記録（P1-22・publish 内で1回だけ）。
    case "publish_layout":
      if (!slug) return json({ error: "slug が必要" }, 400);
      await publishLayout(env, slug, ses.uid);
      return json({ ok: true, slug });
    // 公開履歴一覧（P1-22）。
    case "list_versions":
      if (!slug) return json({ error: "slug が必要" }, 400);
      return json({ ok: true, versions: await listLayoutVersions(env, slug) });
    // ロールバック（P1-22）：指定版を下書きへ戻す（公開前確認を経て再公開）。復元操作を監査ログへ残す。
    case "restore_version": {
      if (!slug) return json({ error: "slug が必要" }, 400);
      const vn = Number(b.version_no);
      if (!Number.isInteger(vn) || vn < 1) return json({ error: "version_no が必要" }, 400);
      const layout = await restoreLayoutVersion(env, slug, vn);
      if (layout == null) return json({ error: "指定の版が見つかりません" }, 404);
      await audit(env, ses.uid, "site.restore_version", `${slug}#${vn}`);
      return json({ ok: true, slug, layout });
    }
    // ブロック構成を解除（body HTML 描画へ戻す）。
    case "clear_layout":
      if (slug) await clearLayout(env, slug);
      return json({ ok: true });
    // 限定公開（H7）：パスワード設定/解除（空文字で解除）。
    case "set_password":
      if (!slug) return json({ error: "slug が必要" }, 400);
      await setSitePassword(env, slug, (b.password ?? "").trim() || null);
      return json({ ok: true });
    default:
      return json({ error: "不明な操作" }, 400);
  }
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
