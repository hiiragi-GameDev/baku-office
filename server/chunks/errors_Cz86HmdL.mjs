globalThis.process ??= {};
globalThis.process.env ??= {};
class AppError extends Error {
  code;
  status;
  userMessage;
  constructor(code, userMessage, status = 400, cause) {
    super(`${code}: ${userMessage}`);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.userMessage = userMessage;
    if (cause !== void 0) this.cause = cause;
  }
}
const INFRA = {
  WRITE_LIMIT: "E9001",
  // KV/D1 の1日あたり書き込み上限超過
  MASTER_KEY_MISSING: "E9002",
  // ホスト(host worker)との通信失敗
  CAPABILITY: "E9007"
  // アプリ（パーツ）が宣言していない能力(Port)へアクセスした（capability scoping 違反）
};
const APP = {
  NOT_FOUND: "E6010",
  // アプリが未導入/削除
  DEFINITION_INVALID: "E6011",
  // 定義が検証不合格で実行不可
  SCREEN_MISSING: "E6012",
  // 実行できる画面定義（steps/output）が無い
  STEP_LIMIT: "E6013",
  // 処理ステップ数が上限超過
  RUN_FAILED: "E6014",
  // 実行中の想定外の失敗
  FORBIDDEN: "E6015",
  // 画面/操作の権限不足（画面RBAC・状態遷移ポリシー）
  APPROVAL_REQUIRED: "E6016"
  // 外部送信/不可逆操作を含むため実行前に承認が必要（承認キューへ起案済み）
};
const GENERIC_MSG = "申し訳ありません。処理中に問題が発生しました。";
function explainStop(side, reason, action) {
  const head = side === "ai" ? "⚠️ AI（応答・生成）側の問題で中断しました。" : "⚠️ システム（設定・基盤）側の問題で中断しました。";
  return `${head}
・なぜ：${reason}
・どうする：${action}`;
}
const LIMIT_MSG = "ただいま保存（書き込み）回数が本日の上限に達したため、一時的に保存できません。時間をおいて（日付が変わると回復します）お試しください。管理者の方は上位プラン（Workers Paid）で上限を引き上げられます。";
function isWriteLimitError(e) {
  const m = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return m.includes("limit exceeded") || m.includes("too many requests") || m.includes("daily request limit");
}
const ROUTE_CODES = {
  // 1xxx 認証・参加
  "/api/login": "E1001",
  "/api/join": "E1002",
  "/api/consent": "E1003",
  "/api/auth/google/relay": "E1012",
  // 2xxx 会計
  "/api/tx": "E2001",
  "/api/invoices": "E2002",
  // 3xxx 人・会員
  "/api/members": "E3001",
  "/api/membership": "E3002",
  "/api/review": "E3003",
  "/api/me/leave-request": "E3004",
  // 4xxx 予定・Google
  "/api/docs": "E4001",
  "/api/google": "E4010",
  "/api/google/start": "E4011",
  "/api/google/callback": "E4012",
  // 5xxx ファイル・取り込み
  "/api/files": "E5001",
  "/api/import": "E5002",
  "/api/drive": "E5010",
  "/api/drive/start": "E5011",
  "/api/drive/callback": "E5012",
  "/api/store": "E5020",
  "/api/data": "E5030",
  "/api/backup": "E5040",
  // 6xxx AI・エージェント
  "/api/chat": "E6001",
  "/api/chat-sessions": "E6002",
  "/api/skills": "E6003",
  "/api/agent-actions": "E6004",
  "/api/autopilot": "E6005",
  "/api/mascot": "E6006",
  "/api/capabilities": "E6007",
  "/api/activity": "E6008",
  "/api/app-run": "E6009",
  // 7xxx 設定・通知・課金
  "/api/settings": "E7001",
  "/api/site": "E7002",
  "/api/site/join": "E7003",
  "/api/update": "E7004",
  "/api/billing/start": "E7005",
  "/api/notifications": "E7006",
  "/api/personal": "E7007",
  "/api/usage": "E7008",
  "/api/keys": "E7009",
  // 8xxx 連携(A2A)・外部・Webhook
  "/api/a2a/inbound": "E8001",
  "/api/a2a/manage": "E8002",
  "/api/report": "E8010",
  "/api/cron/drain": "E8020",
  "/api/line/webhook": "E8030",
  "/api/site/stripe-webhook": "E8031"
};
const ROUTE_PATTERNS = [
  [/^\/api\/auth\/[^/]+\/start$/, "E1010"],
  [/^\/api\/auth\/[^/]+\/callback$/, "E1011"]
];
const PAGE_AREA = {
  "": "E0100",
  // ホーム
  accounting: "E0200",
  invoices: "E0210",
  membership: "E0300",
  members: "E0300",
  review: "E0310",
  schedule: "E0400",
  calendar: "E0401",
  meet: "E0402",
  gmail: "E0403",
  minutes: "E0410",
  files: "E0500",
  import: "E0510",
  drive: "E0520",
  backup: "E0530",
  chat: "E0600",
  apps: "E0610",
  app: "E0610",
  settings: "E0700",
  billing: "E0710",
  usage: "E0720",
  diagnostics: "E0730",
  legal: "E0740",
  approvals: "E0750",
  personal: "E0800",
  account: "E0810",
  consent: "E0820",
  activate: "E0830",
  login: "E0840",
  join: "E0850"
};
function codeForPath(pathname) {
  if (ROUTE_CODES[pathname]) return ROUTE_CODES[pathname];
  for (const [re, c] of ROUTE_PATTERNS) if (re.test(pathname)) return c;
  const seg = pathname.replace(/^\/+/, "").split("/")[0] ?? "";
  return PAGE_AREA[seg] ?? "E0000";
}
function resolveError(e, pathname) {
  if (e instanceof AppError) return { status: e.status, code: e.code, message: e.userMessage };
  if (isWriteLimitError(e)) return { status: 503, code: INFRA.WRITE_LIMIT, message: LIMIT_MSG };
  return { status: 500, code: codeForPath(pathname), message: GENERIC_MSG };
}
const appendCode = (message, code) => `${message}（エラー番号: ${code}）`;
export {
  APP,
  AppError,
  GENERIC_MSG,
  INFRA,
  LIMIT_MSG,
  appendCode,
  codeForPath,
  explainStop,
  isWriteLimitError,
  resolveError
};
