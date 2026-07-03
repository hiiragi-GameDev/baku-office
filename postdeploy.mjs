// 初回デプロイの点灯・失敗案内（deploy仕様§2.4）：
//   deploy.log（wrangler の出力）を解析して分岐する。
//   ①成功（workers.dev 公開URLあり）：report.json（個別リポ）があれば当社ホスト /api/deploy-report へ
//     {code,url} をPOSTして点灯。共有リポ（report.json 無し）は初回 Google ログイン時の捕捉に委ねる（§2.7）。
//   ②workers.dev サブドメイン未登録で公開できていない：顧客へ「あと1手順」を案内し、非0で終了。
//   ③その他の wrangler エラー：成功詐称を避けるため非0で終了。
//   ホストへ送るのは公開URLのみ（原則1：CF/GitHub トークンや Deploy Hook は送らない）。
//
// WHY 非0終了をここで出す：deploy スクリプトは `wrangler deploy 2>&1 | tee deploy.log` のパイプ構成のため
//   wrangler の異常終了コードが tee に吸収され、ビルドが「成功」と誤表示される。deploy.log を後段で判定し、
//   失敗（②③）を Workers Builds に正しく伝播させて「成功したのに公開されない」混乱を防ぐ。
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// workers.dev サブドメイン自動登録（詰まり検知時の救済・deploy仕様§2.5）：
//   ②で「サブドメイン未登録」を検知した時、顧客のビルドトークン（env.CLOUDFLARE_API_TOKEN）で
//   自己登録を試みる。成功すれば顧客は「Retry / 再試行」を1回押すだけで公開される（ダッシュボード操作不要）。
//   prebuild-update.mjs の同名関数と同じ処理を独立ファイルとして再掲する（配布リポは flat 構成で共有 import 不可）。
//   fail-open：トークン非露出／API失敗でも握りつぶし、従来の手動案内へフォールバック。冪等（既登録なら no-op）。
//   ホストへは何も送らない・トークンはビルド内でのみ使用（原則1）。
//   戻り値：'registered'（新規登録）｜'already'（既登録）｜'no-token'（非露出）｜'failed'（失敗）
async function ensureWorkersDevSubdomain() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  // env 露出を boolean で1行出力（値は出さない）。自己登録可否の実機判定を兼ねる。
  console.log(`[subdomain] env: HAS_CF_TOKEN=${!!token} HAS_CF_ACCOUNT=${!!process.env.CLOUDFLARE_ACCOUNT_ID}`);
  if (!token) return "no-token"; // 非露出＝自己登録不可。手動案内へ委ねる。
  const api = "https://api.cloudflare.com/client/v4";
  const authz = { authorization: "Bearer " + token, "content-type": "application/json" };
  try {
    let acct = process.env.CLOUDFLARE_ACCOUNT_ID;
    if (!acct) {
      const m = await (await fetch(api + "/memberships", { headers: authz })).json();
      acct = m?.result?.[0]?.account?.id;
    }
    if (!acct) { console.log("[subdomain] skip: account 不明"); return "failed"; }
    // 既登録なら no-op（冪等）。
    const cur = await (await fetch(`${api}/accounts/${acct}/workers/subdomain`, { headers: authz })).json();
    if (cur?.result?.subdomain) { console.log("[subdomain] 既登録:", cur.result.subdomain); return "already"; }
    // 未登録：bo-<乱数8桁hex> を登録。衝突時は乱数を変えて最大3回。
    for (let i = 0; i < 3; i++) {
      const name = "bo-" + randomBytes(4).toString("hex");
      const r = await fetch(`${api}/accounts/${acct}/workers/subdomain`, {
        method: "PUT", headers: authz, body: JSON.stringify({ subdomain: name }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.success !== false) { console.log("[subdomain] 登録成功:", name); return "registered"; }
      console.log(`[subdomain] 登録失敗(試行${i + 1}):`, j?.errors?.[0]?.message || r.status);
    }
    return "failed";
  } catch (e) {
    console.log("[subdomain] skip(例外):", e?.message || e);
    return "failed";
  }
}

let log = "";
try {
  log = readFileSync("deploy.log", "utf8");
} catch {
  process.exit(0); // deploy.log 無し＝判定不能。従来どおり何もしない。
}

// 公開URL抽出。bindings 表示行（env.HOST_BASE_URL 等・値自体が *.workers.dev）を除外してから探す：
//   これを含めると未公開でも HOST_BASE_URL を拾って「成功」と誤判定するため。
const cleaned = log
  .split("\n")
  .filter((l) => !/env\.[A-Z]|HOST_BASE_URL/.test(l))
  .join("\n");
const url = (cleaned.match(/https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.workers\.dev/i) || [])[0];

// ── ① 成功：公開URLが取れた ─────────────────────────────
if (url) {
  let code, host;
  try {
    const r = JSON.parse(readFileSync("report.json", "utf8"));
    code = r.code;
    host = String(r.host || "").replace(/\/$/, "");
  } catch {}
  if (code && host) {
    for (let i = 0; i < 6; i++) {
      try {
        const r = await fetch(host + "/api/deploy-report", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code, url }),
        });
        if (r.ok) break;
      } catch {}
      await new Promise((s) => setTimeout(s, 10000)); // 初回 523/DNS伝播を吸収
    }
  }
  process.exit(0);
}

