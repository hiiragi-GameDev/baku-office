globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { deleteSkill, setSkillEnabled, generateSkill, createSkill } from "./skills_Be49B9yx.mjs";
import { cachedEntitlement } from "./client_F4fksau0.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const b = await request.json().catch(() => ({}));
  switch (b._action) {
    case "create":
      if (!b.name || !b.skill_md) return json({ error: "name と skill_md が必要" }, 400);
      return json({ ok: true, id: await createSkill(env, ses.uid, { name: b.name, description: b.description, skill_md: b.skill_md, mode: b.mode ?? "instruction" }) });
    case "generate": {
      if (!atLeast(await cachedEntitlement(env), "plus")) return json({ error: "AIによるスキル生成は Plus 以上で利用できます" }, 403);
      if (!b.request) return json({ error: "request が必要" }, 400);
      const g = await generateSkill(env, ses.uid, String(b.request));
      return json(g, g.ok ? 200 : 400);
    }
    case "enable":
      if (b.id) await setSkillEnabled(env, b.id, !!b.enabled);
      return json({ ok: true });
    case "delete":
      if (b.id) await deleteSkill(env, b.id);
      return json({ ok: true });
    default:
      return json({ error: "不明な操作" }, 400);
  }
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
