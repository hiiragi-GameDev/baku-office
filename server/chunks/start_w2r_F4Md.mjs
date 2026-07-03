globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { normalizeGroups, googleAuthUrl } from "./google_DFar0IbF.mjs";
import { newState } from "./oauth_BlD-15-T.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const GET = async ({ request, locals, url, cookies, redirect }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return new Response("管理者のみ", { status: 403 });
  const param = url.searchParams.get("groups");
  const groups = normalizeGroups(param ? param.split(",").map((s2) => s2.trim()) : null);
  const s = newState();
  cookies.set("google_state", s, { httpOnly: true, secure: true, path: "/", maxAge: 600, sameSite: "lax" });
  cookies.set("google_groups", groups.join(","), { httpOnly: true, secure: true, path: "/", maxAge: 600, sameSite: "lax" });
  const authUrl = await googleAuthUrl(env, url.origin, s, groups);
  if (!authUrl) return new Response("Google OAuth が未設定です（GOOGLE_CLIENT_ID/SECRET）。", { status: 400 });
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