// ── ② workers.dev サブドメイン未登録（アカウントに1回だけ必要な初期設定）──
//   wrangler は WARNING/ERROR 双方に "register a workers.dev subdomain" を出す。
//   まず自己登録を試み（救済）、成功時は「Retry 1回」だけで済むよう案内を切り替える。
if (/register a workers\.dev subdomain/i.test(log)) {
  const onboarding =
    (log.match(/https:\/\/dash\.cloudflare\.com\/[a-z0-9]+\/workers\/onboarding/i) || [])[0] ||
    "https://dash.cloudflare.com/?to=/:account/workers/onboarding";
  // 詰まり検知時の救済：ビルドトークンで自己登録を試みる（fail-open）。
  const status = await ensureWorkersDevSubdomain();
  if (status === "registered" || status === "already") {
    // 自動登録できた → ダッシュボード操作は不要。Retry を1回押せば公開される。
    console.error(
      [
        "",
        "==================================================================",
        " あと1手順で公開できます（サブドメインは自動登録済み・所要 約10秒）",
        "------------------------------------------------------------------",
        " アプリのアップロードは完了しました。公開に必要な workers.dev の",
        " サブドメイン名を自動で登録しました。",
        "",
        " このデプロイ画面で「Retry / 再試行」を1回押すだけで公開されます。",
        "  （ダッシュボードでの手動登録は不要です）",
        "==================================================================",
        "",
      ].join("\n"),
    );
  } else {
    // トークン非露出／登録失敗 → 従来どおり手動登録を案内。
    console.error(
      [
        "",
        "==================================================================",
        " あと1手順で公開できます（初回のみ・所要 約30秒）",
        "------------------------------------------------------------------",
        " アプリのアップロードは完了しましたが、Cloudflare アカウントに",
        " workers.dev のサブドメイン名がまだ登録されていないため、公開URLを",
        " 発行できませんでした。",
        "",
        " 次の手順で解決します：",
        "   1) 下記URLを開く",
        "      " + onboarding,
        "   2) 好きなサブドメイン名（例：会社名）を1回だけ登録する",
        "   3) このデプロイ画面で「Retry / 再試行」を押す",
        "",
        " ※ 登録はアカウントにつき1回だけ。次回以降のデプロイ・自動更新では",
        "    この手順は不要です。",
        "==================================================================",
        "",
      ].join("\n"),
    );
  }
  process.exit(1);
}

// ── ③ その他の wrangler 失敗（成功詐称を防ぐ）────────────
if (/✘\s*\[ERROR\]/.test(log)) {
  console.error(
    "[deploy] wrangler がエラーで終了し、公開URLを確認できませんでした。上のログを確認してください。",
  );
  process.exit(1);
}

// URLは無いが明確なエラーも検知できない＝誤検知で正常ビルドを落とさないため 0 終了。
process.exit(0);
