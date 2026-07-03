globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { cancelLeave, activeAdminCount, requestLeave } from "./users_DArBIlQW.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.ctx !== "org") return json({ error: "ログインが必要です" }, 403);
  if (ses.uid === "org") return json({ error: "この管理者アカウントは脱退できません" }, 400);
  if (ses.role === "admin" && await activeAdminCount(env) <= 1) {
    return json({ error: "最後の管理者は脱退できません。先に別の管理者を指定してください。" }, 400);
  }
  await requestLeave(env, ses.uid);
  return json({ ok: true });
};
const DELETE = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.ctx !== "org") return json({ error: "ログインが必要です" }, 403);
  await cancelLeave(env, ses.uid);
  return json({ ok: true });
};
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
