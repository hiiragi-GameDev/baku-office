globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { n as nowSec, e as ensureSeed, c as currentPeriod, l as listWallets, f as findOrCreateCategory, a as createTx, s as softDeleteTx } from "./accounting_D4tRmfws.mjs";
import { createMember } from "./membership_DQ1fLu2V.mjs";
import { registerLocalUser } from "./users_DArBIlQW.mjs";
function parsePlans(raw) {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v.map((p) => ({ id: String(p.id ?? randomId(6)), name: String(p.name ?? ""), price: Math.max(0, Math.round(Number(p.price) || 0)) })).filter((p) => p.name);
  } catch {
    return [];
  }
}
const toModel = (r) => ({ ...r, plans: parsePlans(r.plans) });
async function listEvents(env) {
  return (await env.DB.prepare("SELECT * FROM events ORDER BY (event_date IS NULL), event_date DESC, updated_at DESC").all()).results.map(toModel);
}
async function listPublishedEvents(env) {
  return (await env.DB.prepare("SELECT * FROM events WHERE published=1 ORDER BY (event_date IS NULL), event_date ASC").all()).results.map(toModel);
}
async function getEvent(env, id) {
  const r = await env.DB.prepare("SELECT * FROM events WHERE id=?").bind(id).first();
  return r ? toModel(r) : null;
}
async function getPublishedEventBySlug(env, slug) {
  const r = await env.DB.prepare("SELECT * FROM events WHERE slug=? AND published=1").bind(slug).first();
  return r ? toModel(r) : null;
}
const cleanSlug = (s) => s.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
const normPlans = (plans) => (plans ?? []).map((p) => ({ id: p.id || randomId(6), name: String(p.name ?? "").trim(), price: Math.max(0, Math.round(Number(p.price) || 0)) })).filter((p) => p.name);
const cleanImage = (v) => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  return /^https:\/\/[\w./?=&%:-]+$/.test(s) || /^\/[\w./?=&%-]+$/.test(s) ? s.slice(0, 500) : null;
};
async function saveEvent(env, a) {
  const slug = cleanSlug(a.slug);
  if (!slug) return { ok: false, error: "slug（英数字）が必要です" };
  if (!a.title?.trim()) return { ok: false, error: "タイトルが必要です" };
  const cap = a.capacity === "" || a.capacity == null ? null : Math.max(0, Math.round(Number(a.capacity) || 0));
  const plansJson = JSON.stringify(normPlans(a.plans));
  const image = cleanImage(a.image);
  const now = nowSec();
  const other = await env.DB.prepare("SELECT id FROM events WHERE slug=?").bind(slug).first();
  if (other && other.id !== a.id) return { ok: false, error: "この slug は別のイベントで使用されています" };
  if (a.id) {
    await env.DB.prepare(
      "UPDATE events SET slug=?,title=?,lead=?,body=?,location=?,event_date=?,capacity=?,plans=?,image=?,published=?,updated_at=? WHERE id=?"
    ).bind(slug, a.title.trim(), a.lead ?? null, a.body ?? null, a.location ?? null, a.event_date ?? null, cap, plansJson, image, a.published ? 1 : 0, now, a.id).run();
    return { ok: true, id: a.id };
  }
  const id = randomId();
  await env.DB.prepare(
    "INSERT INTO events (id,slug,title,lead,body,location,event_date,capacity,plans,image,published,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(id, slug, a.title.trim(), a.lead ?? null, a.body ?? null, a.location ?? null, a.event_date ?? null, cap, plansJson, image, a.published ? 1 : 0, now, now).run();
  return { ok: true, id };
}
async function deleteEvent(env, id) {
  await env.DB.prepare("DELETE FROM event_registrations WHERE event_id=?").bind(id).run();
  await env.DB.prepare("DELETE FROM events WHERE id=?").bind(id).run();
}
async function listRegistrations(env, eventId) {
  return (await env.DB.prepare("SELECT * FROM event_registrations WHERE event_id=? ORDER BY created_at DESC").bind(eventId).all()).results;
}
async function registeredHeadcount(env, eventId) {
  const r = await env.DB.prepare("SELECT COALESCE(SUM(headcount),0) AS n FROM event_registrations WHERE event_id=?").bind(eventId).first();
  return r?.n ?? 0;
}
async function eventStats(env, eventId) {
  const regs = await listRegistrations(env, eventId);
  return {
    count: regs.length,
    headcount: regs.reduce((s, r) => s + (r.headcount || 0), 0),
    paid: regs.filter((r) => r.pay_status === "paid").length,
    revenue: regs.filter((r) => r.pay_status === "paid").reduce((s, r) => s + (r.amount || 0), 0)
  };
}
async function notify(env, owner, kind, body, link) {
  try {
    await env.DB.prepare("INSERT INTO notifications (id,owner,kind,body,link,created_at) VALUES (?,?,?,?,?,?)").bind(randomId(), owner, kind, body, link ?? null, nowSec()).run();
  } catch {
  }
}
async function registerForEvent(env, a) {
  const ev = await getPublishedEventBySlug(env, a.slug);
  if (!ev) return { ok: false, error: "イベントが見つかりません" };
  const name = (a.name ?? "").trim();
  if (!name) return { ok: false, error: "お名前が必要です" };
  const headcount = Math.max(1, Math.min(20, Math.round(Number(a.headcount) || 1)));
  if (ev.capacity != null) {
    const cur = await registeredHeadcount(env, ev.id);
    if (cur + headcount > ev.capacity) return { ok: false, error: "申し訳ありません。定員に達したため受付を終了しました" };
  }
  const plan = ev.plans.find((p) => p.id === a.planId) ?? ev.plans[0] ?? null;
  const amount = plan ? plan.price * headcount : 0;
  const acct = await registerLocalUser(env, { name, loginId: a.loginId, password: a.password, role: "guest", status: "active" });
  if (!acct.ok) return { ok: false, error: acct.error };
  const memberId = await createMember(env, { name, contact: (a.contact ?? "").slice(0, 200), fee_status: "unpaid", extra: `イベント申込：${ev.title}` }).catch(() => null);
  const regId = randomId();
  await env.DB.prepare(
    "INSERT INTO event_registrations (id,event_id,user_id,member_id,name,contact,plan_id,plan_name,headcount,amount,pay_status,fee_tx_id,paid_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(regId, ev.id, acct.uid ?? null, memberId, name, (a.contact ?? "").slice(0, 200) || null, plan?.id ?? null, plan?.name ?? null, headcount, amount, "unpaid", null, null, nowSec()).run();
  await notify(env, "org", "event", `イベント「${ev.title}」に新しいお申し込み（${name}・${headcount}名）`, "/settings/events");
  return { ok: true, registrationId: regId, userId: acct.uid, amount };
}
async function markRegistrationPaid(env, regId) {
  const reg = await env.DB.prepare("SELECT * FROM event_registrations WHERE id=?").bind(regId).first();
  if (!reg) return { ok: false, error: "申込が見つかりません" };
  if (reg.pay_status === "paid") return { ok: true, amount: reg.amount ?? 0 };
  const ev = await getEvent(env, reg.event_id);
  const title = ev?.title ?? "イベント";
  let txId = null;
  const amount = reg.amount ?? 0;
  if (amount > 0) {
    try {
      await ensureSeed(env);
      const period = await currentPeriod(env);
      const wallets = await listWallets(env);
      const wallet = wallets.find((w) => w.type === "bank") ?? wallets[0];
      const catId = await findOrCreateCategory(env, "参加費収入", "income");
      if (period && wallet) {
        txId = await createTx(env, {
          fiscal_period_id: period.id,
          date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
          wallet_id: wallet.id,
          kind: "income",
          category_id: catId,
          amount,
          description: `イベント参加費：${title}／${reg.name}`,
          counter_wallet_id: null
        });
      }
    } catch {
    }
  }
  await env.DB.prepare("UPDATE event_registrations SET pay_status='paid', fee_tx_id=?, paid_at=? WHERE id=?").bind(txId, nowSec(), regId).run();
  if (reg.user_id) await notify(env, reg.user_id, "event", `「${title}」へのお申し込み・お支払いが完了しました（デモ）`, "/my-events");
  await notify(env, "org", "event", `イベント「${title}」の参加費 ¥${amount.toLocaleString("ja-JP")} を入金（デモ）`, "/settings/events");
  return { ok: true, amount };
}
async function deleteRegistration(env, regId) {
  const reg = await env.DB.prepare("SELECT fee_tx_id FROM event_registrations WHERE id=?").bind(regId).first();
  if (reg?.fee_tx_id) await softDeleteTx(env, reg.fee_tx_id).catch(() => {
  });
  await env.DB.prepare("DELETE FROM event_registrations WHERE id=?").bind(regId).run();
}
async function listMyRegistrations(env, userId) {
  return (await env.DB.prepare(
    "SELECT r.*, e.title AS event_title, e.slug AS event_slug, e.event_date AS event_date FROM event_registrations r JOIN events e ON e.id=r.event_id WHERE r.user_id=? ORDER BY r.created_at DESC"
  ).bind(userId).all()).results;
}
const CRAFT_LP_SLUG = "craft-career";
const CRAFT_LP_DEFAULT = {
  title: "クラフトビール片手に、キャリアを語る夜。",
  body: [
    '<p class="lead">醸造のように、キャリアもゆっくり発酵する。一杯のクラフトビールを起点に、畑違いの人と本音で語り合う——そんな夜をつくっています。</p>',
    "<h2>醸造に学ぶ</h2><p>発酵は、待つ技術。焦らず、混ぜ合わせ、時を読む。キャリアの育て方と、驚くほど似ています。一杯のなかにある時間の積み重ねを、自分の歩みに重ねてみる夜です。</p>",
    "<h2>越境してつながる</h2><p>醸造家、人事、エンジニア、経営者。畑違いの人と一杯を交わすほど、視界がひらけていきます。肩書きを少しだけ脇に置いて、対等に語り合える場をつくります。</p>",
    "<h2>次の一歩を持ち帰る</h2><p>ただ飲むだけで終わらせません。対話のなかで、明日からの小さな一歩を見つけて帰る。そんな手ざわりのある時間を大切にしています。</p>"
  ].join("\n")
};
async function seedDemoEvent(env) {
  const { getSite, upsertSite } = await import("./sites_DMFBMYur.mjs");
  if (!await getSite(env, CRAFT_LP_SLUG)) {
    await upsertSite(env, { slug: CRAFT_LP_SLUG, title: CRAFT_LP_DEFAULT.title, body: CRAFT_LP_DEFAULT.body, published: true, show_join: false }).catch(() => {
    });
  }
  const slug = "craft-career-night";
  const exists = await env.DB.prepare("SELECT id FROM events WHERE slug=?").bind(slug).first();
  if (exists) return exists.id;
  const body = [
    "<p>クラフトビール片手に、キャリアを語る夜。醸造家・人事・エンジニア・フリーランス——畑の違う人と、肩の力を抜いて未来の話をしませんか。</p>",
    "<h2>当日の流れ</h2>",
    "<ul><li>18:30 受付・乾杯（クラフトビール3種テイスティング）</li><li>19:00 トークセッション「醸造とキャリアの共通点」</li><li>19:45 テーマ別グループ対話</li><li>20:30 自由交流</li><li>21:00 閉会</li></ul>",
    "<h2>こんな方へ</h2>",
    "<p>キャリアの分岐点にいる方／越境して人とつながりたい方／単純にクラフトビールが好きな方。お一人参加も大歓迎です。</p>"
  ].join("\n");
  const plans = [
    { id: "ga", name: "一般（ビール3種＋軽食）", price: 4500 },
    { id: "stu", name: "学生・25歳以下", price: 3e3 },
    { id: "drv", name: "ドライバー（ノンアル3種＋軽食）", price: 3500 }
  ];
  const r = await saveEvent(env, {
    slug,
    title: "Craft Beer × Career Night vol.1",
    lead: "クラフトビール片手に、キャリアを語る夜。",
    body,
    location: "東京・蔵前 BREW STUDIO（蔵前駅 徒歩4分）",
    event_date: "2026-07-18 18:30",
    capacity: 40,
    plans,
    image: "/img/craft-event.jpg",
    published: true
  });
  return r.id ?? null;
}
export {
  CRAFT_LP_DEFAULT,
  CRAFT_LP_SLUG,
  deleteEvent,
  deleteRegistration,
  eventStats,
  getEvent,
  getPublishedEventBySlug,
  listEvents,
  listMyRegistrations,
  listPublishedEvents,
  listRegistrations,
  markRegistrationPaid,
  registerForEvent,
  registeredHeadcount,
  saveEvent,
  seedDemoEvent
};
