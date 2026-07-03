globalThis.process ??= {};
globalThis.process.env ??= {};
import { APP_SCHEMA, validateDefinition } from "./appdef_CBJw5awM.mjs";
import { ALLOWED_PERMISSIONS, PRIVILEGED_PERMISSIONS } from "./apps_qko8nJrR.mjs";
import { p as preflight } from "./preflight_BWqz46-c.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
async function loadDraftForCheck(ctx, draftId) {
  const d = await ctx.db.first(
    "SELECT id,name,description,spec,permissions,definition,est_tokens FROM app_drafts WHERE id=?",
    [draftId]
  );
  if (!d) return null;
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    spec: d.spec,
    permissions: JSON.parse(d.permissions || "[]"),
    definition: d.definition ? JSON.parse(d.definition) : null,
    estTokens: d.est_tokens ?? void 0,
    role: "admin"
    // 申請は org 管理者のみ（settings ゲート）。
  };
}
function scanText(input) {
  const def = input.definition;
  const html = def && typeof def === "object" && typeof def.render?.html === "string" ? def.render.html : "";
  return [input.name, input.description ?? "", input.spec ?? "", JSON.stringify(def ?? ""), html].join("\n");
}
function renderModeOf(input) {
  const def = input.definition;
  const iso = def && typeof def === "object" ? def.render?.isolation : void 0;
  return iso === "relaxed" ? "relaxed" : "sandboxed";
}
const PII_PATTERNS = [
  { kind: "メールアドレス", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { kind: "電話番号", re: /0\d{1,3}[-(]?\d{2,4}[-)]?\d{3,4}/g },
  { kind: "マイナンバー(12桁)", re: /(?<!\d)\d{12}(?!\d)/g },
  { kind: "クレジットカード番号(桁)", re: /(?<!\d)(?:\d[ -]?){13,16}(?!\d)/g },
  { kind: "郵便番号付き住所", re: /〒?\d{3}-?\d{4}/g }
];
const SECRET_PATTERNS_FAIL = [
  { kind: "OpenAI APIキー", re: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { kind: "Anthropic APIキー", re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/ },
  { kind: "AWSアクセスキー", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { kind: "Google APIキー", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { kind: "GitHubトークン", re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { kind: "Slackトークン", re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { kind: "Stripeシークレットキー", re: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/ },
  { kind: "JWT/Bearerトークン", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{6,}\b/ },
  { kind: "秘密鍵(PEM)", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { kind: "接続文字列のパスワード", re: /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^\s:@/]+:[^\s:@/]+@/i }
];
const SECRET_ASSIGN = /\b(?:api[_-]?key|secret(?:[_-]?key)?|access[_-]?token|auth[_-]?token|client[_-]?secret|password|passwd)\b\s*[:=]\s*["'][^"'\s]{8,}["']/i;
const DESTRUCTIVE_SQL = /\b(drop\s+table|delete\s+from|truncate|alter\s+table|attach\s+database|pragma|update\s+\w+\s+set(?![^;]*\bwhere\b))/i;
const DANGEROUS_JS = /\beval\s*\(|\bnew\s+Function\s*\(|\bdocument\.cookie\b|\bindexedDB\b|\bwindow\.parent\b|\bwindow\.top\b|\bnavigator\.sendBeacon\b/i;
function collectSteps(def) {
  const out = [];
  const push = (steps) => {
    if (Array.isArray(steps)) {
      for (const s of steps) if (s && typeof s === "object") out.push(s);
    }
  };
  const d = def;
  push(d?.steps);
  if (Array.isArray(d?.screens)) for (const sc of d.screens) push(sc?.steps);
  return out;
}
async function deterministicSelfChecks(ctx, input) {
  const text = scanText(input);
  const checks = [];
  const hits = [];
  for (const p of PII_PATTERNS) {
    const m = text.match(p.re);
    if (m && m.length) hits.push(`${p.kind}（${m.length}件）`);
  }
  checks.push(hits.length ? { key: "pii", label: "個人情報・企業情報", status: "warn", detail: `アプリ定義に個人情報・企業情報らしき値が直書きされています：${hits.join(" / ")}。意図したサンプル/連絡先か、AI審査で精査します。第三者の実データなら削除してください。`, ai: false } : { key: "pii", label: "個人情報・企業情報", status: "ok", detail: "定義内に個人情報・企業情報の直書きは検出されませんでした。", ai: false });
  const secretHits = [];
  for (const p of SECRET_PATTERNS_FAIL) if (p.re.test(text)) secretHits.push(p.kind);
  if (secretHits.length) {
    checks.push({ key: "secret", label: "秘密情報", status: "fail", detail: `アプリ定義/HTMLに資格情報が直書きされています：${[...new Set(secretHits)].join(" / ")}。公開物に秘密は載せられません。キーはサーバ側の安全な保管（設定→APIキー）に置き、http.fetch op 経由で使ってください。`, ai: false });
  } else if (SECRET_ASSIGN.test(text)) {
    checks.push({ key: "secret", label: "秘密情報", status: "warn", detail: "api_key/secret/password などに具体的な値が直書きされている可能性があります。サンプルや初期値ならご確認ください。実際の秘密はサーバ側保管にしてください。", ai: false });
  } else {
    checks.push({ key: "secret", label: "秘密情報", status: "ok", detail: "資格情報（APIキー/トークン/接続文字列）の直書きは検出されませんでした。", ai: false });
  }
  const def = input.definition;
  const mode = renderModeOf(input);
  const html = def && typeof def === "object" && typeof def.render?.html === "string" ? def.render.html : "";
  const badSql = DESTRUCTIVE_SQL.test(JSON.stringify(def ?? ""));
  const badJs = DANGEROUS_JS.test(html);
  if (badSql) {
    checks.push({ key: "destructive", label: "破壊的動作", status: "fail", detail: "破壊的SQL（DROP/DELETE/TRUNCATE/ALTER/WHERE無しUPDATE 等）を検出。自身・ホスト・他クライアントへ影響しうるため申請できません。", ai: false });
  } else if (badJs && mode === "relaxed") {
    checks.push({ key: "destructive", label: "破壊的動作", status: "warn", detail: "リッチ描画(relaxed)のJSに動的実行/ストレージ等のパターンがあります。別オリジン隔離とCSP（外部通信は宣言ホストのみ）で封じ込められるため通常は問題ありませんが、用途を確認してください。", ai: false });
  } else if (badJs) {
    checks.push({ key: "destructive", label: "破壊的動作", status: "fail", detail: "危険なJS（eval/Function/cookie/外部送出 等）を検出。サンドボックス描画では不要なため申請できません（外部ライブラリが必要ならリッチ描画(relaxed)で宣言してください）。", ai: false });
  } else {
    checks.push({ key: "destructive", label: "破壊的動作", status: "ok", detail: "DB破壊や危険な動的実行の痕跡はありません。", ai: false });
  }
  const structured = def && typeof def === "object" && def.schema === APP_SCHEMA ? validateDefinition(def) : null;
  const unknown = input.permissions.filter((p) => !ALLOWED_PERMISSIONS.has(p));
  const priv = input.permissions.filter((p) => PRIVILEGED_PERMISSIONS.has(p));
  if (!structured) checks.push({ key: "scope", label: "実装・権限", status: "fail", detail: `実行可能なアプリ定義（schema="${APP_SCHEMA}"）がありません。`, ai: false });
  else if (!structured.ok || unknown.length) checks.push({ key: "scope", label: "実装・権限", status: "fail", detail: [unknown.length ? `未許可の権限：${unknown.join(", ")}` : "", structured.issues.slice(0, 3).map((i) => `${i.path || "定義"}: ${i.message}`).join(" / ")].filter(Boolean).join(" / "), ai: false });
  else checks.push({ key: "scope", label: "実装・権限", status: priv.length ? "warn" : "ok", detail: priv.length ? `影響の大きい権限を含みます（${priv.join(", ")}）。導入先の管理者承認が必要になります。` : "宣言権限はクライアント権限の範囲内です。", ai: false });
  const pf = await preflight(ctx, { name: input.name, permissions: input.permissions, definition: input.definition, spec: input.spec ?? void 0, estTokens: input.estTokens, role: input.role }).catch(() => null);
  const costCheck = pf?.checks.find((c) => c.key === "cost");
  checks.push(costCheck ? { key: "cost", label: "過剰コスト", status: costCheck.status, detail: costCheck.detail + (costCheck.status === "ok" ? "" : " 導入者にコストの目安が表示されます。"), ai: false } : { key: "cost", label: "過剰コスト", status: "warn", detail: "コスト見積りを取得できませんでした。", ai: false });
  const render = def?.render;
  const connectHosts = Array.isArray(render?.connectHosts) ? render.connectHosts.map(String) : [];
  const fetchHosts = Array.isArray(def?.allowHosts) ? def.allowHosts.map(String) : [];
  const steps = collectSteps(def);
  const sendsEmail = steps.some((s) => s.op === "notify" && s.channel === "email");
  const egressItems = [
    connectHosts.length ? `iframe通信先(connect)：${connectHosts.join("、")}` : "",
    fetchHosts.length ? `サーバ外部送信(http.fetch)：${fetchHosts.join("、")}` : "",
    sendsEmail ? "メール送信(notify)" : ""
  ].filter(Boolean);
  checks.push(connectHosts.length ? { key: "egress", label: "外部送信先", status: "warn", detail: `iframe からの外部通信路があります：${egressItems.join(" / ")}。意図した送信先か（公開物の持ち出し先）を確認してください。`, ai: false } : { key: "egress", label: "外部送信先", status: "ok", detail: egressItems.length ? `外部依存（監査記録）：${egressItems.join(" / ")}。iframe からの直接通信はありません。` : "外部への送信経路は検出されませんでした。", ai: false });
  const dataScope = def?.dataScope;
  const screensArr = Array.isArray(def?.screens) ? def.screens : [];
  const readsData = (st) => Array.isArray(st) && st.some((s) => s && typeof s === "object" && (s.op === "data.list" || s.op === "data.get"));
  const openReaders = screensArr.filter((sc) => sc && typeof sc === "object" && readsData(sc.steps) && !(Array.isArray(sc.requiredRoles) && sc.requiredRoles.length)).map((sc) => String(sc.id ?? "画面"));
  checks.push(openReaders.length && dataScope === "shared" ? { key: "rbac", label: "アクセス制御", status: "warn", detail: `共有データを読む画面に役割制限(requiredRoles)がありません：${openReaders.join("、")}。一覧/取得画面は requiredRoles:["admin"] 等で閲覧者を絞り、他人のデータが見えないようにしてください（IDOR/過剰公開の確認）。`, ai: false } : { key: "rbac", label: "アクセス制御", status: "ok", detail: "データ読み取り画面のアクセス制御に明らかな問題は見つかりませんでした。", ai: false });
  return checks;
}
const AI_SYSTEM = 'あなたはアプリ公開審査の審査員です。提示されたアプリ定義（JSON）と仕様を読み、4観点で安全性を判定します。出力は厳密なJSONのみ（前置き・説明・コードフェンス禁止）。各観点は status を "ok"|"warn"|"fail" のいずれか、detail は日本語1〜2文で具体的に。判定観点：morals=公序良俗（差別・暴力・性的・ヘイト・依存助長・詐欺的表現など）に反しないか。legal=法的問題（無断のスクレイピング・著作権/商標侵害・賭博・無資格の医療/法律/金融助言・個人情報の不適切な取り扱いなど）が無いか。pii=第三者の実在する個人情報・企業の非公開情報（社内URL・社員名・内部メモ・未公開の取引先情報など、コメント内も含む）が定義/HTMLに焼き込まれていないか（fail=実データ混入の疑い、warn=判断保留、ok=問題なし）。destructive=自身・ホスト基盤・他の利用者へ破壊的/迷惑な動作（無限ループ・大量送信・資格情報の窃取・他テナント干渉）をしないか。また公開到達経路（公開フォーム/ゲスト/メンバー）が管理者専用のデータ・操作に到達し得る不正アクセス／他人のレコードを列挙・取得できる IDOR の論理欠陥が無いか（あれば fail/warn）。確証が持てない不利益はwarn、明確な違反のみfailとする。出力形式：{"morals":{"status":"...","detail":"..."},"legal":{"status":"...","detail":"..."},"pii":{"status":"...","detail":"..."},"destructive":{"status":"...","detail":"..."}}';
function parseAiVerdict(text) {
  if (!text) return null;
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s < 0 || e <= s) return null;
  try {
    return JSON.parse(t.slice(s, e + 1));
  } catch {
    return null;
  }
}
const normStatus = (s) => s === "fail" || s === "warn" || s === "ok" ? s : "warn";
async function aiSelfChecks(ctx, input) {
  const labels = { morals: "公序良俗", legal: "法的問題", pii: "個人情報（AI精査）", destructive: "破壊的動作（AI精査）" };
  const keys = ["morals", "legal", "pii", "destructive"];
  const mode = renderModeOf(input);
  const modeNote = mode === "relaxed" ? "描画モード：relaxed（別オリジン隔離＋CSP）。外部CDNライブラリ/CSSの読込は正当な機能であり、それ自体を destructive と判定しないこと。外部への実行時通信は宣言した connectHosts のみCSPで許可される（既定は通信不可）。" : "描画モード：sandboxed（厳格iframe・外部読込/通信なし）。";
  const prompt = `アプリ名：${input.name}
説明：${input.description ?? "(なし)"}
仕様：${input.spec ?? "(なし)"}
${modeNote}
要求権限：${input.permissions.join(", ") || "(なし)"}
定義(JSON)：
${JSON.stringify(input.definition ?? {}).slice(0, 6e3)}`;
  let verdict = null;
  try {
    const out = await ctx.ai.infer(prompt, { system: AI_SYSTEM, maxTokens: 900 });
    verdict = parseAiVerdict(out);
  } catch {
    verdict = null;
  }
  if (!verdict) {
    return keys.map((k) => ({ key: k, label: labels[k], status: "fail", detail: "AI審査を完了できませんでした。時間をおいて再度お試しください。", ai: true }));
  }
  return keys.map((k) => {
    const v = verdict[k];
    return { key: k, label: labels[k], status: v ? normStatus(v.status) : "warn", detail: v?.detail || "判定結果を取得できませんでした。", ai: true };
  });
}
const RANK = { ok: 0, warn: 1, fail: 2 };
function mergeChecks(det, ai) {
  const out = [];
  const aiByKey = new Map(ai.map((c) => [c.key, c]));
  for (const d of det) {
    const a = aiByKey.get(d.key);
    if (a && RANK[a.status] > RANK[d.status]) {
      out.push({ ...d, status: a.status, detail: `${d.detail} ／AI審査：${a.detail}`, ai: true });
      aiByKey.delete(d.key);
    } else {
      if (a) aiByKey.delete(d.key);
      out.push(d);
    }
  }
  for (const a of aiByKey.values()) out.push(a);
  return out;
}
function finalize(checks) {
  return { ok: checks.every((c) => c.status !== "fail"), checks, checkedAt: nowSec() };
}
async function persistSelfCheck(ctx, draftId, result) {
  await ctx.db.run("UPDATE app_drafts SET selfcheck=?, selfcheck_status=? WHERE id=?", [JSON.stringify(result), result.ok ? "pass" : "fail", draftId]);
}
async function buildAppCheckInput(ctx, appId) {
  const a = await ctx.db.first(
    "SELECT id,name,description,permissions,definition FROM external_apps WHERE id=?",
    [appId]
  );
  if (!a || !a.definition) return null;
  let definition = null;
  try {
    definition = JSON.parse(a.definition);
  } catch {
    return null;
  }
  let permissions = [];
  try {
    permissions = JSON.parse(a.permissions || "[]");
  } catch {
  }
  return { id: a.id, name: a.name, description: a.description, spec: null, permissions, definition, role: "admin" };
}
async function gatePublishApp(ctx, appId) {
  const input = await buildAppCheckInput(ctx, appId);
  if (!input) return { ok: true, concerns: [] };
  const det = await deterministicSelfChecks(ctx, input);
  const leaked = await scanLeakedSecrets(ctx, scanText(input)).catch(() => []);
  if (leaked.length) det.push({ key: "secret", label: "秘密情報", status: "fail", detail: `保存済みの秘密（${leaked.join("、")}）の実値が公開物に含まれています。キーはサーバ側保管のまま http.fetch op 経由で使い、定義/HTMLに値を埋め込まないでください。`, ai: false });
  const result = finalize(det);
  const concerns = det.filter((c) => c.status === "fail").map((c) => `${c.label}：${c.detail}`);
  return { ok: result.ok, concerns, result };
}
async function scanLeakedSecrets(ctx, text) {
  const { listApiKeyNames, getApiKey } = await import("./client_F4fksau0.mjs");
  const names = await listApiKeyNames(ctx.env).catch(() => []);
  const leaked = [];
  for (const name of names) {
    const val = await getApiKey(ctx.env, name).catch(() => null);
    if (val && val.length >= 8 && text.includes(val)) leaked.push(name);
  }
  return leaked;
}
export {
  aiSelfChecks,
  buildAppCheckInput,
  deterministicSelfChecks,
  finalize,
  gatePublishApp,
  loadDraftForCheck,
  mergeChecks,
  persistSelfCheck
};
