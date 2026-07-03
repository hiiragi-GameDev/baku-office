globalThis.process ??= {};
globalThis.process.env ??= {};
import { AppError } from "./errors_Cz86HmdL.mjs";
const EGRESS_BLOCKED = "E8040";
const DEFAULT_EGRESS_ALLOWLIST = [
  "discord.com",
  // Discord Interactions follow-up / コマンド登録
  "cdn.discordapp.com",
  // Discord 添付（画像/ファイル）取得
  "media.discordapp.net",
  // Discord 添付のメディアプロキシ（画像取得）
  "api.line.me",
  // LINE Messaging push/reply
  "api-data.line.me",
  // LINE メッセージ本体（画像/ファイル/音声）取得
  "api.resend.com",
  // メール送信（Resend）
  "gmail.googleapis.com",
  // メール送信（Gmail）
  "oauth2.googleapis.com",
  // Google OAuth token 交換
  "accounts.google.com",
  // Google OAuth 認可
  "www.googleapis.com",
  // Google API（Drive 等）
  "api.github.com",
  // GitHub API
  "hooks.slack.com",
  // Slack Incoming Webhook（送信）
  "slack.com"
  // Slack Web API（chat.postMessage＝受信への返信）
];
function hostAllowed(host, allowlist) {
  const h = host.toLowerCase();
  return allowlist.some((a) => {
    const x = a.toLowerCase();
    return h === x || h.endsWith("." + x);
  });
}
function isPublicHttpsUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (/^\d+$/.test(host) || /^0x[0-9a-f]+$/.test(host)) return false;
  if (host.startsWith("[::ffff:") || host === "[::]") return false;
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 0 || a === 10 || a === 127 || a === 192 && b === 168 || a === 172 && b >= 16 && b <= 31 || a === 169 && b === 254) return false;
    return true;
  }
  if (host === "[::1]" || host.startsWith("[fe8") || host.startsWith("[fe9") || host.startsWith("[fea") || host.startsWith("[feb") || host.startsWith("[fc") || host.startsWith("[fd")) return false;
  return true;
}
class EgressGateway {
  opts;
  now;
  fetchImpl;
  constructor(opts) {
    this.opts = opts;
    this.now = opts.now ?? (() => Date.now());
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }
  isAllowed(url) {
    let u;
    try {
      u = new URL(url);
    } catch {
      return false;
    }
    const localhost = u.hostname === "localhost" || u.hostname === "127.0.0.1";
    if (localhost) return this.opts.allowLocalhost === true;
    if (u.protocol !== "https:") return false;
    return hostAllowed(u.hostname, this.opts.allowlist);
  }
  // connector 名義で外部へ送る唯一の口。allowlist 外は監査して拒否し、実際の fetch は行わない。
  // opts.allowConfigured：宛先が「管理者が設定したデータ」（任意URL）の場合は静的 allowlist を課さない。
  //   ＝コードに埋め込まれた宛先は allowlist で防御し、admin が明示設定した宛先は設定で認可（https 必須・監査つき）。
  //   いずれも本 Gateway を通る＝単一チョークポイントと監査は不変。
  async fetch(connector, url, init, opts) {
    const method = (init?.method ?? "GET").toUpperCase();
    let host = "";
    try {
      host = new URL(url).host;
    } catch {
    }
    const permitted = opts?.allowConfigured ? isPublicHttpsUrl(url) : this.isAllowed(url);
    if (!permitted) {
      await this.opts.audit.record({ connector, host, method, ok: false, blocked: true, at: this.now() });
      throw new AppError(
        EGRESS_BLOCKED,
        opts?.allowConfigured ? `送信先は公開ネットワーク上の https である必要があります（内部/プライベート宛先は不可・${host || url}）。` : `送信先が許可リストにありません（${host || url}）。管理者に egress allowlist への追加を依頼してください。`,
        403
      );
    }
    try {
      const res = await this.fetchImpl(url, init);
      await this.opts.audit.record({ connector, host, method, ok: res.ok, status: res.status, at: this.now() });
      return res;
    } catch (e) {
      await this.opts.audit.record({ connector, host, method, ok: false, at: this.now() });
      throw e;
    }
  }
  // 生成アプリの http.fetch 専用の口（P0/P1）。connector 埋め込みの allowlist ではなくアプリ定義の allowHosts を
  // 使うが、それ以外（https 必須・内部/プライベート拒否・監査）は本 Gateway で connector 経由と同一に強制する。
  // 追加で、生成アプリは送信先制御が弱いため次も一元強制する：
  //   ・リダイレクト（3xx）は手動追従し、移動先を allowHosts で再検証＝最初の許可ホスト以外への移動を拒否
  //   ・応答サイズ上限（Content-Length 事前判定＋本文 slice）／実行時間タイムアウト（AbortController）
  // 監査は connector="app:<appId>" で egress_log に残す＝管理者がアプリ単位の送信先を確認できる。
  async appFetch(req) {
    const connector = `app:${req.appId}`;
    const method = (req.method ?? "GET").toUpperCase();
    const MAX_BYTES = 1e6;
    const TIMEOUT_MS = 1e4;
    const MAX_REDIRECTS = 3;
    const checkHost = (u) => {
      if (!isPublicHttpsUrl(u)) throw new AppError(EGRESS_BLOCKED, `送信先は公開ネットワーク上の https である必要があります（内部/プライベート宛先は不可・${u}）。`, 403);
      let host2;
      try {
        host2 = new URL(u).host;
      } catch {
        throw new AppError(EGRESS_BLOCKED, "URL が不正です。", 400);
      }
      const bare = host2.toLowerCase().replace(/:\d+$/, "");
      if (!req.allowHosts.map((a) => a.toLowerCase()).includes(bare)) {
        throw new AppError(EGRESS_BLOCKED, `送信先 ${host2} はこのアプリの allowHosts に未登録です。`, 403);
      }
      return host2;
    };
    let url = req.url;
    let host = "";
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
    try {
      host = checkHost(url);
      let redirects = 0;
      for (; ; ) {
        const res = await this.fetchImpl(url, {
          method,
          ...req.headers ? { headers: req.headers } : {},
          ...req.body !== void 0 && method !== "GET" && method !== "HEAD" ? { body: req.body } : {},
          redirect: "manual",
          // 既定の追従を止め、移動先を自前で再検証する
          signal: ac.signal
        });
        if (res.status >= 300 && res.status < 400) {
          const loc = res.headers.get("location");
          if (loc) {
            if (++redirects > MAX_REDIRECTS) throw new AppError(EGRESS_BLOCKED, "リダイレクトが多すぎます。", 403);
            await res.body?.cancel().catch(() => {
            });
            url = new URL(loc, url).toString();
            host = checkHost(url);
            continue;
          }
        }
        const cl = Number(res.headers.get("content-length") ?? "");
        if (cl && cl > MAX_BYTES) throw new AppError(EGRESS_BLOCKED, "応答が大きすぎます（上限 1MB）。", 413);
        const text = await this.readBodyCapped(res, MAX_BYTES, ac);
        await this.opts.audit.record({ connector, host, method, ok: res.ok, status: res.status, at: this.now() });
        return { ok: res.ok, status: res.status, text };
      }
    } catch (e) {
      await this.opts.audit.record({ connector, host, method, ok: false, at: this.now() });
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
  // 本文をチャンク読取し、累積バイトが上限を超えた時点で中断する（文字数ではなく UTF-8 バイトで判定）。
  // Content-Length 無しの巨大/無限本文でも、受信・メモリ・実行時間を上限内に抑える（P1-05）。
  async readBodyCapped(res, maxBytes, ac) {
    if (!res.body) return "";
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        total += value.byteLength;
        if (total > maxBytes) {
          await reader.cancel().catch(() => {
          });
          ac.abort();
          throw new AppError(EGRESS_BLOCKED, "応答が大きすぎます（上限 1MB）。", 413);
        }
        chunks.push(value);
      }
    } finally {
      try {
        reader.releaseLock();
      } catch {
      }
    }
    const buf = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      buf.set(c, off);
      off += c.byteLength;
    }
    return new TextDecoder().decode(buf);
  }
}
export {
  DEFAULT_EGRESS_ALLOWLIST,
  EgressGateway,
  hostAllowed,
  isPublicHttpsUrl
};
