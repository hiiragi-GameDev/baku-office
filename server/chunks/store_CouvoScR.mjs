globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession, canDevelopApps } from "./auth_DL5yvmzT.mjs";
import { storeCatalog, myApps, listReviews, rateApp, setListed, setAllowFork, requestStoreRemoval } from "./store_D30lmPXJ.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "ログインが必要" }, 401);
  if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "ストアの利用は管理者または開発者のみです" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b._action === "catalog") return json({ ok: true, apps: await storeCatalog(env) });
  if (b._action === "mine") {
    if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません" }, 403);
    return json({ ok: true, apps: await myApps(env) });
  }
  if (b._action === "reviews") return json({ ok: true, reviews: await listReviews(env, String(b.appId ?? "")) });
  if (b._action === "rate") return json(await rateApp(env, String(b.appId ?? ""), Number(b.rating) || 0, b.body));
  if (b._action === "set_listed") {
    if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません" }, 403);
    return json(await setListed(env, String(b.appId ?? ""), !!b.listed, String(b.minEntitlement ?? "free")));
  }
  if (b._action === "set_allow_fork") {
    if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません" }, 403);
    return json(await setAllowFork(env, String(b.appId ?? ""), !!b.allow));
  }
  if (b._action === "remove_request") {
    if (!canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません" }, 403);
    return json(await requestStoreRemoval(env, String(b.appId ?? ""), b.reason));
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
