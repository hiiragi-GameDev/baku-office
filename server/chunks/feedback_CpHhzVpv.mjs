globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses) return json({ error: "unauthorized" }, 401);
  const b = await request.json().catch(() => ({}));
  if (b.nps !== void 0) {
    if (!["yes", "neutral", "no"].includes(String(b.nps))) return json({ error: "bad request" }, 400);
    try {
      await env.DB.prepare("INSERT INTO nps_responses (id, ts, owner, score) VALUES (?,?,?,?)").bind(randomId(), Math.floor(Date.now() / 1e3), ses.uid, String(b.nps)).run();
    } catch {
      return json({ error: "記録に失敗しました" }, 500);
    }
    return json({ ok: true });
  }
  const messageId = String(b.messageId ?? "");
  const value = b.value === "good" ? "good" : b.value === "bad" ? "bad" : null;
  const minutes = Number.isFinite(Number(b.minutes)) && Number(b.minutes) >= 0 ? Math.min(480, Math.round(Number(b.minutes))) : null;
  if (!messageId || !value && minutes === null) return json({ error: "bad request" }, 400);
  const owned = await env.DB.prepare(
    "SELECT m.id FROM chat_messages m JOIN chat_sessions s ON s.id=m.session_id WHERE m.id=? AND s.owner=? AND m.role='assistant'"
  ).bind(messageId, ses.uid).first().catch(() => null);
  if (!owned) return json({ error: "not found" }, 404);
  try {
    const upd = await env.DB.prepare(
      "UPDATE task_logs SET feedback=COALESCE(?, feedback), saved_minutes=COALESCE(?, saved_minutes), rework=CASE WHEN ?='bad' THEN 1 ELSE rework END WHERE message_id=?"
    ).bind(value, minutes, value ?? "", messageId).run();
    if (!(upd.meta?.changes ?? 0)) {
      await env.DB.prepare(
        "INSERT INTO task_logs (id, ts, owner, role, source, kind, ai_completed, exec_type, rework, feedback, saved_minutes, message_id) VALUES (?,?,?,?,?,?,1,'suggest',?,?,?,?)"
      ).bind(randomId(), Math.floor(Date.now() / 1e3), ses.uid, ses.role, "feedback", "other", value === "bad" ? 1 : 0, value, minutes, messageId).run();
    }
  } catch {
    return json({ error: "記録に失敗しました" }, 500);
  }
  return json({ ok: true });
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
