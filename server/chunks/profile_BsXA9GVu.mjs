globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { setDisplayName, changeLocalPassword } from "./users_DArBIlQW.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要です" }, 401);
  if (ses.ctx !== "personal" || ses.uid === "org") return json({ error: "このアカウントは編集できません" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b._action === "name") {
    const name = (b.name ?? "").trim();
    if (!name) return json({ error: "氏名を入力してください" }, 400);
    if (name.length > 80) return json({ error: "氏名が長すぎます" }, 400);
    await setDisplayName(env, ses.uid, name);
    return json({ ok: true });
  }
  if (b._action === "password") {
    if (!b.current || !b.next) return json({ error: "現在のパスワードと新しいパスワードが必要です" }, 400);
    const r = await changeLocalPassword(env, ses.uid, b.current, b.next);
    return r.ok ? json({ ok: true }) : json({ error: r.error }, 400);
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
