// 第2層更新の「日和見ローダ」（deploy仕様§3.2）：
//   再ビルド時だけ最新バンドルを取りに行く。初回や障害時は同梱版をそのまま使う（＝壊さない）。
//   手順：①同梱 VERSION を読む ②HOST/api/release/latest を取得 ③latest>同梱 のときだけ tarball 取得
//        ④【同梱】release-pubkey.json の Ed25519 公開鍵で署名検証 ⑤検証OK→server/client/migrations/release-pubkey.json＋ローダ自身/postdeploy を置換
//        検証NG／取得失敗／鍵欠落→何もしない（同梱版のまま・fail-closed）。続く wrangler deploy が同一プロジェクトへ反映。
// ホストへは何も送らない（pull のみ＝原則1）。失敗は常に「現行版維持」へフォールバック（原則3）。
//
// §3-2（更新チェーンのトラストアンカー）：検証鍵は配布バンドルに同梱した release-pubkey.json に【ピン留め】する。
//   WHY: 鍵をホストから取得すると tarball/署名/鍵が同一ホスト由来＝ホスト侵害で悪性バンドルが全顧客に展開され得た（TOFU）。
//   ピン留めにより信頼アンカーは「初回 Deploy で取り込んだ配布物」1点に集約され、以後の更新はホストを信頼せず検証できる。
//   鍵ローテーション：新バンドルに新 release-pubkey.json を同梱し【旧鍵で署名】して配る→検証OK後に鍵も置換＝次回から新鍵。
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { createPublicKey, verify as edVerify, randomBytes } from "node:crypto";

const die = (msg) => { if (msg) console.log("[update] skip:", msg); process.exit(0); };

// workers.dev サブドメイン自動登録（新規CFアカウント救済・deploy仕様§2.5）：
//   新規CFアカウントは workers.dev サブドメイン名が未登録だと wrangler deploy が公開URLを発行できず、
//   顧客は「アップロード成功なのにアプリが開けない」状態で詰まる（postdeploy ② が案内する事象）。
//   Workers Builds のビルドトークン（env.CLOUDFLARE_API_TOKEN＝Workers Scripts Write 権限を持つ）で
//   顧客自身のアカウントへ自己登録し、deploy 前に公開URLを発行可能にする＝顧客操作ゼロで点灯。
//   fail-open：トークン非露出／API失敗でも常に握りつぶして継続（postdeploy ② が最終防衛線）。
//   ホストへは何も送らない・トークンはビルド内でのみ使用（原則1）。
async function ensureWorkersDevSubdomain() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  // ビルド環境の env 露出を boolean で1行出力（値は出さない）。自己登録可否の実機判定を兼ねる。
  console.log(`[subdomain] env: HAS_CF_TOKEN=${!!token} HAS_CF_ACCOUNT=${!!process.env.CLOUDFLARE_ACCOUNT_ID}`);
  if (!token) return; // 非露出＝自己登録不可。postdeploy ② の手動案内に委ねる。
  const api = "https://api.cloudflare.com/client/v4";
  const authz = { authorization: "Bearer " + token, "content-type": "application/json" };
  try {
    let acct = process.env.CLOUDFLARE_ACCOUNT_ID;
    if (!acct) {
      const m = await (await fetch(api + "/memberships", { headers: authz })).json();
      acct = m?.result?.[0]?.account?.id;
    }
    if (!acct) { console.log("[subdomain] skip: account 不明"); return; }
    // 既登録なら no-op（冪等）。
    const cur = await (await fetch(`${api}/accounts/${acct}/workers/subdomain`, { headers: authz })).json();
    if (cur?.result?.subdomain) { console.log("[subdomain] 既登録:", cur.result.subdomain); return; }
    // 未登録：bo-<乱数8桁hex> を登録。衝突時は乱数を変えて最大3回（deploy_code 断片は使わない＝URLへのnonce漏えい防止）。
    for (let i = 0; i < 3; i++) {
      const name = "bo-" + randomBytes(4).toString("hex");
      const r = await fetch(`${api}/accounts/${acct}/workers/subdomain`, {
        method: "PUT", headers: authz, body: JSON.stringify({ subdomain: name }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.success !== false) { console.log("[subdomain] 登録成功:", name); return; }
      console.log(`[subdomain] 登録失敗(試行${i + 1}):`, j?.errors?.[0]?.message || r.status);
    }
  } catch (e) {
    console.log("[subdomain] skip(例外):", e?.message || e);
  }
}
// 実デプロイ時のみ実行（CI dry-run は GITHUB_ACTIONS でスキップ）。BO_SKIP_UPDATE とは独立
// ＝版凍結中の顧客でも新規アカウントなら初回に公開URLを発行できるようにする。
if (process.env.GITHUB_ACTIONS !== "true") await ensureWorkersDevSubdomain();

// wrangler の build.command 経由で毎デプロイ走る。配布リポの GitHub Actions CI（wrangler dry-run）では
// 更新を走らせない：GITHUB_ACTIONS は GitHub Actions のみ真＝Cloudflare Workers Builds の実デプロイでは
// 走る。これにより配布 ci.yml を変更せずに済む（ci.yml 変更は publish に workflow スコープを要求するため）。
// 明示抑止用に BO_SKIP_UPDATE=1 も受ける。
if (process.env.GITHUB_ACTIONS === "true" || process.env.BO_SKIP_UPDATE === "1") die("CI/明示指定により更新ローダを抑止");

// 同梱バージョン。
let bundled;
try { bundled = readFileSync("VERSION", "utf8").trim(); } catch { die("VERSION 無し"); }

// ホストURL：report.json（個別リポ）優先、無ければ wrangler.jsonc の HOST_BASE_URL。
let host;
try { host = String(JSON.parse(readFileSync("report.json", "utf8")).host || "").replace(/\/$/, ""); } catch {}
if (!host) {
  try {
    // JSONCの行コメント除去。ただし `://` は消さない：`https://…` の `//` をコメントと誤判定すると
    // HOST_BASE_URL が `"https:` で切れて JSON.parse が失敗し、host 不明＝更新が永久に不成立になっていた
    // （共有リポ顧客は report.json が無く wrangler.jsonc が唯一の host 源）。`:` が先行しない `//` のみ除去。
    const w = readFileSync("wrangler.jsonc", "utf8").replace(/(^|[^:])\/\/.*$/gm, "$1");
    host = (JSON.parse(w).vars?.HOST_BASE_URL || "").replace(/\/$/, "");
  } catch {}
}
if (!host) die("HOST 不明");

const cmp = (a, b) => {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0); }
  return 0;
};

