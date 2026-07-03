globalThis.process ??= {};
globalThis.process.env ??= {};
import { providerEnabled, newState, authorizeUrl } from "./oauth_BlD-15-T.mjs";
import { isWebViewUA, webviewBlockedPage } from "./webview_V8PPSFH4.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const GET = async ({ params, url, request, locals }) => {
  const p = params.provider;
  if (!["google", "line", "discord", "slack"].includes(p)) return new Response("不明なプロバイダ", { status: 404 });
  if (p === "google" && isWebViewUA(request.headers.get("user-agent") ?? "")) {
    return new Response(webviewBlockedPage(`${url.origin}/login`), { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  }
  const cookie = (state) => `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
  if (providerEnabled(env, p)) {
    const state = newState();
    const target = authorizeUrl(env, p, url.origin, state);
    if (!target) return new Response("設定不足", { status: 500 });
    return new Response(null, { status: 302, headers: { location: target, "set-cookie": cookie(state) } });
  }
  if (p === "google" && env.HOST_BASE_URL) {
    const state = newState();
    const ret = `${url.origin}/api/auth/google/relay`;
    const relay = `${env.HOST_BASE_URL.replace(/\/$/, "")}/api/relay/google/start?return=${encodeURIComponent(ret)}&cstate=${state}`;
    return new Response(null, { status: 302, headers: { location: relay, "set-cookie": cookie(state) } });
  }
  return new Response("このログイン方法は未設定です", { status: 404 });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
