globalThis.process ??= {};
globalThis.process.env ??= {};
const DEFAULT_BRAND = "baku-office";
const VAR = {
  bg: "--bg",
  surface: "--surface",
  ink: "--ink",
  muted: "--muted",
  line: "--line",
  brand: "--brand",
  brandInk: "--brand-ink",
  ok: "--ok",
  warn: "--warn",
  danger: "--danger"
};
const SAFE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$|^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s]+\)$|^[a-zA-Z]{3,20}$/;
function brandName(t) {
  return (t?.brand ?? "").trim() || DEFAULT_BRAND;
}
function themeCss(t) {
  const c = t?.colors ?? {};
  const decls = [];
  for (const k of Object.keys(VAR)) {
    const v = c[k];
    if (typeof v === "string" && SAFE.test(v.trim())) decls.push(`${VAR[k]}: ${v.trim()};`);
  }
  return decls.length ? `:root{${decls.join("")}}` : "";
}
function sanitizeTheme(input) {
  const o = input ?? {};
  const out = {};
  if (typeof o.brand === "string" && o.brand.trim()) out.brand = o.brand.trim().slice(0, 40);
  if (typeof o.logoUrl === "string") {
    const u = o.logoUrl.trim();
    if (/^https?:\/\//.test(u) || /^\/[\w./?=&-]+$/.test(u)) out.logoUrl = u.slice(0, 400);
  }
  if (typeof o.mascotUrl === "string") {
    const u = o.mascotUrl.trim();
    if (/^https:\/\//.test(u) || /^\/[\w./?=&-]+$/.test(u)) out.mascotUrl = u.slice(0, 400);
  }
  if (o.appearance === "light" || o.appearance === "dark") out.appearance = o.appearance;
  const colors = {};
  const ic = o.colors ?? {};
  for (const k of Object.keys(VAR)) {
    const v = ic[k];
    if (typeof v === "string" && SAFE.test(v.trim())) colors[k] = v.trim();
  }
  if (Object.keys(colors).length) out.colors = colors;
  return out;
}
const KV_THEME = "ui_theme";
async function getTheme(ctx) {
  const raw = await ctx.storage.kv.get(KV_THEME);
  if (!raw) return {};
  try {
    return sanitizeTheme(JSON.parse(raw));
  } catch {
    return {};
  }
}
async function setTheme(ctx, input) {
  const t = sanitizeTheme(input);
  await ctx.storage.kv.put(KV_THEME, JSON.stringify(t));
  return t;
}
export {
  brandName,
  getTheme,
  sanitizeTheme,
  setTheme,
  themeCss
};
