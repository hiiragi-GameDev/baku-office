globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { makeSessionCookie, sessionExp, clearSessionCookie } from "./auth_DL5yvmzT.mjs";
import { authLocal } from "./users_DArBIlQW.mjs";
import { logDiag } from "./diag_CY3PJnOM.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200, headers = {}) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", ...headers } });
const WINDOW = 900;
const LIMIT_IP = 10;
const LIMIT_ID = 5;
async function rlCount(env2, key) {
  return Number(await env2.LICENSE.get(`loginrl:${key}`) ?? "0");
}
async function rlBump(env2, key) {
  const k = `loginrl:${key}`;
  const cur = Number(await env2.LICENSE.get(k) ?? "0");
  await kvPut(env2, k, String(cur + 1), { expirationTtl: WINDOW });
}
async function rlReset(env2, key) {
  await env2.LICENSE.delete(`loginrl:${key}`);
}
const POST = async ({ request, locals }) => {
  const b = await request.json().catch(() => ({}));
  if (b.mode === "org") {
    if (env.HOST_BASE_URL || env.VERIFY_PUBLIC_JWK) return json({ error: "本番では Google でログインしてください" }, 403);
    const cookie = await makeSessionCookie(env, { uid: "org", role: "admin", ctx: "org", name: "組織管理者", exp: sessionExp() });
    return json({ ok: true, role: "admin", ctx: "org" }, 200, { "set-cookie": cookie });
  }
  if (b.mode === "local" && b.loginId && b.password) {
    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    const idKey = b.loginId.slice(0, 64).toLowerCase();
    if (await rlCount(env, `ip:${ip}`) >= LIMIT_IP || await rlCount(env, `id:${idKey}`) >= LIMIT_ID) {
      await logDiag(env, "warn", "security", `login rate-limited ip=${ip} id=${idKey}`);
      return json({ error: "試行回数が上限に達しました。しばらく時間をおいて再度お試しください。" }, 429);
    }
    const u = await authLocal(env, b.loginId, b.password);
    if (!u) {
      await rlBump(env, `ip:${ip}`);
      await rlBump(env, `id:${idKey}`);
      return json({ error: "IDまたはパスワードが違うか、未承認です" }, 401);
    }
    await rlReset(env, `id:${idKey}`);
    const cookie = await makeSessionCookie(env, { uid: u.id, role: u.role, ctx: "personal", name: u.name || void 0, exp: sessionExp() });
    return json({ ok: true, role: u.role, ctx: "personal" }, 200, { "set-cookie": cookie });
  }
  return json({ error: "mode が不正" }, 400);
};
const DELETE = async () => json({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
