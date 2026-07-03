globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
import { moderate, getPublicPageAny, setPublicEnabled, setRegisterMode, setCapacity, seatsTaken, listSubmissions, deletePublicPage } from "./public-pages_DHQdIiIX.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b.action === "rebuild") {
    if (!b.slug) return json({ error: "slug が必要です" }, 400);
    const { rebuildPublicPage } = await import("./ctx_D9xObGWH.mjs").then((n) => n.R);
    const r = await rebuildPublicPage(locals.ctx, b.slug);
    return json(r, r.ok ? 200 : 400);
  }
  if (b.action === "moderate") {
    if (!b.id || b.decision !== "approve" && b.decision !== "reject") return json({ error: "パラメータが不正です" }, 400);
    const r = await moderate(env, b.id, b.decision, ses.uid);
    return json(r, r.ok ? 200 : 400);
  }
  if (b.action === "toggle") {
    if (!b.slug) return json({ error: "slug が必要です" }, 400);
    const enable = b.enabled !== false;
    if (enable) {
      const page2 = await getPublicPageAny(env, b.slug);
      if (page2) {
        const { gatePublishApp } = await import("./self-check_CChoVSYc.mjs");
        const { appendMessage } = await import("./chat-sessions_DJA_I8xR.mjs").then((n) => n.i);
        const gate = await gatePublishApp(locals.ctx, page2.app_id);
        if (!gate.ok) {
          await appendMessage(locals.ctx, `appdev:${page2.app_id}`, "assistant", `🛑 公開監査でブロック（/${page2.slug}）：${gate.concerns.join(" / ")}`).catch(() => {
          });
          return json({ ok: false, blocked: true, error: "公開前のセルフチェックで指摘があります。修正してから公開してください。", concerns: gate.concerns, appId: page2.app_id }, 400);
        }
        await appendMessage(locals.ctx, `appdev:${page2.app_id}`, "assistant", `✅ 公開監査を通過し公開しました（/${page2.slug}）。`).catch(() => {
        });
      }
    }
    await setPublicEnabled(env, b.slug, enable);
    return json({ ok: true });
  }
  if (b.action === "register_mode") {
    if (!b.slug) return json({ error: "slug が必要です" }, 400);
    await setRegisterMode(env, b.slug, b.mode === "guest" ? "guest" : "none");
    return json({ ok: true });
  }
  if (b.action === "set_capacity") {
    if (!b.slug) return json({ error: "slug が必要です" }, 400);
    await setCapacity(env, b.slug, b.capacity ?? null);
    return json({ ok: true, taken: await seatsTaken(env, b.slug) });
  }
  if (b.action === "waitlist") {
    if (!b.slug) return json({ error: "slug が必要です" }, 400);
    const rows = await listSubmissions(env, b.slug, "waitlist");
    return json({ ok: true, submissions: rows, taken: await seatsTaken(env, b.slug) });
  }
  if (b.action === "delete") {
    if (!b.slug) return json({ error: "slug が必要です" }, 400);
    const page2 = await getPublicPageAny(env, b.slug);
    if (!page2) return json({ ok: true });
    const appExists = await env.DB.prepare("SELECT 1 FROM external_apps WHERE id=?").bind(page2.app_id).first();
    if (appExists) return json({ error: "このページのアプリがまだ存在します。先にアプリ（アプリ画面 →「アプリを削除」）を削除してください。公開ページはアプリ削除時に一緒に削除されます。" }, 400);
    await deletePublicPage(env, b.slug);
    return json({ ok: true });
  }
  return json({ error: "不明な操作です" }, 400);
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
