globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { normalizeGroups, exchangeGoogleCode } from "./google_DFar0IbF.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const GET = async ({ request, locals, url, cookies, redirect }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return new Response("管理者のみ", { status: 403 });
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = cookies.get("google_state")?.value;
  const groupsCookie = cookies.get("google_groups")?.value ?? "";
  cookies.delete("google_state", { path: "/" });
  cookies.delete("google_groups", { path: "/" });
  if (!code || !state || state !== saved) return redirect("/calendar?error=state", 302);
  const groups = normalizeGroups(groupsCookie ? groupsCookie.split(",") : null);
  const ok = await exchangeGoogleCode(env, url.origin, code, groups);
  return redirect(ok ? "/calendar?connected=1" : "/calendar?error=token", 302);
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
