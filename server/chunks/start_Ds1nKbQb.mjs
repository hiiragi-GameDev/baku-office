globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { driveAuthUrl } from "./drive_BU5bDSNm.mjs";
import { newState } from "./oauth_BlD-15-T.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const GET = async ({ request, locals, url, cookies, redirect }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return new Response("管理者のみ", { status: 403 });
  const authUrl = await driveAuthUrl(env, url.origin, (() => {
    const s = newState();
    cookies.set("drive_state", s, { httpOnly: true, secure: true, path: "/", maxAge: 600, sameSite: "lax" });
    return s;
  })());
  if (!authUrl) return new Response("Google OAuth が未設定です。連携設定でクライアントID／シークレットを登録してください。", { status: 400 });
  return redirect(authUrl, 302);
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
