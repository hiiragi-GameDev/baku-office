globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { getAutoUpdateStatus, getAutoUpdate, hasDeployHook, clearDeployHook, setAutoUpdate, getDeployHook, isValidHookUrl, saveDeployHook } from "./update_BZb99hDh.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const GET = async ({ locals, request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  return json({ configured: await hasDeployHook(env), auto: await getAutoUpdate(env), status: await getAutoUpdateStatus(env) });
};
const POST = async ({ locals, request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b._action === "delete") {
    await clearDeployHook(env);
    return json({ ok: true });
  }
  if (b._action === "set_auto") {
    if (b.on && !await hasDeployHook(env)) return json({ ok: false, error: "先に Deploy Hook を登録してください（自動更新は登録済みフックを使います）。" }, 400);
    await setAutoUpdate(env, !!b.on);
    return json({ ok: true, auto: !!b.on });
  }
  if (b._action === "trigger") {
    const hook = await getDeployHook(env);
    if (!hook) return json({ ok: false, needGuide: true });
    if (!isValidHookUrl(hook)) return json({ ok: false, error: "登録済みフックURLが不正です。再登録してください。" }, 400);
    try {
      const r = await fetch(hook, { method: "POST", signal: AbortSignal.timeout(15e3) });
      return r.ok ? json({ ok: true }) : json({ ok: false, error: "フック発火に失敗（" + r.status + "）" }, 502);
    } catch (e) {
      return json({ ok: false, error: e.message }, 502);
    }
  }
  const url = (b.hookUrl ?? "").trim();
  if (!isValidHookUrl(url)) return json({ ok: false, error: "Cloudflare の Deploy Hook URL を確認してください" }, 400);
  await saveDeployHook(env, url);
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
