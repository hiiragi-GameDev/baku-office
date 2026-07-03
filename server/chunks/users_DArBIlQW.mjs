globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId, e as encryptField, d as decryptField } from "./stripe_r-RFTlbb.mjs";
import { masterKey } from "./client_F4fksau0.mjs";
import { revokeSessions } from "./auth_DL5yvmzT.mjs";
import { n as nowSec, s as softDeleteTx, c as currentPeriod, f as findOrCreateCategory, a as createTx } from "./accounting_D4tRmfws.mjs";
async function encName(env, name) {
  return encryptField(await masterKey(env), name, "member-pii");
}
async function decName(env, stored) {
  if (!stored) return "";
  try {
    return await decryptField(await masterKey(env), stored, "member-pii");
  } catch {
    return "(復号失敗)";
  }
}
async function createInvite(env, issuedBy, defaultRole) {
  const id = randomId();
  const code = randomId(6).toUpperCase();
  await env.DB.prepare(
    "INSERT INTO invites (id,code,issued_by,default_role,expires_at,max_uses,used_count,status) VALUES (?,?,?,?,?,1,0,'active')"
  ).bind(id, code, issuedBy, defaultRole, nowSec() + 7 * 86400).run();
  return code;
}
async function createLinkCode(env, issuedBy, targetUserId) {
  const id = randomId();
  const code = randomId(6).toUpperCase();
  await env.DB.prepare(
    "INSERT INTO invites (id,code,issued_by,default_role,expires_at,max_uses,used_count,status,target_user_id) VALUES (?,?,?,?,?,1,0,'active',?)"
  ).bind(id, code, issuedBy, "member", nowSec() + 3 * 86400, targetUserId).run();
  return code;
}
async function listMemberConnectors(env) {
  const out = {};
  try {
    const { results } = await env.DB.prepare("SELECT user_id, type FROM identities WHERE type IN ('line','discord','slack')").all();
    for (const r of results) {
      (out[r.user_id] ??= []).push(r.type);
    }
  } catch {
  }
  return out;
}
async function linkIdentity(env, userId, type, externalId) {
  const existing = await env.DB.prepare("SELECT user_id FROM identities WHERE type=? AND external_id=?").bind(type, externalId).first();
  if (existing) return existing.user_id === userId ? { ok: true } : { ok: false, error: "この外部アカウントは別の会員に連携済みです。" };
  await env.DB.prepare("INSERT INTO identities (id,user_id,type,external_id,password_hash,created_at) VALUES (?,?,?,?,?,?)").bind(randomId(), userId, type, externalId, null, nowSec()).run();
  return { ok: true };
}
async function joinWithInvite(env, code, name, identity) {
  const inv = await env.DB.prepare("SELECT * FROM invites WHERE code=? AND status='active'").bind(code).first();
  if (!inv) return { ok: false, error: "招待コードが無効" };
  if (nowSec() >= inv.expires_at) return { ok: false, error: "招待コードが期限切れ" };
  if (inv.used_count >= inv.max_uses) return { ok: false, error: "招待コードは使用済み" };
  const uid = randomId();
  await env.DB.prepare("INSERT INTO users (id,display_name,role,status,created_at) VALUES (?,?,?,'pending',?)").bind(uid, await encName(env, name), inv.default_role, nowSec()).run();
  let passwordHash = null;
  if (identity.type === "local" && identity.password) {
    passwordHash = await pbkdf2Hash(identity.password);
  }
  await env.DB.prepare("INSERT INTO identities (id,user_id,type,external_id,password_hash,created_at) VALUES (?,?,?,?,?,?)").bind(randomId(), uid, identity.type, identity.externalId ?? name, passwordHash, nowSec()).run();
  await env.DB.prepare("UPDATE invites SET used_count=used_count+1, status=CASE WHEN used_count+1>=max_uses THEN 'revoked' ELSE status END WHERE id=?").bind(inv.id).run();
  return { ok: true };
}
async function registerLocalUser(env, a) {
  const loginId = a.loginId.trim();
  if (!loginId) return { ok: false, error: "ログインIDが必要です" };
  if (a.password.length < 8) return { ok: false, error: "パスワードは8文字以上にしてください" };
  const dup = await env.DB.prepare("SELECT id FROM identities WHERE type='local' AND external_id=?").bind(loginId).first();
  if (dup) return { ok: false, error: "このログインIDは既に使われています" };
  const uid = randomId();
  await env.DB.prepare("INSERT INTO users (id,display_name,role,status,created_at) VALUES (?,?,?,?,?)").bind(uid, await encName(env, a.name), a.role ?? "member", a.status ?? "active", nowSec()).run();
  await env.DB.prepare("INSERT INTO identities (id,user_id,type,external_id,password_hash,created_at) VALUES (?,?,?,?,?,?)").bind(randomId(), uid, "local", loginId, await pbkdf2Hash(a.password), nowSec()).run();
  return { ok: true, uid };
}
async function listUsers(env) {
  const { results } = await env.DB.prepare("SELECT * FROM users WHERE role!='guest' ORDER BY created_at DESC").all();
  const out = [];
  for (const u of results) out.push({ ...u, name: await decName(env, u.display_name) });
  return out;
}
async function approveUser(env, id) {
  await env.DB.prepare("UPDATE users SET status='active' WHERE id=? AND status='pending'").bind(id).run();
}
async function updateDisplayName(env, id, name) {
  const clean = name.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "").trim().slice(0, 100);
  if (!clean) return;
  await env.DB.prepare("UPDATE users SET display_name=? WHERE id=?").bind(await encName(env, clean), id).run();
}
async function rejectUser(env, id) {
  await env.DB.prepare("UPDATE users SET status='disabled', leave_requested_at=NULL WHERE id=?").bind(id).run();
  await revokeSessions(env, id);
}
async function deleteUser(env, id) {
  await env.DB.prepare("DELETE FROM identities WHERE user_id=?").bind(id).run();
  await env.DB.prepare("DELETE FROM users WHERE id=?").bind(id).run();
  await revokeSessions(env, id);
}
async function setRole(env, id, role) {
  await env.DB.prepare("UPDATE users SET role=? WHERE id=?").bind(role, id).run();
  await revokeSessions(env, id);
}
async function setDisplayName(env, uid, name) {
  await env.DB.prepare("UPDATE users SET display_name=? WHERE id=?").bind(await encName(env, name), uid).run();
}
async function changeLocalPassword(env, uid, current, next) {
  const idn = await env.DB.prepare("SELECT id, password_hash FROM identities WHERE user_id=? AND type='local'").bind(uid).first();
  if (!idn || !idn.password_hash) return { ok: false, error: "パスワードログインを利用していないアカウントです" };
  if (!await verifyPassword(idn.password_hash, current)) return { ok: false, error: "現在のパスワードが違います" };
  if (next.length < 8) return { ok: false, error: "新しいパスワードは8文字以上にしてください" };
  await env.DB.prepare("UPDATE identities SET password_hash=? WHERE id=?").bind(await pbkdf2Hash(next), idn.id).run();
  return { ok: true };
}
async function requestLeave(env, uid) {
  await env.DB.prepare("UPDATE users SET leave_requested_at=? WHERE id=? AND status='active'").bind(nowSec(), uid).run();
}
async function cancelLeave(env, uid) {
  await env.DB.prepare("UPDATE users SET leave_requested_at=NULL WHERE id=?").bind(uid).run();
}
async function activeAdminCount(env) {
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin' AND status='active'").first();
  return r?.n ?? 0;
}
async function authLocal(env, loginId, password) {
  const idn = await env.DB.prepare("SELECT id, user_id, password_hash FROM identities WHERE type='local' AND external_id=?").bind(loginId).first();
  if (!idn || !idn.password_hash) return null;
  if (!await verifyPassword(idn.password_hash, password)) return null;
  if (!idn.password_hash.startsWith("pbkdf2$")) {
    await env.DB.prepare("UPDATE identities SET password_hash=? WHERE id=?").bind(await pbkdf2Hash(password), idn.id).run();
  }
  const u = await env.DB.prepare("SELECT * FROM users WHERE id=? AND status='active'").bind(idn.user_id).first();
  if (!u) return null;
  return { ...u, name: await decName(env, u.display_name) };
}
async function reviewQueue(env) {
  const { results } = await env.DB.prepare(
    "SELECT id,type,title,amount,owner_user_id,date FROM personal_items WHERE share_scope='org' AND review_status='pending' ORDER BY created_at"
  ).all();
  return results.map((r) => ({ id: r.id, type: r.type, title: r.title ?? "", amount: r.amount, owner: r.owner_user_id, date: r.date }));
}
async function approveItem(env, id, reviewer) {
  const it = await env.DB.prepare("SELECT * FROM personal_items WHERE id=?").bind(id).first();
  if (!it) return;
  await env.DB.prepare("UPDATE personal_items SET review_status='approved', reviewed_by=?, reviewed_at=? WHERE id=?").bind(reviewer, nowSec(), id).run();
  if (it.type === "receipt" && it.amount) {
    const period = await currentPeriod(env);
    const wallet = await env.DB.prepare("SELECT id FROM wallets ORDER BY sort_order LIMIT 1").first();
    if (period && wallet) {
      const categoryId = await findOrCreateCategory(env, "雑費", "expense");
      const txId = await createTx(env, {
        fiscal_period_id: period.id,
        date: it.date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        wallet_id: wallet.id,
        kind: "expense",
        category_id: categoryId,
        amount: it.amount,
        description: `[共有領収書] ${it.title ?? ""}`,
        counter_wallet_id: null
      });
      await env.DB.prepare("UPDATE personal_items SET gen_tx_id=? WHERE id=?").bind(txId, id).run();
    }
  } else {
    await env.DB.prepare("INSERT INTO knowledge (id,title,body,file_ref,tags,created_by,created_at) VALUES (?,?,?,?,?,?,?)").bind(randomId(), it.title ?? "(無題)", it.body ?? "", null, it.type, it.owner_user_id, nowSec()).run();
  }
}
async function rejectItem(env, id, reviewer, reason) {
  await env.DB.prepare("UPDATE personal_items SET review_status='rejected', reviewed_by=?, reviewed_at=?, reject_reason=? WHERE id=?").bind(reviewer, nowSec(), reason, id).run();
}
async function approvedReceipts(env) {
  const { results } = await env.DB.prepare(
    "SELECT id,title,amount,owner_user_id,date FROM personal_items WHERE type='receipt' AND share_scope='org' AND review_status='approved' ORDER BY reviewed_at DESC LIMIT 100"
  ).all();
  return results.map((r) => ({ id: r.id, title: r.title ?? "", amount: r.amount, owner: r.owner_user_id, date: r.date }));
}
async function unapproveItem(env, id, reviewer) {
  const it = await env.DB.prepare("SELECT review_status, gen_tx_id FROM personal_items WHERE id=?").bind(id).first();
  if (!it || it.review_status !== "approved") return;
  if (it.gen_tx_id) await softDeleteTx(env, it.gen_tx_id).catch(() => {
  });
  await env.DB.prepare("UPDATE personal_items SET review_status='rejected', reviewed_by=?, reviewed_at=?, reject_reason='承認を取消（管理者）', gen_tx_id=NULL WHERE id=?").bind(reviewer, nowSec(), id).run();
}
async function createPersonalItem(env, ownerId, t) {
  const id = randomId();
  await env.DB.prepare(
    "INSERT INTO personal_items (id,owner_user_id,type,title,body,amount,date,share_scope,review_status,created_at) VALUES (?,?,?,?,?,?,?,'personal','none',?)"
  ).bind(id, ownerId, t.type, t.title, t.body ?? null, t.amount ?? null, t.date ?? null, nowSec()).run();
  return id;
}
async function shareItem(env, id, ownerId) {
  await env.DB.prepare("UPDATE personal_items SET share_scope='org', review_status='pending' WHERE id=? AND owner_user_id=?").bind(id, ownerId).run();
}
async function deletePersonalItem(env, id, ownerId) {
  const it = await env.DB.prepare("SELECT review_status FROM personal_items WHERE id=? AND owner_user_id=?").bind(id, ownerId).first();
  if (!it) return { ok: false, error: "記録が見つかりません" };
  if (it.review_status === "approved") return { ok: false, error: "承認済みの記録は削除できません（組織の記録になっています）" };
  await env.DB.prepare("DELETE FROM personal_items WHERE id=? AND owner_user_id=?").bind(id, ownerId).run();
  return { ok: true };
}
async function listMyItems(env, ownerId) {
  const { results } = await env.DB.prepare(
    "SELECT id,type,title,amount,share_scope,review_status FROM personal_items WHERE owner_user_id=? ORDER BY created_at DESC"
  ).bind(ownerId).all();
  return results.map((r) => ({ ...r, title: r.title ?? "" }));
}
const PBKDF2_ITER = 1e5;
async function pbkdf2Hash(password, saltB64) {
  const salt = saltB64 ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITER }, base, 256);
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  const sB64 = btoa(String.fromCharCode(...salt));
  return `pbkdf2$${PBKDF2_ITER}$${sB64}$${hashB64}`;
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function verifyPassword(stored, password) {
  if (stored.startsWith("pbkdf2$")) {
    const saltB64 = stored.split("$")[2];
    if (!saltB64) return false;
    return timingSafeEqual(await pbkdf2Hash(password, saltB64), stored);
  }
  return timingSafeEqual(stored, await sha256(password));
}
async function sha256(s) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, "0")).join("");
}
export {
  activeAdminCount,
  approveItem,
  approveUser,
  approvedReceipts,
  authLocal,
  cancelLeave,
  changeLocalPassword,
  createInvite,
  createLinkCode,
  createPersonalItem,
  deletePersonalItem,
  deleteUser,
  joinWithInvite,
  linkIdentity,
  listMemberConnectors,
  listMyItems,
  listUsers,
  pbkdf2Hash,
  registerLocalUser,
  rejectItem,
  rejectUser,
  requestLeave,
  reviewQueue,
  setDisplayName,
  setRole,
  shareItem,
  unapproveItem,
  updateDisplayName,
  verifyPassword
};
