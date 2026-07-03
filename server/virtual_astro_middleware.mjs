globalThis.process ??= {};
globalThis.process.env ??= {};
import { d as defineMiddleware, s as sequence } from "./chunks/sequence_BESBTeYg.mjs";
import { masterKeySource, getToken } from "./chunks/client_F4fksau0.mjs";
import { e as ensureSchema } from "./chunks/migrate_Ck12DMSM.mjs";
import { kvPut } from "./chunks/kv_JIFmI05h.mjs";
import { logDiag } from "./chunks/diag_CY3PJnOM.mjs";
import { sameOrigin, getSession } from "./chunks/auth_DL5yvmzT.mjs";
import { n as needsConsent } from "./chunks/consent_pwDjHOqX.mjs";
import { A as buildCtx } from "./chunks/ctx_D9xObGWH.mjs";
import { getSiteHosts } from "./chunks/custom-domain_BlEKJqw-.mjs";
import { hostRole, publicHostAllows, publicSiteCsp } from "./chunks/site-routing_D_cHuHu3.mjs";
import { resolveError, appendCode } from "./chunks/errors_Cz86HmdL.mjs";
import { env } from "cloudflare:workers";
const KV_FLAG = "bootcheck_done";
function checkProdEnv(env2) {
  const out = [];
  if (env2.ENVIRONMENT !== "production") return out;
  if (!env2.MASTER_KEY) out.push({ level: "error", key: "MASTER_KEY", detail: "未設定。保存時暗号化・セッション署名が停止する（wrangler secret put MASTER_KEY --env production）。" });
  if (!env2.VERIFY_PUBLIC_JWK) out.push({ level: "warn", key: "VERIFY_PUBLIC_JWK", detail: "未設定。A2A受信の署名検証が 503 になる。" });
  if (!env2.INTERNAL_KEY) out.push({ level: "warn", key: "INTERNAL_KEY", detail: "未設定。リマインダー drain の保護が効かない。" });
  if (!env2.GOOGLE_CLIENT_ID || !env2.GOOGLE_CLIENT_SECRET) out.push({ level: "warn", key: "GOOGLE_OAUTH", detail: "GOOGLE_CLIENT_ID/SECRET 未設定。組織ログインが dev 経路にフォールバックする。" });
  return out;
}
let isolateChecked = false;
async function bootCheck(env2) {
  if (isolateChecked) return;
  isolateChecked = true;
  try {
    if (await env2.LICENSE.get(KV_FLAG) === "1") return;
    if (env2.ENVIRONMENT === "production") {
      for (const f of checkProdEnv(env2)) {
        await logDiag(env2, f.level, "bootcheck", `本番設定点検: ${f.key} — ${f.detail}`);
      }
    }
    const src = await masterKeySource(env2);
    if (src === "missing-prod") {
      await logDiag(
        env2,
        "error",
        "security",
        "本番で MASTER_KEY が未投入＝暗号処理をブロック中。`wrangler secret put MASTER_KEY --env production` で投入してください（§10.1）。"
      );
    } else if (src === "kv-autogen" && env2.ENVIRONMENT === "production") {
      await logDiag(
        env2,
        "error",
        "security",
        "本番(自社)で MASTER_KEY が KV 自動生成です＝運用事故（鍵と暗号文が同居）。Worker Secret(MASTER_KEY) を投入してください（§10.1）。"
      );
    }
    if (src !== "unknown") await kvPut(env2, KV_FLAG, "1");
  } catch {
  }
}
const STATIC_EXT = /\.(?:css|js|mjs|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|txt|json|xml|webmanifest)$/i;
const UNSAFE_METHODS = /* @__PURE__ */ new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CSRF_EXEMPT = /* @__PURE__ */ new Set([
  "/api/site/stripe-webhook",
  "/api/a2a/inbound",
  "/api/cron/drain",
  // WIF自動ハンドオフ：Cloud Shell（curl・セッション無し）からの受信。ワンタイム token を本体で検証する。
  "/api/google/wif-handoff"
]);
const CSRF_EXEMPT_PREFIXES = ["/api/inbound/"];
const GUEST_PREFIXES = ["/my-events", "/event", "/lp/", "/site", "/legal", "/p/", "/news", "/embed/"];
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join("; ");
const CSP_EMBED = CSP.replace("frame-ancestors 'none'", "frame-ancestors *");
const CSP_PREVIEW = CSP.replace("frame-ancestors 'none'", "frame-ancestors 'self'");
function strictScriptSrc(nonce) {
  return `script-src 'self' 'nonce-${nonce}' 'inline-speculation-rules'`;
}
function withSec(res, frame = "none", scriptSrc) {
  const base = frame === "embed" ? CSP_EMBED : frame === "self" ? CSP_PREVIEW : CSP;
  const policy = scriptSrc ? base.replace("script-src 'self' 'unsafe-inline'", scriptSrc) : base;
  res.headers.set("Content-Security-Policy", policy);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return res;
}
const escHtml = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
function buildErrorResponse(status, code, message, pathname, accept) {
  const isApi = pathname.startsWith("/api/") || accept.includes("application/json");
  const retry = String(status === 503 ? 3600 : 5);
  if (isApi) {
    return new Response(JSON.stringify({ error: appendCode(message, code), code }), {
      status,
      headers: { "content-type": "application/json", "retry-after": retry }
    });
  }
  const html = `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>エラー（${code}）</title><div style="max-width:640px;margin:12vh auto;padding:24px;font-family:system-ui,-apple-system,'Hiragino Kaku Gothic ProN',sans-serif;line-height:1.9;color:#0E1A2B"><h1 style="font-size:1.35rem">問題が発生しました</h1><p style="font-size:1.05rem">${escHtml(message)}</p><p style="font-size:1.02rem">サポートにお問い合わせの際は、次の番号をお伝えください：<br><strong style="font-size:1.25rem;letter-spacing:.04em">エラー番号 ${code}</strong></p><p><a href="javascript:history.back()" style="color:#836528;font-weight:600">← 前の画面に戻る</a></p></div></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "retry-after": retry } });
}
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  try {
    context.locals.ctx = buildCtx(env);
    if (!context.locals.cfContext) {
      context.locals.cfContext = {
        waitUntil: (p) => {
          void Promise.resolve(p).catch(() => void 0);
        },
        passThroughOnException: () => {
        }
      };
    }
    context.locals.ctx.waitUntil = (p) => {
      try {
        context.locals.cfContext.waitUntil(p);
      } catch {
        void Promise.resolve(p).catch(() => void 0);
      }
    };
    context.locals.cspNonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
    await ensureSchema(env);
    await bootCheck(env);
    const siteHosts = await getSiteHosts(context.locals.ctx);
    const role = hostRole(context.request.headers.get("host") ?? context.url.host, siteHosts);
    if (role === "public") {
      context.locals.publicHost = true;
      if (!publicHostAllows(pathname)) {
        return withSec(new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } }));
      }
    }
    if (pathname.startsWith("/api/") && UNSAFE_METHODS.has(context.request.method) && !CSRF_EXEMPT.has(pathname) && !CSRF_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p)) && // 受信webhook（署名検証あり）
    !pathname.startsWith("/api/ext/") && // アプリ公開API（C4）はトークン認証＝外部呼び出しのため CSRF 対象外
    !sameOrigin(context.request)) {
      return withSec(
        new Response(JSON.stringify({ error: "cross-site request rejected" }), {
          status: 403,
          headers: { "content-type": "application/json" }
        })
      );
    }
    const embeddable = pathname.startsWith("/embed/");
    const exempt = pathname.startsWith("/activate") || pathname.startsWith("/api/") || pathname.startsWith("/.well-known/") || embeddable || STATIC_EXT.test(pathname);
    if (exempt) {
      const r2 = await next();
      return withSec(r2, embeddable ? "embed" : "none", context.locals.cspStrict ? strictScriptSrc(context.locals.cspNonce) : void 0);
    }
    const token = await getToken(env);
    if (!token) {
      if (env.LICENSE_ID) return withSec(context.redirect("/activate?license_id=" + encodeURIComponent(env.LICENSE_ID), 302));
      return withSec(context.redirect("/activate", 302));
    }
    const ses = await getSession(env, context.request);
    if (ses?.role === "guest") {
      const guestOk = pathname === "/my-events" || GUEST_PREFIXES.some((p) => pathname.startsWith(p));
      if (!guestOk) return withSec(context.redirect("/my-events", 302));
    }
    if (pathname !== "/consent") {
      if (ses?.ctx === "org" && ses.role === "admin" && await needsConsent(env)) {
        return withSec(context.redirect("/consent", 302));
      }
    }
    const isAdminPreview = ses?.role === "admin" && context.url.searchParams.get("preview") === "1" && (pathname === "/site" || pathname.startsWith("/lp/"));
    const r = await next();
    const out = withSec(r, isAdminPreview ? "self" : "none", context.locals.cspStrict ? strictScriptSrc(context.locals.cspNonce) : void 0);
    if (context.locals.publicSiteAllowHosts) out.headers.set("Content-Security-Policy", publicSiteCsp(context.locals.publicSiteAllowHosts));
    return out;
  } catch (e) {
    const { status, code, message } = resolveError(e, pathname);
    try {
      await logDiag(env, "error", "exception", `[${code}] ${context.request.method} ${pathname}: ${(e instanceof Error ? e.message : String(e)).slice(0, 200)}`);
    } catch {
    }
    return withSec(buildErrorResponse(status, code, message, pathname, context.request.headers.get("accept") ?? ""));
  }
});
const onRequest = sequence(
  onRequest$1
);
export {
  onRequest
};
