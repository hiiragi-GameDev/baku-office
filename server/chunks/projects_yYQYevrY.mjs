globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
import { createProject, getProject, updateProject, deleteProject, assignAppToProject, bulkSetPublic, bulkSetRoles } from "./projects_B_gexkwU.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b.action === "create") {
    const name = (b.name ?? "").trim();
    if (!name) return json({ error: "プロジェクト名を入力してください" }, 400);
    const p = await createProject(env, { name, description: b.description, color: b.color, icon: b.icon, by: ses.uid });
    return json({ ok: true, project: p });
  }
  if (b.action === "update") {
    if (!b.id) return json({ error: "id が必要です" }, 400);
    if (!await getProject(env, b.id)) return json({ error: "プロジェクトが見つかりません" }, 404);
    await updateProject(env, b.id, { name: b.name, description: b.description, color: b.color, icon: b.icon, archived: b.archived, hub_enabled: b.hubEnabled, hub_intro: b.hubIntro });
    return json({ ok: true });
  }
  if (b.action === "delete") {
    if (!b.id) return json({ error: "id が必要です" }, 400);
    await deleteProject(env, b.id);
    return json({ ok: true });
  }
  if (b.action === "assign") {
    if (!b.appId) return json({ error: "appId が必要です" }, 400);
    if (b.projectId && !await getProject(env, b.projectId)) return json({ error: "プロジェクトが見つかりません" }, 404);
    await assignAppToProject(env, b.appId, b.projectId ?? null);
    return json({ ok: true });
  }
  if (b.action === "bulk_public") {
    if (!b.id) return json({ error: "id が必要です" }, 400);
    const n = await bulkSetPublic(env, b.id, b.enabled !== false);
    return json({ ok: true, changed: n });
  }
  if (b.action === "bulk_roles") {
    if (!b.id) return json({ error: "id が必要です" }, 400);
    const roles = Array.isArray(b.roles) ? b.roles.filter((r) => typeof r === "string") : null;
    const n = await bulkSetRoles(env, b.id, roles);
    return json({ ok: true, changed: n });
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
