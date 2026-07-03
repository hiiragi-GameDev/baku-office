globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { getToken, hostFetch } from "./client_F4fksau0.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b.kind !== "nonprofit" && b.kind !== "enterprise") return json({ error: "種別が不正です" }, 400);
  const token = await getToken(env);
  if (!token) return json({ error: "ライセンスが未取得です。" }, 400);
  const r = await hostFetch(env, "/api/plan-request", {
    method: "POST",
    headers: { "content-type": "application/json", "x-bo-license": token },
    body: JSON.stringify({ _action: "submit", kind: b.kind, orgName: b.orgName, contact: b.contact, note: b.note })
  }).catch(() => null);
  if (!r) return json({ error: "ホストに接続できませんでした。時間をおいて再度お試しください。" }, 502);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return json({ error: j.error ?? "申込に失敗しました。" }, r.status);
  return json({ ok: true });
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
