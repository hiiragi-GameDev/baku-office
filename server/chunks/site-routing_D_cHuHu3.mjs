globalThis.process ??= {};
globalThis.process.env ??= {};
const stripHost = (h) => String(h || "").trim().toLowerCase().split(":")[0];
function hostRole(host, hosts) {
  if (!hosts || !hosts.active) return "default";
  const h = stripHost(host);
  if (!h) return "default";
  if (h === stripHost(hosts.publicHost)) return "public";
  if (h === stripHost(hosts.adminHost)) return "admin";
  return "default";
}
const STATIC_EXT = /\.(?:css|js|mjs|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|txt|json|xml|webmanifest)$/i;
const PUBLIC_PAGE_PREFIXES = ["/p/", "/lp/", "/site", "/news", "/event", "/embed/", "/legal"];
const PUBLIC_API_PREFIXES = ["/api/p/", "/api/site-media/", "/api/inbound/", "/api/ext/"];
const PUBLIC_ASSET_PREFIXES = ["/_astro/", "/_image", "/favicon", "/robots.txt", "/sitemap"];
const ADMIN_TOP_ROUTES = /* @__PURE__ */ new Set([
  "account",
  "accounting",
  "activate",
  "admin",
  "approvals",
  "app",
  "apps",
  "backup",
  "billing",
  "calendar",
  "chat",
  "consent",
  "dashboard",
  "diagnostics",
  "directory",
  "drive",
  "files",
  "forbidden",
  "gmail",
  "hub",
  "import",
  "invoices",
  "join",
  "login",
  "meet",
  "membership",
  "minutes",
  "my-events",
  "personal",
  "project",
  "projects",
  "reports",
  "review",
  "schedule",
  "settings",
  "setup",
  "usage"
]);
function isReservedSlug(slug) {
  return ADMIN_TOP_ROUTES.has(String(slug || "").trim().toLowerCase());
}
const CLEAN_SEG = /^\/([a-z0-9][a-z0-9-]{0,47})$/;
function publicHostAllows(pathname) {
  const p = pathname || "/";
  if (p === "/") return true;
  if (STATIC_EXT.test(p)) return true;
  if (PUBLIC_ASSET_PREFIXES.some((x) => p.startsWith(x))) return true;
  if (p.startsWith("/api/")) return PUBLIC_API_PREFIXES.some((x) => p.startsWith(x));
  if (PUBLIC_PAGE_PREFIXES.some((x) => p.startsWith(x))) return true;
  const m = CLEAN_SEG.exec(p);
  return !!m && !ADMIN_TOP_ROUTES.has(m[1]);
}
function publicUrlFor(slug, publicHost, homeSlug) {
  if (!publicHost) return "/p/" + encodeURIComponent(slug);
  const path = homeSlug && slug === homeSlug ? "/" : isReservedSlug(slug) ? "/p/" + encodeURIComponent(slug) : "/" + encodeURIComponent(slug);
  return "https://" + publicHost.toLowerCase().split(":")[0] + path;
}
function publicSiteCsp(allowHosts) {
  const lib = (allowHosts || []).map((h) => String(h).trim().toLowerCase()).filter((h) => /^[a-z0-9.-]+(?::\d+)?$/.test(h)).map((h) => "https://" + h).join(" ");
  return [
    "default-src 'self'",
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: https: blob:",
    "font-src 'self' data: https:",
    `style-src 'self' 'unsafe-inline'${lib ? " " + lib : ""}`,
    `script-src 'self' 'unsafe-inline'${lib ? " " + lib : ""}`,
    "object-src 'self' data: https:",
    "frame-src 'self' https:",
    "connect-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join("; ");
}
export {
  ADMIN_TOP_ROUTES,
  hostRole,
  isReservedSlug,
  publicHostAllows,
  publicSiteCsp,
  publicUrlFor
};
