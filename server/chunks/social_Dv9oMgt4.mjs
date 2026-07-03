globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Social = createComponent(async ($$result, $$props, $$slots) => {
  const { hasApiKey } = await import("./client_F4fksau0.mjs");
  const { saveMark } = await import("./conn-status_DKuiC5qX.mjs");
  const mark = saveMark;
  const status = {
    x: await hasApiKey(env, "x_access_token"),
    fb_id: await hasApiKey(env, "facebook_page_id"),
    fb_token: await hasApiKey(env, "facebook_page_token"),
    ig_id: await hasApiKey(env, "instagram_user_id"),
    ig_token: await hasApiKey(env, "instagram_token"),
    youtube: await hasApiKey(env, "youtube_api_key"),
    tiktok: await hasApiKey(env, "tiktok_access_token")
  };
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "SNS連携", "active": "/settings" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>SNS連携（投稿・閲覧・検索）</h1> <p class="muted">各社の公式API（団体ご自身の開発者アプリの資格情報＝BYOK）で投稿・閲覧・検索します。ログイン用途ではありません。保存値は暗号化して保管し、画面には表示しません（空欄は変更なし）。投稿はチャットの承認モード時に管理者承認を経て送信されます。</p> <div class="card"> <h2>YouTube（検索・閲覧）<span class="muted small">${mark(status.youtube)}</span></h2> <p class="muted small">YouTube Data API v3 のAPIキー。Google Cloud で API を有効化し、APIキーを発行して貼り付けます（検索・動画情報・コメント閲覧に使用。投稿は未対応）。</p> <div class="field"><label>YouTube Data API キー</label><input id="youtube_api_key" type="password" placeholder="AIza…" autocomplete="off"></div> <button class="btn btn-primary save" data-field="youtube_api_key">保存</button> </div> <div class="card"> <h2>X（投稿）<span class="muted small">${mark(status.x)}</span></h2> <p class="muted small">X API v2 のユーザーアクセストークン（<code>tweet.write</code> スコープ）。X の開発者ポータルでアプリを作成し OAuth2 ユーザートークンを取得して貼り付けます。<strong>有料 Basic プラン（約$100/月）以上が必要</strong>です。検索は上位プラン限定のため未対応。</p> <div class="field"><label>X アクセストークン</label><input id="x_access_token" type="password" placeholder="OAuth2 user access token" autocomplete="off"></div> <button class="btn btn-primary save" data-field="x_access_token">保存</button> </div> <div class="card"> <h2>Facebook ページ（投稿）<span class="muted small">${mark(status.fb_id && status.fb_token)}</span></h2> <p class="muted small">Facebook ページへ投稿します。Meta for Developers でアプリを作成し、Page ID と Page アクセストークン（<code>pages_manage_posts</code>）を取得します。投稿権限は App Review が必要な場合があります。</p> <div class="field"><label>Facebook Page ID</label><input id="facebook_page_id" type="text" placeholder="1234567890" autocomplete="off"></div> <button class="btn btn-sm save" data-field="facebook_page_id">Page ID を保存</button> <div class="field" style="margin-top:.6rem"><label>Facebook Page アクセストークン</label><input id="facebook_page_token" type="password" placeholder="EAAB…" autocomplete="off"></div> <button class="btn btn-primary save" data-field="facebook_page_token">トークンを保存</button> </div> <div class="card"> <h2>Instagram（投稿）<span class="muted small">${mark(status.ig_id && status.ig_token)}</span></h2> <p class="muted small">Instagram ビジネス/クリエイターアカウントへ画像投稿します（Facebook ページと連携・Graph API 経由）。IG ユーザーID とアクセストークンが必要。<strong>画像は公開httpsのURL</strong>で渡します（投稿時に image_url を指定）。</p> <div class="field"><label>Instagram ユーザーID</label><input id="instagram_user_id" type="text" placeholder="17841400000000000" autocomplete="off"></div> <button class="btn btn-sm save" data-field="instagram_user_id">ユーザーIDを保存</button> <div class="field" style="margin-top:.6rem"><label>Instagram アクセストークン</label><input id="instagram_token" type="password" placeholder="EAAB…（FB Page トークンと同系）" autocomplete="off"></div> <button class="btn btn-primary save" data-field="instagram_token">トークンを保存</button> </div> <div class="card"> <h2>TikTok（投稿・閲覧）<span class="muted small">${mark(status.tiktok)}</span></h2> <p class="muted small">TikTok の Content Posting API（投稿）と Display API（自社動画の閲覧）。TikTok for Developers でアプリを作成し、ユーザーアクセストークンを取得します。<strong>投稿・データ取得とも用途のアプリ審査が必要</strong>です。投稿は<strong>動画URL（公開httpsの動画）</strong>を取り込む方式です。公開検索は Research API（別途審査）が必要。</p> <div class="field"><label>TikTok アクセストークン</label><input id="tiktok_access_token" type="password" placeholder="act.…" autocomplete="off"></div> <button class="btn btn-primary save" data-field="tiktok_access_token">保存</button> </div> <p class="muted small">使い方：登録後、チャットで「YouTubeで〇〇を検索して」「Xに〇〇と投稿して」「自社のInstagramの直近投稿を見せて」のように依頼できます。<strong>検索</strong>＝YouTube・X（有料）。<strong>閲覧</strong>＝YouTube/X（個別）・Facebook/Instagram/TikTok（自社の直近）。Facebook/Instagram/TikTok の公開全体検索は各社APIが提供していません。投稿は承認モード時に管理者承認を経ます。</p>  `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template(['<script>\n    document.querySelectorAll(".save").forEach((btn) => {\n      btn.addEventListener("click", async (e) => {\n        const field = e.currentTarget.getAttribute("data-field");\n        const inp = document.getElementById(field);\n        const v = (inp?.value || "").trim();\n        if (!v) { window.bo?.toast?.("値を入力してください", "err"); return; }\n        const { ok } = await window.bo.api("/api/keys", { [field]: v }, { btn: e.currentTarget, successMsg: "保存しました" });\n        if (ok && inp) inp.value = "";\n      });\n    });\n  <\/script>']))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/social.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/social.astro";
const $$url = "/settings/social";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Social,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
