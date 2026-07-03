globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { saveApiKey, getApiKey, hostFetch } from "./client_F4fksau0.mjs";
import { getDeployHook } from "./update_BZb99hDh.mjs";
import { logDiag } from "./diag_CY3PJnOM.mjs";
const KV_ON = "org_autonomy";
const KV_CF_ACCT = "cf_account_id";
const KV_GH_REPO = "gh_repo";
const AUTONOMY_POLICY = "[Autopilot (operating this organization's own Cloudflare/GitHub on its behalf)]\nWhat you can do: list/create CF KV/D1 resources; deploy via a Deploy Hook; read GitHub repos, create branches, commit non-core files, create PRs; merge PRs (only when all CI/checks pass, squash).\nWhat you cannot do (core damage = the tools simply do not exist; never attempt): deleting accounts or production DB/KV, deleting repositories, force-push, committing directly to protected branches such as main, merging with failing checks or conflicts, changing billing/plan/member permissions, disclosing or sending out secrets/tokens, operating on other organizations or tenants.\nFor irreversible or high-impact operations (deploy, resource creation, PR), state the key points before executing and act only when it matches the user's intent.";
async function isAutonomyOn(env) {
  return await env.LICENSE.get(KV_ON) === "true";
}
async function setAutonomy(env, on) {
  await kvPut(env, KV_ON, on ? "true" : "false");
}
async function getAutonomyConfig(env) {
  return {
    on: await isAutonomyOn(env),
    cfToken: !!await getApiKey(env, "cloudflare_token"),
    cfAccount: await env.LICENSE.get(KV_CF_ACCT) ?? "",
    ghToken: !!await getApiKey(env, "github_token"),
    ghRepo: await env.LICENSE.get(KV_GH_REPO) ?? ""
  };
}
async function saveAutonomyConfig(env, a) {
  const out = {};
  if (a.cfToken) {
    await saveApiKey(env, "cloudflare_token", a.cfToken.trim());
    if (!a.cfAccount) {
      const det = await cfDetectAccount(a.cfToken.trim());
      if (det) {
        await kvPut(env, KV_CF_ACCT, det);
        out.cfAccount = det;
      } else out.cfError = "トークンからアカウントを検出できませんでした。権限（Account 読み取り）をご確認ください。";
    }
  }
  if (a.ghToken) await saveApiKey(env, "github_token", a.ghToken.trim());
  if (a.cfAccount) await kvPut(env, KV_CF_ACCT, a.cfAccount.trim());
  if (a.ghRepo !== void 0) await kvPut(env, KV_GH_REPO, a.ghRepo.trim());
  return out;
}
async function cfDetectAccount(token) {
  try {
    const r = await fetch("https://api.cloudflare.com/client/v4/accounts?per_page=1", { headers: { authorization: `Bearer ${token}` } });
    const j = await r.json().catch(() => ({}));
    return j.success && j.result?.[0]?.id ? j.result[0].id : null;
  } catch {
    return null;
  }
}
const GH_SCOPE = "repo";
async function resolveGhClientId(env) {
  if (env.GITHUB_OAUTH_CLIENT_ID) return env.GITHUB_OAUTH_CLIENT_ID;
  const cached = await env.LICENSE.get("gh_client_id");
  if (cached) return cached;
  try {
    const r = await hostFetch(env, "/api/gh-client-id");
    if (r.ok) {
      const j = await r.json();
      if (j.clientId) {
        await kvPut(env, "gh_client_id", j.clientId, { expirationTtl: 86400 });
        return j.clientId;
      }
    }
  } catch {
  }
  return "";
}
async function ghDeviceAvailable(env) {
  return !!await resolveGhClientId(env);
}
async function ghDeviceStart(env) {
  const cid = await resolveGhClientId(env);
  if (!cid) return { ok: false, error: "GitHub接続は未設定です（手動トークンをご利用ください）" };
  try {
    const r = await fetch("https://github.com/login/device/code", { method: "POST", headers: { accept: "application/json", "content-type": "application/json", "user-agent": "baku-office" }, body: JSON.stringify({ client_id: cid, scope: GH_SCOPE }) });
    const j = await r.json().catch(() => ({}));
    if (!j.device_code) return { ok: false, error: "開始に失敗しました" };
    return { ok: true, user_code: j.user_code, verification_uri: j.verification_uri, device_code: j.device_code, interval: j.interval ?? 5 };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
async function ghDevicePoll(env, deviceCode) {
  const cid = await resolveGhClientId(env);
  if (!cid) return { ok: false, error: "未設定" };
  try {
    const r = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { accept: "application/json", "content-type": "application/json", "user-agent": "baku-office" }, body: JSON.stringify({ client_id: cid, device_code: deviceCode, grant_type: "urn:ietf:params:oauth:grant-type:device_code" }) });
    const j = await r.json().catch(() => ({}));
    if (j.access_token) {
      await saveApiKey(env, "github_token", j.access_token);
      return { ok: true };
    }
    if (j.error === "authorization_pending" || j.error === "slow_down") return { ok: false, pending: true };
    return { ok: false, error: j.error || "取得に失敗しました" };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
async function ghListRepos(env) {
  const token = await getApiKey(env, "github_token");
  if (!token) return [];
  try {
    const r = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", { headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "baku-office" } });
    const j = await r.json().catch(() => []);
    return Array.isArray(j) ? j.map((x) => x.full_name) : [];
  } catch {
    return [];
  }
}
async function autonomyReady(env) {
  if (!await isAutonomyOn(env)) return false;
  return !!await getApiKey(env, "cloudflare_token") || !!await getApiKey(env, "github_token");
}
async function cf(env, method, path, body) {
  const token = await getApiKey(env, "cloudflare_token");
  const acct = await env.LICENSE.get(KV_CF_ACCT) ?? "";
  if (!token || !acct) return { ok: false, error: "Cloudflareトークン/アカウントIDが未設定です" };
  try {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acct}${path}`, { method, headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : void 0 });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.success ? { ok: true, result: j.result } : { ok: false, error: j.errors?.map((e) => e.message).join(", ") || `CF ${r.status}` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
async function cfListResources(env) {
  const kv = await cf(env, "GET", "/storage/kv/namespaces?per_page=50");
  const d1 = await cf(env, "GET", "/d1/database?per_page=50");
  const kvs = kv.ok ? kv.result.map((x) => x.title) : [];
  const d1s = d1.ok ? d1.result.map((x) => x.name) : [];
  return `KV: ${kvs.join(", ") || "（なし）"}
D1: ${d1s.join(", ") || "（なし）"}`;
}
async function cfCreateKv(env, title) {
  const r = await cf(env, "POST", "/storage/kv/namespaces", { title });
  return r.ok ? `KV namespace「${title}」を作成しました。` : `作成失敗：${r.error}`;
}
async function cfCreateD1(env, name) {
  const r = await cf(env, "POST", "/d1/database", { name });
  return r.ok ? `D1「${name}」を作成しました。` : `作成失敗：${r.error}`;
}
async function cfDeploy(env) {
  const hook = await getDeployHook(env);
  if (!hook) return "Deploy Hook が未設定です（設定→アプリの更新 で登録してください）。";
  try {
    const r = await fetch(hook, { method: "POST" });
    return r.ok ? "デプロイをトリガーしました。" : `デプロイ失敗（${r.status}）`;
  } catch (e) {
    return `デプロイ失敗：${e.message}`;
  }
}
const CORE_DENY = [/^src\/core\//, /^wrangler/, /^package\.json$/, /^package-lock\.json$/, /^\.github\//, /^migrations\//];
function isCorePath(path) {
  return CORE_DENY.some((re) => re.test(path));
}
async function gh(env, method, path, body) {
  const token = await getApiKey(env, "github_token");
  const repo = await env.LICENSE.get(KV_GH_REPO) ?? "";
  if (!token || !repo) return { ok: false, error: "GitHubトークン/リポジトリ(owner/repo)が未設定です" };
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}${path}`, { method, headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "baku-office", "content-type": "application/json" }, body: body ? JSON.stringify(body) : void 0 });
    const data = await r.json().catch(() => ({}));
    return r.ok ? { ok: true, data } : { ok: false, error: data.message || `GitHub ${r.status}` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
async function defaultBranch(env) {
  const r = await gh(env, "GET", "");
  return r.ok ? r.data.default_branch || "main" : "main";
}
async function ghReadFile(env, path) {
  const r = await gh(env, "GET", `/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`);
  if (!r.ok) return `読取失敗：${r.error}`;
  if (Array.isArray(r.data)) return `（ディレクトリ）${r.data.map((x) => x.name).join(", ")}`;
  try {
    return atob(r.data.content.replace(/\n/g, "")).slice(0, 8e3);
  } catch {
    return "（内容を取得できません）";
  }
}
async function ghCreateBranch(env, name) {
  const base = await defaultBranch(env);
  const ref = await gh(env, "GET", `/git/ref/heads/${base}`);
  if (!ref.ok) return `基点ブランチ取得失敗：${ref.error}`;
  const r = await gh(env, "POST", "/git/refs", { ref: `refs/heads/${name}`, sha: ref.data.object.sha });
  return r.ok ? `ブランチ「${name}」を作成しました。` : `作成失敗：${r.error}`;
}
async function ghCommitFile(env, branch, path, content, message) {
  const base = await defaultBranch(env);
  if (branch === base) return "保護ブランチ（既定ブランチ）への直接コミットは禁止です。新しいブランチを作成し PR で反映してください。";
  if (isCorePath(path)) return `コア領域（${path}）への変更は禁止です。`;
  const cur = await gh(env, "GET", `/contents/${path}?ref=${branch}`);
  const sha = cur.ok && !Array.isArray(cur.data) ? cur.data.sha : void 0;
  const r = await gh(env, "PUT", `/contents/${path}`, { message: message || `update ${path}`, content: btoa(unescape(encodeURIComponent(content))), branch, sha });
  return r.ok ? `${path} を ${branch} にコミットしました。` : `コミット失敗：${r.error}`;
}
async function ghOpenPr(env, head, title, body) {
  const base = await defaultBranch(env);
  const r = await gh(env, "POST", "/pulls", { title: title || head, head, base, body: body ?? "" });
  return r.ok ? `PRを作成しました：${r.data.html_url}` : `PR作成失敗：${r.error}`;
}
async function ghMergePr(env, number) {
  const pr = await gh(env, "GET", `/pulls/${number}`);
  if (!pr.ok) return `PR取得失敗：${pr.error}`;
  if (pr.data.state !== "open") return "オープンなPRではありません。";
  let mergeable = pr.data.mergeable;
  if (mergeable === null || mergeable === void 0) {
    await new Promise((s) => setTimeout(s, 1500));
    const pr2 = await gh(env, "GET", `/pulls/${number}`);
    mergeable = pr2.ok ? pr2.data.mergeable : null;
  }
  if (mergeable !== true) return "コンフリクトがあるか可否を確認できないため自動マージしません。解消後に再依頼してください。";
  const files = [];
  for (let page = 1; page <= 10; page++) {
    const fl = await gh(env, "GET", `/pulls/${number}/files?per_page=100&page=${page}`);
    if (!fl.ok) return `PRファイル取得失敗：${fl.error}`;
    const batch = fl.data ?? [];
    files.push(...batch);
    if (batch.length < 100) break;
    if (page === 10) return "変更ファイルが多すぎて安全確認できないため自動マージしません（手動レビューしてください）。";
  }
  const core = files.find((f) => isCorePath(f.filename));
  if (core) return `コア領域（${core.filename}）を含むPRは自動マージできません。手動レビューが必要です。`;
  const sha = pr.data.head?.sha;
  const runs = [];
  {
    const cr = await gh(env, "GET", `/commits/${sha}/check-runs?per_page=100`);
    if (cr.ok) {
      runs.push(...cr.data.check_runs ?? []);
      const total = cr.data.total_count ?? runs.length;
      for (let page = 2; runs.length < total && page <= 10; page++) {
        const more = await gh(env, "GET", `/commits/${sha}/check-runs?per_page=100&page=${page}`);
        if (!more.ok) break;
        runs.push(...more.data.check_runs ?? []);
      }
    }
  }
  const st = await gh(env, "GET", `/commits/${sha}/status`);
  const statuses = st.ok ? st.data.statuses : [];
  if ((runs?.length ?? 0) + (statuses?.length ?? 0) === 0) return "CI/チェックが見つからないため自動マージしません（安全のため手動マージしてください）。";
  const badRun = (runs ?? []).find((r) => r.status !== "completed" || !["success", "neutral", "skipped"].includes(r.conclusion ?? ""));
  if (badRun) return `チェック「${badRun.name}」が未通過のためマージしません（${badRun.conclusion ?? badRun.status}）。`;
  if (st.ok && (statuses?.length ?? 0) > 0 && st.data.state !== "success") return `コミットステータスが ${st.data.state} のためマージしません。`;
  const m = await gh(env, "PUT", `/pulls/${number}/merge`, { merge_method: "squash" });
  return m.ok ? `PR #${number} を squash マージしました（チェック成功を確認済み）。本番デプロイが走る場合があります。` : `マージ失敗：${m.error}`;
}
async function runAutonomyTool(env, name, a) {
  let out;
  switch (name) {
    case "cf_list_resources":
      out = await cfListResources(env);
      break;
    case "cf_create_kv":
      out = await cfCreateKv(env, String(a.title ?? ""));
      break;
    case "cf_create_d1":
      out = await cfCreateD1(env, String(a.name ?? ""));
      break;
    case "cf_deploy":
      out = await cfDeploy(env);
      break;
    case "gh_read_file":
      out = await ghReadFile(env, String(a.path ?? ""));
      break;
    case "gh_create_branch":
      out = await ghCreateBranch(env, String(a.name ?? ""));
      break;
    case "gh_commit_file":
      out = await ghCommitFile(env, String(a.branch ?? ""), String(a.path ?? ""), String(a.content ?? ""), String(a.message ?? ""));
      break;
    case "gh_open_pr":
      out = await ghOpenPr(env, String(a.head ?? ""), String(a.title ?? ""), a.body ? String(a.body) : void 0);
      break;
    case "gh_merge_pr":
      out = await ghMergePr(env, Number(a.number) || 0);
      break;
    default:
      return "未知の自治ツール";
  }
  await logDiag(env, "info", "other", `自治ツール ${name}：${out.slice(0, 120)}`).catch(() => {
  });
  return out;
}
const AUTONOMY_TOOLS = [
  { name: "cf_list_resources", description: "自団体CloudflareのKV/D1リソースを一覧", parameters: { type: "object", properties: {} } },
  { name: "cf_create_kv", description: "CloudflareにKV namespaceを作成", parameters: { type: "object", properties: { title: { type: "string" } }, required: ["title"] } },
  { name: "cf_create_d1", description: "CloudflareにD1データベースを作成", parameters: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } },
  { name: "cf_deploy", description: "Deploy Hook で自団体アプリをデプロイ", parameters: { type: "object", properties: {} } },
  { name: "gh_read_file", description: "自団体リポのファイル/ディレクトリを読む", parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } },
  { name: "gh_create_branch", description: "新しいブランチを作成（既定ブランチから分岐）", parameters: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } },
  { name: "gh_commit_file", description: "ブランチに非コアファイルをコミット（main直/コア領域は禁止）", parameters: { type: "object", properties: { branch: { type: "string" }, path: { type: "string" }, content: { type: "string" }, message: { type: "string" } }, required: ["branch", "path", "content"] } },
  { name: "gh_open_pr", description: "ブランチから既定ブランチへPRを作成", parameters: { type: "object", properties: { head: { type: "string" }, title: { type: "string" }, body: { type: "string" } }, required: ["head", "title"] } },
  { name: "gh_merge_pr", description: "PRをマージ（CI/チェックが全て成功のときのみ・squash）。未通過/コンフリクト/チェック無しは拒否", parameters: { type: "object", properties: { number: { type: "number", description: "PR番号" } }, required: ["number"] } }
];
export {
  AUTONOMY_POLICY,
  AUTONOMY_TOOLS,
  autonomyReady,
  cfCreateD1,
  cfCreateKv,
  cfDeploy,
  cfDetectAccount,
  cfListResources,
  getAutonomyConfig,
  ghCommitFile,
  ghCreateBranch,
  ghDeviceAvailable,
  ghDevicePoll,
  ghDeviceStart,
  ghListRepos,
  ghMergePr,
  ghOpenPr,
  ghReadFile,
  isAutonomyOn,
  resolveGhClientId,
  runAutonomyTool,
  saveAutonomyConfig,
  setAutonomy
};
