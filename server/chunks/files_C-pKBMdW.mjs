globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { softDeleteFileForSession, audit, saveFile } from "./storage_BHLYBEBb.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要" }, 401);
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const b = await request.json().catch(() => ({}));
    if (b._action === "delete" && b.id) {
      const ok = await softDeleteFileForSession(env, b.id, ses);
      await audit(env, ses.uid, ok ? "file.delete" : "file.delete.denied", b.id);
      if (!ok) return json({ error: "not found" }, 404);
      return json({ ok: true });
    }
    return json({ error: "不明な操作" }, 400);
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "file がありません" }, 400);
  try {
    const r = await saveFile(env, file, ses.uid, ses.ctx);
    await audit(env, ses.uid, "file.upload", r.id);
    return json({ ok: true, id: r.id, mode: r.mode });
  } catch (e) {
    return json({ error: e.message }, 400);
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
