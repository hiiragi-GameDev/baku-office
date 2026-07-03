globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { exchangeDriveCode } from "./drive_BU5bDSNm.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const GET = async ({ request, locals, url, cookies, redirect }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return new Response("管理者のみ", { status: 403 });
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = cookies.get("drive_state")?.value;
  cookies.delete("drive_state", { path: "/" });
  if (!code || !state || state !== saved) return redirect("/drive?error=state", 302);
  const ok = await exchangeDriveCode(env, url.origin, code);
  return redirect(ok ? "/drive?connected=1" : "/drive?error=token", 302);
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
