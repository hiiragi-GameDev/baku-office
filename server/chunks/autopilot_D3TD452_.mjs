globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { entitlementForGate } from "./client_F4fksau0.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { ghDeviceStart, ghDevicePoll, ghListRepos, saveAutonomyConfig } from "./autonomy_BR9KrOCt.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  if (!atLeast(await entitlementForGate(env), "pro")) return json({ error: "オートパイロットは Pro 以上で利用できます" }, 403);
  const b = await request.json().catch(() => ({}));
  if (b._action === "gh_start") return json(await ghDeviceStart(env));
  if (b._action === "gh_poll") return json(await ghDevicePoll(env, String(b.deviceCode ?? "")));
  if (b._action === "gh_repos") return json({ ok: true, repos: await ghListRepos(env) });
  if (b._action === "set_repo") {
    await saveAutonomyConfig(env, { ghRepo: String(b.repo ?? "") });
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
