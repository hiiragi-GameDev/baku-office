globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as renderComponent, s as spreadAttributes } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Membership = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Membership;
  const { getSession, canAccess } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const canEdit = canAccess(ses.role, "accounting");
  const { listMembers, memberStats, FEE_STATUSES, FEE_LABEL } = await import("./membership_DQ1fLu2V.mjs");
  const q = Astro2.url.searchParams.get("q") ?? "";
  const members = await listMembers(env, q);
  const stats = await memberStats(env);
  const opt = (cur, v) => ({ value: v, selected: cur === v });
  const fmt = (s) => s ? new Date(s * 1e3).toISOString().slice(0, 10) : "—";
  const yen = (n) => n != null ? "¥" + n.toLocaleString("ja-JP") : "—";
  const extraHistory = [...new Set(members.map((m) => m.extra).filter((x) => !!x && x.trim() !== ""))].slice(0, 50);
  const rankHistory = [...new Set(members.map((m) => m.rank).filter((x) => !!x && x.trim() !== ""))].slice(0, 50);
  const cols = canEdit ? 9 : 8;
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "名簿", "active": "/membership" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>名簿</h1> <p class="muted">団体会員の名簿と会費状況を管理します（全プラン可）。</p> <div class="grid"> <div class="card"><div class="label">会員数</div><div class="num">${stats.total}</div></div> <div class="card"><div class="label">支払済</div><div class="num">${stats.paid}</div></div> <div class="card"><div class="label">未払い</div><div class="num">${stats.unpaid}</div></div> </div> ${canEdit && renderTemplate`<div class="card"> <h2 style="margin-top:0;border:0">会員を追加</h2> <div class="row"><input id="m-name" placeholder="氏名" aria-label="氏名"><input id="m-contact" placeholder="連絡先（電話/メール）" aria-label="連絡先"></div> <div class="row"><select id="m-fee" aria-label="会費の状態">${FEE_STATUSES.map((s) => renderTemplate`<option${addAttribute(s, "value")}>${FEE_LABEL[s]}</option>`)}</select><input id="m-paid" placeholder="支払い日時（任意）" aria-label="支払い日時"></div> <div class="row"><input id="m-amount" type="number" min="0" inputmode="numeric" placeholder="会費の金額（円・任意）" aria-label="会費の金額"><input id="m-rank" list="rank-history" placeholder="ランク・区分（例：正会員／賛助会員）" aria-label="ランク・区分"></div> <div class="field"><input id="m-extra" list="extra-history" placeholder="任意項目（メモ・自由記述。例：所属=A班, 区分=正会員）" aria-label="任意項目"></div> <button class="btn btn-primary" id="m-add">追加</button> <p class="muted" style="font-size:.82rem;margin:.4rem 0 0">会費を「支払済」にして金額を入れると、<a href="/accounting">お金の記録</a>へ「会費収入」として自動で計上されます（支払済を解除すると取り消し）。</p> </div>`}<datalist id="extra-history">${extraHistory.map((v) => renderTemplate`<option${addAttribute(v, "value")}></option>`)}</datalist> <datalist id="rank-history">${rankHistory.map((v) => renderTemplate`<option${addAttribute(v, "value")}></option>`)}</datalist><form method="get" class="row" style="margin:.5rem 0"><input name="q"${addAttribute(q, "value")} placeholder="氏名・連絡先で検索" aria-label="氏名・連絡先で検索"><button class="btn" type="submit" style="flex:0 0 auto">検索</button></form> <div class="table-wrap"><table> <thead><tr><th>氏名</th><th>連絡先</th><th>会費</th><th>金額</th><th>ランク</th><th>支払日時</th><th>変更日</th><th>任意項目</th>${canEdit && renderTemplate`<th>操作</th>`}</tr></thead> <tbody> ${members.map((m) => renderTemplate`<tr${addAttribute(m.id, "data-id")}> <td>${canEdit ? renderTemplate`<input class="e-name"${addAttribute(m.name, "value")} aria-label="氏名">` : m.name}</td> <td>${canEdit ? renderTemplate`<input class="e-contact"${addAttribute(m.contact ?? "", "value")} aria-label="連絡先">` : m.contact ?? "—"}</td> <td>${canEdit ? renderTemplate`<select class="e-fee" aria-label="会費の状態">${FEE_STATUSES.map((s) => renderTemplate`<option${spreadAttributes(opt(m.fee_status, s))}>${FEE_LABEL[s]}</option>`)}</select>` : FEE_LABEL[m.fee_status] ?? m.fee_status}</td> <td>${canEdit ? renderTemplate`<input class="e-amount" type="number" min="0" inputmode="numeric"${addAttribute(m.fee_amount ?? "", "value")} aria-label="会費の金額" style="max-width:6.5rem">` : yen(m.fee_amount)}</td> <td>${canEdit ? renderTemplate`<input class="e-rank" list="rank-history"${addAttribute(m.rank ?? "", "value")} aria-label="ランク・区分" style="max-width:8rem">` : m.rank ?? "—"}</td> <td>${canEdit ? renderTemplate`<input class="e-paid"${addAttribute(m.paid_at ?? "", "value")} aria-label="支払い日時">` : m.paid_at ?? "—"}</td> <td class="muted">${fmt(m.status_changed_at)}</td> <td>${canEdit ? renderTemplate`<input class="e-extra" list="extra-history"${addAttribute(m.extra ?? "", "value")} aria-label="任意項目">` : m.extra ?? "—"}</td> ${canEdit && renderTemplate`<td style="white-space:nowrap"><button class="btn btn-sm btn-primary e-save">保存</button> <button class="btn btn-sm btn-danger e-del">削除</button></td>`} </tr>`)} ${members.length === 0 && renderTemplate`<tr><td${addAttribute(cols, "colspan")} class="muted">会員がいません。</td></tr>`} </tbody> </table></div>  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script data-astro-rerun>\n      const api = (b, btn) => window.bo.api("/api/membership", b, { btn });\n      const add = document.getElementById("m-add");\n      if (add) add.addEventListener("click", async (e) => {\n        const name = document.getElementById("m-name").value.trim();\n        if (!name) { window.bo.toast("氏名を入力してください", "err"); return; }\n        const r = await api({ _action: "create", name, contact: document.getElementById("m-contact").value, fee_status: document.getElementById("m-fee").value, paid_at: document.getElementById("m-paid").value, extra: document.getElementById("m-extra").value, fee_amount: document.getElementById("m-amount").value || undefined, rank: document.getElementById("m-rank").value }, e.currentTarget);\n        if (r.ok) { window.bo.toast("追加しました"); setTimeout(() => location.reload(), 600); }\n      });\n      document.querySelectorAll("tr[data-id]").forEach((tr) => {\n        const id = tr.dataset.id;\n        tr.querySelector(".e-save")?.addEventListener("click", async (e) => {\n          const r = await api({ _action: "update", id, name: tr.querySelector(".e-name").value, contact: tr.querySelector(".e-contact").value, fee_status: tr.querySelector(".e-fee").value, paid_at: tr.querySelector(".e-paid").value, extra: tr.querySelector(".e-extra").value, fee_amount: tr.querySelector(".e-amount").value || "", rank: tr.querySelector(".e-rank").value }, e.currentTarget);\n          if (r.ok) { window.bo.toast("更新しました"); setTimeout(() => location.reload(), 500); }\n        });\n        tr.querySelector(".e-del")?.addEventListener("click", async (e) => {\n          if (await window.bo.confirm("この会員を削除しますか？", { confirmLabel: "削除", danger: true, auditHref: "/diagnostics" })) { const r = await api({ _action: "delete", id }, e.currentTarget); if (r.ok) setTimeout(() => location.reload(), 400); }\n        });\n      });\n    <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/membership.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/membership.astro";
const $$url = "/membership";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Membership,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
