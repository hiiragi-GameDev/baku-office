globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { audit } from "./storage_BHLYBEBb.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const TABLES = { transactions: true, files: true, schedules: true, knowledge: true };
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (!b.table || !TABLES[b.table] || !b.id) return json({ error: "table/id が不正" }, 400);
  if (b._action === "restore") {
    await env.DB.prepare(`UPDATE ${b.table} SET deleted_at=NULL WHERE id=?`).bind(b.id).run();
    await audit(env, ses.uid, `${b.table}.restore`, b.id);
    return json({ ok: true });
  }
  if (b._action === "purge") {
    await env.DB.prepare(`DELETE FROM ${b.table} WHERE id=? AND deleted_at IS NOT NULL`).bind(b.id).run();
    await audit(env, ses.uid, `${b.table}.purge`, b.id);
    return json({ ok: true });
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
