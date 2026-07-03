globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { disconnectGoogle, googleStatus, setGoogleGroups, grantedScopeString } from "./google_DFar0IbF.mjs";
import { getServiceAccountInfo, saveServiceAccount, saveWifConfig, testServiceAccount } from "./google-sa_3CXcw4Dg.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b._action === "disconnect") {
    await disconnectGoogle(env);
    return json({ ok: true });
  }
  if (b._action === "status") {
    const info = await getServiceAccountInfo(env);
    return json({ ok: true, ...await googleStatus(env), sa: info });
  }
  if (b._action === "connect_sa") {
    const res = await saveServiceAccount(env, String(b.keyJson ?? ""), String(b.subject ?? ""));
    if (!res.ok) return json({ error: res.error ?? "保存に失敗しました" }, 400);
    await setGoogleGroups(env, Array.isArray(b.groups) ? b.groups : []);
    return json({ ok: true, sa: await getServiceAccountInfo(env) });
  }
  if (b._action === "connect_wif") {
    const w = b.wif ?? {};
    const cfg = {
      sa_email: String(w.sa_email ?? ""),
      client_id: String(w.client_id ?? ""),
      project_number: String(w.project_number ?? ""),
      pool: String(w.pool ?? ""),
      provider: String(w.provider ?? ""),
      issuer: new URL(request.url).origin
    };
    const res = await saveWifConfig(env, cfg, String(b.subject ?? ""));
    if (!res.ok) return json({ error: res.error ?? "保存に失敗しました" }, 400);
    await setGoogleGroups(env, Array.isArray(b.groups) ? b.groups : []);
    return json({ ok: true, sa: await getServiceAccountInfo(env) });
  }
  if (b._action === "test_sa") {
    const res = await testServiceAccount(env, await grantedScopeString(env));
    return res.ok ? json({ ok: true }) : json({ error: res.error ?? "接続できませんでした" }, 400);
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
