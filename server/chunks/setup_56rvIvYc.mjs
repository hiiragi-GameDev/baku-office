globalThis.process ??= {};
globalThis.process.env ??= {};
import { requireOrgAdmin } from "./auth_DL5yvmzT.mjs";
import { saveApiKey } from "./client_F4fksau0.mjs";
import { t as cfEgressGateway, w as lineBotInfo, x as setLineWebhookEndpoint, y as setLineWebhookActive } from "./ctx_D9xObGWH.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  if (!await requireOrgAdmin(env, request)) return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  const secret = (b.secret ?? "").trim();
  const token = (b.token ?? "").trim();
  if (!secret || !token) return json({ error: "チャネルシークレットとアクセストークンを入力してください。" }, 400);
  const gw = cfEgressGateway(env);
  const info = await lineBotInfo(gw, token);
  if (!info.ok) return json({ error: `アクセストークンが無効です（${info.status}）。` }, 400);
  await saveApiKey(env, "line_secret", secret);
  await saveApiKey(env, "line_token", token);
  const webhookUrl = `${new URL(request.url).origin}/api/inbound/line`;
  const set = await setLineWebhookEndpoint(gw, token, webhookUrl);
  const active = set.ok ? await setLineWebhookActive(gw, token) : { ok: false, detail: void 0 };
  return json({
    ok: true,
    botName: info.displayName,
    basicId: info.basicId,
    webhookUrl,
    webhookSet: set.ok,
    webhookDetail: set.ok ? void 0 : set.detail,
    webhookActive: active.ok,
    webhookActiveDetail: active.ok ? void 0 : active.detail
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
