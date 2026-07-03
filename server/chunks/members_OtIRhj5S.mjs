globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { activeAdminCount, deleteUser, updateDisplayName, setRole, rejectUser, approveUser, createLinkCode, createInvite } from "./users_DArBIlQW.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "権限がありません" }, 403);
  const actorIsOrg = ses.ctx === "org";
  const b = await request.json().catch(() => ({}));
  const ASSIGNABLE_ROLES = ["admin", "developer", "accounting", "clerical", "other", "member"];
  const validRole = (r) => typeof r === "string" && ASSIGNABLE_ROLES.includes(r);
  switch (b._action) {
    case "invite": {
      const role = validRole(b.role) ? b.role : "member";
      const code = await createInvite(env, ses.uid, role);
      return json({ ok: true, code });
    }
    // 既存メンバーへの外部連携コード（アカウントを増やさず本人へ LINE/Discord/Slack を紐付ける）。
    case "link_code": {
      if (!b.id || b.id === "org") return json({ error: "対象メンバーがありません" }, 400);
      const u = await env.DB.prepare("SELECT id FROM users WHERE id=? AND status='active'").bind(b.id).first();
      if (!u) return json({ error: "有効なメンバーが見つかりません" }, 400);
      const code = await createLinkCode(env, ses.uid, b.id);
      const connector = ["line", "discord", "slack"].includes(String(b.connector)) ? String(b.connector) : "line";
      return json({ ok: true, code, connector });
    }
    case "approve":
      if (b.id) {
        const name = typeof b.name === "string" ? b.name.trim() : "";
        if (name) await updateDisplayName(env, b.id, name);
        await approveUser(env, b.id);
      }
      return json({ ok: true });
    case "reject":
    case "leave_approve": {
      if (!b.id) return json({ error: "対象がありません" }, 400);
      if (b.id === "org") return json({ error: "組織アカウントは無効化できません" }, 400);
      if (b.id === ses.uid) return json({ error: "自分自身は無効化できません" }, 400);
      const u = await env.DB.prepare("SELECT role,status FROM users WHERE id=?").bind(b.id).first();
      if (u && u.role === "admin" && u.status === "active" && !actorIsOrg && await activeAdminCount(env) <= 1) {
        return json({ error: "最後の管理者は無効化できません（組織アカウントのみ操作できます）" }, 400);
      }
      await rejectUser(env, b.id);
      return json({ ok: true });
    }
    case "role":
      if (!b.id || !validRole(b.role)) return json({ error: "ロールが不正です" }, 400);
      await setRole(env, b.id, b.role);
      return json({ ok: true });
    case "rename": {
      if (!b.id) return json({ error: "対象がありません" }, 400);
      const name = typeof b.name === "string" ? b.name.trim() : "";
      if (!name) return json({ error: "名前を入力してください" }, 400);
      await updateDisplayName(env, b.id, name);
      return json({ ok: true });
    }
    case "delete": {
      if (!b.id) return json({ error: "対象がありません" }, 400);
      if (b.id === "org") return json({ error: "システムユーザーは削除できません" }, 400);
      if (b.id === ses.uid) return json({ error: "自分自身は削除できません" }, 400);
      const u = await env.DB.prepare("SELECT role,status FROM users WHERE id=?").bind(b.id).first();
      if (!u) return json({ error: "対象が見つかりません" }, 404);
      if (u.role === "admin" && u.status === "active" && !actorIsOrg && await activeAdminCount(env) <= 1) {
        return json({ error: "最後の管理者は削除できません（組織アカウントのみ操作できます）" }, 400);
      }
      await deleteUser(env, b.id);
      return json({ ok: true });
    }
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
