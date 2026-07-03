globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Events = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Events;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const { listEvents, listRegistrations, eventStats } = await import("./events_DvycExYH.mjs");
  const events = await listEvents(env);
  const data = await Promise.all(events.map(async (e) => ({ ev: e, regs: await listRegistrations(env, e.id), stats: await eventStats(env, e.id) })));
  const origin = Astro2.url.origin;
  const yen = (n) => n != null ? "¥" + n.toLocaleString("ja-JP") : "—";
  const PAY_LABEL = { paid: "支払済", unpaid: "未払い" };
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "イベント管理", "active": "/settings" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>イベント管理</h1> <p class="muted">イベントの公開ページ（クラフトビール×キャリア デモLP）と、イベント毎の参加者・入金状況を管理します。公開LP：<code>${origin}/lp/craft-career</code></p> ${events.length === 0 && renderTemplate`<div class="card" style="border-left:3px solid var(--brand)"> <strong>まずはサンプルから</strong> <p class="muted" style="font-size:.88rem;margin:.3em 0 .8em">「Craft Beer × Career Night」のデモイベントを1件作成します（公開状態で投入）。</p> <button class="btn btn-primary" id="seed">デモ用サンプルイベントを作成</button> </div>`}${data.map(({ ev, regs, stats }) => renderTemplate`<div class="card" style="margin-bottom:1rem"${addAttribute(JSON.stringify({ id: ev.id, slug: ev.slug, title: ev.title, lead: ev.lead, body: ev.body, location: ev.location, event_date: ev.event_date, capacity: ev.capacity, image: ev.image, published: ev.published, plans: ev.plans }), "data-ev")}> <div class="spread" style="flex-wrap:wrap;gap:10px;align-items:baseline"> <div> <h2 style="margin:0;border:0">${ev.title} <span${addAttribute("pill " + (ev.published ? "ok" : ""), "class")}>${ev.published ? "公開中" : "下書き"}</span></h2> <div class="muted" style="font-size:.85rem;margin-top:2px"><code>${ev.slug}</code>・${ev.event_date ?? "日程未定"}・${ev.location ?? "—"}・定員${ev.capacity ?? "無制限"}</div> </div> <div style="white-space:nowrap"> ${ev.published && renderTemplate`<a class="btn btn-sm"${addAttribute("/event/" + ev.slug, "href")} target="_blank" rel="noreferrer">公開ページ</a>`} <button class="btn btn-sm ev-edit">編集</button> <button class="btn btn-sm btn-danger ev-del">削除</button> </div> </div> <div class="grid" style="margin:.8rem 0"> <div class="card"><div class="label">申込</div><div class="num">${stats.count}件</div></div> <div class="card"><div class="label">参加人数</div><div class="num">${stats.headcount}名</div></div> <div class="card"><div class="label">入金済</div><div class="num">${stats.paid}件</div></div> <div class="card"><div class="label">参加費収入</div><div class="num">${yen(stats.revenue)}</div></div> </div> <h3 style="margin:.6rem 0 .3rem">参加者リスト</h3> <div class="table-wrap"><table> <thead><tr><th>氏名</th><th>連絡先</th><th>プラン</th><th>人数</th><th>金額</th><th>入金</th><th>操作</th></tr></thead> <tbody> ${regs.map((r) => renderTemplate`<tr${addAttribute(r.id, "data-reg")}> <td>${r.name}</td> <td>${r.contact ?? "—"}</td> <td>${r.plan_name ?? "—"}</td> <td>${r.headcount}名</td> <td>${yen(r.amount)}</td> <td><span${addAttribute("pill " + (r.pay_status === "paid" ? "ok" : ""), "class")}>${PAY_LABEL[r.pay_status] ?? r.pay_status}</span></td> <td style="white-space:nowrap"> ${r.pay_status !== "paid" && renderTemplate`<button class="btn btn-sm btn-primary r-paid">入金記録</button>`} <button class="btn btn-sm btn-danger r-del">取消</button> </td> </tr>`)} ${regs.length === 0 && renderTemplate`<tr><td colspan="7" class="muted">まだ申込はありません。</td></tr>`} </tbody> </table></div> </div>`)}<h2 id="editor">イベントを作成 / 編集</h2> <div class="card"> <input type="hidden" id="e-id"> <div class="row"><div class="field" style="flex:1"><label>slug（公開URL・英数字）</label><input id="e-slug" placeholder="craft-career-night"></div><div class="field" style="flex:2"><label>タイトル</label><input id="e-title" placeholder="Craft Beer × Career Night vol.1"></div></div> <div class="field"><label>リード文（短い紹介）</label><input id="e-lead" placeholder="クラフトビール片手に、キャリアを語る夜。"></div> <div class="row"><div class="field" style="flex:2"><label>開催場所</label><input id="e-location" placeholder="東京・蔵前 BREW STUDIO"></div><div class="field" style="flex:1"><label>開催日時</label><input id="e-date" placeholder="2026-07-18 18:30"></div><div class="field" style="flex:1"><label>定員（空欄=無制限）</label><input id="e-cap" type="number" min="0" inputmode="numeric" placeholder="40"></div></div> <div class="field"><label>カバー画像URL（任意・公開ページのヒーロー/一覧サムネに表示）</label><input id="e-image" placeholder="https://…/cover.jpg または /img/your.jpg"><div class="muted" style="font-size:.8rem;margin-top:4px">https の外部URL、または自己ホスト画像の相対パス（例 /img/event.jpg）。</div></div> <div class="field"><label>本文（HTML可）</label><textarea id="e-body" rows="8" placeholder="<p>イベントの説明…</p>"></textarea></div> <div class="field"> <label>参加プラン（プラン名と金額）</label> <div id="plan-rows"></div> <button class="btn btn-sm" id="add-plan" type="button">＋ プランを追加</button> </div> <label><input type="checkbox" id="e-pub"> 公開する</label> <div style="margin-top:.7rem"><button class="btn btn-primary" id="e-save">保存</button> <button class="btn" id="e-new" type="button">新規作成にリセット</button></div> </div>  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template([`<script data-astro-rerun>
    const $ = (id) => document.getElementById(id);
    function planRow(name, price) {
      const row = document.createElement("div");
      row.className = "row pl-row"; row.style.margin = ".3rem 0";
      row.innerHTML = '<input class="pl-name" placeholder="プラン名（例：一般）" style="flex:2" /><input class="pl-price" type="number" min="0" inputmode="numeric" placeholder="金額（円）" style="flex:1" /><button class="btn btn-sm btn-danger pl-del" type="button" style="flex:0 0 auto">削除</button>';
      row.querySelector(".pl-name").value = name || "";
      row.querySelector(".pl-price").value = (price != null ? price : "");
      row.querySelector(".pl-del").addEventListener("click", () => row.remove());
      $("plan-rows").appendChild(row);
    }
    function collectPlans() {
      return [...document.querySelectorAll("#plan-rows .pl-row")].map((r) => ({ name: r.querySelector(".pl-name").value.trim(), price: r.querySelector(".pl-price").value || 0 })).filter((p) => p.name);
    }
    function resetForm() {
      $("e-id").value = ""; $("e-slug").value = ""; $("e-title").value = ""; $("e-lead").value = "";
      $("e-location").value = ""; $("e-date").value = ""; $("e-cap").value = ""; $("e-image").value = ""; $("e-body").value = ""; $("e-pub").checked = false;
      $("plan-rows").replaceChildren();
    }
    $("e-new")?.addEventListener("click", () => { resetForm(); location.hash = "editor"; });
    $("add-plan")?.addEventListener("click", () => planRow("", ""));

    document.querySelectorAll("[data-ev]").forEach((cardEl) => {
      const ev = JSON.parse(cardEl.getAttribute("data-ev"));
      cardEl.querySelector(".ev-edit")?.addEventListener("click", () => {
        $("e-id").value = ev.id; $("e-slug").value = ev.slug; $("e-title").value = ev.title; $("e-lead").value = ev.lead || "";
        $("e-location").value = ev.location || ""; $("e-date").value = ev.event_date || ""; $("e-cap").value = (ev.capacity != null ? ev.capacity : "");
        $("e-image").value = ev.image || ""; $("e-body").value = ev.body || ""; $("e-pub").checked = ev.published === 1;
        $("plan-rows").replaceChildren(); (ev.plans || []).forEach((p) => planRow(p.name, p.price));
        location.hash = "editor";
      });
      cardEl.querySelector(".ev-del")?.addEventListener("click", async (e) => {
        if (await window.bo.confirm("このイベントを削除しますか？（参加者の申込も削除されます）", { confirmLabel: "削除", danger: true, irreversible: true })) {
          const r = await window.bo.api("/api/event", { _action: "delete", id: ev.id }, { btn: e.currentTarget }); if (r.ok) setTimeout(() => location.reload(), 400);
        }
      });
      cardEl.querySelectorAll("tr[data-reg]").forEach((tr) => {
        const regId = tr.dataset.reg;
        tr.querySelector(".r-paid")?.addEventListener("click", async (e) => {
          const r = await window.bo.api("/api/event", { _action: "mark_paid", regId }, { btn: e.currentTarget, successMsg: "入金を記録しました（会計に計上）" }); if (r.ok) setTimeout(() => location.reload(), 500);
        });
        tr.querySelector(".r-del")?.addEventListener("click", async (e) => {
          if (await window.bo.confirm("この参加申込を取り消しますか？", { confirmLabel: "取消", danger: true })) {
            const r = await window.bo.api("/api/event", { _action: "delete_registration", regId }, { btn: e.currentTarget }); if (r.ok) setTimeout(() => location.reload(), 400);
          }
        });
      });
    });

    $("seed")?.addEventListener("click", async (e) => {
      const r = await window.bo.api("/api/event", { _action: "seed" }, { btn: e.currentTarget, successMsg: "サンプルイベントを作成しました" }); if (r.ok) setTimeout(() => location.reload(), 700);
    });
    $("e-save")?.addEventListener("click", async (e) => {
      const id = $("e-id").value || undefined;
      const r = await window.bo.api("/api/event", { _action: "save", id, slug: $("e-slug").value, title: $("e-title").value, lead: $("e-lead").value, body: $("e-body").value, location: $("e-location").value, event_date: $("e-date").value, capacity: $("e-cap").value, image: $("e-image").value, plans: collectPlans(), published: $("e-pub").checked }, { btn: e.currentTarget, successMsg: "保存しました" });
      if (r.ok) setTimeout(() => location.reload(), 600);
    });
  <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/events.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/events.astro";
const $$url = "/settings/events";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Events,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
