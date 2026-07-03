globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
import "./stripe_r-RFTlbb.mjs";
import { a as atLeast } from "./types_BVJxqWI9.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const prerender = false;
const $$Advanced = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Advanced;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const entitlement = await (await import("./client_F4fksau0.mjs")).cachedEntitlement(env);
  const hasPlus = atLeast(entitlement, "plus");
  const hasPro = atLeast(entitlement, "pro");
  const { getAiEngine, getCustomPrompt, getWorkersPaid, getSmartRouting } = await import("./settings_dTyIbTCR.mjs");
  const workersPaid = hasPlus ? await getWorkersPaid(env) : false;
  const { getAutonomyConfig, ghDeviceAvailable } = await import("./autonomy_BR9KrOCt.mjs");
  const auto = hasPro ? await getAutonomyConfig(env) : { on: false, cfToken: false, cfAccount: "", ghToken: false, ghRepo: "" };
  const ghAuto = hasPro && await ghDeviceAvailable(env);
  const engine = hasPlus ? await getAiEngine(env) : "gemini";
  const custom = hasPlus ? await getCustomPrompt(env) : "";
  const smartRouting = hasPlus ? await getSmartRouting(env) : false;
  const { storageMode, maxUploadMb } = await import("./storage_BHLYBEBb.mjs");
  const mode = storageMode(env);
  const curMax = hasPlus ? await maxUploadMb(env) : 5;
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "高度なオプション", "active": "/settings", "data-astro-cid-k62awgq3": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-k62awgq3>高度なオプション</h1> ${!hasPlus && renderTemplate`<div class="card" data-astro-cid-k62awgq3> <div class="banner banner-warn" data-astro-cid-k62awgq3>この機能は <strong data-astro-cid-k62awgq3>Plus 以上</strong>のプランで利用できます。</div> <p class="muted" data-astro-cid-k62awgq3>AIエンジン選択／カスタム指示／KVアップロードサイズ上限／Workers Paid 案内などの高度な設定は、Plus 以上で開放されます。</p> <a class="btn btn-primary" href="/billing" data-astro-cid-k62awgq3>プラン・課金へ</a> </div>`}${hasPlus && renderTemplate`<div class="adv" data-astro-cid-k62awgq3> <p class="muted" data-astro-cid-k62awgq3>見た目（テーマ）は「アプリ → ブランド設定」、APIキーは「外部サービス設定」、メニューの出し入れは「アプリ」から行えます。下のタブで設定の種類を切り替えてください。</p> <div class="adv-tabs" role="tablist" aria-label="高度なオプションの種類" data-astro-cid-k62awgq3> <button type="button" class="adv-tab on" role="tab" data-tab="cloudflare" aria-selected="true" data-astro-cid-k62awgq3>Cloudflare 設定</button> <button type="button" class="adv-tab" role="tab" data-tab="ai" aria-selected="false" data-astro-cid-k62awgq3>AIエンジン設定</button> <button type="button" class="adv-tab" role="tab" data-tab="agent" aria-selected="false" data-astro-cid-k62awgq3>エージェント詳細設定</button> </div>  <section class="adv-panel" data-tab="cloudflare" role="tabpanel" data-astro-cid-k62awgq3> <h2 data-astro-cid-k62awgq3>① ファイル保存を強化（R2・高度モード）</h2> <div class="card" data-astro-cid-k62awgq3> <p class="muted" data-astro-cid-k62awgq3>現在：<strong data-astro-cid-k62awgq3>${mode === "r2" ? "高度モード（R2 有効・1ファイル上限なし）" : "標準モード（KV・上限あり）"}</strong>。R2 を有効化すると、領収書画像・契約書・大きな添付などを本格的に保存できます。</p> ${mode === "r2" ? renderTemplate`<div class="banner banner-info" data-astro-cid-k62awgq3>R2 はすでに有効です（高度モード）。ファイルは上限なしで R2 に保存されます。</div>` : renderTemplate`<div class="steps" data-astro-cid-k62awgq3> <div class="step" data-astro-cid-k62awgq3><span class="step-no" data-astro-cid-k62awgq3>1</span><div class="step-body" data-astro-cid-k62awgq3><strong data-astro-cid-k62awgq3>R2 を開いて支払い方法（カード）を登録</strong><div class="muted small" data-astro-cid-k62awgq3>R2 の有効化に必要です。無料枠内なら課金は発生しません。</div><a class="btn btn-sm btn-primary step-btn" href="https://dash.cloudflare.com/?to=/:account/r2" target="_blank" rel="noopener" data-astro-cid-k62awgq3>Cloudflare R2 を開く ↗</a></div></div> <div class="step" data-astro-cid-k62awgq3><span class="step-no" data-astro-cid-k62awgq3>2</span><div class="step-body" data-astro-cid-k62awgq3><strong data-astro-cid-k62awgq3>バケットを作成</strong><div class="muted small" data-astro-cid-k62awgq3>名前は任意（例 <code data-astro-cid-k62awgq3>baku-office-media</code>）。</div><a class="btn btn-sm btn-ghost step-btn" href="https://developers.cloudflare.com/r2/buckets/" target="_blank" rel="noopener" data-astro-cid-k62awgq3>バケット作成の手順 ↗</a></div></div> <div class="step" data-astro-cid-k62awgq3><span class="step-no" data-astro-cid-k62awgq3>3</span><div class="step-body" data-astro-cid-k62awgq3><strong data-astro-cid-k62awgq3>Worker にバインドを追加</strong><div class="muted small" data-astro-cid-k62awgq3><strong data-astro-cid-k62awgq3>Workers &amp; Pages</strong> → <code data-astro-cid-k62awgq3>baku-office-app</code> → <strong data-astro-cid-k62awgq3>Settings → Bindings → Add → R2 bucket</strong>。変数名は必ず <strong data-astro-cid-k62awgq3><code data-astro-cid-k62awgq3>MEDIA_R2</code></strong>。</div><a class="btn btn-sm btn-ghost step-btn" href="https://dash.cloudflare.com/?to=/:account/workers/services/view/baku-office-app/production/settings" target="_blank" rel="noopener" data-astro-cid-k62awgq3>Worker 設定を開く ↗</a></div></div> <div class="step" data-astro-cid-k62awgq3><span class="step-no" data-astro-cid-k62awgq3>4</span><div class="step-body" data-astro-cid-k62awgq3><strong data-astro-cid-k62awgq3>保存して再デプロイ</strong><div class="muted small" data-astro-cid-k62awgq3>自動的に<strong data-astro-cid-k62awgq3>高度モード（R2）</strong>へ切り替わります（コード変更不要）。</div></div></div> <p class="muted" style="font-size:.8rem;margin-top:.5rem" data-astro-cid-k62awgq3>R2 はカード登録が前提です。使用量に応じた従量課金（無料枠あり）。支払い方法が無効のまま30日経過すると R2 のデータが削除され得ます（標準モードの KV は影響を受けません）。設定はお客様の Cloudflare 操作で、当社は手順案内のみを行います。</p> </div>`} </div> <h2 data-astro-cid-k62awgq3>② Workers Paid（CF有料プラン）への切替</h2> <div class="card" data-astro-cid-k62awgq3> <p class="muted" data-astro-cid-k62awgq3>無料枠では CPU時間・実行時間(waitUntil)・サブリクエスト数 等に上限があり、大きなファイル処理や生成でエラーになることがあります。安定運用には <strong data-astro-cid-k62awgq3>Workers Paid（月$5〜）</strong> への切替がおすすめです。データ・デプロイはそのまま、上限が大幅緩和されます。</p> <div class="steps" data-astro-cid-k62awgq3> <div class="step" data-astro-cid-k62awgq3><span class="step-no" data-astro-cid-k62awgq3>1</span><div class="step-body" data-astro-cid-k62awgq3><strong data-astro-cid-k62awgq3>Cloudflare の Workers プラン画面を開く</strong><a class="btn btn-sm btn-primary step-btn" href="https://dash.cloudflare.com/?to=/:account/workers/plans" target="_blank" rel="noopener" data-astro-cid-k62awgq3>Workers プランを開く ↗</a></div></div> <div class="step" data-astro-cid-k62awgq3><span class="step-no" data-astro-cid-k62awgq3>2</span><div class="step-body" data-astro-cid-k62awgq3><strong data-astro-cid-k62awgq3>「Workers Paid」を選んで切替</strong><div class="muted small" data-astro-cid-k62awgq3>月$5〜。既存のデータ・デプロイには影響しません。</div></div></div> <div class="step" data-astro-cid-k62awgq3><span class="step-no" data-astro-cid-k62awgq3>3</span><div class="step-body" data-astro-cid-k62awgq3><strong data-astro-cid-k62awgq3>下の「Workers Paid を有効化済み」をON</strong><div class="muted small" data-astro-cid-k62awgq3>アプリ側の上限（並列・ホップ・ジョブ）を引き上げます。</div> <label class="wpaid-row" data-astro-cid-k62awgq3><input type="checkbox" id="wpaid"${addAttribute(workersPaid, "checked")} data-astro-cid-k62awgq3> <strong data-astro-cid-k62awgq3>Workers Paid を有効化済み</strong></label> <button class="btn btn-sm btn-primary step-btn" id="saveWpaid" data-astro-cid-k62awgq3>保存</button> </div></div> </div> <p class="muted" style="font-size:.8rem;margin-top:.4rem" data-astro-cid-k62awgq3>現在：<strong data-astro-cid-k62awgq3>${workersPaid ? "Workers Paid 有効（上限拡張）" : "無料枠（上限控えめ）"}</strong>。困ったときは <a href="/diagnostics" data-astro-cid-k62awgq3>診断</a> で稼働状況を確認できます。</p> </div> <h2 data-astro-cid-k62awgq3>③ KVアップロードサイズ上限（標準モード）</h2> <div class="card" data-astro-cid-k62awgq3> <p class="muted" data-astro-cid-k62awgq3>現在：<strong data-astro-cid-k62awgq3>${mode === "r2" ? "高度モード（R2・上限なし）" : `標準モード（KV）・1ファイル上限 ${curMax}MB`}</strong>。KVの値上限は <strong data-astro-cid-k62awgq3>25MiB</strong> までで、既定は安全側の5MB。下で1〜25MBに変更できます（R2有効時はこの上限は無視）。</p> <div class="row" data-astro-cid-k62awgq3><input id="maxmb" type="number" min="1" max="25"${addAttribute(curMax, "value")} style="flex:0 0 120px" data-astro-cid-k62awgq3><button class="btn btn-primary" id="saveMax" style="flex:0 0 auto" data-astro-cid-k62awgq3>上限を保存</button></div> </div> </section>  <section class="adv-panel" data-tab="ai" role="tabpanel" hidden data-astro-cid-k62awgq3> <h2 data-astro-cid-k62awgq3>既定のAIエンジン</h2> <div class="card" data-astro-cid-k62awgq3> <p class="muted" data-astro-cid-k62awgq3>通常の回答に使う既定のエンジンを選びます。<strong data-astro-cid-k62awgq3>APIキーの登録は <a href="/settings/integrations" data-astro-cid-k62awgq3>外部サービス設定</a> で行います</strong>（ここでは既定エンジンの選択のみ）。キーが登録されているエンジンが利用できます。</p> <div class="field" data-astro-cid-k62awgq3><label data-astro-cid-k62awgq3><input type="radio" name="engine" value="gemini"${addAttribute(engine === "gemini", "checked")} data-astro-cid-k62awgq3> Gemini（無料枠・標準）</label></div> <div class="field" data-astro-cid-k62awgq3><label data-astro-cid-k62awgq3><input type="radio" name="engine" value="claude"${addAttribute(engine === "claude", "checked")} data-astro-cid-k62awgq3> Claude（高精度・要APIキー）</label></div> <div class="field" data-astro-cid-k62awgq3><label data-astro-cid-k62awgq3><input type="radio" name="engine" value="openai"${addAttribute(engine === "openai", "checked")} data-astro-cid-k62awgq3> ChatGPT（OpenAI・要APIキー）</label></div> <button class="btn btn-primary" id="saveEngine" data-astro-cid-k62awgq3>既定エンジンを保存</button> </div> <h2 data-astro-cid-k62awgq3>賢い割当（コスト最適化）</h2> <div class="card" data-astro-cid-k62awgq3> <p class="muted" data-astro-cid-k62awgq3>複数のAIを登録しているとき、依頼ごとに最適なAIへ自動で振り分けます（画像→画像対応AI／生成・コード→高性能／雑談→無料・高速）。これは常時有効です。<br data-astro-cid-k62awgq3>このトグルを<strong data-astro-cid-k62awgq3>ON</strong>にすると、判断が曖昧な中程度の依頼を<strong data-astro-cid-k62awgq3>無料AIで一度だけ難易度判定</strong>し、簡単なら無料AIへ回して<strong data-astro-cid-k62awgq3>有料クレジットを節約</strong>します（有料エンジンが既定で、無料AIも登録済みのときだけ＋約0.3〜0.8秒）。</p> <div class="field" data-astro-cid-k62awgq3><label data-astro-cid-k62awgq3><input type="checkbox" id="smartRouting"${addAttribute(smartRouting, "checked")} data-astro-cid-k62awgq3> 賢い割当（曖昧な依頼を無料AIで難易度判定してコスト最適化）</label></div> <button class="btn btn-primary" id="saveSmartRouting" data-astro-cid-k62awgq3>保存</button> </div> <h2 data-astro-cid-k62awgq3>カスタム指示（口調・人格・回答形式）</h2> <div class="card" data-astro-cid-k62awgq3> <p class="muted" data-astro-cid-k62awgq3>AIへ常に追加する指示。例：「丁寧語で簡潔に」「箇条書き中心」「団体名は○○会」。安全制約（破壊操作の確認など）は変更されません。</p> <div class="field" data-astro-cid-k62awgq3><textarea id="customPrompt" rows="4" placeholder="例：回答は敬語で簡潔に。金額は¥表記。専門用語は補足を添える。" data-astro-cid-k62awgq3>${custom}</textarea></div> <button class="btn btn-primary" id="savePrompt" data-astro-cid-k62awgq3>カスタム指示を保存</button> </div> </section>  <section class="adv-panel" data-tab="agent" role="tabpanel" hidden data-astro-cid-k62awgq3> <h2 data-astro-cid-k62awgq3>マルチエージェント（Pro 以上）</h2> ${!hasPro && renderTemplate`<div class="card" data-astro-cid-k62awgq3><p class="muted" data-astro-cid-k62awgq3>複数の専門エージェントを役割分担・並列・バックグラウンドで動かす機能は <strong data-astro-cid-k62awgq3>Pro 以上</strong>で開放されます。<a href="/billing" data-astro-cid-k62awgq3>プラン・課金へ</a></p></div>`} ${hasPro && renderTemplate`<div class="card" data-astro-cid-k62awgq3> <p class="muted" data-astro-cid-k62awgq3>AIチャットが複雑な依頼を<strong data-astro-cid-k62awgq3>役割ごとの子エージェントに委譲（順次/並列）</strong>し、重い処理は<strong data-astro-cid-k62awgq3>バックグラウンド実行</strong>できます。実行規模は Cloudflare の枠に依存します（上限引き上げは「Cloudflare 設定」タブ）。</p> <div class="table-wrap" style="margin-top:.4rem" data-astro-cid-k62awgq3><table data-astro-cid-k62awgq3> <thead data-astro-cid-k62awgq3><tr data-astro-cid-k62awgq3><th data-astro-cid-k62awgq3>項目</th><th data-astro-cid-k62awgq3>無料枠</th><th data-astro-cid-k62awgq3>Workers Paid</th></tr></thead> <tbody data-astro-cid-k62awgq3> <tr data-astro-cid-k62awgq3><td data-astro-cid-k62awgq3>並列エージェント上限</td><td data-astro-cid-k62awgq3>2</td><td data-astro-cid-k62awgq3>5</td></tr> <tr data-astro-cid-k62awgq3><td data-astro-cid-k62awgq3>委譲ホップ上限</td><td data-astro-cid-k62awgq3>4</td><td data-astro-cid-k62awgq3>6</td></tr> <tr data-astro-cid-k62awgq3><td data-astro-cid-k62awgq3>バックグラウンド・ジョブ</td><td data-astro-cid-k62awgq3>小規模（順次・少数）</td><td data-astro-cid-k62awgq3>大きめ・安定</td></tr> <tr data-astro-cid-k62awgq3><td data-astro-cid-k62awgq3>A2A（他団体連携）</td><td colspan="2" class="ctr" data-astro-cid-k62awgq3>Pro 以上（エージェント設定）</td></tr> <tr data-astro-cid-k62awgq3><td data-astro-cid-k62awgq3>目安サブリクエスト/リクエスト</td><td data-astro-cid-k62awgq3>〜50</td><td data-astro-cid-k62awgq3>〜1000</td></tr> </tbody> </table></div> </div>`} <h2 data-astro-cid-k62awgq3>オートパイロット（AIに運用代行を任せる・Pro 以上）</h2> ${!hasPro && renderTemplate`<div class="card" data-astro-cid-k62awgq3><p class="muted" data-astro-cid-k62awgq3>AIに自団体のCloudflare/GitHub運用（破壊的操作を除く）を任せる<strong data-astro-cid-k62awgq3>オートパイロット</strong>は <strong data-astro-cid-k62awgq3>Pro 以上</strong>で開放されます。<a href="/billing" data-astro-cid-k62awgq3>プラン・課金へ</a></p></div>`} ${hasPro && renderTemplate`<div class="card" data-astro-cid-k62awgq3> <div class="banner banner-warn" data-astro-cid-k62awgq3>AIに<strong data-astro-cid-k62awgq3>自団体のサーバー操作</strong>を任せます。許可＝CFのKV/D1作成・一覧・デプロイ、GitHubの読取・ブランチ/PR・非コアコミット。<strong data-astro-cid-k62awgq3>禁止（実行不可）</strong>＝削除・force-push・main直push・課金/権限変更・他団体操作。トークンは暗号化保存（既定OFF・管理者のみ・最小スコープ推奨）。</div> <div class="field" data-astro-cid-k62awgq3><label data-astro-cid-k62awgq3><input type="checkbox" id="autoOn"${addAttribute(auto.on, "checked")} data-astro-cid-k62awgq3> <strong data-astro-cid-k62awgq3>オートパイロットを有効にする</strong></label></div> <h3 style="margin:.6rem 0 .2rem" data-astro-cid-k62awgq3>① Cloudflare 接続</h3> <p class="muted" style="font-size:.85rem" data-astro-cid-k62awgq3>下のボタンで作成ページを開き、テンプレ「<strong data-astro-cid-k62awgq3>Edit Cloudflare Workers</strong>」（または KV/D1/Workers 編集権限）でトークンを作成→貼り付け。<strong data-astro-cid-k62awgq3>アカウントIDは自動検出</strong>します。</p> <div class="row" style="margin-bottom:4px" data-astro-cid-k62awgq3><a class="btn btn-ghost" href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener" style="flex:0 0 auto" data-astro-cid-k62awgq3>CFトークン作成ページを開く</a>${auto.cfToken && renderTemplate`<span class="muted" style="align-self:center" data-astro-cid-k62awgq3>接続済み${auto.cfAccount ? `（acct: ${auto.cfAccount.slice(0, 8)}…）` : ""}</span>`}</div> <div class="row" data-astro-cid-k62awgq3><input id="cfTok" type="password"${addAttribute(auto.cfToken ? "CF APIトークン（設定済み・変更時のみ）" : "CF APIトークンを貼り付け", "placeholder")} style="flex:1" data-astro-cid-k62awgq3><button class="btn btn-primary" id="saveCf" style="flex:0 0 auto" data-astro-cid-k62awgq3>接続</button></div> <h3 style="margin:.8rem 0 .2rem" data-astro-cid-k62awgq3>② GitHub 接続</h3> ${ghAuto ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-k62awgq3": true }, { "default": async ($$result3) => renderTemplate` <p class="muted" style="font-size:.85rem" data-astro-cid-k62awgq3>ボタンを押すと<strong data-astro-cid-k62awgq3>コードが表示</strong>されます。GitHub の認証ページでそのコードを入力して許可するだけで接続できます（トークン作成は不要）。</p> <div class="row" data-astro-cid-k62awgq3><button class="btn btn-primary" id="ghConnect" style="flex:0 0 auto" data-astro-cid-k62awgq3>${auto.ghToken ? "GitHubを再接続" : "GitHubと接続"}</button><span id="ghStat" class="muted" style="align-self:center" data-astro-cid-k62awgq3>${auto.ghToken ? `接続済み${auto.ghRepo ? `（${auto.ghRepo}）` : ""}` : ""}</span></div> <div id="ghCode" class="card" hidden style="margin-top:.4rem;background:var(--surface-3)" data-astro-cid-k62awgq3></div> <div id="ghRepoBox" hidden style="margin-top:.4rem" data-astro-cid-k62awgq3><label class="muted" style="font-size:.85rem" data-astro-cid-k62awgq3>接続するリポジトリ</label><div class="row" data-astro-cid-k62awgq3><select id="ghRepoSel" style="flex:1" data-astro-cid-k62awgq3></select><button class="btn btn-primary" id="ghRepoSave" style="flex:0 0 auto" data-astro-cid-k62awgq3>保存</button></div></div> ` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-k62awgq3": true }, { "default": async ($$result3) => renderTemplate` <p class="muted" style="font-size:.85rem" data-astro-cid-k62awgq3>GitHub トークン（contents / pull_requests 権限）と接続先リポを入力してください。</p> <div class="field" data-astro-cid-k62awgq3><input id="ghTok" type="password"${addAttribute(auto.ghToken ? "GitHub トークン（設定済み・変更時のみ）" : "GitHub トークンを貼り付け", "placeholder")} data-astro-cid-k62awgq3></div> <div class="row" data-astro-cid-k62awgq3><input id="ghRepo"${addAttribute(auto.ghRepo, "value")} placeholder="owner/repo（例 your-org/baku-office-app）" style="flex:1" data-astro-cid-k62awgq3><button class="btn btn-primary" id="saveGh" style="flex:0 0 auto" data-astro-cid-k62awgq3>接続</button></div> ` })}`} <p class="muted" style="font-size:.8rem;margin-top:.6rem" data-astro-cid-k62awgq3>接続後、AIチャット（管理者）から「KVを作って」「○○を直すPRを出して」等を依頼できます。重要操作は実行前にAIが確認します。</p> </div>`} </section> </div>`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template([`<script data-astro-rerun>
    (function () {
      // 種類タブ（Cloudflare / AIエンジン / エージェント）。ハッシュ深リンク対応。
      (function () {
        const tabs = Array.prototype.slice.call(document.querySelectorAll(".adv-tab"));
        const panels = Array.prototype.slice.call(document.querySelectorAll(".adv-panel"));
        if (tabs.length) {
          const show = (t) => {
            tabs.forEach((x) => { const on = x.dataset.tab === t; x.classList.toggle("on", on); x.setAttribute("aria-selected", on ? "true" : "false"); });
            panels.forEach((p) => { p.hidden = p.dataset.tab !== t; });
          };
          tabs.forEach((x) => x.addEventListener("click", () => { show(x.dataset.tab); try { history.replaceState(null, "", "#" + x.dataset.tab); } catch (e) { /* noop */ } }));
          const init = (location.hash || "").replace("#", "");
          show(tabs.some((x) => x.dataset.tab === init) ? init : "cloudflare");
        }
      })();
      // 既定エンジンの保存（APIキーはここでは扱わない＝外部サービス設定で登録・項目1）。
      document.getElementById("saveEngine")?.addEventListener("click", async (e) => {
        const engine = document.querySelector('input[name="engine"]:checked').value;
        const r = await window.bo.api("/api/settings", { _action: "ai_engine", engine }, { btn: e.currentTarget, successMsg: "既定エンジンを保存しました" });
        if (r.ok) setTimeout(() => location.reload(), 600);
      });
      document.getElementById("saveSmartRouting")?.addEventListener("click", async (e) => {
        const on = !!document.getElementById("smartRouting")?.checked;
        await window.bo.api("/api/settings", { _action: "smart_routing", on }, { btn: e.currentTarget, successMsg: on ? "賢い割当をオンにしました" : "賢い割当をオフにしました" });
      });
      document.getElementById("savePrompt")?.addEventListener("click", async (e) => {
        const prompt = document.getElementById("customPrompt").value;
        await window.bo.api("/api/settings", { _action: "custom_prompt", prompt }, { btn: e.currentTarget, successMsg: "カスタム指示を保存しました" });
      });
      document.getElementById("saveMax")?.addEventListener("click", async (e) => { const v = document.getElementById("maxmb").value; const r = await window.bo.api("/api/settings", { _action: "max_upload", mb: Number(v) }, { btn: e.currentTarget, successMsg: "上限を保存しました" }); if (r.ok) setTimeout(() => location.reload(), 600); });
      document.getElementById("saveWpaid")?.addEventListener("click", async (e) => { const workersPaid = document.getElementById("wpaid").checked; const r = await window.bo.api("/api/settings", { _action: "workers_paid", workersPaid }, { btn: e.currentTarget, successMsg: "保存しました" }); if (r.ok) setTimeout(() => location.reload(), 600); });
      // オートパイロット：有効トグル
      document.getElementById("autoOn")?.addEventListener("change", async (e) => {
        const box = e.currentTarget; // await を挟むと change の currentTarget は null になるため退避。
        const on = box.checked;
        // 有効化はAIへの運用代行委任＝影響が大きいため確認を挟む（無効化は即時）。
        if (on && !(await window.bo.confirm("オートパイロットを有効にすると、AIが自団体のCloudflare/GitHub運用（破壊的操作を除く）を自動実行します。よろしいですか？", { confirmLabel: "有効にする", danger: true, auditHref: "/diagnostics" }))) { box.checked = false; return; }
        await window.bo.api("/api/settings", { _action: "autonomy_toggle", on }, { btn: box, successMsg: on ? "オートパイロットを有効化" : "無効化しました" });
      });
      // CF：トークン貼付→アカウント自動検出
      document.getElementById("saveCf")?.addEventListener("click", async (e) => {
        const cfToken = document.getElementById("cfTok").value.trim();
        if (!cfToken) { window.bo.toast("CFトークンを貼り付けてください", "err"); return; }
        const r = await window.bo.api("/api/settings", { _action: "autonomy_config", cfToken }, { btn: e.currentTarget, successMsg: "Cloudflareに接続しました（アカウント自動検出）" });
        if (r.ok) setTimeout(() => location.reload(), 700);
      });
      // GitHub 手動接続（device flow未設定時）
      document.getElementById("saveGh")?.addEventListener("click", async (e) => {
        const ghToken = document.getElementById("ghTok").value.trim();
        const ghRepo = document.getElementById("ghRepo").value.trim();
        const cfg = { _action: "autonomy_config", ghRepo };
        if (ghToken) cfg.ghToken = ghToken;
        const r = await window.bo.api("/api/settings", cfg, { btn: e.currentTarget, successMsg: "GitHubに接続しました" });
        if (r.ok) setTimeout(() => location.reload(), 700);
      });
      // GitHub デバイスフロー接続
      const ghBtn = document.getElementById("ghConnect");
      if (ghBtn) ghBtn.addEventListener("click", async (e) => {
        const s = await window.bo.api("/api/autopilot", { _action: "gh_start" }, { btn: e.currentTarget, successMsg: null });
        if (!s.ok || !s.data.ok) { window.bo.toast(s.data?.error || "開始に失敗", "err"); return; }
        const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
        const box = document.getElementById("ghCode");
        box.hidden = false;
        const vuri = /^https:\\/\\//.test(s.data.verification_uri || "") ? s.data.verification_uri : "#";
        box.innerHTML = 'GitHubで <a href="' + esc(vuri) + '" target="_blank" rel="noopener"><strong>認証ページ</strong></a> を開き、コード <strong style="font-size:1.1rem">' + esc(s.data.user_code) + '</strong> を入力して許可してください。<div class="muted" style="margin-top:4px">承認を待っています…</div>';
        const interval = (s.data.interval || 5) * 1000;
        const deviceCode = s.data.device_code;
        const poll = async () => {
          const p = await window.bo.api("/api/autopilot", { _action: "gh_poll", deviceCode }, { successMsg: null });
          if (p.ok && p.data.ok) {
            box.innerHTML = '<span class="ok" style="color:#1f7a4d">GitHubに接続しました。</span>';
            // リポ自動取得→選択
            const rr = await window.bo.api("/api/autopilot", { _action: "gh_repos" }, { successMsg: null });
            const repos = (rr.ok && rr.data.repos) || [];
            const rb = document.getElementById("ghRepoBox"); const sel = document.getElementById("ghRepoSel");
            sel.innerHTML = repos.map((x) => '<option value="' + esc(x) + '">' + esc(x) + "</option>").join("") || '<option value="">（リポが見つかりません）</option>';
            rb.hidden = false;
            return;
          }
          if (p.ok && p.data.pending) { setTimeout(poll, interval); return; }
          box.innerHTML = '<span style="color:#c0392b">接続に失敗：' + esc(p.data?.error) + "</span>";
        };
        setTimeout(poll, interval);
      });
      document.getElementById("ghRepoSave")?.addEventListener("click", async (e) => {
        const repo = document.getElementById("ghRepoSel").value;
        if (!repo) { window.bo.toast("リポジトリを選択", "err"); return; }
        const r = await window.bo.api("/api/autopilot", { _action: "set_repo", repo }, { btn: e.currentTarget, successMsg: "接続先リポを保存しました" });
        if (r.ok) setTimeout(() => location.reload(), 600);
      });
    })();
  <\/script>`], [`<script data-astro-rerun>
    (function () {
      // 種類タブ（Cloudflare / AIエンジン / エージェント）。ハッシュ深リンク対応。
      (function () {
        const tabs = Array.prototype.slice.call(document.querySelectorAll(".adv-tab"));
        const panels = Array.prototype.slice.call(document.querySelectorAll(".adv-panel"));
        if (tabs.length) {
          const show = (t) => {
            tabs.forEach((x) => { const on = x.dataset.tab === t; x.classList.toggle("on", on); x.setAttribute("aria-selected", on ? "true" : "false"); });
            panels.forEach((p) => { p.hidden = p.dataset.tab !== t; });
          };
          tabs.forEach((x) => x.addEventListener("click", () => { show(x.dataset.tab); try { history.replaceState(null, "", "#" + x.dataset.tab); } catch (e) { /* noop */ } }));
          const init = (location.hash || "").replace("#", "");
          show(tabs.some((x) => x.dataset.tab === init) ? init : "cloudflare");
        }
      })();
      // 既定エンジンの保存（APIキーはここでは扱わない＝外部サービス設定で登録・項目1）。
      document.getElementById("saveEngine")?.addEventListener("click", async (e) => {
        const engine = document.querySelector('input[name="engine"]:checked').value;
        const r = await window.bo.api("/api/settings", { _action: "ai_engine", engine }, { btn: e.currentTarget, successMsg: "既定エンジンを保存しました" });
        if (r.ok) setTimeout(() => location.reload(), 600);
      });
      document.getElementById("saveSmartRouting")?.addEventListener("click", async (e) => {
        const on = !!document.getElementById("smartRouting")?.checked;
        await window.bo.api("/api/settings", { _action: "smart_routing", on }, { btn: e.currentTarget, successMsg: on ? "賢い割当をオンにしました" : "賢い割当をオフにしました" });
      });
      document.getElementById("savePrompt")?.addEventListener("click", async (e) => {
        const prompt = document.getElementById("customPrompt").value;
        await window.bo.api("/api/settings", { _action: "custom_prompt", prompt }, { btn: e.currentTarget, successMsg: "カスタム指示を保存しました" });
      });
      document.getElementById("saveMax")?.addEventListener("click", async (e) => { const v = document.getElementById("maxmb").value; const r = await window.bo.api("/api/settings", { _action: "max_upload", mb: Number(v) }, { btn: e.currentTarget, successMsg: "上限を保存しました" }); if (r.ok) setTimeout(() => location.reload(), 600); });
      document.getElementById("saveWpaid")?.addEventListener("click", async (e) => { const workersPaid = document.getElementById("wpaid").checked; const r = await window.bo.api("/api/settings", { _action: "workers_paid", workersPaid }, { btn: e.currentTarget, successMsg: "保存しました" }); if (r.ok) setTimeout(() => location.reload(), 600); });
      // オートパイロット：有効トグル
      document.getElementById("autoOn")?.addEventListener("change", async (e) => {
        const box = e.currentTarget; // await を挟むと change の currentTarget は null になるため退避。
        const on = box.checked;
        // 有効化はAIへの運用代行委任＝影響が大きいため確認を挟む（無効化は即時）。
        if (on && !(await window.bo.confirm("オートパイロットを有効にすると、AIが自団体のCloudflare/GitHub運用（破壊的操作を除く）を自動実行します。よろしいですか？", { confirmLabel: "有効にする", danger: true, auditHref: "/diagnostics" }))) { box.checked = false; return; }
        await window.bo.api("/api/settings", { _action: "autonomy_toggle", on }, { btn: box, successMsg: on ? "オートパイロットを有効化" : "無効化しました" });
      });
      // CF：トークン貼付→アカウント自動検出
      document.getElementById("saveCf")?.addEventListener("click", async (e) => {
        const cfToken = document.getElementById("cfTok").value.trim();
        if (!cfToken) { window.bo.toast("CFトークンを貼り付けてください", "err"); return; }
        const r = await window.bo.api("/api/settings", { _action: "autonomy_config", cfToken }, { btn: e.currentTarget, successMsg: "Cloudflareに接続しました（アカウント自動検出）" });
        if (r.ok) setTimeout(() => location.reload(), 700);
      });
      // GitHub 手動接続（device flow未設定時）
      document.getElementById("saveGh")?.addEventListener("click", async (e) => {
        const ghToken = document.getElementById("ghTok").value.trim();
        const ghRepo = document.getElementById("ghRepo").value.trim();
        const cfg = { _action: "autonomy_config", ghRepo };
        if (ghToken) cfg.ghToken = ghToken;
        const r = await window.bo.api("/api/settings", cfg, { btn: e.currentTarget, successMsg: "GitHubに接続しました" });
        if (r.ok) setTimeout(() => location.reload(), 700);
      });
      // GitHub デバイスフロー接続
      const ghBtn = document.getElementById("ghConnect");
      if (ghBtn) ghBtn.addEventListener("click", async (e) => {
        const s = await window.bo.api("/api/autopilot", { _action: "gh_start" }, { btn: e.currentTarget, successMsg: null });
        if (!s.ok || !s.data.ok) { window.bo.toast(s.data?.error || "開始に失敗", "err"); return; }
        const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
        const box = document.getElementById("ghCode");
        box.hidden = false;
        const vuri = /^https:\\\\/\\\\//.test(s.data.verification_uri || "") ? s.data.verification_uri : "#";
        box.innerHTML = 'GitHubで <a href="' + esc(vuri) + '" target="_blank" rel="noopener"><strong>認証ページ</strong></a> を開き、コード <strong style="font-size:1.1rem">' + esc(s.data.user_code) + '</strong> を入力して許可してください。<div class="muted" style="margin-top:4px">承認を待っています…</div>';
        const interval = (s.data.interval || 5) * 1000;
        const deviceCode = s.data.device_code;
        const poll = async () => {
          const p = await window.bo.api("/api/autopilot", { _action: "gh_poll", deviceCode }, { successMsg: null });
          if (p.ok && p.data.ok) {
            box.innerHTML = '<span class="ok" style="color:#1f7a4d">GitHubに接続しました。</span>';
            // リポ自動取得→選択
            const rr = await window.bo.api("/api/autopilot", { _action: "gh_repos" }, { successMsg: null });
            const repos = (rr.ok && rr.data.repos) || [];
            const rb = document.getElementById("ghRepoBox"); const sel = document.getElementById("ghRepoSel");
            sel.innerHTML = repos.map((x) => '<option value="' + esc(x) + '">' + esc(x) + "</option>").join("") || '<option value="">（リポが見つかりません）</option>';
            rb.hidden = false;
            return;
          }
          if (p.ok && p.data.pending) { setTimeout(poll, interval); return; }
          box.innerHTML = '<span style="color:#c0392b">接続に失敗：' + esc(p.data?.error) + "</span>";
        };
        setTimeout(poll, interval);
      });
      document.getElementById("ghRepoSave")?.addEventListener("click", async (e) => {
        const repo = document.getElementById("ghRepoSel").value;
        if (!repo) { window.bo.toast("リポジトリを選択", "err"); return; }
        const r = await window.bo.api("/api/autopilot", { _action: "set_repo", repo }, { btn: e.currentTarget, successMsg: "接続先リポを保存しました" });
        if (r.ok) setTimeout(() => location.reload(), 600);
      });
    })();
  <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/advanced.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/advanced.astro";
const $$url = "/settings/advanced";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Advanced,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
