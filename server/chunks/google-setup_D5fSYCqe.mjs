globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, F as Fragment, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$GoogleSetup = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$GoogleSetup;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  const isAdmin = ses.role === "admin";
  const { googleConfigured, googleStatus, SCOPE_GROUPS } = await import("./google_DFar0IbF.mjs");
  const configured = isAdmin ? await googleConfigured(env) : false;
  const { getServiceAccountInfo } = await import("./google-sa_3CXcw4Dg.mjs");
  const saInfo = isAdmin ? await getServiceAccountInfo(env).catch(() => null) : null;
  const { driveConfigured } = await import("./drive_BU5bDSNm.mjs");
  const gstatus = isAdmin ? await googleStatus(env).catch(() => null) : null;
  const grantedSet = new Set(gstatus?.groups ?? []);
  const oauthClientReady = isAdmin ? await driveConfigured(env).catch(() => false) : false;
  const oauthConnected = gstatus?.mode === "oauth";
  const saConnected = !!saInfo;
  const orgEmail = isAdmin ? await env.LICENSE.get("org_google_email") ?? "" : "";
  const groupList = Object.keys(SCOPE_GROUPS).map((g) => ({ id: g, label: SCOPE_GROUPS[g].label, restricted: SCOPE_GROUPS[g].restricted, scopes: SCOPE_GROUPS[g].scopes.join(" ") }));
  const CLOUDSHELL_REPO = "https://github.com/baku-team/baku-office-app";
  const cloudshellUrl = "https://shell.cloud.google.com/cloudshell/editor?cloudshell_git_repo=" + encodeURIComponent(CLOUDSHELL_REPO) + "&cloudshell_workspace=cloudshell&cloudshell_tutorial=tutorial.md";
  const { randomId } = await import("./ctx_D9xObGWH.mjs").then((n) => n.J);
  let handoffToken = isAdmin ? Astro2.cookies.get("wifho")?.value ?? "" : "";
  if (isAdmin && !/^[a-f0-9]{8,64}$/.test(handoffToken)) {
    handoffToken = randomId(16);
    if (handoffToken) Astro2.cookies.set("wifho", handoffToken, { path: "/settings/google-setup", maxAge: 1800, sameSite: "lax", secure: true, httpOnly: false });
  }
  if (isAdmin && handoffToken) await env.LICENSE.put(`wifho:${handoffToken}`, "1", { expirationTtl: 1800 }).catch(() => {
  });
  const wifCommand = `WORKER_URL=${Astro2.url.origin} HANDOFF=${handoffToken} bash google-service-account-setup.sh`;
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "Google連携セットアップ", "active": "/settings", "data-astro-cid-v63rqogn": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-v63rqogn>Google 連携セットアップ</h1> ${!isAdmin && renderTemplate`<div class="card" data-astro-cid-v63rqogn><div class="banner banner-warn" data-astro-cid-v63rqogn>この画面は管理者のみ利用できます。</div></div>`}${isAdmin && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`<p style="margin:.2rem 0 .6rem;font-weight:700;font-size:1.02rem" data-astro-cid-v63rqogn>まず、お使いの Google アカウントで選んでください</p> <div class="gpick" data-astro-cid-v63rqogn> <a class="gpick-c gpick-rec" href="#sa-wizard" data-astro-cid-v63rqogn> <div class="gpick-h" data-astro-cid-v63rqogn><span class="gpick-badge ok" data-astro-cid-v63rqogn>おすすめ</span>会社・団体で使っている方</div> <div class="gpick-d" data-astro-cid-v63rqogn>独自ドメインの <strong data-astro-cid-v63rqogn>Google Workspace（有料）</strong>をお使いなら</div> <div class="gpick-pick" data-astro-cid-v63rqogn>→ ① <strong data-astro-cid-v63rqogn>WIF</strong>（この画面の上から）</div> <div class="gpick-why" data-astro-cid-v63rqogn>メンバー全員ぶんをまとめて AI に任せられます。</div> </a> <a class="gpick-c" href="#goauth" data-astro-cid-v63rqogn> <div class="gpick-h" data-astro-cid-v63rqogn><span class="gpick-badge" data-astro-cid-v63rqogn>かんたん</span>個人で使っている方</div> <div class="gpick-d" data-astro-cid-v63rqogn><strong data-astro-cid-v63rqogn>無料の Gmail アカウント</strong>（@gmail.com など）をお使いなら</div> <div class="gpick-pick" data-astro-cid-v63rqogn>→ ② <strong data-astro-cid-v63rqogn>OAuth</strong>（この画面の下から）</div> <div class="gpick-why" data-astro-cid-v63rqogn>ご自身ひとり分のデータを、すぐに連携できます。</div> </a> </div> <p class="muted" style="font-size:.8rem;margin:.1rem 0 .8rem" data-astro-cid-v63rqogn>Gemini／Claude／LINE 等の API キーは <a href="/settings/keys" data-astro-cid-v63rqogn>連携設定（APIキー）</a> です。</p> ${configured ? renderTemplate`<div class="banner banner-ok" data-astro-cid-v63rqogn>Google 連携は設定済みです。<a href="/calendar" data-astro-cid-v63rqogn>カレンダー</a> / <a href="/gmail" data-astro-cid-v63rqogn>Gmail</a> / <a href="/meet" data-astro-cid-v63rqogn>Meet</a> から利用できます。</div>` : renderTemplate`<div class="banner banner-warn" data-astro-cid-v63rqogn>未設定です。下の ① または ② で設定してください。</div>`}<h2 style="margin-top:1.4rem" data-astro-cid-v63rqogn>① 会社・団体向け：Workspace 連携（WIF・キーレス）</h2> <p class="muted" data-astro-cid-v63rqogn>下のステップを<strong data-astro-cid-v63rqogn>上から順に</strong>。<strong data-astro-cid-v63rqogn>Cloud Shell でほぼ自動</strong>、残る手動は管理コンソールでの委任承認1回のみです（鍵は発行しません）。</p> <div data-astro-cid-v63rqogn> <div id="sa-wizard"${addAttribute(saInfo ? "1" : "0", "data-configured")}${addAttribute(handoffToken, "data-handoff")} data-astro-cid-v63rqogn> <section class="wstep" data-step="1" data-astro-cid-v63rqogn> <header class="wstep-h" data-astro-cid-v63rqogn><span class="wstep-n" data-astro-cid-v63rqogn>1</span><span class="wstep-t" data-astro-cid-v63rqogn>Google Cloud で準備（Cloud Shell）</span><span class="wstep-badge" data-astro-cid-v63rqogn></span></header> <div class="wstep-b" data-astro-cid-v63rqogn> <p class="muted" data-astro-cid-v63rqogn>ブラウザ内のターミナル <strong data-astro-cid-v63rqogn>Cloud Shell</strong> で、プロジェクト作成・API有効化・サービスアカウント作成・WIF 設定までを自動で行います（ログイン済み・インストール不要）。</p> <div class="field" data-astro-cid-v63rqogn><label data-astro-cid-v63rqogn>① 実行コマンド（自動でコピーされます）</label><div class="row" data-astro-cid-v63rqogn><input id="wif-cmd" type="text" readonly${addAttribute(wifCommand, "value")} style="flex:1;font-family:monospace;font-size:.78rem" data-astro-cid-v63rqogn><button class="btn" id="copy-wif-cmd" type="button" data-astro-cid-v63rqogn>コピー</button></div><div class="muted small" data-astro-cid-v63rqogn>先頭の <code data-astro-cid-v63rqogn>WORKER_URL</code> はこの画面のURLから自動設定済み。下のボタンで開くと<strong data-astro-cid-v63rqogn>このコマンドが自動でコピー</strong>されます。</div></div> <a class="btn btn-primary" id="open-cloudshell"${addAttribute(cloudshellUrl, "href")} target="_blank" rel="noopener" style="margin-top:.5rem" data-astro-cid-v63rqogn>② コマンドをコピーして Cloud Shell を開く ↗</a> <p class="muted small" style="margin-top:.7rem" data-astro-cid-v63rqogn>開いた後の操作（3つだけ）：</p> <ol class="dwd-steps" data-astro-cid-v63rqogn> <li data-astro-cid-v63rqogn><strong data-astro-cid-v63rqogn>「Authorize（承認）」</strong> をクリック</li> <li data-astro-cid-v63rqogn>ターミナルで <strong data-astro-cid-v63rqogn>Ctrl+V / Cmd+V</strong> で貼り付け（コマンドはコピー済み）</li> <li data-astro-cid-v63rqogn><strong data-astro-cid-v63rqogn>「Enter」キー</strong>を押す（貼り付けただけでは実行されません）</li> <li data-astro-cid-v63rqogn>自動で進み、完了すると <strong data-astro-cid-v63rqogn>WIF設定が自動で baku-office へ送信</strong>されます（コピー不要）</li> <li data-astro-cid-v63rqogn>このタブ（baku-office）に戻ると、下の<strong data-astro-cid-v63rqogn>手順2</strong>に<strong data-astro-cid-v63rqogn>自動入力</strong>されます（入らない場合のみ手動で貼り付け）</li> </ol> <details class="adv" style="margin-top:6px" data-astro-cid-v63rqogn><summary data-astro-cid-v63rqogn>自分の端末の gcloud で実行する場合</summary> <pre style="background:#0f172a;color:#e2e8f0;padding:.8rem;border-radius:8px;overflow:auto;font-size:.8rem" data-astro-cid-v63rqogn><code data-astro-cid-v63rqogn>gcloud auth login
${wifCommand.replace("bash ", "bash scripts/")}</code></pre> </details> <div class="wstep-nav" data-astro-cid-v63rqogn><button class="btn btn-primary" type="button" data-next="2" data-astro-cid-v63rqogn>準備ができた → 次へ</button></div> </div> </section> <section class="wstep" data-step="2" data-astro-cid-v63rqogn> <header class="wstep-h" data-astro-cid-v63rqogn><span class="wstep-n" data-astro-cid-v63rqogn>2</span><span class="wstep-t" data-astro-cid-v63rqogn>WIF設定を登録</span><span class="wstep-badge" data-astro-cid-v63rqogn></span></header> <div class="wstep-b" data-astro-cid-v63rqogn> <p class="muted" data-astro-cid-v63rqogn>Cloud Shell の完了時に <strong data-astro-cid-v63rqogn>WIF設定が自動コピー</strong>されています。下の欄をクリックして貼り付け（Ctrl+V / Cmd+V）してください。</p> <div class="field" data-astro-cid-v63rqogn><label for="sa-wif" data-astro-cid-v63rqogn>WIF設定（JSON）</label><textarea id="sa-wif" rows="3"${addAttribute('{ "sa_email": "...", "client_id": "...", "project_number": "...", "pool": "...", "provider": "..." }', "placeholder")} style="width:100%;font-family:monospace;font-size:.78rem" data-astro-cid-v63rqogn></textarea><div class="muted small" data-astro-cid-v63rqogn>うまく貼れない場合は Cloud Shell 出力の「┌─ … └─」の間の 1 行をコピーしてください。</div></div> <div class="field" data-astro-cid-v63rqogn><label for="sa-subject" data-astro-cid-v63rqogn>代理するユーザーのメール（Workspace）</label><input id="sa-subject" type="email" placeholder="admin@yourdomain.co.jp"${addAttribute(saInfo?.subject ?? orgEmail, "value")} autocomplete="off" data-astro-cid-v63rqogn><div class="muted small" data-astro-cid-v63rqogn>${orgEmail && !saInfo ? `ログイン中の団体アカウント（${orgEmail}）を既定表示しています。別ユーザーを代理させる場合は変更してください。` : "予定/メールを操作する Workspace ユーザーのメール。"}</div></div> <fieldset style="border:1px solid var(--line);border-radius:6px;padding:.5rem .8rem" data-astro-cid-v63rqogn> <legend class="muted" style="font-size:.85rem" data-astro-cid-v63rqogn>利用する機能（委任するスコープ）</legend> ${groupList.map((g) => renderTemplate`<label style="display:block;margin:.2rem 0" data-astro-cid-v63rqogn><input type="checkbox" class="sa-grp"${addAttribute(g.id, "value")}${addAttribute(g.scopes, "data-scopes")} checked data-astro-cid-v63rqogn> ${g.label}</label>`)} </fieldset> <div class="wstep-nav" data-astro-cid-v63rqogn><button class="btn btn-primary" id="sa-go" data-astro-cid-v63rqogn>① 設定を登録</button></div> <div id="sa-result" style="margin-top:.5rem" data-astro-cid-v63rqogn></div> </div> </section> <section class="wstep" data-step="3" data-astro-cid-v63rqogn> <header class="wstep-h" data-astro-cid-v63rqogn><span class="wstep-n" data-astro-cid-v63rqogn>3</span><span class="wstep-t" data-astro-cid-v63rqogn>ドメイン全体の委任を承認</span><span class="wstep-badge" data-astro-cid-v63rqogn></span></header> <div class="wstep-b" data-astro-cid-v63rqogn> <div class="banner banner-warn small" data-astro-cid-v63rqogn>この手順だけは <strong data-astro-cid-v63rqogn>Google Workspace の超管理者</strong> の操作が必要です（Google がセキュリティ上、人による承認を必須にしているため省略できません・反映に1〜2分かかります）。</div> <p class="muted" data-astro-cid-v63rqogn>下の2つの値を使います（右の「コピー」で取得）。</p> <div class="field" data-astro-cid-v63rqogn><label data-astro-cid-v63rqogn>クライアントID</label><div class="row" data-astro-cid-v63rqogn><input id="sa-cid" type="text" readonly${addAttribute(saInfo?.clientId ?? "（手順2を登録すると表示されます）", "value")} style="flex:1;font-family:monospace;font-size:.82rem" data-astro-cid-v63rqogn><button class="btn" id="sa-copy-cid" type="button"${addAttribute(!saInfo, "disabled")} data-astro-cid-v63rqogn>コピー</button></div></div> <div class="field" data-astro-cid-v63rqogn><label data-astro-cid-v63rqogn>OAuth スコープ（カンマ区切り）</label><div class="row" data-astro-cid-v63rqogn><input id="sa-scopes" type="text" readonly value="" style="flex:1;font-family:monospace;font-size:.78rem" data-astro-cid-v63rqogn><button class="btn" id="sa-copy-scopes" type="button" data-astro-cid-v63rqogn>コピー</button></div></div> <a class="btn btn-primary" href="https://admin.google.com/ac/owl/domainwidedelegation" target="_blank" rel="noopener" data-astro-cid-v63rqogn>ドメイン全体の委任の設定を開く ↗</a> <ol class="dwd-steps" data-astro-cid-v63rqogn> <li data-astro-cid-v63rqogn>開いた画面（「<strong data-astro-cid-v63rqogn>API クライアント</strong>」のドメイン全体の委任）で <strong data-astro-cid-v63rqogn>「新しく追加」</strong> をクリック</li> <li data-astro-cid-v63rqogn><strong data-astro-cid-v63rqogn>「クライアント ID」</strong> 欄に、上の<strong data-astro-cid-v63rqogn>クライアントID</strong>を貼り付け</li> <li data-astro-cid-v63rqogn><strong data-astro-cid-v63rqogn>「OAuth スコープ（カンマ区切り）」</strong> 欄に、上の<strong data-astro-cid-v63rqogn>スコープ</strong>を貼り付け</li> <li data-astro-cid-v63rqogn><strong data-astro-cid-v63rqogn>「承認」</strong>（または「Authorize」）をクリック</li> <li data-astro-cid-v63rqogn>一覧に追加されれば完了（反映まで1〜2分待つことがあります）</li> </ol> <div class="wstep-nav" data-astro-cid-v63rqogn><button class="btn btn-primary" type="button" data-next="4" data-astro-cid-v63rqogn>承認した → 次へ</button></div> </div> </section> <section class="wstep" data-step="4" data-astro-cid-v63rqogn> <header class="wstep-h" data-astro-cid-v63rqogn><span class="wstep-n" data-astro-cid-v63rqogn>4</span><span class="wstep-t" data-astro-cid-v63rqogn>連携を確認</span><span class="wstep-badge" data-astro-cid-v63rqogn></span></header> <div class="wstep-b" data-astro-cid-v63rqogn> <p class="muted" data-astro-cid-v63rqogn>承認が反映されたら、下のボタンで実際に接続できるかを確認します（手順3の承認直後は1〜2分かかることがあります）。</p> <button class="btn btn-primary" id="sa-test" data-astro-cid-v63rqogn>② 連携を確認</button> <div id="sa-test-result" style="margin-top:.5rem" data-astro-cid-v63rqogn></div> <div class="row" style="margin-top:1rem" data-astro-cid-v63rqogn><button class="btn btn-ghost" id="sa-disconnect" type="button"${addAttribute(!saInfo, "hidden")} data-astro-cid-v63rqogn>連携を解除</button><button class="btn btn-ghost" id="sa-restart" type="button" data-astro-cid-v63rqogn>最初から設定し直す</button></div> </div> </section> </div> </div> <h2 id="goauth" style="margin-top:1.8rem" data-astro-cid-v63rqogn>② 個人向け：Google アカウントで連携（OAuth）</h2> <p class="muted" data-astro-cid-v63rqogn>Workspace を使わない／Cloud Shell が難しい場合の<strong data-astro-cid-v63rqogn>代替</strong>。<strong data-astro-cid-v63rqogn>連携した本人ひとり分</strong>の カレンダー／Meet／ドライブ／Gmail を扱えます（団体全員の横断管理が要るなら上の WIF を使ってください）。</p> <details class="adv" style="margin:.4rem 0 .8rem" data-astro-cid-v63rqogn><summary data-astro-cid-v63rqogn>WIF と OAuth の違い（詳しく）</summary> <div class="gcmp" style="margin-top:.5rem" data-astro-cid-v63rqogn> <table class="gcmp-t" data-astro-cid-v63rqogn> <thead data-astro-cid-v63rqogn><tr data-astro-cid-v63rqogn><th data-astro-cid-v63rqogn></th><th data-astro-cid-v63rqogn>① WIF<span class="gcmp-tag ok" data-astro-cid-v63rqogn>基本</span></th><th data-astro-cid-v63rqogn>② OAuth<span class="gcmp-tag" data-astro-cid-v63rqogn>代替</span></th></tr></thead> <tbody data-astro-cid-v63rqogn> <tr data-astro-cid-v63rqogn><th data-astro-cid-v63rqogn>扱える範囲</th><td data-astro-cid-v63rqogn>団体メンバー<strong data-astro-cid-v63rqogn>全員</strong>を代理操作</td><td data-astro-cid-v63rqogn>連携した<strong data-astro-cid-v63rqogn>本人1人</strong>のみ</td></tr> <tr data-astro-cid-v63rqogn><th data-astro-cid-v63rqogn>メンバー増加</th><td data-astro-cid-v63rqogn>追加設定ゼロ（自動で対象）</td><td data-astro-cid-v63rqogn>1人ずつ個別に連携が必要</td></tr> <tr data-astro-cid-v63rqogn><th data-astro-cid-v63rqogn>向く用途</th><td data-astro-cid-v63rqogn>団体横断の自動化に最適</td><td data-astro-cid-v63rqogn>個人・単一アカウント向き</td></tr> <tr data-astro-cid-v63rqogn><th data-astro-cid-v63rqogn>初期設定</th><td data-astro-cid-v63rqogn>Cloud Shell＋委任承認（1回）</td><td data-astro-cid-v63rqogn>OAuthクライアント作成＋同意</td></tr> <tr data-astro-cid-v63rqogn><th data-astro-cid-v63rqogn>必要な権限</th><td data-astro-cid-v63rqogn>Workspace＋特権管理者</td><td data-astro-cid-v63rqogn>個人Gmailでも可</td></tr> <tr data-astro-cid-v63rqogn><th data-astro-cid-v63rqogn>Google審査</th><td data-astro-cid-v63rqogn>不要</td><td data-astro-cid-v63rqogn>Gmail/ドライブは審査対象（同意画面「内部」で不要）</td></tr> </tbody> </table> </div> </details> ${oauthConnected ? renderTemplate`<div class="banner banner-ok" data-astro-cid-v63rqogn>
OAuth で連携済みです（許可済み：${(gstatus?.groups ?? []).map((g) => SCOPE_GROUPS[g]?.label ?? g).join("、") || "なし"}）。各機能は <a href="/calendar" data-astro-cid-v63rqogn>カレンダー</a> / <a href="/meet" data-astro-cid-v63rqogn>Meet</a> / <a href="/import" data-astro-cid-v63rqogn>取り込み</a> から利用できます。下で機能を選び直して<strong data-astro-cid-v63rqogn>「この内容で連携」</strong>を押すと、許可を追加できます。
</div>` : saConnected ? renderTemplate`<div class="banner banner-info" data-astro-cid-v63rqogn>すでに上の <strong data-astro-cid-v63rqogn>Workspace 連携（WIF）が有効</strong>です。OAuth での連携は不要ですが、Workspace を使わない構成に切り替えたい場合のみ、下から連携できます。</div>` : null}${!oauthClientReady ? renderTemplate`<div class="banner banner-warn" data-astro-cid-v63rqogn>
先に <strong data-astro-cid-v63rqogn>OAuth クライアントID／シークレット</strong>を <a href="/settings/keys" data-astro-cid-v63rqogn>連携設定（APIキー）</a> で登録してください（Google Cloud の「APIとサービス → 認証情報」で作成。リダイレクトURIは <code data-astro-cid-v63rqogn>${Astro2.url.origin}/api/google/callback</code>）。
</div>` : renderTemplate`<div id="goauth-card" class="card" style="margin-top:.6rem" data-astro-cid-v63rqogn> <p style="margin:0 0 .5rem;font-weight:600" data-astro-cid-v63rqogn>連携する機能を選択<span class="muted" style="font-weight:400;font-size:.8rem" data-astro-cid-v63rqogn>（「審査対象」はGoogle審査が必要。同意画面「内部」なら不要）</span></p> <div class="oauth-groups" data-astro-cid-v63rqogn> ${groupList.map((g) => renderTemplate`<label class="oauth-g" data-astro-cid-v63rqogn><input type="checkbox" name="goauth-g"${addAttribute(g.id, "value")}${addAttribute(g.id === "calendar" || g.id === "meet" || grantedSet.has(g.id), "checked")} data-astro-cid-v63rqogn> <span data-astro-cid-v63rqogn>${g.label}${g.restricted && renderTemplate`<span class="gcmp-tag warn" data-astro-cid-v63rqogn>審査対象</span>`}</span></label>`)} </div> <div class="row" style="margin-top:.7rem" data-astro-cid-v63rqogn> <button class="btn btn-primary" id="goauth-go" type="button" data-astro-cid-v63rqogn>この内容で連携</button> ${oauthConnected && renderTemplate`<button class="btn" id="goauth-off" type="button" data-astro-cid-v63rqogn>連携を解除</button>`} </div> <p class="muted" style="margin:.5rem 0 0;font-size:.8rem" data-astro-cid-v63rqogn>「連携」を押すと Google の同意画面に移動します。同意後この画面に戻ります。</p> </div>`}` })}`} `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template([`<script data-astro-rerun>
        // サービスアカウント(DWD)連携：上から順に進めるウィザード。
        (function () {
          const wiz = document.getElementById("sa-wizard");
          if (!wiz) return;
          wiz.classList.add("js-ready"); // 折りたたみ制御を有効化（未実行時は全表示のまま）
          const steps = [...wiz.querySelectorAll(".wstep")];
          const grps = () => [...document.querySelectorAll(".sa-grp")].filter((c) => c.checked);
          const syncScopes = () => { const el = document.getElementById("sa-scopes"); if (el) el.value = grps().map((c) => c.dataset.scopes).join(" ").split(" ").filter(Boolean).join(", "); };
          document.querySelectorAll(".sa-grp").forEach((c) => c.addEventListener("change", syncScopes));
          syncScopes();

          // ステップ表示制御：active=展開、done=折りたたみ(✓)、locked=淡色。active のみ本文を出す。
          const done = new Set();
          const setStep = (n) => {
            steps.forEach((s) => {
              const k = Number(s.dataset.step);
              s.classList.toggle("active", k === n);
              s.classList.toggle("done", done.has(k) && k !== n);
              s.classList.toggle("locked", k > n && !done.has(k));
              const badge = s.querySelector(".wstep-badge");
              if (badge) badge.textContent = done.has(k) && k !== n ? "✓ 完了" : "";
            });
            steps.find((s) => Number(s.dataset.step) === n)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          };
          // 「次へ」ボタン：現ステップを完了にして指定ステップへ。
          wiz.querySelectorAll("[data-next]").forEach((b) => b.addEventListener("click", () => {
            done.add(Number(b.closest(".wstep").dataset.step)); setStep(Number(b.dataset.next));
          }));
          // 完了済みステップはヘッダクリックで開き直せる。
          steps.forEach((s) => s.querySelector(".wstep-h")?.addEventListener("click", () => {
            const k = Number(s.dataset.step); if (done.has(k)) setStep(k);
          }));

          const resolveWif = () => {
            const raw = (document.getElementById("sa-wif")?.value || "").trim();
            if (!raw) return null;
            let o; try { o = JSON.parse(raw); } catch { return null; }
            const need = ["sa_email", "client_id", "project_number", "pool", "provider"];
            if (need.some((k) => !o || !String(o[k] ?? "").trim())) return null;
            return { sa_email: String(o.sa_email), client_id: String(o.client_id), project_number: String(o.project_number), pool: String(o.pool), provider: String(o.provider) };
          };
          const copy = async (id) => { const t = document.getElementById(id); if (!t) return; try { await navigator.clipboard.writeText(t.value); window.bo?.toast?.("コピーしました"); } catch { t.select(); document.execCommand("copy"); } };
          document.getElementById("copy-wif-cmd")?.addEventListener("click", () => copy("wif-cmd"));
          // 「Cloud Shell を開く」を押した瞬間に実行コマンドを自動コピー（Cloud Shell側はCtrl+V→Enterだけに）。
          // クリック由来のユーザー操作なので clipboard 書き込みが許可される。リンクの遷移(target=_blank)はそのまま継続。
          document.getElementById("open-cloudshell")?.addEventListener("click", () => { copy("wif-cmd"); });
          document.getElementById("sa-copy-cid")?.addEventListener("click", () => copy("sa-cid"));
          document.getElementById("sa-copy-scopes")?.addEventListener("click", () => copy("sa-scopes"));
          const fillSa = (sa) => {
            if (!sa) return;
            const cid = document.getElementById("sa-cid");
            if (cid && sa.clientId) cid.value = sa.clientId;
            document.getElementById("sa-copy-cid")?.removeAttribute("disabled");
            syncScopes();
          };

          // ① 設定を登録（保存のみ。接続テストはしない＝手順4で別途確認）。
          document.getElementById("sa-go")?.addEventListener("click", async (e) => {
            const subject = (document.getElementById("sa-subject")?.value || "").trim();
            const wif = resolveWif();
            if (!wif) { window.bo.toast("WIF設定(JSON)を貼り付けてください（Cloud Shell 出力の1行）", "err"); return; }
            if (!subject) { window.bo.toast("代理するユーザーのメールを入力してください", "err"); return; }
            const groups = grps().map((c) => c.value);
            const r = await window.bo.api("/api/google", { _action: "connect_wif", wif, subject, groups }, { btn: e.currentTarget, successMsg: null });
            if (!r.ok) return; // connect_wif の失敗は bo.api がトースト済み
            fillSa(r.data?.sa);
            document.getElementById("sa-disconnect")?.removeAttribute("hidden");
            const box = document.getElementById("sa-result");
            if (box) box.innerHTML = '<div class="banner banner-ok">設定を登録しました。次は手順3でドメイン全体の委任を承認します。</div>';
            window.bo.toast("設定を登録しました");
            done.add(2); setStep(3);
          });

          // ② 連携を確認（接続テスト）。DWD未承認なら失敗が想定内なので静かに判定し、意味を表示。
          const testSa = async () => {
            try { const r = await fetch("/api/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ _action: "test_sa" }) }); const j = await r.json().catch(() => ({})); return { ok: r.ok && j.ok, error: j.error }; }
            catch (err) { return { ok: false, error: String(err) }; }
          };
          document.getElementById("sa-test")?.addEventListener("click", async (e) => {
            const btn = e.currentTarget; btn.disabled = true;
            const box = document.getElementById("sa-test-result");
            if (box) box.innerHTML = '<div class="muted">確認中…</div>';
            const res = await testSa();
            btn.disabled = false;
            if (res.ok) {
              if (box) box.innerHTML = '<div class="banner banner-ok">連携が完了しました（接続確認に成功）。</div>';
              window.bo.toast("連携が完了しました");
              done.add(4); setStep(4);
            } else if (box) {
              const detail = res.error ? String(res.error).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])).slice(0, 200) : "不明";
              box.innerHTML = '<div class="banner banner-warn">まだ接続できません。手順3の「ドメイン全体の委任」の承認直後は反映に1〜2分かかります。少し待ってからもう一度お試しください。<br><span class="muted" style="font-size:.8rem">詳細：' + detail + '</span></div>';
            }
          });

          document.getElementById("sa-disconnect")?.addEventListener("click", async (e) => {
            if (!(await window.bo.confirm("Google 連携を解除しますか？（WIF設定・代理ユーザー設定を削除します）", { confirmLabel: "解除", danger: true }))) return;
            const r = await window.bo.api("/api/google", { _action: "disconnect" }, { btn: e.currentTarget, successMsg: "解除しました" });
            if (r.ok) setTimeout(() => location.reload(), 700);
          });
          document.getElementById("sa-restart")?.addEventListener("click", () => { done.clear(); setStep(1); });

          // 初期表示：設定済みなら確認(4)から、未設定なら1から。
          if (wiz.dataset.configured === "1") { done.add(1); done.add(2); done.add(3); setStep(4); } else { setStep(1); }

          // 自動ハンドオフ：Cloud Shell のスクリプトが送ってきた WIF設定をポーリングで受け取り、手順2へ自動入力＋進行。
          // ＝端末からのコピーが不要に。届かない場合は従来どおり手動コピー枠（保険）を使えるので行き止まりにならない。
          // configured 状態に関わらずポーリングする（再設定中も受信できるように）。データが来なければ何も起きない。
          const handoff = wiz.dataset.handoff;
          if (handoff) {
            let filled = false;
            const tick = async () => {
              if (filled) return;
              try {
                const r = await fetch("/api/google/wif-handoff?token=" + encodeURIComponent(handoff));
                const j = await r.json().catch(() => ({}));
                const ta = document.getElementById("sa-wif");
                if (j && j.wif && ta) {
                  filled = true; clearInterval(iv);
                  ta.value = JSON.stringify(j.wif);
                  done.add(1); setStep(2);
                  const note = document.createElement("div");
                  note.className = "banner banner-ok"; note.style.marginTop = ".4rem";
                  note.textContent = "Cloud Shell から WIF設定を自動で受け取りました（コピー不要）。代理ユーザーと機能を確認して「① 設定を登録」してください。";
                  ta.closest(".field")?.appendChild(note);
                  window.bo?.toast?.("WIF設定を自動受信しました");
                }
              } catch (e) { /* ネットワーク不調は次の tick で再試行 */ }
            };
            const iv = setInterval(tick, 3000);
            setTimeout(() => clearInterval(iv), 30 * 60 * 1000); // 30分で停止
            tick();
          }

          // 別の方法：個人用OAuth。選んだ機能を groups に渡して同意画面へ。Gmail は対象外（UIに出さない）。
          document.getElementById("goauth-go")?.addEventListener("click", () => {
            const groups = Array.from(document.querySelectorAll('input[name="goauth-g"]:checked')).map((c) => c.value);
            if (!groups.length) { window.bo?.toast?.("連携する機能を1つ以上選んでください"); return; }
            location.href = "/api/google/start?groups=" + encodeURIComponent(groups.join(","));
          });
          document.getElementById("goauth-off")?.addEventListener("click", async (e) => {
            if (!(await window.bo.confirm("OAuth 連携を解除しますか？", { confirmLabel: "解除", danger: true }))) return;
            const r = await window.bo.api("/api/google", { _action: "disconnect" }, { btn: e.currentTarget, successMsg: "解除しました" });
            if (r.ok) setTimeout(() => location.reload(), 700);
          });
        })();
      <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/google-setup.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/google-setup.astro";
const $$url = "/settings/google-setup";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$GoogleSetup,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