try {
  const latest = await (await fetch(host + "/api/release/latest")).json();
  if (!latest?.version || !latest?.tarballUrl || !latest?.sig) die("最新情報が未配備");
  if (cmp(latest.version, bundled) <= 0) die("同梱が最新（" + bundled + "）");

  const tarball = Buffer.from(await (await fetch(latest.tarballUrl)).arrayBuffer());
  // リリース署名の検証鍵は【同梱】release-pubkey.json に固定（§3-2）。ネットワークからは取得しない＝ホスト侵害で鍵を差し替えられない。
  // 鍵が無い/壊れている場合は検証不能なので更新を行わない（fail-closed＝現行版維持）。
  let jwk;
  try { jwk = JSON.parse(readFileSync("release-pubkey.json", "utf8")); } catch { die("release-pubkey.json 無し/不正＝検証鍵がピン留めされていないため更新しない"); }
  if (!jwk || jwk.kty !== "OKP" || jwk.crv !== "Ed25519" || !jwk.x) die("release-pubkey.json が Ed25519 公開鍵JWK でない");
  const pub = createPublicKey({ key: jwk, format: "jwk" });
  const sig = Buffer.from(latest.sig, "base64");
  if (!edVerify(null, tarball, pub, sig)) die("署名検証NG（同梱鍵と不一致）");

  // 検証OK：tarball を展開し、コード/アセット/マイグレーション＋検証鍵のみ置換（D1/KV/R2 設定には触れない）。
  // release-pubkey.json も置換＝鍵ローテーションを更新で運ぶ（旧鍵で署名された新バンドルが新鍵を運ぶ）。
  const tmp = ".update-tmp";
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  writeFileSync(tmp + "/bundle.tgz", tarball);
  execSync(`tar -xzf ${tmp}/bundle.tgz -C ${tmp}`, { stdio: "ignore" });
  // v13（@astrojs/cloudflare 13）配布構成：コードは server/、静的アセットは client/。
  // 旧 _worker.js/_astro はもう生成されないため、ここを置換対象から外すと自動更新がコードを差し替えられない。
  // ローダ自身（prebuild-update.mjs）と postdeploy.mjs も置換＝更新機構そのものの改善を更新で運ぶ（F5緩和）。
  // 注意：Workers Builds は毎回リポを一時 checkout するため、この自己更新が「残る」のは永続 checkout の
  // 自己ホスト/手動デプロイのみ（主流の一時ビルドでは deploy 反映のみで、次回はリポの版から再 checkout）。
  for (const p of ["server", "client", "migrations", "release-pubkey.json", "prebuild-update.mjs", "postdeploy.mjs"]) {
    const src = `${tmp}/${p}`;
    if (existsSync(src)) { rmSync(p, { recursive: true, force: true }); execSync(`cp -R ${src} ${p}`, { stdio: "ignore" }); }
  }
  if (existsSync(tmp + "/VERSION")) writeFileSync("VERSION", latest.version + "\n");
  rmSync(tmp, { recursive: true, force: true });
  console.log("[update] applied:", bundled, "->", latest.version);
} catch (e) {
  die("取得/検証エラー: " + (e?.message || e));
}
