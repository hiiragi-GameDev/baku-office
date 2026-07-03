globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { saveApiKey } from "./client_F4fksau0.mjs";
import { t as cfEgressGateway, z as slackAuthTest } from "./ctx_D9xObGWH.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  const signingSecret = (b.signingSecret ?? "").trim();
  const botToken = (b.botToken ?? "").trim();
  if (!signingSecret || !botToken) return json({ error: "Signing Secret と Bot Token を入力してください。" }, 400);
  const gw = cfEgressGateway(env);
  const auth = await slackAuthTest(gw, botToken);
  if (!auth.ok) return json({ error: `Bot Token が無効です（${auth.error ?? "auth.test 失敗"}）。` }, 400);
  await saveApiKey(env, "slack_signing_secret", signingSecret);
  await saveApiKey(env, "slack_bot_token", botToken);
  return json({
    ok: true,
    team: auth.team,
    eventsUrl: `${new URL(request.url).origin}/api/inbound/slack`
  });
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
