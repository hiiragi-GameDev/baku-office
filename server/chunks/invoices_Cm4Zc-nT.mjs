globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
async function setReminder(ctx, owner, a) {
  const at = Math.floor(new Date(a.remind_at).getTime() / 1e3);
  if (!Number.isFinite(at)) return "日時を解釈できませんでした（例：2026-06-20T10:00）。";
  await ctx.db.run(
    "INSERT INTO reminders (id,owner,content,remind_at,done,created_at) VALUES (?,?,?,?,0,?)",
    [randomId(), owner, a.content, at, nowSec()]
  );
  return `リマインダー設定：${a.remind_at} に「${a.content}」`;
}
async function listReminders(ctx, owner) {
  const results = await ctx.db.all("SELECT content,remind_at FROM reminders WHERE owner=? AND done=0 ORDER BY remind_at LIMIT 10", [owner]);
  if (!results.length) return "未配信のリマインダーはありません。";
  return results.map((r) => `・${new Date(r.remind_at * 1e3).toISOString().slice(0, 16).replace("T", " ")} ${r.content}`).join("\n");
}
async function dueReminders(ctx, owner) {
  const now = nowSec();
  const sql = "SELECT id,owner,content FROM reminders WHERE done=0 AND remind_at<=? ORDER BY remind_at LIMIT 50";
  const results = await ctx.db.all(sql, [now]);
  return results;
}
async function markReminderDone(ctx, id) {
  await ctx.db.run("UPDATE reminders SET done=1 WHERE id=?", [id]);
}
const remindersPart = {
  id: "reminders",
  name: "予定",
  icon: "⏰",
  version: "1.0.0",
  category: "庶務",
  description: "指定日時の通知。",
  permissions: ["db:read", "db:write"],
  menu: [{ href: "/schedule", label: "予定" }],
  agentTools: [
    {
      name: "set_reminder",
      description: "指定日時にLINEへ通知",
      parameters: { type: "object", properties: { content: { type: "string" }, remind_at: { type: "string", description: "ISO日時" } }, required: ["content", "remind_at"] },
      run: (ctx, owner, _baseUrl, a) => setReminder(ctx, owner, { content: String(a.content), remind_at: String(a.remind_at) })
    },
    {
      name: "list_reminders",
      description: "未配信リマインダー一覧",
      parameters: { type: "object", properties: {} },
      run: (ctx, owner) => listReminders(ctx, owner)
    }
  ]
};
const STATUSES = ["unpaid", "paid", "overdue", "canceled"];
async function saveInvoice(ctx, owner, d) {
  const id = randomId();
  const now = nowSec();
  await ctx.db.run(
    "INSERT INTO invoices (id,owner,file_id,vendor,amount,issued_date,due_date,status,notes,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?, 'unpaid', ?,?,?,?)",
    [id, owner, d.fileId ?? null, d.vendor ?? null, d.amount ?? null, d.issued_date ?? null, d.due_date ?? null, d.notes ?? null, d.source ?? "manual", now, now]
  );
  if (d.due_date) {
    const due = new Date(d.due_date).getTime();
    if (Number.isFinite(due)) {
      const remindAt = new Date(due - 3 * 864e5).toISOString();
      await setReminder(ctx, owner, { content: `請求書「${d.vendor ?? "(請求元不明)"}」の支払期日が近づいています（期日 ${d.due_date}${d.amount ? ` / ¥${d.amount.toLocaleString()}` : ""}）`, remind_at: remindAt }).catch(() => {
      });
    }
  }
  return id;
}
async function registerInvoiceFromFile(ctx, owner, fileId, source = "manual") {
  if (!await ctx.storage.ownsFile(fileId, owner)) return { error: "ファイルが見つかりません。" };
  const f = await ctx.storage.getFile(fileId);
  if (!f) return { error: "ファイルが見つかりません。" };
  const ex = await ctx.ai.extractInvoice(f);
  const id = await saveInvoice(ctx, owner, { fileId, vendor: ex.vendor, amount: ex.amount, issued_date: ex.issued_date, due_date: ex.due_date, source });
  return { id, vendor: ex.vendor, amount: ex.amount, due_date: ex.due_date };
}
async function listInvoices(ctx, opts = {}) {
  const where = ["deleted_at IS NULL"];
  const binds = [];
  if (opts.status && STATUSES.includes(opts.status)) {
    where.push("status=?");
    binds.push(opts.status);
  }
  binds.push(Math.min(opts.limit ?? 200, 500));
  return await ctx.db.all(`SELECT * FROM invoices WHERE ${where.join(" AND ")} ORDER BY due_date IS NULL, due_date ASC LIMIT ?`, binds);
}
async function setInvoiceStatus(ctx, id, status) {
  if (!STATUSES.includes(status)) return { ok: false, error: "不正なステータスです" };
  await ctx.db.run("UPDATE invoices SET status=?, updated_at=? WHERE id=?", [status, nowSec(), id]);
  return { ok: true };
}
async function toolRegister(ctx, owner, a) {
  const r = await registerInvoiceFromFile(ctx, owner, a.file_id, "chat");
  if (r.error) return r.error;
  return `請求書を登録しました：${r.vendor ?? "(請求元不明)"} / ${r.amount ? `¥${r.amount.toLocaleString()}` : "金額不明"} / 期日 ${r.due_date ?? "不明"}`;
}
async function toolListUnpaid(ctx) {
  const rows = await listInvoices(ctx, { status: "unpaid", limit: 30 });
  if (!rows.length) return "未払いの請求書はありません。";
  return rows.map((r) => `・[${r.id}] ${r.vendor ?? "(不明)"} ¥${r.amount?.toLocaleString() ?? "?"} 期日 ${r.due_date ?? "未設定"}`).join("\n");
}
async function toolMarkPaid(ctx, a) {
  const r = await setInvoiceStatus(ctx, a.invoice_id, "paid");
  return r.ok ? "請求書を支払済みにしました。" : r.error ?? "更新に失敗しました。";
}
const invoicesPart = {
  id: "invoices",
  name: "請求書管理",
  icon: "🧾",
  version: "1.0.0",
  category: "会計",
  description: "請求書/領収書の画像・PDFから請求元・金額・期日を抽出して管理。未払の期日接近を通知。",
  permissions: ["db:read", "db:write", "ai", "storage:read"],
  minPlan: "pro",
  menu: [{ href: "/invoices", label: "請求書" }],
  widgets: [
    {
      id: "unpaid_invoices",
      title: "未払請求書",
      run: async (ctx) => {
        const r = await ctx.db.first("SELECT COUNT(*) AS n FROM invoices WHERE status='unpaid' AND deleted_at IS NULL");
        return { value: `${r?.n ?? 0} 件`, sub: "未払い" };
      }
    }
  ],
  agentTools: [
    {
      name: "register_invoice",
      description: "保存済みの請求書ファイル(file_id)から請求元・金額・期日を抽出して登録",
      parameters: { type: "object", properties: { file_id: { type: "string" }, notes: { type: "string" } }, required: ["file_id"] },
      run: (ctx, owner, _b, a) => toolRegister(ctx, owner, { file_id: String(a.file_id), notes: a.notes })
    },
    {
      name: "list_unpaid_invoices",
      description: "未払いの請求書一覧（期日順）",
      parameters: { type: "object", properties: {} },
      run: (ctx) => toolListUnpaid(ctx)
    },
    {
      name: "mark_invoice_paid",
      description: "請求書を支払済みにする（invoice_id 指定）",
      parameters: { type: "object", properties: { invoice_id: { type: "string" } }, required: ["invoice_id"] },
      run: (ctx, _o, _b, a) => toolMarkPaid(ctx, { invoice_id: String(a.invoice_id) })
    }
  ]
};
const invoices = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  invoicesPart,
  listInvoices,
  registerInvoiceFromFile,
  saveInvoice,
  setInvoiceStatus
}, Symbol.toStringTag, { value: "Module" }));
export {
  saveInvoice as a,
  setReminder as b,
  remindersPart as c,
  dueReminders as d,
  invoices as e,
  invoicesPart as i,
  markReminderDone as m,
  registerInvoiceFromFile as r,
  setInvoiceStatus as s
};
