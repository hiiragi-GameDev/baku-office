globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
import { v as vapidPublicKey, s as saveSubscription } from "./push_BdVtByn8.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const GET = async () => {
  return json({ publicKey: await vapidPublicKey(env) });
};
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  const b = await request.json().catch(() => ({}));
  if (!b.endpoint) return json({ error: "endpoint が必要です" }, 400);
  await saveSubscription(env, ses.uid, { endpoint: b.endpoint, keys: b.keys });
  return json({ ok: true });
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
