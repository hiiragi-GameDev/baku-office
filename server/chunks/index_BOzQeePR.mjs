globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, F as Fragment, a as addAttribute, u as unescapeHTML } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b;
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  if (Astro2.locals.publicHost) {
    const { getPublicHomeSlug } = await import("./custom-domain_BlEKJqw-.mjs");
    const { getPublicPage } = await import("./public-pages_DHQdIiIX.mjs");
    const { buildPublicFullPage } = await import("./app-frame_NWC0ZR-C.mjs").then((n) => n.d);
    const homeSlug = await getPublicHomeSlug(Astro2.locals.ctx);
    const home = homeSlug ? await getPublicPage(env, homeSlug) : null;
    if (home) {
      let allowHosts = [];
      try {
        const row = await env.DB.prepare("SELECT definition FROM external_apps WHERE id=? UNION ALL SELECT definition FROM app_drafts WHERE id=? LIMIT 1").bind(home.app_id, home.app_id).first();
        const r = row?.definition ? JSON.parse(row.definition).render : null;
        if (r?.isolation === "relaxed" && Array.isArray(r.allowHosts)) allowHosts = r.allowHosts;
      } catch {
      }
      Astro2.locals.publicSiteAllowHosts = allowHosts;
      return new Response(buildPublicFullPage(home.html, { slug: home.slug, title: home.title, canonical: Astro2.url.origin + "/", params: Object.fromEntries(Astro2.url.searchParams), nonce: Astro2.locals.cspNonce }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response('<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>準備中</title><body style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:14vh auto;padding:24px;color:#1B1D22"><h1>準備中です</h1><p>このサイトは公開準備中です。</p></body></html>', { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const { cachedEntitlement, hasApiKey } = await import("./client_F4fksau0.mjs");
  const entitlement = await cachedEntitlement(env).catch(() => "free");
  const hasPlus = atLeast(entitlement, "plus");
  const hasPro = atLeast(entitlement, "pro");
  const [hasGemini, hasClaude, hasOpenai, hasGrok, hasGithubModels, hasGroq, hasCerebras] = await Promise.all([hasApiKey(env, "gemini").catch(() => false), hasApiKey(env, "claude").catch(() => false), hasApiKey(env, "openai").catch(() => false), hasApiKey(env, "grok").catch(() => false), hasApiKey(env, "github_models").catch(() => false), hasApiKey(env, "groq").catch(() => false), hasApiKey(env, "cerebras").catch(() => false)]);
  const hasLocal = !!env.AI;
  const aiReady = hasGemini || hasClaude || hasOpenai || hasGrok || hasGithubModels || hasGroq || hasCerebras || hasLocal;
  const hasExternalAI = hasGemini || hasClaude || hasOpenai || hasGrok || hasGithubModels || hasGroq || hasCerebras;
  const setupDismissed = ses.role === "admin" ? await env.LICENSE.get("onboarding_dismissed").catch(() => null) === "1" : true;
  if (ses.role === "admin" && !hasExternalAI && !setupDismissed) {
    const redirected = await env.LICENSE.get("setup_redirected").catch(() => null) === "1";
    if (!redirected) {
      await env.LICENSE.put("setup_redirected", "1").catch(() => {
      });
      return Astro2.redirect("/setup", 302);
    }
  }
  const agentName = await (await import("./settings_dTyIbTCR.mjs")).getAgentName(env).catch(() => "相棒");
  const ttsCloudReady = await (await import("./capabilities_DGQUed42.mjs")).ttsConfigured(env).catch(() => false);
  const { GEMINI_MODELS, CLAUDE_MODELS, OPENAI_MODELS, WORKERS_AI_MODELS, GROK_MODELS, GITHUB_MODELS, GROQ_MODELS, CEREBRAS_MODELS } = await import("./config_2o5HV4Wj.mjs");
  const waName = (id) => id.replace("@cf/meta/", "").replace("@cf/", "");
  const modelGroups = [];
  if (hasGemini) modelGroups.push({ label: "標準AI（Gemini）", opts: GEMINI_MODELS.map((m) => ({ id: m.id, text: `${m.name}（${m.note}）` })) });
  if (hasClaude) modelGroups.push({ label: "高精度AI（Claude）", opts: CLAUDE_MODELS.map((m) => ({ id: m.id, text: `${m.name}（${m.note}）` })) });
  if (hasOpenai) modelGroups.push({ label: "ChatGPT（OpenAI）", opts: OPENAI_MODELS.map((m) => ({ id: m.id, text: `${m.name}（${m.note}）` })) });
  if (hasGrok) modelGroups.push({ label: "Grok（xAI）", opts: GROK_MODELS.map((m) => ({ id: m.id, text: `${m.name}（${m.note}）` })) });
  if (hasGithubModels) modelGroups.push({ label: "GitHub Models", opts: GITHUB_MODELS.map((m) => ({ id: m.id, text: `${m.name}（${m.note}）` })) });
  if (hasGroq) modelGroups.push({ label: "Groq（無料・高速）", opts: GROQ_MODELS.map((m) => ({ id: m.id, text: `${m.name}（${m.note}）` })) });
  if (hasCerebras) modelGroups.push({ label: "Cerebras（無料・高速）", opts: CEREBRAS_MODELS.map((m) => ({ id: m.id, text: `${m.name}（${m.note}）` })) });
  if (hasLocal) modelGroups.push({ label: "クラウドAI（無料・会話向け）", opts: WORKERS_AI_MODELS.map((m) => ({ id: m.id, text: `${m.label}・${waName(m.id)}（${m.note}）` })) });
  const allIds = modelGroups.flatMap((g) => g.opts.map((o) => o.id));
  const isOrgAdmin = ses.role === "admin";
  const onboardingDismissed = setupDismissed;
  const [{ getMemberModel }, { listSkills }, { listScheduledTasks }] = await Promise.all([
    import("./settings_dTyIbTCR.mjs"),
    import("./skills_Be49B9yx.mjs"),
    import("./scheduled-tasks_DLesrd8F.mjs")
  ]);
  const [savedModel, skills, scheduledTasks] = await Promise.all([
    hasPlus ? getMemberModel(env, ses.uid).catch(() => null) : Promise.resolve(null),
    hasPlus && isOrgAdmin ? listSkills(env).catch(() => []) : Promise.resolve([]),
    hasPlus ? listScheduledTasks(Astro2.locals.ctx, ses.uid).catch(() => []) : Promise.resolve([])
  ]);
  const activeModel = savedModel === "auto" ? "auto" : savedModel && allIds.includes(savedModel) ? savedModel : "auto";
  const DOW_JA = ["日", "月", "火", "水", "木", "金", "土"];
  const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
  const freqLabelOf = (t) => t.freq === "weekly" ? `毎週${DOW_JA[t.dow ?? 1]} ${hhmm(t.at_min)}` : t.freq === "monthly" ? `毎月${t.dom ?? 1}日 ${hhmm(t.at_min)}` : `毎日 ${hhmm(t.at_min)}`;
  const fmtNext = (sec) => new Date((sec + 32400) * 1e3).toISOString().slice(5, 16).replace("T", " ");
  await import("./index_pgwuXuOD.mjs");
  const { enabledParts, enabledPartIds } = await import("./parts_BnninK9G.mjs").then((n) => n.f);
  const { disabledBuiltins } = await import("./client_F4fksau0.mjs");
  const off = new Set(await disabledBuiltins(env).catch(() => []));
  const activeParts = enabledParts(await enabledPartIds(Astro2.locals.ctx).catch(() => null)).filter((p) => !off.has(p.id) && atLeast(entitlement, p.minPlan ?? "free") && (ses.role === "admin" || !p.orgOnly));
  const PART_CAN = {
    accounting: "お金の記録・集計（収支の記録、一覧、当月収支の確認）",
    invoices: "請求書の登録・確認（未払いの管理、入金の消し込み）",
    members: "名簿の検索（会員情報の照会）",
    reminders: "予定・リマインダーの登録・確認",
    calendar: "カレンダーの確認・予定の作成",
    gmail: "メールの検索・閲覧",
    meet: "会議記録の確認・議事のまとめ",
    memo: "メモ・領収書の記録",
    knowledge: "組織ナレッジの保存・検索",
    import: "書類の取り込み"
  };
  const partCan = activeParts.map((p) => PART_CAN[p.id]).filter(Boolean);
  const coreCan = ["保存した資料・ファイルの検索や参照", "文書の作成（PDF / Word / Markdown / CSV など）", ...hasGemini ? ["調べもの（ウェブ検索）"] : []];
  const canList = [...coreCan, ...partCan];
  const dispName = ses.name && ses.name.trim() ? ses.name.trim() : "";
  const greeting = dispName ? `${dispName} さん、こんにちは` : "こんにちは。何をしましょう？";
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "AI", "active": "/" }, { "default": async ($$result2) => renderTemplate`${isOrgAdmin && !onboardingDismissed && renderTemplate`${maybeRenderHead()}<div class="banner banner-info">はじめにいくつか設定すると、もっと便利に使えます。<a href="/setup">はじめの設定ガイド</a>（AI・ブランド・Google連携・バックアップ）を開く。</div>`}${!hasPlus && renderTemplate`<div class="card"> <div class="banner banner-warn">この機能は <strong>Plus 以上</strong>のプランで利用できます。</div> <p class="muted">集計・DB／ファイル検索・文書作成を会話で実行し、結果を PDF／TXT／md／HTML／CSV でダウンロードできます。</p> <a class="btn btn-primary" href="/billing">プラン・課金へ</a> </div>`}${hasPlus && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate(_a || (_a = __template([' <div class="chat"> <section class="pane"> <script type="application/json" id="cap-json">', '<\/script> <script type="application/json" id="agent-name-json">', "<\/script> ", ' <div id="chat-hero" class="chat-hero"> <div class="hero-mark"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"></path></svg></div> <h1 class="hero-h">', '</h1> <p class="hero-sub">調べもの・文書づくり・集計までお手伝いします。</p> </div> <div id="log"></div> ', " <div", '> <input type="file" id="att" accept="image/*,application/pdf,text/plain,text/csv,text/markdown,application/json,.txt,.csv,.tsv,.md,.json,.log,.yaml,.yml,.xml" hidden aria-label="添付ファイル（画像・PDF・テキスト/CSV など）"> <button class="btn icon-only" id="att-btn" type="button" title="ファイルを添付（画像・PDF）" aria-label="ファイルを添付" style="flex:0 0 auto"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.44 11.05 12.25 20.24a5.5 5.5 0 0 1-7.78-7.78l8.49-8.49a3.5 3.5 0 0 1 4.95 4.95l-8.49 8.49a1.5 1.5 0 0 1-2.12-2.12l7.78-7.78"></path></svg></button> <button class="btn icon-only" id="mic-btn" type="button" title="音声入力（もう一度押すと停止）" aria-label="音声入力" style="flex:0 0 auto"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M5 10v1a7 7 0 0 0 14 0v-1"></path><path d="M12 19v3"></path></svg></button> <button class="btn icon-only" id="tts-btn" type="button" title="返信を読み上げ（オン/オフ）" aria-label="返信を読み上げ"', ' style="flex:0 0 auto"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M19 5a9 9 0 0 1 0 14"></path></svg></button> <button class="btn icon-only" id="conv-btn" type="button" title="音声会話モード（話す→自動送信→読み上げ→続けて聞く）" aria-label="音声会話モード" style="flex:0 0 auto"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path></svg></button> <textarea id="msg"', "", '></textarea> <button class="btn btn-primary" id="send" style="flex:0 0 auto"', '>送信</button> </div> <p id="att-name" class="muted" style="font-size:.78rem;margin:4px 0 0"></p>   <div', '> <div class="cmode" id="cmode" role="group" aria-label="モード" title="プラン=計画のみ／確認=危険操作は実行前に確認／自動実行=低リスク操作は確認なしで実行（削除・外部送信・権限変更など不可逆操作は自動実行中でも必ず確認します）"> <button type="button" class="cmode-opt" data-mode="plan">プラン</button> <button type="button" class="cmode-opt on" data-mode="edit">確認</button> <button type="button" class="cmode-opt" data-mode="auto">自動実行</button> </div> <p class="cmode-warn muted small" id="cmode-warn" role="status" hidden style="color:#b00020;flex-basis:100%;margin:.3rem 0 0">⚠️ 自動実行中：低リスクの操作は確認なしで実行します（削除・外部送信・権限変更などの不可逆操作は必ず確認します）。この設定は本セッションのみで、次回は「確認」に戻ります。</p> ', ' <div class="chat-dl"> <span>保存</span> <button class="dlc" type="button" data-ext="txt" title="文字だけのシンプルな形式。" aria-label="TXT形式で保存">TXT</button> <button class="dlc" type="button" data-ext="md" title="見出し・箇条書きを残せる形式。" aria-label="MD形式で保存">MD</button> <button class="dlc" type="button" data-ext="html" title="ブラウザで開け、体裁を保てる形式。" aria-label="HTML形式で保存">HTML</button> <button class="dlc" type="button" data-ext="pdf" title="印刷・配布向き、レイアウト固定。" aria-label="PDF形式で保存">PDF</button> </div> ', " </div> ", ' </section> </div> <div class="chat side-stack"> ', ' <details class="skills-box adv"> <summary><strong>実行中のバックグラウンドタスク</strong></summary> <p class="adv-note">いまバックグラウンドで動いている AI・エージェントの処理です（数秒ごとに自動更新）。</p> <div id="bg-list" class="task-list"><p class="muted task-empty">読み込み中…</p></div> </details> <details class="skills-box adv"> <summary><strong>スケジュールタスク（定期実行）</strong></summary> <p class="adv-note">指示を毎日／毎週／毎月の決まった時刻に自動実行します（時刻は日本時間）。実行はバックグラウンドで処理されます。</p> <div class="card"> <div class="field"><label for="st-prompt">実行する指示</label><textarea id="st-prompt" rows="2" placeholder="例：今月の収支をまとめてレポートを作成して"></textarea></div> <div class="row" style="gap:.6rem;flex-wrap:wrap;align-items:flex-end"> <div><label for="st-freq">周期</label><select id="st-freq"><option value="daily">毎日</option><option value="weekly">毎週</option><option value="monthly">毎月</option></select></div> <div id="st-dow-wrap" hidden><label for="st-dow">曜日</label><select id="st-dow">', '</select></div> <div id="st-dom-wrap" hidden><label for="st-dom">日</label><select id="st-dom">', '</select></div> <div><label for="st-time">時刻</label><input id="st-time" type="time" value="09:00"></div> <button class="btn btn-primary" id="st-add" style="flex:0 0 auto">追加</button> </div> </div> <div class="table-wrap" style="margin-top:.5rem"><table><thead><tr><th>指示</th><th>周期</th><th>次回</th><th>状態</th><th>操作</th></tr></thead><tbody id="st-tbody"> ', " ", " </tbody></table></div> </details> </div> "])), unescapeHTML(JSON.stringify({ can: canList }).replace(/</g, "\\u003c")), unescapeHTML(JSON.stringify(agentName).replace(/</g, "\\u003c")), modelGroups.length === 0 && renderTemplate`<select id="model" hidden><option value="gemini-2.5-flash" selected>標準AI</option></select>`, greeting, !aiReady && renderTemplate`<div class="card" style="margin:.4rem 0"> <div class="banner banner-warn">AI がまだ設定されていません。</div> ${isOrgAdmin ? renderTemplate`<p class="muted">Gemini / Claude / ChatGPT のいずれかの APIキーを登録すると会話を開始できます。<br><a class="btn btn-primary" href="/settings/keys" style="margin-top:.5rem">連携設定（APIキー）を開く</a></p>` : renderTemplate`<p class="muted">管理者による設定をお待ちください（Gemini / Claude / ChatGPT のいずれかの APIキー登録が必要です）。設定後にご利用いただけます。</p>`} </div>`, addAttribute("cinput" + (aiReady ? "" : " ai-off"), "class"), addAttribute(ttsCloudReady ? "1" : "", "data-cloud"), addAttribute(aiReady ? "メッセージを入力（Enter で送信／Shift+Enter で改行）" : "AI 未設定のため送信できません", "placeholder"), addAttribute(!aiReady, "disabled"), addAttribute(!aiReady, "disabled"), addAttribute("cfoot" + (aiReady ? "" : " ai-off"), "class"), modelGroups.length >= 1 && renderTemplate`<div class="model-picker"> <label for="model">AI</label> <select id="model" aria-label="使うAI（モデル）"> <option value="auto"${addAttribute(activeModel === "auto", "selected")}>自動（おまかせ）— 会話内容で最適なAIを選びます</option> ${modelGroups.map((g) => renderTemplate`<optgroup${addAttribute(g.label, "label")}> ${g.opts.map((o) => renderTemplate`<option${addAttribute(o.id, "value")}${addAttribute(activeModel === o.id, "selected")}>${o.text}</option>`)} </optgroup>`)} </select> </div>`, hasPro && renderTemplate`<label class="cfoot-bg"><input type="checkbox" id="bgrun"> バックグラウンド実行</label>`, hasPro && renderTemplate`<p class="muted cfoot-note">複雑な依頼は内部で役割ごとの子エージェントに分担・並列処理します（無料枠は並列2まで・設定→高度なオプションで拡張）。</p>`, isOrgAdmin && renderTemplate`<details class="skills-box adv"> <summary><strong>スキル管理</strong></summary> <p class="adv-note">よく使う作業を「スキル」として登録し、AIに任せられます。AIに作らせるか、手動で追加できます。一部は利用量に応じた費用がかかります。</p> <div class="card"> <p class="muted"><strong>AIに作らせる</strong>：やりたいことを書くと、AI がスキルを設計して<strong>無効状態で自動登録</strong>します。確認して下で有効化してください。</p> <div class="row"><input id="skreq" placeholder="例：月次の会費集計表を作るスキル" aria-label="作りたいスキルの内容"><button class="btn btn-primary" id="skgen" style="flex:0 0 auto">AIに作らせる</button></div> </div> <details style="margin-top:.5rem"><summary>スキルを手動で追加</summary> <div class="field"><label for="sname">スキル名（呼び出し名）</label><input id="sname" placeholder="例：会費集計"></div> <div class="row"><div style="flex:1"><label for="sdesc">説明（任意）</label><input id="sdesc" placeholder="どんな作業か"></div><div style="flex:0 0 200px"><label for="smode">種類</label><select id="smode"><option value="instruction">標準（通常の費用）</option><option value="code">高度（利用量に応じた費用）</option></select></div></div> <div class="field"><label for="smd">手順・テンプレート</label><textarea id="smd" rows="5" placeholder="作業の手順やひな形を書きます"></textarea></div> <button class="btn btn-primary" id="skadd">登録（無効状態で保存）</button> </details> <div class="table-wrap" style="margin-top:.5rem"><table><thead><tr><th>名前</th><th>モード</th><th>状態</th><th>操作</th></tr></thead><tbody> ${skills.map((s) => renderTemplate`<tr${addAttribute(s.id, "data-sid")}><td>${s.name}<div class="muted">${s.description ?? ""}</div></td><td><span class="pill">${s.mode}</span></td><td>${s.enabled ? "有効" : "無効"}</td><td>${s.enabled ? renderTemplate`<button class="btn btn-sm btn-warn sdis">無効化</button>` : renderTemplate`<button class="btn btn-sm btn-ok sen">有効化</button>`} <button class="btn btn-sm btn-danger sdel">削除</button></td></tr>`)} ${skills.length === 0 && renderTemplate`<tr><td colspan="4" class="muted">スキルは未登録です。</td></tr>`} </tbody></table></div> </details>`, DOW_JA.map((w, i) => renderTemplate`<option${addAttribute(i, "value")}${addAttribute(i === 1, "selected")}>${w}</option>`), Array.from({ length: 28 }, (_, i) => i + 1).map((n) => renderTemplate`<option${addAttribute(n, "value")}>${n}</option>`), scheduledTasks.map((t) => renderTemplate`<tr${addAttribute(t.id, "data-stid")}> <td>${t.prompt}</td> <td class="muted" style="white-space:nowrap">${freqLabelOf(t)}</td> <td class="muted" style="white-space:nowrap">${t.enabled ? fmtNext(t.next_run) : "—"}</td> <td>${t.enabled ? "有効" : "停止中"}</td> <td class="row" style="gap:.3rem">${t.enabled ? renderTemplate`<button class="btn btn-sm btn-warn st-toggle" data-on="0">停止</button>` : renderTemplate`<button class="btn btn-sm btn-ok st-toggle" data-on="1">再開</button>`} <button class="btn btn-sm btn-danger st-del">削除</button></td> </tr>`), scheduledTasks.length === 0 && renderTemplate`<tr><td colspan="5" class="muted">登録された定期実行はありません。</td></tr>`) })}`} `, "scripts": async ($$result2) => renderTemplate(_b || (_b = __template([`<script data-astro-rerun>
    (function () {
        const log = document.getElementById("log");
        if (!log) return;  // Plus未満は要素が無い
        const sel = document.getElementById("model");
        // ホームの相棒プロンプトからの ?q= を入力欄に反映。
        try { const q = new URLSearchParams(location.search).get("q"); if (q) { const m = document.getElementById("msg"); if (m) { m.value = q; m.focus(); } } } catch (e) { /* noop */ }
        // できること（具体リスト）はサーバ算出値を読む。クラウドAIは「操作」が不可なので別立て。
        let CAP_CAN = [];
        try { CAP_CAN = (JSON.parse(document.getElementById("cap-json")?.textContent || "{}").can) || []; } catch (e) { CAP_CAN = []; }
        // AIアシスタントの表示名（設定で変更可・既定「相棒」）。発言者ラベル等に使う。
        let AGENT_NAME = "相棒";
        try { AGENT_NAME = JSON.parse(document.getElementById("agent-name-json")?.textContent || '"相棒"') || "相棒"; } catch (e) { AGENT_NAME = "相棒"; }
        const USE_LABEL = { gemini: "標準AI", claude: "高精度AI", local: "クラウドAI", openai: "ChatGPT", grok: "Grok", github: "GitHub Models" };
        // 標準AI/高精度AIで「できない・確認が必要」な共通項目。
        const CANT_TOOL = [
          "メールの送信・予定の変更/削除・他団体への連絡は、安全のため<strong>実行前に必ず確認</strong>します（勝手には実行しません）",
          "未導入のアプリの操作（管理者がアプリを追加すると使えます）",
          "銀行・クレジットカードなど外部サービスへの直接ログイン",
        ];
        // クラウドAI（Workers AI）はツールを実行しない＝会話・文章づくり向け。
        const LOCAL_CAN = ["会話・相談にこたえる", "文章の作成・要約・言いかえ", "かんたんな下書きづくり"];
        const LOCAL_CANT = ["お金の記録・検索、請求書、名簿、予定などの<strong>操作</strong>（標準AI／高精度AIに切り替えると使えます）", "ファイルや資料を読み取っての作業"];
        const noteEl = document.getElementById("model-note");
        // 具体モデルID（gemini-*/claude-*/@cf/...）や後方互換のエンジン名から engine 種別へ。
        // workers_ai(@cf/) と engine名 "local" のみ「会話向け（操作不可）」。grok/github/openai は全機能対応のクラウドAI。
        const engineKey = (v) => { v = String(v); if (v === "auto") return "auto"; if (v.indexOf("claude") === 0) return "claude"; if (v.indexOf("gemini") === 0) return "gemini"; if (v.indexOf("@cf/") === 0 || v === "local") return "local"; if (v.indexOf("grok") === 0) return "grok"; if (v.indexOf("github") === 0 || v.indexOf("/") >= 0) return "github"; return "openai"; };
        const engineForModel = (v) => { const k = engineKey(v); return k === "local" ? "workers_ai" : k; };
        // can/cant はサーバ算出値＋静的文言（利用者入力を含まない）。<strong> 等の体裁をそのまま使う。
        const ul = (items) => "<ul class='mn-list'>" + items.map((t) => "<li>" + t + "</li>").join("") + "</ul>";
        const setNote = (v) => {
          window.bo?.setAgentEngine?.(engineForModel(v));
          if (!noteEl) return;
          const k = engineKey(v);
          if (k === "auto") {
            noteEl.innerHTML =
              '<div class="mn-use">使用中：自動（おまかせ）</div>' +
              '<div class="mn-can"><div class="mn-h">会話内容に応じて最適なAIを自動で選びます</div>' +
              ul(["かんたんな相談・雑談は高速・無料のAIへ", "操作や厳密な作業・長文は高性能なAIへ", "登録済みのAPIから自動で選択・切替（使えない時は他のAPIへ自動フォールバック）"]) + "</div>";
            return;
          }
          const can = k === "local" ? LOCAL_CAN : CAP_CAN;
          const cant = k === "local" ? LOCAL_CANT : CANT_TOOL;
          noteEl.innerHTML =
            '<div class="mn-use">使用中：' + (USE_LABEL[k] || "AI") + (k === "claude" ? "（高精度）" : k === "local" ? "（会話向け）" : "（標準）") + "</div>" +
            '<div class="mn-can"><div class="mn-h">できること</div>' + ul(can) + "</div>" +
            '<div class="mn-cant"><div class="mn-h">できない・確認が必要なこと</div>' + ul(cant) + "</div>";
        };
        setNote(sel ? sel.value : "gemini");
        // モデルピッカー：選んだら即保存（メンバー単位）。次回以降の既定になり、クラウドAIは選んだティア(8B/70B)で動く。
        if (sel) sel.addEventListener("change", () => {
          setNote(sel.value);
          window.bo?.api?.("/api/settings", { _action: "member_model", model: sel.value }, { successMsg: "使うAIを切り替えました" });
        });
        // 会話履歴トグル（モバイル）。
        const sesToggle = document.getElementById("ses-toggle");
        const chatBox = document.querySelector(".chat");
        if (sesToggle && chatBox) sesToggle.addEventListener("click", () => chatBox.classList.toggle("show-ses"));
        let sessionId = "";
        // 音声入力（Web Speech API）。長時間対応：onend で自動再開。voiceBase=確定済みテキスト。
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        let voiceRec = null, voiceOn = false, voiceBase = "";
        // 音声会話：返信読み上げ（readAloudOn）＋ハンズフリー（handsFree）。ttsMode=cloud は /api/tts（OpenAI互換）、browser は speechSynthesis。
        const TTS_CLOUD_READY = document.getElementById("tts-btn")?.dataset.cloud === "1";
        let readAloudOn = false, handsFree = false, ttsMode = TTS_CLOUD_READY ? "cloud" : "browser";
        let silenceTimer = null, currentAudio = null;
        try { readAloudOn = localStorage.getItem("bo_tts_on") === "1"; const tm = localStorage.getItem("bo_tts_mode"); if (tm === "cloud" || tm === "browser") ttsMode = tm; } catch (e) { /* noop */ }
        if (ttsMode === "cloud" && !TTS_CLOUD_READY) ttsMode = "browser";
        let currentAbort = null; // 実行中ストリームの中断（途中停止）。
        let sending = false; // 非ストリーム（バックグラウンド）送信の実行中フラグ。Enter 連打等の二重送信を防ぐ。
        // モード（plan=計画のみ / edit=確認 / auto=自動実行）。
        // P1-01：自動実行はセッション単位＝localStorage から復元しない（翌日/再読込で「確認」に戻る）。
        // plan/edit のみ復元し、危険な auto は毎回ユーザーが明示選択する。選択中は警告を常時表示する。
        let chatMode = "edit";
        try { const m = localStorage.getItem("bo_chat_mode"); if (m === "plan" || m === "edit") chatMode = m; } catch (e) { /* noop */ }
        (function initMode() {
          const seg = document.getElementById("cmode");
          if (!seg) return;
          const warn = document.getElementById("cmode-warn");
          const sync = () => {
            seg.querySelectorAll(".cmode-opt").forEach((x) => x.classList.toggle("on", x.dataset.mode === chatMode));
            if (warn) warn.hidden = chatMode !== "auto";
          };
          seg.querySelectorAll(".cmode-opt").forEach((b) => b.addEventListener("click", () => {
            chatMode = b.dataset.mode;
            // auto はセッション限定のため保存しない（保存すると翌日も確認なしのまま気づかず使ってしまう）。
            try { if (chatMode === "auto") localStorage.removeItem("bo_chat_mode"); else localStorage.setItem("bo_chat_mode", chatMode); } catch (e) { /* noop */ }
            sync();
          }));
          sync();
        })();
        const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
        // 軽量Markdownレンダラ（表・箇条書き・見出し・コード・太字などを整形）。依存なし・HTMLはエスケープ。
        const mdEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
        function mdInline(s) {
          let t = mdEsc(s);
          t = t.replace(/\`([^\`]+)\`/g, (_m, c) => "<code>" + c + "</code>");
          t = t.replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>");
          t = t.replace(/(^|[^*])\\*([^*\\n]+)\\*(?!\\*)/g, "$1<em>$2</em>");
          t = t.replace(/\\[([^\\]]+)\\]\\((https?:[^)\\s]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
          return t;
        }
        function mdRender(src) {
          const lines = String(src).replace(/\\r\\n/g, "\\n").split("\\n");
          let html = "", i = 0;
          const isSep = (l) => l != null && l.indexOf("-") >= 0 && /^\\s*\\|?[\\s:|-]+\\|?\\s*$/.test(l);
          const isTableHead = (l, n) => l.indexOf("|") >= 0 && isSep(n);
          while (i < lines.length) {
            const line = lines[i];
            if (/^\`\`\`/.test(line)) { i++; let code = ""; while (i < lines.length && !/^\`\`\`/.test(lines[i])) { code += lines[i] + "\\n"; i++; } i++; html += "<pre><code>" + mdEsc(code.replace(/\\n$/, "")) + "</code></pre>"; continue; }
            if (isTableHead(line, lines[i + 1])) {
              const row = (r) => r.replace(/^\\s*\\|/, "").replace(/\\|\\s*$/, "").split("|").map((c) => c.trim());
              const head = row(line); i += 2; const body = [];
              while (i < lines.length && lines[i].indexOf("|") >= 0 && lines[i].trim() !== "") { body.push(row(lines[i])); i++; }
              html += '<div class="md-tablewrap"><table class="md-table"><thead><tr>' + head.map((h) => "<th>" + mdInline(h) + "</th>").join("") + "</tr></thead><tbody>" + body.map((r) => "<tr>" + r.map((c) => "<td>" + mdInline(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>"; continue;
            }
            const h = line.match(/^(#{1,4})\\s+(.*)$/);
            if (h) { const lv = Math.min(h[1].length + 2, 6); html += "<h" + lv + ' class="md-h">' + mdInline(h[2]) + "</h" + lv + ">"; i++; continue; }
            if (/^\\s*([-*_])(\\s*\\1){2,}\\s*$/.test(line)) { html += '<hr class="md-hr">'; i++; continue; }
            if (/^>\\s?/.test(line)) { let q = ""; while (i < lines.length && /^>\\s?/.test(lines[i])) { q += lines[i].replace(/^>\\s?/, "") + "\\n"; i++; } html += '<blockquote class="md-q">' + mdInline(q.trim()).replace(/\\n/g, "<br>") + "</blockquote>"; continue; }
            if (/^\\s*[-*+]\\s+/.test(line)) { const it = []; while (i < lines.length && /^\\s*[-*+]\\s+/.test(lines[i])) { it.push(lines[i].replace(/^\\s*[-*+]\\s+/, "")); i++; } html += '<ul class="md-ul">' + it.map((x) => "<li>" + mdInline(x) + "</li>").join("") + "</ul>"; continue; }
            if (/^\\s*\\d+\\.\\s+/.test(line)) { const it = []; while (i < lines.length && /^\\s*\\d+\\.\\s+/.test(lines[i])) { it.push(lines[i].replace(/^\\s*\\d+\\.\\s+/, "")); i++; } html += '<ol class="md-ol">' + it.map((x) => "<li>" + mdInline(x) + "</li>").join("") + "</ol>"; continue; }
            if (line.trim() === "") { i++; continue; }
            const para = [];
            while (i < lines.length && lines[i].trim() !== "" && !/^\`\`\`/.test(lines[i]) && !/^(#{1,4})\\s/.test(lines[i]) && !/^\\s*[-*+]\\s+/.test(lines[i]) && !/^\\s*\\d+\\.\\s+/.test(lines[i]) && !/^>\\s?/.test(lines[i]) && !isTableHead(lines[i], lines[i + 1])) { para.push(lines[i]); i++; }
            if (para.length) html += "<p>" + para.map(mdInline).join("<br>") + "</p>";
          }
          return html;
        }
        function dload(text, ext, mime) {
          if (ext === "pdf") {
            const w = window.open("", "_blank");
            if (!w) { window.bo.toast("PDF化はポップアップ許可が必要です", "err"); return; }
            w.document.write('<title>baku-office</title><pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;padding:24px">' + esc(text) + "</pre>");
            w.document.close(); w.focus(); w.print(); return;
          }
          let body = text;
          if (ext === "html") body = '<!doctype html><meta charset="utf-8"><title>baku-office</title><pre style="white-space:pre-wrap;font-family:system-ui,sans-serif">' + esc(text) + "</pre>";
          const blob = new Blob([body], { type: mime || "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "baku-office-" + Date.now() + "." + ext;
          document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        }
        // 会話全体をテキスト化（セッション単位のダウンロード用）。
        function conversationText() {
          const out = [];
          log.querySelectorAll(".cmsg").forEach((m) => {
            const who = m.classList.contains("u") ? "あなた" : AGENT_NAME;
            const b = m.querySelector(".cbub");
            out.push(who + "： " + (b ? b.innerText.trim() : ""));
          });
          return out.join("\\n\\n");
        }
        // メッセージ下のアクションボタン群（生成アプリ導線・会話の選択肢）を描画。
        // kind: reply（その文を送信）/ navigate（同タブ遷移）/ link（別タブ）/ api（/api へPOST→任意で遷移/再読込）。
        function renderActions(parent, actions) {
          if (!Array.isArray(actions) || !actions.length) return;
          const wrap = document.createElement("div");
          wrap.className = "cmsg-actions";
          for (const a of actions) {
            if (!a || !a.label || !a.kind) continue;
            const cls = "btn btn-sm " + (a.style === "primary" ? "btn-primary" : "btn-ghost");
            // navigate/link は本物の <a href> で描画する。ClientRouter（View Transitions）配下では
            // button+location.href 代入が不発になり得るため、アンカーにして確実に遷移させる。
            if ((a.kind === "navigate" || a.kind === "link") && a.href) {
              // アクションは AI/セッション履歴由来＝javascript: 等の危険スキームを弾く（App.astro の通知パネルと同基準）。
              const safeHref = /^(https?:|\\/|#)/.test(String(a.href)) ? a.href : "#";
              const link = document.createElement("a");
              link.className = cls; link.textContent = a.label; link.href = safeHref;
              if (a.kind === "link") { link.target = "_blank"; link.rel = "noopener"; }
              wrap.appendChild(link);
              continue;
            }
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = cls;
            btn.textContent = a.label;
            btn.addEventListener("click", async () => {
              if (a.kind === "reply" && a.text) { sendText(a.text); }
              else if (a.kind === "copy" && a.text) { try { await navigator.clipboard.writeText(a.text); window.bo?.toast?.("コピーしました"); } catch (e) { window.bo?.toast?.("コピーできませんでした", "err"); } }
              else if (a.kind === "api" && a.endpoint) {
                const r = await window.bo.api(a.endpoint, a.payload || {}, { btn, successMsg: a.successMsg || null });
                if (r.ok) { if (a.then && /^(https?:|\\/|#)/.test(String(a.then))) location.href = a.then; else if (a.reload) setTimeout(() => location.reload(), 600); }
              }
            });
            wrap.appendChild(btn);
          }
          parent.appendChild(wrap);
        }
        // テキストを入力欄に入れて送信（reply アクション・外部呼び出し用）。
        function sendText(text) {
          if (currentAbort) return;
          const ta = document.getElementById("msg");
          if (!ta) return;
          ta.value = text;
          send();
        }
        // マイクロフィードバック（1タップ・任意・未回答でも集計成立）。「はい」の後だけ「何分浮いた？」を任意で聞く。
        // localStorage で回答済みを記憶し二重送信・再表示を防ぐ。
        function fbSent(mid) { try { return !!localStorage.getItem("bo_fb_" + mid); } catch (e) { return false; } }
        function fbMark(mid) { try { localStorage.setItem("bo_fb_" + mid, "1"); } catch (e) { /* noop */ } }
        async function fbPost(payload) { try { await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); } catch (e) { /* noop */ } }
        function addFeedbackBar(body, mid) {
          if (!mid || fbSent(mid)) return;
          const bar = document.createElement("div");
          bar.className = "msg-fb";
          const q = (t) => { const s = document.createElement("span"); s.className = "fb-q"; s.textContent = t; return s; };
          const btn = (t, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "fb-b"; b.textContent = t; b.addEventListener("click", fn); return b; };
          // 簡易NPS（月1回だけ・フィードバック回答者にだけ続けて出す＝自然なスロットリング）。
          const npsKey = () => "bo_nps_" + new Date().toISOString().slice(0, 7);
          const maybeAskNps = () => {
            try { if (localStorage.getItem(npsKey())) return false; } catch (e) { return false; }
            try { localStorage.setItem(npsKey(), "1"); } catch (e) { /* noop */ }
            const done = (score) => { fbPost({ nps: score, messageId: mid }); bar.replaceChildren(q("ありがとうございます")); setTimeout(() => bar.remove(), 4000); };
            bar.replaceChildren(q("この相棒、同僚にも勧めたいですか？（月1回だけ聞いています）"),
              btn("はい", () => done("yes")), btn("どちらでも", () => done("neutral")), btn("いいえ", () => done("no")));
            return true;
          };
          const finish = (msg) => { if (maybeAskNps()) return; bar.replaceChildren(q(msg)); setTimeout(() => bar.remove(), 4000); };
          bar.append(
            q("役に立ちましたか？"),
            btn("はい", () => {
              fbMark(mid); fbPost({ messageId: mid, value: "good" });
              const minutes = [5, 15, 30].map((n) => btn(n === 30 ? "30分以上" : n + "分", () => { fbPost({ messageId: mid, minutes: n }); finish("ありがとうございます"); }));
              bar.replaceChildren(q("何分くらい手間が省けましたか？（任意）"), ...minutes);
              setTimeout(() => { if (bar.isConnected && bar.querySelector("button")) finish("ありがとうございます"); }, 15000);
            }),
            btn("いまいち", () => { fbMark(mid); fbPost({ messageId: mid, value: "bad" }); finish("フィードバックを記録しました"); }),
          );
          body.appendChild(bar);
        }
        // role=u/a。発言者ラベル付き。stream=true（新規AI応答のみ）で段階表示（タイプ風・点滅キャレット）。履歴は即時。
        // actions=メッセージ下に出すボタン配列（任意）。messageId=保存済みAIメッセージのid（あればフィードバックを出す）。
        function addMsg(role, text, stream, actions, messageId) {
          // 最初の発言でヒーロー（空状態）を隠す。
          document.getElementById("chat-hero")?.classList.add("hidden");
          const d = document.createElement("div");
          d.className = "cmsg " + role;
          // 相棒（AI）の最終表示は Markdown 整形、利用者の発言はそのまま（改行のみ）。
          const html = role === "a" ? mdRender(text) : esc(text).replace(/\\n/g, "<br>");
          d.innerHTML = '<div class="cmsg-body"><span class="cmsg-who">' + (role === "a" ? esc(AGENT_NAME) : "あなた") + '</span><div class="cbub"></div></div>';
          const bub = d.querySelector(".cbub");
          // メッセージごとのコピーボタン（本文をクリップボードへ）。
          const copyBtn = document.createElement("button");
          copyBtn.type = "button"; copyBtn.className = "msg-copy"; copyBtn.title = "コピー"; copyBtn.setAttribute("aria-label", "このメッセージをコピー");
          copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
          copyBtn.addEventListener("click", async () => { try { await navigator.clipboard.writeText(text); window.bo.toast("コピーしました"); } catch (e) { window.bo.toast("コピーできませんでした", "err"); } });
          d.querySelector(".cmsg-body").appendChild(copyBtn);
          log.appendChild(d);
          if (stream && role === "a" && text) {
            let i = 0;
            const step = () => {
              i += 3;
              bub.innerHTML = esc(text.slice(0, i)).replace(/\\n/g, "<br>") + '<span class="caret"></span>';
              log.scrollTop = log.scrollHeight;
              if (i < text.length) { setTimeout(step, 18); }
              else { bub.innerHTML = html; renderActions(d.querySelector(".cmsg-body"), actions); if (role === "a") addFeedbackBar(d.querySelector(".cmsg-body"), messageId); log.scrollTop = log.scrollHeight; }
            };
            step();
          } else {
            bub.innerHTML = html;
            renderActions(d.querySelector(".cmsg-body"), actions);
            if (role === "a") addFeedbackBar(d.querySelector(".cmsg-body"), messageId);
            log.scrollTop = log.scrollHeight;
          }
        }
        // セッション単位のダウンロード（枠外ツールバー）。
        document.querySelectorAll(".chat-dl .dlc").forEach((b) => b.addEventListener("click", () => {
          const t = conversationText();
          if (!t) { window.bo.toast("まだ会話がありません", "err"); return; }
          const ext = b.dataset.ext;
          const mime = { txt: "text/plain", md: "text/markdown", html: "text/html", pdf: "" }[ext] || "text/plain";
          dload(t, ext, mime);
        }));
        // セッションを開く（履歴ロード）。
        // 現在の会話IDを記憶（画面遷移して戻っても復元するため）。
        function setLastSession(id) { try { if (id) localStorage.setItem("bo_last_session", id); } catch (e) { /* noop */ } }
        function showHero() { document.getElementById("chat-hero")?.classList.remove("hidden"); }
        // このセッションに紐づく「実際に稼働中の裏タスク」があるか（agent_job/アプリ実装）。誤った『実行中』表示を防ぐ判定。
        async function sessionHasActiveTask(sid) {
          try {
            const a = await (await fetch("/api/activity", { headers: { accept: "application/json" } })).json();
            return (a.tasks || []).some((t) => t && t.mine && t.sessionId === sid);
          } catch (e) { return false; }
        }
        async function openSession(id) {
          sessionId = id; log.innerHTML = "";
          [...document.querySelectorAll(".ses-row")].forEach((r) => r.classList.toggle("on", r.getAttribute("data-ses") === id));
          const r = await window.bo.api("/api/chat-sessions?id=" + encodeURIComponent(id), undefined, { method: "GET", successMsg: null });
          if (sessionId !== id) return; // 応答待ちの間に別の会話へ切り替えられたら、遅延応答を捨てる（内容混入・送信先食い違い防止）。
          const msgs = (r.ok && r.data.messages) || [];
          if (msgs.length) {
            // フィードバックは最後のAI応答にだけ出す（履歴全件に出すとうるさい＝スロットリング）。
            const lastAi = msgs.map((m, i) => (m.role === "assistant" ? i : -1)).reduce((a, b) => Math.max(a, b), -1);
            msgs.forEach((m, i) => addMsg(m.role === "assistant" ? "a" : "u", m.content, false, m.actions, i === lastAi ? m.id : undefined)); setLastSession(id);
            // 末尾がユーザー発言＝AIの応答がまだ無い。ただし「本当に裏で動いているタスクがあるか」を /api/activity で確認してから
            // 表示を出し分ける（前景チャットは画面遷移で中断＝裏では動かないため、実体の無い『実行中』を出さない）。
            const last = msgs[msgs.length - 1];
            if (last && last.role !== "assistant") {
              const running = await sessionHasActiveTask(id);
              if (running) {
                addMsg("a", "この依頼はバックグラウンドで実行中です。完了するとここに表示されます（画面を離れても続行します）。タスク一覧やマスコットから停止もできます。");
                pollBackgroundResult(id);
              } else {
                // 裏で動いていない＝前回の依頼は画面遷移などで中断された。正直に伝え、ワンタップで再送できるようにする。
                addMsg("a", "前回の依頼は完了前に中断されました（通常の処理中に画面を離れると中断されます）。もう一度お試しください。", false, [{ label: "もう一度送る", kind: "reply", text: last.content }]);
              }
            }
          } else { // 空/削除済みセッション：記憶を消して空状態に戻す。
            sessionId = ""; try { localStorage.removeItem("bo_last_session"); } catch (e) { /* noop */ } showHero();
          }
        }
        // サイドバー再描画。
        function renderSessions(sessions) {
          const list = document.getElementById("ses-list");
          if (!list) return; // 会話履歴は共通サイドバー（App.astro）に集約。ページ内一覧は無い。
          list.innerHTML = sessions.length ? "" : '<p class="muted" style="font-size:.82rem;padding:6px">会話はまだありません。</p>';
          sessions.forEach((s) => {
            const row = document.createElement("div"); row.className = "ses-row"; row.setAttribute("data-ses", s.id);
            if (s.id === sessionId) row.classList.add("on");
            const a = document.createElement("a"); a.href = "#"; a.className = "ses-open"; a.textContent = s.title || "（無題）";
            a.addEventListener("click", (e) => { e.preventDefault(); openSession(s.id); });
            const del = document.createElement("button"); del.className = "ses-del"; del.textContent = "×";
            del.addEventListener("click", async (e) => {
              e.preventDefault();
              if (!(await window.bo.confirm("このチャットセッションを削除しますか？", { confirmLabel: "削除", danger: true, irreversible: true }))) return;
              const rr = await window.bo.api("/api/chat-sessions", { _action: "delete", id: s.id }, { btn: del, successMsg: "削除しました" });
              if (rr.ok) { if (s.id === sessionId) { sessionId = ""; log.innerHTML = ""; } reloadSessions(); }
            });
            row.append(a, del); list.appendChild(row);
          });
        }
        async function reloadSessions() {
          const r = await window.bo.api("/api/chat-sessions", undefined, { method: "GET", successMsg: null });
          if (r.ok) renderSessions(r.data.sessions || []);
        }
        // ファイル添付（画像/PDF）：選択ファイルを base64 化して /api/chat の image に乗せる（API は受領済み）。
        let pendingImage = null;
        let pendingFileName = "";
        const att = document.getElementById("att");
        document.getElementById("att-btn")?.addEventListener("click", () => att?.click());
        att?.addEventListener("change", () => {
          const f = att.files && att.files[0];
          if (!f) return;
          // P1-05：送信前にサイズと種別を検査（大容量でブラウザ/ワーカー上限に当たる前に弾く）。
          const MAX_MB = 8;
          if (f.size > MAX_MB * 1024 * 1024) { window.bo.toast(\`ファイルが大きすぎます（上限 \${MAX_MB}MB）。\`, "err"); att.value = ""; return; }
          // MIME が空でも拡張子から推定（.csv/.md 等はブラウザが種別を付けないことがある）。
          const EXT_MIME = { txt: "text/plain", csv: "text/csv", tsv: "text/tab-separated-values", md: "text/markdown", log: "text/plain", json: "application/json", yaml: "application/yaml", yml: "application/yaml", xml: "application/xml" };
          const ext = (f.name.split(".").pop() || "").toLowerCase();
          const mime = f.type || EXT_MIME[ext] || "application/octet-stream";
          const isText = /^text\\//.test(mime) || ["application/json", "application/xml", "application/yaml"].includes(mime);
          if (!/^image\\//.test(mime) && mime !== "application/pdf" && !isText) { window.bo.toast("画像・PDF・テキスト系ファイル（txt/csv/json/md 等）に対応しています。", "err"); att.value = ""; return; }
          const reader = new FileReader();
          reader.onload = () => {
            const url = String(reader.result);
            pendingImage = { mimeType: mime, dataB64: url.split(",")[1] || "" };
            pendingFileName = f.name;
            const nm = document.getElementById("att-name"); if (nm) nm.textContent = "添付: " + f.name;
          };
          reader.readAsDataURL(f);
        });
        function clearAttach() {
          pendingImage = null; pendingFileName = "";
          if (att) att.value = "";
          const nm = document.getElementById("att-name"); if (nm) nm.textContent = "";
        }
        // 応答待ちの「考え中」表示。ストリーミング時はサーバから届く実ステップ（思考/ツール実行）を反映、
        // 非ストリーミング時は段階テキストを自動巡回（画面が止まって見えない＝不安解消）。
        function addThinking(autoCycle) {
          const d = document.createElement("div");
          d.className = "cmsg a thinking";
          d.innerHTML = '<div class="cmsg-body"><span class="cmsg-who">' + esc(AGENT_NAME) + '</span><div class="cbub think"><span class="think-dots"><i></i><i></i><i></i></span><span class="think-text">考えています…</span></div></div>';
          log.appendChild(d); log.scrollTop = log.scrollHeight;
          const tEl = d.querySelector(".think-text");
          let timer = 0;
          if (autoCycle) {
            const steps = ["考えています…", "必要な情報を探しています…", "内容を整理しています…", "回答を作成しています…", "もう少しで完成します…"];
            let i = 0; timer = setInterval(() => { i = Math.min(i + 1, steps.length - 1); if (tEl) tEl.textContent = steps[i]; }, 2600);
          }
          return { setStep: (s) => { if (tEl && s) { tEl.textContent = s; log.scrollTop = log.scrollHeight; } }, stop: () => { if (timer) clearInterval(timer); d.remove(); } };
        }
        // 長時間になりそうな依頼の判定（指定なしでも自動でバックグラウンドへ回す）。
        // 対話的な依頼（アプリ作成など）はストリーミングで応答性を保つ。明確に大量・一括の依頼だけ自動バックグラウンド化。
        function looksLong(t) { const s = t || ""; return s.length > 600 || /(一括|全件|大量|まとめて[^。]*(集計|処理|要約|変換|作成)|月次(レポート|集計)|年次(レポート|集計)|全(部|て)[^。]*(集計|処理|要約))/.test(s); }
        // バックグラウンド完了の監視：結果がセッションへ追記されたら会話を更新（画面を離れても継続）。
        let bgPollTimer = null;
        function pollBackgroundResult(sid) {
          if (bgPollTimer) clearInterval(bgPollTimer);
          let tries = 0, lastCount = -1, idleTicks = -1;
          // 会話内のライブ稼働チップ（稼働中か・今どの工程か・経過秒）を /api/activity から描画。
          const renderLive = (t) => {
            let el = document.getElementById("bo-live");
            if (!t) { if (el) el.remove(); return; }
            if (!el) {
              el = document.createElement("div"); el.id = "bo-live";
              el.style.cssText = "margin:8px 0;padding:9px 13px;border:1px solid var(--brand-tint);background:var(--brand-soft);color:var(--accent-ink);border-radius:12px;font-size:.85rem;font-weight:600;display:flex;align-items:center;gap:9px";
              log.appendChild(el);
            }
            const sec = Math.max(0, t.elapsedSec || 0);
            const prog = (t.kind === "build" && t.total) ? "工程 " + (t.phase || 0) + "/" + t.total + "・" : "";
            el.innerHTML = '<span style="width:9px;height:9px;border-radius:99px;background:var(--brand-strong);display:inline-block;flex:0 0 auto"></span>' + esc((t.label || "稼働中") + "（" + prog + "経過 " + sec + "秒）");
            log.scrollTop = log.scrollHeight;
          };
          const stop = () => { clearInterval(bgPollTimer); bgPollTimer = null; renderLive(null); };
          const _every = (window.bo?.every || setInterval);
          bgPollTimer = _every(async () => {
            tries++;
            if (sessionId !== sid) { stop(); return; }
            // 会話を最新化：新着メッセージ（計画・進捗・完了）があれば即反映＝手動更新なしでリアルタイム表示。
            let grew = false;
            try {
              const r = await window.bo.api("/api/chat-sessions?id=" + encodeURIComponent(sid), undefined, { method: "GET", successMsg: null });
              if (r.ok) { const n = (r.data.messages || []).length; if (n !== lastCount) { grew = n > lastCount; lastCount = n; openSession(sid); window.bo.pollAgent?.(); } }
            } catch (e) { /* retry */ }
            // バックグラウンドの作業（ジョブ/アプリ実装）の稼働をチップ表示。無くなったら完了とみなし、最終反映して停止。
            try {
              const a = await (await fetch("/api/activity", { headers: { accept: "application/json" } })).json();
              const mineWork = (a.tasks || []).filter((t) => t.mine && (t.kind === "build" || t.kind === "edit"));
              renderLive(mineWork[0] || null);
              // 完了確定（app_builds.status=done）は「プレビュー…」ボタン付き完了メッセージの投稿より先に行われ、
              // その間に createDraft・メタ生成・公開ページ等で数十秒かかる。活動が消えた瞬間に止めると完了メッセージを
              // 取りこぼし手動更新が必要になるため、活動消失後も新着が届く（grew）まで猶予（~40秒）を持って停止する。
              const idle = tries > 1 && !(a.tasks || []).some((t) => t.mine);
              if (idle) { idleTicks++; if (grew || idleTicks >= 8) { stop(); openSession(sid); window.bo.pollAgent?.(); } }
              else idleTicks = -1;
            } catch (e) { /* retry */ }
            if (tries > 300) stop(); // 約25分で打ち切り
          }, 5000);
        }
        // 非ストリーミング送信（バックグラウンド実行／ストリーム失敗時のフォールバック）。
        async function sendNonStream(body, btn) {
          const thinking = addThinking(true);
          const r = await window.bo.api("/api/chat", body, { btn, successMsg: null });
          thinking.stop(); clearAttach();
          if (!r.ok) return;
          window.bo.pollAgent?.();
          const isNew = !sessionId; sessionId = r.data.sessionId; setLastSession(sessionId); if (isNew) reloadSessions();
          window.bo.refreshRecent?.(); // サイドバー「最近の会話」を更新
          addMsg("a", r.data.reply, true, r.data.actions, r.data.messageId);
          window.__afterReply && window.__afterReply(r.data.reply);
          if (r.data.queued) pollBackgroundResult(sessionId); // バックグラウンド：完了したら会話を自動更新
        }
        async function send() {
          if (currentAbort || sending) return; // 応答中は新規送信しない（ストリームは停止ボタン／非ストリームは sending フラグ）。
          const ta = document.getElementById("msg");
          const text = ta.value.trim(); if (!text && !pendingImage) return;
          addMsg("u", text + (pendingFileName ? \`\\n（添付: \${pendingFileName}）\` : "")); ta.value = ""; voiceBase = "";
          const manualBg = !!document.getElementById("bgrun")?.checked;
          const canBg = !!document.getElementById("bgrun"); // bgrun の存在＝Pro（バックグラウンド可）
          // 指定がなくても、長時間になりそうな依頼は自動でバックグラウンドへ。プランモードは実行しない＝前景で計画のみ。
          const background = chatMode !== "plan" && canBg && (manualBg || looksLong(text));
          const body = { message: text, sessionId: sessionId || undefined, model: sel.value, background, mode: chatMode };
          if (pendingImage) body.image = pendingImage;
          const btn = document.getElementById("send");
          // バックグラウンド実行はストリーミング非対応＝従来APIへ。
          if (background) { sending = true; try { return await sendNonStream(body, btn); } finally { sending = false; } }
          // ストリーミング：思考/ツール実行の進捗を逐次表示し、最後に回答を描画。
          const thinking = addThinking(false);
          window.bo.progress?.start?.();
          // 途中停止：送信ボタンを「□」(停止)に切り替える（無効化せずクリックで中断可能に）。
          currentAbort = new AbortController();
          btn.dataset.label = btn.textContent; btn.textContent = "□"; btn.classList.add("is-stop"); btn.title = "停止";
          let streamed = false;
          try {
            const res = await fetch("/api/chat/stream", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: currentAbort.signal });
            if (!res.ok || !res.body) {
              let msg = "送信に失敗しました";
              try { const j = await res.json(); if (j?.error) msg = j.error; } catch (e) { /* non-json */ }
              thinking.stop(); window.bo.toast(msg, "err"); return;
            }
            const reader = res.body.getReader(); const dec = new TextDecoder();
            let buf = "", done = null;
            for (;;) {
              const { value, done: rdone } = await reader.read();
              if (rdone) break;
              buf += dec.decode(value, { stream: true });
              let idx;
              while ((idx = buf.indexOf("\\n\\n")) >= 0) {
                const raw = buf.slice(0, idx); buf = buf.slice(idx + 2);
                const line = raw.replace(/^data:\\s?/, "");
                if (!line) continue;
                let ev; try { ev = JSON.parse(line); } catch (e) { continue; }
                if (ev.type === "step") { streamed = true; thinking.setStep(ev.label); }
                else if (ev.type === "done") done = ev;
              }
            }
            thinking.stop(); clearAttach();
            if (done) {
              window.bo.pollAgent?.();
              addMsg("a", done.reply, true, done.actions, done.messageId);
              window.__afterReply && window.__afterReply(done.reply);
              const isNew = !sessionId; sessionId = done.sessionId; setLastSession(sessionId); if (isNew) reloadSessions();
              window.bo.refreshRecent?.(); // サイドバー「最近の会話」を更新
              if (done.queued) pollBackgroundResult(sessionId); // 長い処理→バックグラウンド継続。完了で自動反映
            } else {
              addMsg("a", "（応答を受け取れませんでした。もう一度お試しください）");
            }
          } catch (e) {
            thinking.stop();
            if (e && e.name === "AbortError") { addMsg("a", "（停止しました）"); }
            // 接続が確立する前の失敗のみフォールバック（確立後＝サーバ側で既に記録済みのため二重送信しない）。
            else if (!streamed) await sendNonStream(body, btn);
            else window.bo.toast("通信が途切れました。画面を再読込してご確認ください。", "err");
          } finally {
            window.bo.progress?.done?.();
            btn.textContent = btn.dataset.label || "送信"; btn.classList.remove("is-stop"); btn.title = ""; currentAbort = null;
          }
        }
        document.getElementById("new-ses")?.addEventListener("click", () => { sessionId = ""; log.innerHTML = ""; [...document.querySelectorAll(".ses-row")].forEach((r) => r.classList.remove("on")); document.getElementById("msg")?.focus(); });
        document.getElementById("send")?.addEventListener("click", () => { if (currentAbort) { try { currentAbort.abort(); } catch (e) { /* noop */ } } else send(); });
        // マスコット（相棒）からの呼び出し：?greet=1 で相棒が話しかける。
        try { if (new URLSearchParams(location.search).get("greet") === "1" && !log.children.length) addMsg("a", "はい、" + AGENT_NAME + "です。なにか御用ですか？やりたいことを書いてください。"); document.getElementById("msg")?.focus(); } catch (e) { /* noop */ }
        // 会話の復元：?new=1=新規 / ?ses=ID=指定の会話 / 既定=前回の会話（画面遷移して戻っても継続）。
        function restoreConversation() {
          try {
            const sp = new URLSearchParams(location.search);
            if (sp.get("new") === "1") {
              try { localStorage.removeItem("bo_last_session"); } catch (e) { /* noop */ }
              history.replaceState(null, "", "/"); // URLを綺麗に
            } else {
              const sid = sp.get("ses");
              if (sid) openSession(sid);
              else { let last = ""; try { last = localStorage.getItem("bo_last_session") || ""; } catch (e) { /* noop */ } if (last && !log.children.length) openSession(last); }
            }
          } catch (e) { /* noop */ }
        }
        // openSession は window.bo.api を使う。bo は App.astro 側のモジュール（defer実行）で定義されるため、
        // この is:inline（解析時に即実行）からは準備完了を待ってから復元する。
        (function waitBo(tries) {
          if (window.bo && window.bo.api) { restoreConversation(); return; }
          if (tries > 150) { restoreConversation(); return; } // ~4.5s で諦めて試行
          setTimeout(() => waitBo(tries + 1), 30);
        })(0);
        // --- 音声入力（Web Speech API・長時間対応） ---
        const micBtn = document.getElementById("mic-btn");
        function stopRec() {
          voiceOn = false; clearTimeout(silenceTimer);
          if (micBtn) { micBtn.classList.remove("rec"); micBtn.title = "音声入力（もう一度押すと停止）"; }
          if (voiceRec) { voiceRec.onend = null; try { voiceRec.stop(); } catch (e) { /* noop */ } voiceRec = null; }
        }
        function startRec() {
          const ta = document.getElementById("msg"); if (!ta || !SR) return;
          voiceRec = new SR(); voiceRec.lang = "ja-JP"; voiceRec.continuous = true; voiceRec.interimResults = true;
          voiceBase = ta.value ? (ta.value.replace(/\\s*$/, "") + " ") : "";
          voiceRec.onresult = (e) => {
            let interim = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
              const r = e.results[i];
              if (r.isFinal) voiceBase += r[0].transcript; else interim += r[0].transcript;
            }
            ta.value = voiceBase + interim;
            ta.scrollTop = ta.scrollHeight;
            // ハンズフリー：発話が少し途切れたら自動送信（無音タイマー）。確定テキストがある時のみ。
            if (handsFree) { clearTimeout(silenceTimer); silenceTimer = setTimeout(() => { if (voiceOn && ta.value.trim()) { stopRec(); send(); } }, 1500); }
          };
          voiceRec.onerror = (e) => {
            if (e.error === "not-allowed" || e.error === "service-not-allowed") { window.bo.toast("マイクの使用が許可されていません。ブラウザの設定をご確認ください。", "err"); stopRec(); }
            // no-speech / network 等は onend での自動再開に任せる
          };
          // 長時間対応：listening 継続中に切れたら自動で再開（無音/規定時間での停止を吸収）。
          voiceRec.onend = () => { if (voiceOn) { try { voiceRec.start(); } catch (e) { /* 再開待ち */ } } };
          try { voiceRec.start(); voiceOn = true; if (micBtn) { micBtn.classList.add("rec"); micBtn.title = "停止"; } window.bo.toast("音声入力を開始しました（もう一度押すと停止）", "info"); }
          catch (e) { /* すでに開始済み */ }
        }
        if (micBtn) {
          if (!SR) { micBtn.style.display = "none"; }
          else { micBtn.addEventListener("click", () => (voiceOn ? stopRec() : startRec())); }
        }
        // --- 音声会話（返信読み上げ＋ハンズフリー） ---
        function stripForSpeech(s) { return String(s || "").replace(/\`\`\`[\\s\\S]*?\`\`\`/g, "。（コードは省略）。").replace(/\\[([^\\]]+)\\]\\([^)]*\\)/g, "$1").replace(/https?:\\/\\/\\S+/g, "リンク").replace(/[#*_\`>~|]/g, "").replace(/\\n{2,}/g, "。").replace(/\\s+/g, " ").trim(); }
        function stopSpeak() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* noop */ } if (currentAudio) { try { currentAudio.pause(); } catch (e) { /* noop */ } currentAudio = null; } }
        async function speak(text) {
          const t = stripForSpeech(text).slice(0, 3000); if (!t) return;
          stopSpeak();
          if (ttsMode === "cloud" && TTS_CLOUD_READY) {
            try {
              const res = await fetch("/api/tts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: t }) });
              if (res.ok) {
                const url = URL.createObjectURL(await res.blob());
                await new Promise((resolve) => { const a = new Audio(url); currentAudio = a; a.onended = () => { URL.revokeObjectURL(url); if (currentAudio === a) currentAudio = null; resolve(); }; a.onerror = () => { URL.revokeObjectURL(url); resolve(); }; a.play().catch(() => resolve()); });
                return;
              }
            } catch (e) { /* ブラウザTTSへフォールバック */ }
          }
          if (!window.speechSynthesis) return;
          await new Promise((resolve) => { const u = new SpeechSynthesisUtterance(t); u.lang = "ja-JP"; u.onend = () => resolve(); u.onerror = () => resolve(); window.speechSynthesis.speak(u); });
        }
        // 返信描画後に呼ぶ：読み上げONなら喋り、ハンズフリーなら読み上げ後にマイクを再開＝会話を続ける。
        function afterReply(reply) {
          if (!(readAloudOn || handsFree)) return;
          speak(reply).then(() => { if (handsFree && !currentAbort) startRec(); });
        }
        window.__afterReply = afterReply; // send/sendNonStream から参照
        function refreshVoiceBtns() {
          const tb = document.getElementById("tts-btn"), cb = document.getElementById("conv-btn");
          if (tb) tb.classList.toggle("on", readAloudOn || handsFree);
          if (cb) cb.classList.toggle("on", handsFree);
        }
        document.getElementById("tts-btn")?.addEventListener("click", () => {
          readAloudOn = !readAloudOn; try { localStorage.setItem("bo_tts_on", readAloudOn ? "1" : "0"); } catch (e) { /* noop */ }
          if (!readAloudOn) stopSpeak();
          refreshVoiceBtns();
          window.bo.toast(readAloudOn ? ("返信を読み上げます（" + (ttsMode === "cloud" ? "クラウド音声" : "ブラウザ音声") + "）") : "読み上げをオフにしました", "info");
        });
        if (SR) document.getElementById("conv-btn")?.addEventListener("click", () => {
          handsFree = !handsFree;
          if (handsFree) { readAloudOn = true; try { localStorage.setItem("bo_tts_on", "1"); } catch (e) { /* noop */ } refreshVoiceBtns(); window.bo.toast("音声会話モード：話しかけてください（少し黙ると自動送信→返信を読み上げます）", "info"); startRec(); }
          else { stopRec(); stopSpeak(); refreshVoiceBtns(); window.bo.toast("音声会話モードを終了しました", "info"); }
        });
        else { const cb = document.getElementById("conv-btn"); if (cb) cb.style.display = "none"; }
        refreshVoiceBtns();
        // Enter で送信、Shift+Enter は改行（既定動作のまま）。IME変換確定のEnterは送信しない。
        document.getElementById("msg")?.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
        // 既存セッション行（SSR分）の配線。
        document.querySelectorAll(".ses-row").forEach((row) => {
          const id = row.getAttribute("data-ses");
          row.querySelector(".ses-open")?.addEventListener("click", (e) => { e.preventDefault(); openSession(id); });
          row.querySelector(".ses-del")?.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!(await window.bo.confirm("このチャットセッションを削除しますか？", { confirmLabel: "削除", danger: true, irreversible: true }))) return;
            const rr = await window.bo.api("/api/chat-sessions", { _action: "delete", id }, { btn: e.currentTarget, successMsg: "削除しました" });
            if (rr.ok) { if (id === sessionId) { sessionId = ""; log.innerHTML = ""; } reloadSessions(); }
          });
        });
        // --- スキル管理（管理者のみ要素が存在） ---
        const sk = (b, btn) => window.bo.api("/api/skills", b, { btn });
        document.getElementById("skgen")?.addEventListener("click", async (e) => {
          const request = document.getElementById("skreq").value.trim();
          if (!request) { window.bo.toast("作りたいスキルの要望を入力してください", "err"); return; }
          const r = await sk({ _action: "generate", request }, e.currentTarget);
          if (r.ok) { window.bo.toast("スキル「" + (r.data.name || "") + "」を作成しました（無効状態）"); setTimeout(() => location.reload(), 900); }
        });
        document.getElementById("skadd")?.addEventListener("click", async (e) => {
          const r = await sk({ _action: "create", name: document.getElementById("sname").value, description: document.getElementById("sdesc").value, mode: document.getElementById("smode").value, skill_md: document.getElementById("smd").value }, e.currentTarget);
          if (r.ok) { window.bo.toast("登録しました（無効状態）"); setTimeout(() => location.reload(), 600); }
        });
        document.querySelectorAll("tr[data-sid]").forEach((tr) => {
          const id = tr.dataset.sid;
          tr.querySelector(".sen")?.addEventListener("click", async (e) => { const r = await sk({ _action: "enable", id, enabled: true }, e.target); if (r.ok) setTimeout(() => location.reload(), 500); });
          tr.querySelector(".sdis")?.addEventListener("click", async (e) => { const r = await sk({ _action: "enable", id, enabled: false }, e.target); if (r.ok) setTimeout(() => location.reload(), 500); });
          tr.querySelector(".sdel")?.addEventListener("click", async (e) => { if (await window.bo.confirm("このスキルを削除しますか？", { confirmLabel: "削除", danger: true })) { const r = await sk({ _action: "delete", id }, e.target); if (r.ok) setTimeout(() => location.reload(), 500); } });
        });
        // --- 実行中のバックグラウンドタスク（/api/activity を定期取得） ---
        const TASK_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>';
        async function pollBg() {
          const box = document.getElementById("bg-list"); if (!box) return;
          try {
            const r = await fetch("/api/activity", { headers: { accept: "application/json" } });
            if (!r.ok) return;
            const d = await r.json();
            const tasks = d.tasks || [];
            if (!tasks.length) { box.innerHTML = '<p class="muted task-empty">いま動いているタスクはありません。</p>'; return; }
            const fmtSec = (s) => { s = Math.max(0, s | 0); return s >= 60 ? (Math.floor(s / 60) + "分" + (s % 60) + "秒") : (s + "秒"); };
            box.innerHTML = tasks.map((t) => {
              let detail = (t.status === "running" ? "実行中" : t.status === "planning" ? "計画中" : "待機");
              if (t.kind === "build") {
                const ph = t.total ? ("工程 " + (t.phase || 0) + "/" + t.total) : "計画中";
                detail = ph + "・経過 " + fmtSec(t.elapsedSec || 0);
              }
              return '<div class="task-row"><span class="task-k">' + TASK_SVG + '</span><span class="task-t">' + esc(String(t.label || "処理")) + '</span><span class="task-s">' + esc(detail) + "</span>" + (t.id ? '<button class="btn btn-sm btn-warn bg-stop" data-jid="' + esc(String(t.id)) + '" style="flex:0 0 auto">停止</button>' : "") + "</div>";
            }).join("");
            box.querySelectorAll(".bg-stop").forEach((b) => b.addEventListener("click", async (e) => {
              const jid = e.currentTarget.dataset.jid;
              if (!(await window.bo.confirm("このバックグラウンドの作業を停止しますか？", { confirmLabel: "停止", danger: true }))) return;
              const rr = await window.bo.api("/api/activity", { _action: "cancel", id: jid }, { btn: e.currentTarget, successMsg: "停止しました" });
              if (rr.ok) pollBg();
            }));
          } catch (e) { /* offline */ }
        }
        pollBg(); (window.bo?.every ? window.bo.every(pollBg, 4000) : setInterval(pollBg, 4000));
        // --- スケジュールタスク（定期実行） ---
        const stFreq = document.getElementById("st-freq");
        function syncStFreq() {
          const v = stFreq ? stFreq.value : "daily";
          const dow = document.getElementById("st-dow-wrap"); if (dow) dow.hidden = v !== "weekly";
          const dom = document.getElementById("st-dom-wrap"); if (dom) dom.hidden = v !== "monthly";
        }
        stFreq?.addEventListener("change", syncStFreq); syncStFreq();
        const timeToMin = (v) => { const p = String(v || "09:00").split(":"); const m = (Number(p[0]) * 60) + Number(p[1] || 0); return Number.isFinite(m) ? m : 540; };
        document.getElementById("st-add")?.addEventListener("click", async (e) => {
          const prompt = document.getElementById("st-prompt").value.trim();
          if (!prompt) { window.bo.toast("実行する指示を入力してください", "err"); return; }
          const freq = stFreq.value;
          const body = { _action: "create", prompt, freq, at_min: timeToMin(document.getElementById("st-time").value) };
          if (freq === "weekly") body.dow = Number(document.getElementById("st-dow").value);
          if (freq === "monthly") body.dom = Number(document.getElementById("st-dom").value);
          const r = await window.bo.api("/api/scheduled-tasks", body, { btn: e.currentTarget, successMsg: "定期実行を登録しました" });
          if (r.ok) setTimeout(() => location.reload(), 500);
        });
        document.querySelectorAll("#st-tbody tr[data-stid]").forEach((tr) => {
          const id = tr.dataset.stid;
          tr.querySelector(".st-toggle")?.addEventListener("click", async (e) => {
            const on = e.currentTarget.dataset.on === "1";
            const r = await window.bo.api("/api/scheduled-tasks", { _action: "toggle", id, enabled: on }, { btn: e.currentTarget });
            if (r.ok) setTimeout(() => location.reload(), 400);
          });
          tr.querySelector(".st-del")?.addEventListener("click", async (e) => {
            if (!(await window.bo.confirm("この定期実行を削除しますか？", { confirmLabel: "削除", danger: true }))) return;
            const r = await window.bo.api("/api/scheduled-tasks", { _action: "delete", id }, { btn: e.currentTarget, successMsg: "削除しました" });
            if (r.ok) setTimeout(() => location.reload(), 400);
          });
        });
    })();
  <\/script>`], [`<script data-astro-rerun>
    (function () {
        const log = document.getElementById("log");
        if (!log) return;  // Plus未満は要素が無い
        const sel = document.getElementById("model");
        // ホームの相棒プロンプトからの ?q= を入力欄に反映。
        try { const q = new URLSearchParams(location.search).get("q"); if (q) { const m = document.getElementById("msg"); if (m) { m.value = q; m.focus(); } } } catch (e) { /* noop */ }
        // できること（具体リスト）はサーバ算出値を読む。クラウドAIは「操作」が不可なので別立て。
        let CAP_CAN = [];
        try { CAP_CAN = (JSON.parse(document.getElementById("cap-json")?.textContent || "{}").can) || []; } catch (e) { CAP_CAN = []; }
        // AIアシスタントの表示名（設定で変更可・既定「相棒」）。発言者ラベル等に使う。
        let AGENT_NAME = "相棒";
        try { AGENT_NAME = JSON.parse(document.getElementById("agent-name-json")?.textContent || '"相棒"') || "相棒"; } catch (e) { AGENT_NAME = "相棒"; }
        const USE_LABEL = { gemini: "標準AI", claude: "高精度AI", local: "クラウドAI", openai: "ChatGPT", grok: "Grok", github: "GitHub Models" };
        // 標準AI/高精度AIで「できない・確認が必要」な共通項目。
        const CANT_TOOL = [
          "メールの送信・予定の変更/削除・他団体への連絡は、安全のため<strong>実行前に必ず確認</strong>します（勝手には実行しません）",
          "未導入のアプリの操作（管理者がアプリを追加すると使えます）",
          "銀行・クレジットカードなど外部サービスへの直接ログイン",
        ];
        // クラウドAI（Workers AI）はツールを実行しない＝会話・文章づくり向け。
        const LOCAL_CAN = ["会話・相談にこたえる", "文章の作成・要約・言いかえ", "かんたんな下書きづくり"];
        const LOCAL_CANT = ["お金の記録・検索、請求書、名簿、予定などの<strong>操作</strong>（標準AI／高精度AIに切り替えると使えます）", "ファイルや資料を読み取っての作業"];
        const noteEl = document.getElementById("model-note");
        // 具体モデルID（gemini-*/claude-*/@cf/...）や後方互換のエンジン名から engine 種別へ。
        // workers_ai(@cf/) と engine名 "local" のみ「会話向け（操作不可）」。grok/github/openai は全機能対応のクラウドAI。
        const engineKey = (v) => { v = String(v); if (v === "auto") return "auto"; if (v.indexOf("claude") === 0) return "claude"; if (v.indexOf("gemini") === 0) return "gemini"; if (v.indexOf("@cf/") === 0 || v === "local") return "local"; if (v.indexOf("grok") === 0) return "grok"; if (v.indexOf("github") === 0 || v.indexOf("/") >= 0) return "github"; return "openai"; };
        const engineForModel = (v) => { const k = engineKey(v); return k === "local" ? "workers_ai" : k; };
        // can/cant はサーバ算出値＋静的文言（利用者入力を含まない）。<strong> 等の体裁をそのまま使う。
        const ul = (items) => "<ul class='mn-list'>" + items.map((t) => "<li>" + t + "</li>").join("") + "</ul>";
        const setNote = (v) => {
          window.bo?.setAgentEngine?.(engineForModel(v));
          if (!noteEl) return;
          const k = engineKey(v);
          if (k === "auto") {
            noteEl.innerHTML =
              '<div class="mn-use">使用中：自動（おまかせ）</div>' +
              '<div class="mn-can"><div class="mn-h">会話内容に応じて最適なAIを自動で選びます</div>' +
              ul(["かんたんな相談・雑談は高速・無料のAIへ", "操作や厳密な作業・長文は高性能なAIへ", "登録済みのAPIから自動で選択・切替（使えない時は他のAPIへ自動フォールバック）"]) + "</div>";
            return;
          }
          const can = k === "local" ? LOCAL_CAN : CAP_CAN;
          const cant = k === "local" ? LOCAL_CANT : CANT_TOOL;
          noteEl.innerHTML =
            '<div class="mn-use">使用中：' + (USE_LABEL[k] || "AI") + (k === "claude" ? "（高精度）" : k === "local" ? "（会話向け）" : "（標準）") + "</div>" +
            '<div class="mn-can"><div class="mn-h">できること</div>' + ul(can) + "</div>" +
            '<div class="mn-cant"><div class="mn-h">できない・確認が必要なこと</div>' + ul(cant) + "</div>";
        };
        setNote(sel ? sel.value : "gemini");
        // モデルピッカー：選んだら即保存（メンバー単位）。次回以降の既定になり、クラウドAIは選んだティア(8B/70B)で動く。
        if (sel) sel.addEventListener("change", () => {
          setNote(sel.value);
          window.bo?.api?.("/api/settings", { _action: "member_model", model: sel.value }, { successMsg: "使うAIを切り替えました" });
        });
        // 会話履歴トグル（モバイル）。
        const sesToggle = document.getElementById("ses-toggle");
        const chatBox = document.querySelector(".chat");
        if (sesToggle && chatBox) sesToggle.addEventListener("click", () => chatBox.classList.toggle("show-ses"));
        let sessionId = "";
        // 音声入力（Web Speech API）。長時間対応：onend で自動再開。voiceBase=確定済みテキスト。
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        let voiceRec = null, voiceOn = false, voiceBase = "";
        // 音声会話：返信読み上げ（readAloudOn）＋ハンズフリー（handsFree）。ttsMode=cloud は /api/tts（OpenAI互換）、browser は speechSynthesis。
        const TTS_CLOUD_READY = document.getElementById("tts-btn")?.dataset.cloud === "1";
        let readAloudOn = false, handsFree = false, ttsMode = TTS_CLOUD_READY ? "cloud" : "browser";
        let silenceTimer = null, currentAudio = null;
        try { readAloudOn = localStorage.getItem("bo_tts_on") === "1"; const tm = localStorage.getItem("bo_tts_mode"); if (tm === "cloud" || tm === "browser") ttsMode = tm; } catch (e) { /* noop */ }
        if (ttsMode === "cloud" && !TTS_CLOUD_READY) ttsMode = "browser";
        let currentAbort = null; // 実行中ストリームの中断（途中停止）。
        let sending = false; // 非ストリーム（バックグラウンド）送信の実行中フラグ。Enter 連打等の二重送信を防ぐ。
        // モード（plan=計画のみ / edit=確認 / auto=自動実行）。
        // P1-01：自動実行はセッション単位＝localStorage から復元しない（翌日/再読込で「確認」に戻る）。
        // plan/edit のみ復元し、危険な auto は毎回ユーザーが明示選択する。選択中は警告を常時表示する。
        let chatMode = "edit";
        try { const m = localStorage.getItem("bo_chat_mode"); if (m === "plan" || m === "edit") chatMode = m; } catch (e) { /* noop */ }
        (function initMode() {
          const seg = document.getElementById("cmode");
          if (!seg) return;
          const warn = document.getElementById("cmode-warn");
          const sync = () => {
            seg.querySelectorAll(".cmode-opt").forEach((x) => x.classList.toggle("on", x.dataset.mode === chatMode));
            if (warn) warn.hidden = chatMode !== "auto";
          };
          seg.querySelectorAll(".cmode-opt").forEach((b) => b.addEventListener("click", () => {
            chatMode = b.dataset.mode;
            // auto はセッション限定のため保存しない（保存すると翌日も確認なしのまま気づかず使ってしまう）。
            try { if (chatMode === "auto") localStorage.removeItem("bo_chat_mode"); else localStorage.setItem("bo_chat_mode", chatMode); } catch (e) { /* noop */ }
            sync();
          }));
          sync();
        })();
        const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
        // 軽量Markdownレンダラ（表・箇条書き・見出し・コード・太字などを整形）。依存なし・HTMLはエスケープ。
        const mdEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
        function mdInline(s) {
          let t = mdEsc(s);
          t = t.replace(/\\\`([^\\\`]+)\\\`/g, (_m, c) => "<code>" + c + "</code>");
          t = t.replace(/\\\\*\\\\*([^*]+)\\\\*\\\\*/g, "<strong>$1</strong>");
          t = t.replace(/(^|[^*])\\\\*([^*\\\\n]+)\\\\*(?!\\\\*)/g, "$1<em>$2</em>");
          t = t.replace(/\\\\[([^\\\\]]+)\\\\]\\\\((https?:[^)\\\\s]+)\\\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
          return t;
        }
        function mdRender(src) {
          const lines = String(src).replace(/\\\\r\\\\n/g, "\\\\n").split("\\\\n");
          let html = "", i = 0;
          const isSep = (l) => l != null && l.indexOf("-") >= 0 && /^\\\\s*\\\\|?[\\\\s:|-]+\\\\|?\\\\s*$/.test(l);
          const isTableHead = (l, n) => l.indexOf("|") >= 0 && isSep(n);
          while (i < lines.length) {
            const line = lines[i];
            if (/^\\\`\\\`\\\`/.test(line)) { i++; let code = ""; while (i < lines.length && !/^\\\`\\\`\\\`/.test(lines[i])) { code += lines[i] + "\\\\n"; i++; } i++; html += "<pre><code>" + mdEsc(code.replace(/\\\\n$/, "")) + "</code></pre>"; continue; }
            if (isTableHead(line, lines[i + 1])) {
              const row = (r) => r.replace(/^\\\\s*\\\\|/, "").replace(/\\\\|\\\\s*$/, "").split("|").map((c) => c.trim());
              const head = row(line); i += 2; const body = [];
              while (i < lines.length && lines[i].indexOf("|") >= 0 && lines[i].trim() !== "") { body.push(row(lines[i])); i++; }
              html += '<div class="md-tablewrap"><table class="md-table"><thead><tr>' + head.map((h) => "<th>" + mdInline(h) + "</th>").join("") + "</tr></thead><tbody>" + body.map((r) => "<tr>" + r.map((c) => "<td>" + mdInline(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>"; continue;
            }
            const h = line.match(/^(#{1,4})\\\\s+(.*)$/);
            if (h) { const lv = Math.min(h[1].length + 2, 6); html += "<h" + lv + ' class="md-h">' + mdInline(h[2]) + "</h" + lv + ">"; i++; continue; }
            if (/^\\\\s*([-*_])(\\\\s*\\\\1){2,}\\\\s*$/.test(line)) { html += '<hr class="md-hr">'; i++; continue; }
            if (/^>\\\\s?/.test(line)) { let q = ""; while (i < lines.length && /^>\\\\s?/.test(lines[i])) { q += lines[i].replace(/^>\\\\s?/, "") + "\\\\n"; i++; } html += '<blockquote class="md-q">' + mdInline(q.trim()).replace(/\\\\n/g, "<br>") + "</blockquote>"; continue; }
            if (/^\\\\s*[-*+]\\\\s+/.test(line)) { const it = []; while (i < lines.length && /^\\\\s*[-*+]\\\\s+/.test(lines[i])) { it.push(lines[i].replace(/^\\\\s*[-*+]\\\\s+/, "")); i++; } html += '<ul class="md-ul">' + it.map((x) => "<li>" + mdInline(x) + "</li>").join("") + "</ul>"; continue; }
            if (/^\\\\s*\\\\d+\\\\.\\\\s+/.test(line)) { const it = []; while (i < lines.length && /^\\\\s*\\\\d+\\\\.\\\\s+/.test(lines[i])) { it.push(lines[i].replace(/^\\\\s*\\\\d+\\\\.\\\\s+/, "")); i++; } html += '<ol class="md-ol">' + it.map((x) => "<li>" + mdInline(x) + "</li>").join("") + "</ol>"; continue; }
            if (line.trim() === "") { i++; continue; }
            const para = [];
            while (i < lines.length && lines[i].trim() !== "" && !/^\\\`\\\`\\\`/.test(lines[i]) && !/^(#{1,4})\\\\s/.test(lines[i]) && !/^\\\\s*[-*+]\\\\s+/.test(lines[i]) && !/^\\\\s*\\\\d+\\\\.\\\\s+/.test(lines[i]) && !/^>\\\\s?/.test(lines[i]) && !isTableHead(lines[i], lines[i + 1])) { para.push(lines[i]); i++; }
            if (para.length) html += "<p>" + para.map(mdInline).join("<br>") + "</p>";
          }
          return html;
        }
        function dload(text, ext, mime) {
          if (ext === "pdf") {
            const w = window.open("", "_blank");
            if (!w) { window.bo.toast("PDF化はポップアップ許可が必要です", "err"); return; }
            w.document.write('<title>baku-office</title><pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;padding:24px">' + esc(text) + "</pre>");
            w.document.close(); w.focus(); w.print(); return;
          }
          let body = text;
          if (ext === "html") body = '<!doctype html><meta charset="utf-8"><title>baku-office</title><pre style="white-space:pre-wrap;font-family:system-ui,sans-serif">' + esc(text) + "</pre>";
          const blob = new Blob([body], { type: mime || "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "baku-office-" + Date.now() + "." + ext;
          document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        }
        // 会話全体をテキスト化（セッション単位のダウンロード用）。
        function conversationText() {
          const out = [];
          log.querySelectorAll(".cmsg").forEach((m) => {
            const who = m.classList.contains("u") ? "あなた" : AGENT_NAME;
            const b = m.querySelector(".cbub");
            out.push(who + "： " + (b ? b.innerText.trim() : ""));
          });
          return out.join("\\\\n\\\\n");
        }
        // メッセージ下のアクションボタン群（生成アプリ導線・会話の選択肢）を描画。
        // kind: reply（その文を送信）/ navigate（同タブ遷移）/ link（別タブ）/ api（/api へPOST→任意で遷移/再読込）。
        function renderActions(parent, actions) {
          if (!Array.isArray(actions) || !actions.length) return;
          const wrap = document.createElement("div");
          wrap.className = "cmsg-actions";
          for (const a of actions) {
            if (!a || !a.label || !a.kind) continue;
            const cls = "btn btn-sm " + (a.style === "primary" ? "btn-primary" : "btn-ghost");
            // navigate/link は本物の <a href> で描画する。ClientRouter（View Transitions）配下では
            // button+location.href 代入が不発になり得るため、アンカーにして確実に遷移させる。
            if ((a.kind === "navigate" || a.kind === "link") && a.href) {
              // アクションは AI/セッション履歴由来＝javascript: 等の危険スキームを弾く（App.astro の通知パネルと同基準）。
              const safeHref = /^(https?:|\\\\/|#)/.test(String(a.href)) ? a.href : "#";
              const link = document.createElement("a");
              link.className = cls; link.textContent = a.label; link.href = safeHref;
              if (a.kind === "link") { link.target = "_blank"; link.rel = "noopener"; }
              wrap.appendChild(link);
              continue;
            }
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = cls;
            btn.textContent = a.label;
            btn.addEventListener("click", async () => {
              if (a.kind === "reply" && a.text) { sendText(a.text); }
              else if (a.kind === "copy" && a.text) { try { await navigator.clipboard.writeText(a.text); window.bo?.toast?.("コピーしました"); } catch (e) { window.bo?.toast?.("コピーできませんでした", "err"); } }
              else if (a.kind === "api" && a.endpoint) {
                const r = await window.bo.api(a.endpoint, a.payload || {}, { btn, successMsg: a.successMsg || null });
                if (r.ok) { if (a.then && /^(https?:|\\\\/|#)/.test(String(a.then))) location.href = a.then; else if (a.reload) setTimeout(() => location.reload(), 600); }
              }
            });
            wrap.appendChild(btn);
          }
          parent.appendChild(wrap);
        }
        // テキストを入力欄に入れて送信（reply アクション・外部呼び出し用）。
        function sendText(text) {
          if (currentAbort) return;
          const ta = document.getElementById("msg");
          if (!ta) return;
          ta.value = text;
          send();
        }
        // マイクロフィードバック（1タップ・任意・未回答でも集計成立）。「はい」の後だけ「何分浮いた？」を任意で聞く。
        // localStorage で回答済みを記憶し二重送信・再表示を防ぐ。
        function fbSent(mid) { try { return !!localStorage.getItem("bo_fb_" + mid); } catch (e) { return false; } }
        function fbMark(mid) { try { localStorage.setItem("bo_fb_" + mid, "1"); } catch (e) { /* noop */ } }
        async function fbPost(payload) { try { await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); } catch (e) { /* noop */ } }
        function addFeedbackBar(body, mid) {
          if (!mid || fbSent(mid)) return;
          const bar = document.createElement("div");
          bar.className = "msg-fb";
          const q = (t) => { const s = document.createElement("span"); s.className = "fb-q"; s.textContent = t; return s; };
          const btn = (t, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "fb-b"; b.textContent = t; b.addEventListener("click", fn); return b; };
          // 簡易NPS（月1回だけ・フィードバック回答者にだけ続けて出す＝自然なスロットリング）。
          const npsKey = () => "bo_nps_" + new Date().toISOString().slice(0, 7);
          const maybeAskNps = () => {
            try { if (localStorage.getItem(npsKey())) return false; } catch (e) { return false; }
            try { localStorage.setItem(npsKey(), "1"); } catch (e) { /* noop */ }
            const done = (score) => { fbPost({ nps: score, messageId: mid }); bar.replaceChildren(q("ありがとうございます")); setTimeout(() => bar.remove(), 4000); };
            bar.replaceChildren(q("この相棒、同僚にも勧めたいですか？（月1回だけ聞いています）"),
              btn("はい", () => done("yes")), btn("どちらでも", () => done("neutral")), btn("いいえ", () => done("no")));
            return true;
          };
          const finish = (msg) => { if (maybeAskNps()) return; bar.replaceChildren(q(msg)); setTimeout(() => bar.remove(), 4000); };
          bar.append(
            q("役に立ちましたか？"),
            btn("はい", () => {
              fbMark(mid); fbPost({ messageId: mid, value: "good" });
              const minutes = [5, 15, 30].map((n) => btn(n === 30 ? "30分以上" : n + "分", () => { fbPost({ messageId: mid, minutes: n }); finish("ありがとうございます"); }));
              bar.replaceChildren(q("何分くらい手間が省けましたか？（任意）"), ...minutes);
              setTimeout(() => { if (bar.isConnected && bar.querySelector("button")) finish("ありがとうございます"); }, 15000);
            }),
            btn("いまいち", () => { fbMark(mid); fbPost({ messageId: mid, value: "bad" }); finish("フィードバックを記録しました"); }),
          );
          body.appendChild(bar);
        }
        // role=u/a。発言者ラベル付き。stream=true（新規AI応答のみ）で段階表示（タイプ風・点滅キャレット）。履歴は即時。
        // actions=メッセージ下に出すボタン配列（任意）。messageId=保存済みAIメッセージのid（あればフィードバックを出す）。
        function addMsg(role, text, stream, actions, messageId) {
          // 最初の発言でヒーロー（空状態）を隠す。
          document.getElementById("chat-hero")?.classList.add("hidden");
          const d = document.createElement("div");
          d.className = "cmsg " + role;
          // 相棒（AI）の最終表示は Markdown 整形、利用者の発言はそのまま（改行のみ）。
          const html = role === "a" ? mdRender(text) : esc(text).replace(/\\\\n/g, "<br>");
          d.innerHTML = '<div class="cmsg-body"><span class="cmsg-who">' + (role === "a" ? esc(AGENT_NAME) : "あなた") + '</span><div class="cbub"></div></div>';
          const bub = d.querySelector(".cbub");
          // メッセージごとのコピーボタン（本文をクリップボードへ）。
          const copyBtn = document.createElement("button");
          copyBtn.type = "button"; copyBtn.className = "msg-copy"; copyBtn.title = "コピー"; copyBtn.setAttribute("aria-label", "このメッセージをコピー");
          copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
          copyBtn.addEventListener("click", async () => { try { await navigator.clipboard.writeText(text); window.bo.toast("コピーしました"); } catch (e) { window.bo.toast("コピーできませんでした", "err"); } });
          d.querySelector(".cmsg-body").appendChild(copyBtn);
          log.appendChild(d);
          if (stream && role === "a" && text) {
            let i = 0;
            const step = () => {
              i += 3;
              bub.innerHTML = esc(text.slice(0, i)).replace(/\\\\n/g, "<br>") + '<span class="caret"></span>';
              log.scrollTop = log.scrollHeight;
              if (i < text.length) { setTimeout(step, 18); }
              else { bub.innerHTML = html; renderActions(d.querySelector(".cmsg-body"), actions); if (role === "a") addFeedbackBar(d.querySelector(".cmsg-body"), messageId); log.scrollTop = log.scrollHeight; }
            };
            step();
          } else {
            bub.innerHTML = html;
            renderActions(d.querySelector(".cmsg-body"), actions);
            if (role === "a") addFeedbackBar(d.querySelector(".cmsg-body"), messageId);
            log.scrollTop = log.scrollHeight;
          }
        }
        // セッション単位のダウンロード（枠外ツールバー）。
        document.querySelectorAll(".chat-dl .dlc").forEach((b) => b.addEventListener("click", () => {
          const t = conversationText();
          if (!t) { window.bo.toast("まだ会話がありません", "err"); return; }
          const ext = b.dataset.ext;
          const mime = { txt: "text/plain", md: "text/markdown", html: "text/html", pdf: "" }[ext] || "text/plain";
          dload(t, ext, mime);
        }));
        // セッションを開く（履歴ロード）。
        // 現在の会話IDを記憶（画面遷移して戻っても復元するため）。
        function setLastSession(id) { try { if (id) localStorage.setItem("bo_last_session", id); } catch (e) { /* noop */ } }
        function showHero() { document.getElementById("chat-hero")?.classList.remove("hidden"); }
        // このセッションに紐づく「実際に稼働中の裏タスク」があるか（agent_job/アプリ実装）。誤った『実行中』表示を防ぐ判定。
        async function sessionHasActiveTask(sid) {
          try {
            const a = await (await fetch("/api/activity", { headers: { accept: "application/json" } })).json();
            return (a.tasks || []).some((t) => t && t.mine && t.sessionId === sid);
          } catch (e) { return false; }
        }
        async function openSession(id) {
          sessionId = id; log.innerHTML = "";
          [...document.querySelectorAll(".ses-row")].forEach((r) => r.classList.toggle("on", r.getAttribute("data-ses") === id));
          const r = await window.bo.api("/api/chat-sessions?id=" + encodeURIComponent(id), undefined, { method: "GET", successMsg: null });
          if (sessionId !== id) return; // 応答待ちの間に別の会話へ切り替えられたら、遅延応答を捨てる（内容混入・送信先食い違い防止）。
          const msgs = (r.ok && r.data.messages) || [];
          if (msgs.length) {
            // フィードバックは最後のAI応答にだけ出す（履歴全件に出すとうるさい＝スロットリング）。
            const lastAi = msgs.map((m, i) => (m.role === "assistant" ? i : -1)).reduce((a, b) => Math.max(a, b), -1);
            msgs.forEach((m, i) => addMsg(m.role === "assistant" ? "a" : "u", m.content, false, m.actions, i === lastAi ? m.id : undefined)); setLastSession(id);
            // 末尾がユーザー発言＝AIの応答がまだ無い。ただし「本当に裏で動いているタスクがあるか」を /api/activity で確認してから
            // 表示を出し分ける（前景チャットは画面遷移で中断＝裏では動かないため、実体の無い『実行中』を出さない）。
            const last = msgs[msgs.length - 1];
            if (last && last.role !== "assistant") {
              const running = await sessionHasActiveTask(id);
              if (running) {
                addMsg("a", "この依頼はバックグラウンドで実行中です。完了するとここに表示されます（画面を離れても続行します）。タスク一覧やマスコットから停止もできます。");
                pollBackgroundResult(id);
              } else {
                // 裏で動いていない＝前回の依頼は画面遷移などで中断された。正直に伝え、ワンタップで再送できるようにする。
                addMsg("a", "前回の依頼は完了前に中断されました（通常の処理中に画面を離れると中断されます）。もう一度お試しください。", false, [{ label: "もう一度送る", kind: "reply", text: last.content }]);
              }
            }
          } else { // 空/削除済みセッション：記憶を消して空状態に戻す。
            sessionId = ""; try { localStorage.removeItem("bo_last_session"); } catch (e) { /* noop */ } showHero();
          }
        }
        // サイドバー再描画。
        function renderSessions(sessions) {
          const list = document.getElementById("ses-list");
          if (!list) return; // 会話履歴は共通サイドバー（App.astro）に集約。ページ内一覧は無い。
          list.innerHTML = sessions.length ? "" : '<p class="muted" style="font-size:.82rem;padding:6px">会話はまだありません。</p>';
          sessions.forEach((s) => {
            const row = document.createElement("div"); row.className = "ses-row"; row.setAttribute("data-ses", s.id);
            if (s.id === sessionId) row.classList.add("on");
            const a = document.createElement("a"); a.href = "#"; a.className = "ses-open"; a.textContent = s.title || "（無題）";
            a.addEventListener("click", (e) => { e.preventDefault(); openSession(s.id); });
            const del = document.createElement("button"); del.className = "ses-del"; del.textContent = "×";
            del.addEventListener("click", async (e) => {
              e.preventDefault();
              if (!(await window.bo.confirm("このチャットセッションを削除しますか？", { confirmLabel: "削除", danger: true, irreversible: true }))) return;
              const rr = await window.bo.api("/api/chat-sessions", { _action: "delete", id: s.id }, { btn: del, successMsg: "削除しました" });
              if (rr.ok) { if (s.id === sessionId) { sessionId = ""; log.innerHTML = ""; } reloadSessions(); }
            });
            row.append(a, del); list.appendChild(row);
          });
        }
        async function reloadSessions() {
          const r = await window.bo.api("/api/chat-sessions", undefined, { method: "GET", successMsg: null });
          if (r.ok) renderSessions(r.data.sessions || []);
        }
        // ファイル添付（画像/PDF）：選択ファイルを base64 化して /api/chat の image に乗せる（API は受領済み）。
        let pendingImage = null;
        let pendingFileName = "";
        const att = document.getElementById("att");
        document.getElementById("att-btn")?.addEventListener("click", () => att?.click());
        att?.addEventListener("change", () => {
          const f = att.files && att.files[0];
          if (!f) return;
          // P1-05：送信前にサイズと種別を検査（大容量でブラウザ/ワーカー上限に当たる前に弾く）。
          const MAX_MB = 8;
          if (f.size > MAX_MB * 1024 * 1024) { window.bo.toast(\\\`ファイルが大きすぎます（上限 \\\${MAX_MB}MB）。\\\`, "err"); att.value = ""; return; }
          // MIME が空でも拡張子から推定（.csv/.md 等はブラウザが種別を付けないことがある）。
          const EXT_MIME = { txt: "text/plain", csv: "text/csv", tsv: "text/tab-separated-values", md: "text/markdown", log: "text/plain", json: "application/json", yaml: "application/yaml", yml: "application/yaml", xml: "application/xml" };
          const ext = (f.name.split(".").pop() || "").toLowerCase();
          const mime = f.type || EXT_MIME[ext] || "application/octet-stream";
          const isText = /^text\\\\//.test(mime) || ["application/json", "application/xml", "application/yaml"].includes(mime);
          if (!/^image\\\\//.test(mime) && mime !== "application/pdf" && !isText) { window.bo.toast("画像・PDF・テキスト系ファイル（txt/csv/json/md 等）に対応しています。", "err"); att.value = ""; return; }
          const reader = new FileReader();
          reader.onload = () => {
            const url = String(reader.result);
            pendingImage = { mimeType: mime, dataB64: url.split(",")[1] || "" };
            pendingFileName = f.name;
            const nm = document.getElementById("att-name"); if (nm) nm.textContent = "添付: " + f.name;
          };
          reader.readAsDataURL(f);
        });
        function clearAttach() {
          pendingImage = null; pendingFileName = "";
          if (att) att.value = "";
          const nm = document.getElementById("att-name"); if (nm) nm.textContent = "";
        }
        // 応答待ちの「考え中」表示。ストリーミング時はサーバから届く実ステップ（思考/ツール実行）を反映、
        // 非ストリーミング時は段階テキストを自動巡回（画面が止まって見えない＝不安解消）。
        function addThinking(autoCycle) {
          const d = document.createElement("div");
          d.className = "cmsg a thinking";
          d.innerHTML = '<div class="cmsg-body"><span class="cmsg-who">' + esc(AGENT_NAME) + '</span><div class="cbub think"><span class="think-dots"><i></i><i></i><i></i></span><span class="think-text">考えています…</span></div></div>';
          log.appendChild(d); log.scrollTop = log.scrollHeight;
          const tEl = d.querySelector(".think-text");
          let timer = 0;
          if (autoCycle) {
            const steps = ["考えています…", "必要な情報を探しています…", "内容を整理しています…", "回答を作成しています…", "もう少しで完成します…"];
            let i = 0; timer = setInterval(() => { i = Math.min(i + 1, steps.length - 1); if (tEl) tEl.textContent = steps[i]; }, 2600);
          }
          return { setStep: (s) => { if (tEl && s) { tEl.textContent = s; log.scrollTop = log.scrollHeight; } }, stop: () => { if (timer) clearInterval(timer); d.remove(); } };
        }
        // 長時間になりそうな依頼の判定（指定なしでも自動でバックグラウンドへ回す）。
        // 対話的な依頼（アプリ作成など）はストリーミングで応答性を保つ。明確に大量・一括の依頼だけ自動バックグラウンド化。
        function looksLong(t) { const s = t || ""; return s.length > 600 || /(一括|全件|大量|まとめて[^。]*(集計|処理|要約|変換|作成)|月次(レポート|集計)|年次(レポート|集計)|全(部|て)[^。]*(集計|処理|要約))/.test(s); }
        // バックグラウンド完了の監視：結果がセッションへ追記されたら会話を更新（画面を離れても継続）。
        let bgPollTimer = null;
        function pollBackgroundResult(sid) {
          if (bgPollTimer) clearInterval(bgPollTimer);
          let tries = 0, lastCount = -1, idleTicks = -1;
          // 会話内のライブ稼働チップ（稼働中か・今どの工程か・経過秒）を /api/activity から描画。
          const renderLive = (t) => {
            let el = document.getElementById("bo-live");
            if (!t) { if (el) el.remove(); return; }
            if (!el) {
              el = document.createElement("div"); el.id = "bo-live";
              el.style.cssText = "margin:8px 0;padding:9px 13px;border:1px solid var(--brand-tint);background:var(--brand-soft);color:var(--accent-ink);border-radius:12px;font-size:.85rem;font-weight:600;display:flex;align-items:center;gap:9px";
              log.appendChild(el);
            }
            const sec = Math.max(0, t.elapsedSec || 0);
            const prog = (t.kind === "build" && t.total) ? "工程 " + (t.phase || 0) + "/" + t.total + "・" : "";
            el.innerHTML = '<span style="width:9px;height:9px;border-radius:99px;background:var(--brand-strong);display:inline-block;flex:0 0 auto"></span>' + esc((t.label || "稼働中") + "（" + prog + "経過 " + sec + "秒）");
            log.scrollTop = log.scrollHeight;
          };
          const stop = () => { clearInterval(bgPollTimer); bgPollTimer = null; renderLive(null); };
          const _every = (window.bo?.every || setInterval);
          bgPollTimer = _every(async () => {
            tries++;
            if (sessionId !== sid) { stop(); return; }
            // 会話を最新化：新着メッセージ（計画・進捗・完了）があれば即反映＝手動更新なしでリアルタイム表示。
            let grew = false;
            try {
              const r = await window.bo.api("/api/chat-sessions?id=" + encodeURIComponent(sid), undefined, { method: "GET", successMsg: null });
              if (r.ok) { const n = (r.data.messages || []).length; if (n !== lastCount) { grew = n > lastCount; lastCount = n; openSession(sid); window.bo.pollAgent?.(); } }
            } catch (e) { /* retry */ }
            // バックグラウンドの作業（ジョブ/アプリ実装）の稼働をチップ表示。無くなったら完了とみなし、最終反映して停止。
            try {
              const a = await (await fetch("/api/activity", { headers: { accept: "application/json" } })).json();
              const mineWork = (a.tasks || []).filter((t) => t.mine && (t.kind === "build" || t.kind === "edit"));
              renderLive(mineWork[0] || null);
              // 完了確定（app_builds.status=done）は「プレビュー…」ボタン付き完了メッセージの投稿より先に行われ、
              // その間に createDraft・メタ生成・公開ページ等で数十秒かかる。活動が消えた瞬間に止めると完了メッセージを
              // 取りこぼし手動更新が必要になるため、活動消失後も新着が届く（grew）まで猶予（~40秒）を持って停止する。
              const idle = tries > 1 && !(a.tasks || []).some((t) => t.mine);
              if (idle) { idleTicks++; if (grew || idleTicks >= 8) { stop(); openSession(sid); window.bo.pollAgent?.(); } }
              else idleTicks = -1;
            } catch (e) { /* retry */ }
            if (tries > 300) stop(); // 約25分で打ち切り
          }, 5000);
        }
        // 非ストリーミング送信（バックグラウンド実行／ストリーム失敗時のフォールバック）。
        async function sendNonStream(body, btn) {
          const thinking = addThinking(true);
          const r = await window.bo.api("/api/chat", body, { btn, successMsg: null });
          thinking.stop(); clearAttach();
          if (!r.ok) return;
          window.bo.pollAgent?.();
          const isNew = !sessionId; sessionId = r.data.sessionId; setLastSession(sessionId); if (isNew) reloadSessions();
          window.bo.refreshRecent?.(); // サイドバー「最近の会話」を更新
          addMsg("a", r.data.reply, true, r.data.actions, r.data.messageId);
          window.__afterReply && window.__afterReply(r.data.reply);
          if (r.data.queued) pollBackgroundResult(sessionId); // バックグラウンド：完了したら会話を自動更新
        }
        async function send() {
          if (currentAbort || sending) return; // 応答中は新規送信しない（ストリームは停止ボタン／非ストリームは sending フラグ）。
          const ta = document.getElementById("msg");
          const text = ta.value.trim(); if (!text && !pendingImage) return;
          addMsg("u", text + (pendingFileName ? \\\`\\\\n（添付: \\\${pendingFileName}）\\\` : "")); ta.value = ""; voiceBase = "";
          const manualBg = !!document.getElementById("bgrun")?.checked;
          const canBg = !!document.getElementById("bgrun"); // bgrun の存在＝Pro（バックグラウンド可）
          // 指定がなくても、長時間になりそうな依頼は自動でバックグラウンドへ。プランモードは実行しない＝前景で計画のみ。
          const background = chatMode !== "plan" && canBg && (manualBg || looksLong(text));
          const body = { message: text, sessionId: sessionId || undefined, model: sel.value, background, mode: chatMode };
          if (pendingImage) body.image = pendingImage;
          const btn = document.getElementById("send");
          // バックグラウンド実行はストリーミング非対応＝従来APIへ。
          if (background) { sending = true; try { return await sendNonStream(body, btn); } finally { sending = false; } }
          // ストリーミング：思考/ツール実行の進捗を逐次表示し、最後に回答を描画。
          const thinking = addThinking(false);
          window.bo.progress?.start?.();
          // 途中停止：送信ボタンを「□」(停止)に切り替える（無効化せずクリックで中断可能に）。
          currentAbort = new AbortController();
          btn.dataset.label = btn.textContent; btn.textContent = "□"; btn.classList.add("is-stop"); btn.title = "停止";
          let streamed = false;
          try {
            const res = await fetch("/api/chat/stream", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: currentAbort.signal });
            if (!res.ok || !res.body) {
              let msg = "送信に失敗しました";
              try { const j = await res.json(); if (j?.error) msg = j.error; } catch (e) { /* non-json */ }
              thinking.stop(); window.bo.toast(msg, "err"); return;
            }
            const reader = res.body.getReader(); const dec = new TextDecoder();
            let buf = "", done = null;
            for (;;) {
              const { value, done: rdone } = await reader.read();
              if (rdone) break;
              buf += dec.decode(value, { stream: true });
              let idx;
              while ((idx = buf.indexOf("\\\\n\\\\n")) >= 0) {
                const raw = buf.slice(0, idx); buf = buf.slice(idx + 2);
                const line = raw.replace(/^data:\\\\s?/, "");
                if (!line) continue;
                let ev; try { ev = JSON.parse(line); } catch (e) { continue; }
                if (ev.type === "step") { streamed = true; thinking.setStep(ev.label); }
                else if (ev.type === "done") done = ev;
              }
            }
            thinking.stop(); clearAttach();
            if (done) {
              window.bo.pollAgent?.();
              addMsg("a", done.reply, true, done.actions, done.messageId);
              window.__afterReply && window.__afterReply(done.reply);
              const isNew = !sessionId; sessionId = done.sessionId; setLastSession(sessionId); if (isNew) reloadSessions();
              window.bo.refreshRecent?.(); // サイドバー「最近の会話」を更新
              if (done.queued) pollBackgroundResult(sessionId); // 長い処理→バックグラウンド継続。完了で自動反映
            } else {
              addMsg("a", "（応答を受け取れませんでした。もう一度お試しください）");
            }
          } catch (e) {
            thinking.stop();
            if (e && e.name === "AbortError") { addMsg("a", "（停止しました）"); }
            // 接続が確立する前の失敗のみフォールバック（確立後＝サーバ側で既に記録済みのため二重送信しない）。
            else if (!streamed) await sendNonStream(body, btn);
            else window.bo.toast("通信が途切れました。画面を再読込してご確認ください。", "err");
          } finally {
            window.bo.progress?.done?.();
            btn.textContent = btn.dataset.label || "送信"; btn.classList.remove("is-stop"); btn.title = ""; currentAbort = null;
          }
        }
        document.getElementById("new-ses")?.addEventListener("click", () => { sessionId = ""; log.innerHTML = ""; [...document.querySelectorAll(".ses-row")].forEach((r) => r.classList.remove("on")); document.getElementById("msg")?.focus(); });
        document.getElementById("send")?.addEventListener("click", () => { if (currentAbort) { try { currentAbort.abort(); } catch (e) { /* noop */ } } else send(); });
        // マスコット（相棒）からの呼び出し：?greet=1 で相棒が話しかける。
        try { if (new URLSearchParams(location.search).get("greet") === "1" && !log.children.length) addMsg("a", "はい、" + AGENT_NAME + "です。なにか御用ですか？やりたいことを書いてください。"); document.getElementById("msg")?.focus(); } catch (e) { /* noop */ }
        // 会話の復元：?new=1=新規 / ?ses=ID=指定の会話 / 既定=前回の会話（画面遷移して戻っても継続）。
        function restoreConversation() {
          try {
            const sp = new URLSearchParams(location.search);
            if (sp.get("new") === "1") {
              try { localStorage.removeItem("bo_last_session"); } catch (e) { /* noop */ }
              history.replaceState(null, "", "/"); // URLを綺麗に
            } else {
              const sid = sp.get("ses");
              if (sid) openSession(sid);
              else { let last = ""; try { last = localStorage.getItem("bo_last_session") || ""; } catch (e) { /* noop */ } if (last && !log.children.length) openSession(last); }
            }
          } catch (e) { /* noop */ }
        }
        // openSession は window.bo.api を使う。bo は App.astro 側のモジュール（defer実行）で定義されるため、
        // この is:inline（解析時に即実行）からは準備完了を待ってから復元する。
        (function waitBo(tries) {
          if (window.bo && window.bo.api) { restoreConversation(); return; }
          if (tries > 150) { restoreConversation(); return; } // ~4.5s で諦めて試行
          setTimeout(() => waitBo(tries + 1), 30);
        })(0);
        // --- 音声入力（Web Speech API・長時間対応） ---
        const micBtn = document.getElementById("mic-btn");
        function stopRec() {
          voiceOn = false; clearTimeout(silenceTimer);
          if (micBtn) { micBtn.classList.remove("rec"); micBtn.title = "音声入力（もう一度押すと停止）"; }
          if (voiceRec) { voiceRec.onend = null; try { voiceRec.stop(); } catch (e) { /* noop */ } voiceRec = null; }
        }
        function startRec() {
          const ta = document.getElementById("msg"); if (!ta || !SR) return;
          voiceRec = new SR(); voiceRec.lang = "ja-JP"; voiceRec.continuous = true; voiceRec.interimResults = true;
          voiceBase = ta.value ? (ta.value.replace(/\\\\s*$/, "") + " ") : "";
          voiceRec.onresult = (e) => {
            let interim = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
              const r = e.results[i];
              if (r.isFinal) voiceBase += r[0].transcript; else interim += r[0].transcript;
            }
            ta.value = voiceBase + interim;
            ta.scrollTop = ta.scrollHeight;
            // ハンズフリー：発話が少し途切れたら自動送信（無音タイマー）。確定テキストがある時のみ。
            if (handsFree) { clearTimeout(silenceTimer); silenceTimer = setTimeout(() => { if (voiceOn && ta.value.trim()) { stopRec(); send(); } }, 1500); }
          };
          voiceRec.onerror = (e) => {
            if (e.error === "not-allowed" || e.error === "service-not-allowed") { window.bo.toast("マイクの使用が許可されていません。ブラウザの設定をご確認ください。", "err"); stopRec(); }
            // no-speech / network 等は onend での自動再開に任せる
          };
          // 長時間対応：listening 継続中に切れたら自動で再開（無音/規定時間での停止を吸収）。
          voiceRec.onend = () => { if (voiceOn) { try { voiceRec.start(); } catch (e) { /* 再開待ち */ } } };
          try { voiceRec.start(); voiceOn = true; if (micBtn) { micBtn.classList.add("rec"); micBtn.title = "停止"; } window.bo.toast("音声入力を開始しました（もう一度押すと停止）", "info"); }
          catch (e) { /* すでに開始済み */ }
        }
        if (micBtn) {
          if (!SR) { micBtn.style.display = "none"; }
          else { micBtn.addEventListener("click", () => (voiceOn ? stopRec() : startRec())); }
        }
        // --- 音声会話（返信読み上げ＋ハンズフリー） ---
        function stripForSpeech(s) { return String(s || "").replace(/\\\`\\\`\\\`[\\\\s\\\\S]*?\\\`\\\`\\\`/g, "。（コードは省略）。").replace(/\\\\[([^\\\\]]+)\\\\]\\\\([^)]*\\\\)/g, "$1").replace(/https?:\\\\/\\\\/\\\\S+/g, "リンク").replace(/[#*_\\\`>~|]/g, "").replace(/\\\\n{2,}/g, "。").replace(/\\\\s+/g, " ").trim(); }
        function stopSpeak() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* noop */ } if (currentAudio) { try { currentAudio.pause(); } catch (e) { /* noop */ } currentAudio = null; } }
        async function speak(text) {
          const t = stripForSpeech(text).slice(0, 3000); if (!t) return;
          stopSpeak();
          if (ttsMode === "cloud" && TTS_CLOUD_READY) {
            try {
              const res = await fetch("/api/tts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: t }) });
              if (res.ok) {
                const url = URL.createObjectURL(await res.blob());
                await new Promise((resolve) => { const a = new Audio(url); currentAudio = a; a.onended = () => { URL.revokeObjectURL(url); if (currentAudio === a) currentAudio = null; resolve(); }; a.onerror = () => { URL.revokeObjectURL(url); resolve(); }; a.play().catch(() => resolve()); });
                return;
              }
            } catch (e) { /* ブラウザTTSへフォールバック */ }
          }
          if (!window.speechSynthesis) return;
          await new Promise((resolve) => { const u = new SpeechSynthesisUtterance(t); u.lang = "ja-JP"; u.onend = () => resolve(); u.onerror = () => resolve(); window.speechSynthesis.speak(u); });
        }
        // 返信描画後に呼ぶ：読み上げONなら喋り、ハンズフリーなら読み上げ後にマイクを再開＝会話を続ける。
        function afterReply(reply) {
          if (!(readAloudOn || handsFree)) return;
          speak(reply).then(() => { if (handsFree && !currentAbort) startRec(); });
        }
        window.__afterReply = afterReply; // send/sendNonStream から参照
        function refreshVoiceBtns() {
          const tb = document.getElementById("tts-btn"), cb = document.getElementById("conv-btn");
          if (tb) tb.classList.toggle("on", readAloudOn || handsFree);
          if (cb) cb.classList.toggle("on", handsFree);
        }
        document.getElementById("tts-btn")?.addEventListener("click", () => {
          readAloudOn = !readAloudOn; try { localStorage.setItem("bo_tts_on", readAloudOn ? "1" : "0"); } catch (e) { /* noop */ }
          if (!readAloudOn) stopSpeak();
          refreshVoiceBtns();
          window.bo.toast(readAloudOn ? ("返信を読み上げます（" + (ttsMode === "cloud" ? "クラウド音声" : "ブラウザ音声") + "）") : "読み上げをオフにしました", "info");
        });
        if (SR) document.getElementById("conv-btn")?.addEventListener("click", () => {
          handsFree = !handsFree;
          if (handsFree) { readAloudOn = true; try { localStorage.setItem("bo_tts_on", "1"); } catch (e) { /* noop */ } refreshVoiceBtns(); window.bo.toast("音声会話モード：話しかけてください（少し黙ると自動送信→返信を読み上げます）", "info"); startRec(); }
          else { stopRec(); stopSpeak(); refreshVoiceBtns(); window.bo.toast("音声会話モードを終了しました", "info"); }
        });
        else { const cb = document.getElementById("conv-btn"); if (cb) cb.style.display = "none"; }
        refreshVoiceBtns();
        // Enter で送信、Shift+Enter は改行（既定動作のまま）。IME変換確定のEnterは送信しない。
        document.getElementById("msg")?.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
        // 既存セッション行（SSR分）の配線。
        document.querySelectorAll(".ses-row").forEach((row) => {
          const id = row.getAttribute("data-ses");
          row.querySelector(".ses-open")?.addEventListener("click", (e) => { e.preventDefault(); openSession(id); });
          row.querySelector(".ses-del")?.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!(await window.bo.confirm("このチャットセッションを削除しますか？", { confirmLabel: "削除", danger: true, irreversible: true }))) return;
            const rr = await window.bo.api("/api/chat-sessions", { _action: "delete", id }, { btn: e.currentTarget, successMsg: "削除しました" });
            if (rr.ok) { if (id === sessionId) { sessionId = ""; log.innerHTML = ""; } reloadSessions(); }
          });
        });
        // --- スキル管理（管理者のみ要素が存在） ---
        const sk = (b, btn) => window.bo.api("/api/skills", b, { btn });
        document.getElementById("skgen")?.addEventListener("click", async (e) => {
          const request = document.getElementById("skreq").value.trim();
          if (!request) { window.bo.toast("作りたいスキルの要望を入力してください", "err"); return; }
          const r = await sk({ _action: "generate", request }, e.currentTarget);
          if (r.ok) { window.bo.toast("スキル「" + (r.data.name || "") + "」を作成しました（無効状態）"); setTimeout(() => location.reload(), 900); }
        });
        document.getElementById("skadd")?.addEventListener("click", async (e) => {
          const r = await sk({ _action: "create", name: document.getElementById("sname").value, description: document.getElementById("sdesc").value, mode: document.getElementById("smode").value, skill_md: document.getElementById("smd").value }, e.currentTarget);
          if (r.ok) { window.bo.toast("登録しました（無効状態）"); setTimeout(() => location.reload(), 600); }
        });
        document.querySelectorAll("tr[data-sid]").forEach((tr) => {
          const id = tr.dataset.sid;
          tr.querySelector(".sen")?.addEventListener("click", async (e) => { const r = await sk({ _action: "enable", id, enabled: true }, e.target); if (r.ok) setTimeout(() => location.reload(), 500); });
          tr.querySelector(".sdis")?.addEventListener("click", async (e) => { const r = await sk({ _action: "enable", id, enabled: false }, e.target); if (r.ok) setTimeout(() => location.reload(), 500); });
          tr.querySelector(".sdel")?.addEventListener("click", async (e) => { if (await window.bo.confirm("このスキルを削除しますか？", { confirmLabel: "削除", danger: true })) { const r = await sk({ _action: "delete", id }, e.target); if (r.ok) setTimeout(() => location.reload(), 500); } });
        });
        // --- 実行中のバックグラウンドタスク（/api/activity を定期取得） ---
        const TASK_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>';
        async function pollBg() {
          const box = document.getElementById("bg-list"); if (!box) return;
          try {
            const r = await fetch("/api/activity", { headers: { accept: "application/json" } });
            if (!r.ok) return;
            const d = await r.json();
            const tasks = d.tasks || [];
            if (!tasks.length) { box.innerHTML = '<p class="muted task-empty">いま動いているタスクはありません。</p>'; return; }
            const fmtSec = (s) => { s = Math.max(0, s | 0); return s >= 60 ? (Math.floor(s / 60) + "分" + (s % 60) + "秒") : (s + "秒"); };
            box.innerHTML = tasks.map((t) => {
              let detail = (t.status === "running" ? "実行中" : t.status === "planning" ? "計画中" : "待機");
              if (t.kind === "build") {
                const ph = t.total ? ("工程 " + (t.phase || 0) + "/" + t.total) : "計画中";
                detail = ph + "・経過 " + fmtSec(t.elapsedSec || 0);
              }
              return '<div class="task-row"><span class="task-k">' + TASK_SVG + '</span><span class="task-t">' + esc(String(t.label || "処理")) + '</span><span class="task-s">' + esc(detail) + "</span>" + (t.id ? '<button class="btn btn-sm btn-warn bg-stop" data-jid="' + esc(String(t.id)) + '" style="flex:0 0 auto">停止</button>' : "") + "</div>";
            }).join("");
            box.querySelectorAll(".bg-stop").forEach((b) => b.addEventListener("click", async (e) => {
              const jid = e.currentTarget.dataset.jid;
              if (!(await window.bo.confirm("このバックグラウンドの作業を停止しますか？", { confirmLabel: "停止", danger: true }))) return;
              const rr = await window.bo.api("/api/activity", { _action: "cancel", id: jid }, { btn: e.currentTarget, successMsg: "停止しました" });
              if (rr.ok) pollBg();
            }));
          } catch (e) { /* offline */ }
        }
        pollBg(); (window.bo?.every ? window.bo.every(pollBg, 4000) : setInterval(pollBg, 4000));
        // --- スケジュールタスク（定期実行） ---
        const stFreq = document.getElementById("st-freq");
        function syncStFreq() {
          const v = stFreq ? stFreq.value : "daily";
          const dow = document.getElementById("st-dow-wrap"); if (dow) dow.hidden = v !== "weekly";
          const dom = document.getElementById("st-dom-wrap"); if (dom) dom.hidden = v !== "monthly";
        }
        stFreq?.addEventListener("change", syncStFreq); syncStFreq();
        const timeToMin = (v) => { const p = String(v || "09:00").split(":"); const m = (Number(p[0]) * 60) + Number(p[1] || 0); return Number.isFinite(m) ? m : 540; };
        document.getElementById("st-add")?.addEventListener("click", async (e) => {
          const prompt = document.getElementById("st-prompt").value.trim();
          if (!prompt) { window.bo.toast("実行する指示を入力してください", "err"); return; }
          const freq = stFreq.value;
          const body = { _action: "create", prompt, freq, at_min: timeToMin(document.getElementById("st-time").value) };
          if (freq === "weekly") body.dow = Number(document.getElementById("st-dow").value);
          if (freq === "monthly") body.dom = Number(document.getElementById("st-dom").value);
          const r = await window.bo.api("/api/scheduled-tasks", body, { btn: e.currentTarget, successMsg: "定期実行を登録しました" });
          if (r.ok) setTimeout(() => location.reload(), 500);
        });
        document.querySelectorAll("#st-tbody tr[data-stid]").forEach((tr) => {
          const id = tr.dataset.stid;
          tr.querySelector(".st-toggle")?.addEventListener("click", async (e) => {
            const on = e.currentTarget.dataset.on === "1";
            const r = await window.bo.api("/api/scheduled-tasks", { _action: "toggle", id, enabled: on }, { btn: e.currentTarget });
            if (r.ok) setTimeout(() => location.reload(), 400);
          });
          tr.querySelector(".st-del")?.addEventListener("click", async (e) => {
            if (!(await window.bo.confirm("この定期実行を削除しますか？", { confirmLabel: "削除", danger: true }))) return;
            const r = await window.bo.api("/api/scheduled-tasks", { _action: "delete", id }, { btn: e.currentTarget, successMsg: "削除しました" });
            if (r.ok) setTimeout(() => location.reload(), 400);
          });
        });
    })();
  <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/index.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/index.astro";
const $$url = "";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
