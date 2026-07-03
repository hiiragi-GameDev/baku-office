globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const TTL = 1800;
const POST = async ({ request }) => {
  const b = await request.json().catch(() => ({}));
  const token = String(b.token ?? "").trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return json({ error: "bad token" }, 400);
  if (!await env.LICENSE.get(`wifho:${token}`)) return json({ error: "token expired or unknown" }, 404);
  const w = b.wif;
  const need = ["sa_email", "client_id", "project_number", "pool", "provider"];
  if (!w || need.some((k) => !String(w[k] ?? "").trim())) return json({ error: "invalid wif" }, 400);
  const data = JSON.stringify({ sa_email: String(w.sa_email), client_id: String(w.client_id), project_number: String(w.project_number), pool: String(w.pool), provider: String(w.provider) });
  await env.LICENSE.put(`wifho:${token}:data`, data, { expirationTtl: TTL }).catch(() => {
  });
  return json({ ok: true });
};
const GET = async ({ request, url }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "forbidden" }, 403);
  const token = (url.searchParams.get("token") || "").trim();
  if (!token) return json({ error: "token required" }, 400);
  const data = await env.LICENSE.get(`wifho:${token}:data`);
  if (!data) return json({ ok: true, pending: true });
  return json({ ok: true, wif: JSON.parse(data) });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
