globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
import { c as createApiToken, l as listApiTokens, r as revokeApiToken } from "./api-tokens_BRmtJYri.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  const appId = String(b.appId ?? "");
  if (b._action === "create") {
    if (!appId) return json({ error: "appId が必要です" }, 400);
    const r = await createApiToken(env, appId, ses.uid, b.label);
    return json({ ok: true, id: r.id, token: r.token });
  }
  if (b._action === "list") {
    return json({ ok: true, tokens: await listApiTokens(env, appId) });
  }
  if (b._action === "revoke") {
    if (b.id) await revokeApiToken(env, b.id);
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
