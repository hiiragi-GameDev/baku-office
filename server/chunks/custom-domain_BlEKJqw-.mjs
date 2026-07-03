globalThis.process ??= {};
globalThis.process.env ??= {};
function sanitizeDomain(input) {
  const s = String(input ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!s) return "";
  if (s.length > 253) return "";
  const ok = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(s);
  return ok ? s : "";
}
const KV_DOMAIN = "custom_domain";
async function getCustomDomain(ctx) {
  const raw = await ctx.storage.kv.get(KV_DOMAIN);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v.domain === "string" ? v : null;
  } catch {
    return null;
  }
}
async function setCustomDomain(ctx, domainInput, nowSec) {
  const domain = sanitizeDomain(domainInput);
  if (!domain) {
    await ctx.storage.kv.delete(KV_DOMAIN);
    return null;
  }
  const prev = await getCustomDomain(ctx);
  const cfg = { domain, registeredAt: nowSec, publicHost: prev?.publicHost, adminHost: prev?.adminHost, active: prev?.active };
  await ctx.storage.kv.put(KV_DOMAIN, JSON.stringify(cfg));
  return cfg;
}
function siteHostsOf(cfg) {
  if (!cfg || !cfg.domain) return null;
  return {
    publicHost: (cfg.publicHost || cfg.domain).toLowerCase(),
    adminHost: (cfg.adminHost || "app." + cfg.domain).toLowerCase(),
    active: cfg.active === true
    // 明示 active のみ＝希望ドメイン保存だけでは切り替わらない
  };
}
async function getSiteHosts(ctx) {
  return siteHostsOf(await getCustomDomain(ctx));
}
async function getPublicHomeSlug(ctx) {
  return (await getCustomDomain(ctx))?.homeSlug || null;
}
async function setSiteConfig(ctx, fields, nowSec) {
  const prev = await getCustomDomain(ctx);
  if (!prev) return { ok: false, error: "先にカスタムドメインを保存してください。" };
  const cfg = { ...prev, registeredAt: prev.registeredAt };
  if (fields.publicHost !== void 0) cfg.publicHost = sanitizeDomain(fields.publicHost) || void 0;
  if (fields.adminHost !== void 0) cfg.adminHost = sanitizeDomain(fields.adminHost) || void 0;
  if (fields.homeSlug !== void 0) cfg.homeSlug = String(fields.homeSlug || "").trim() || void 0;
  if (fields.active !== void 0) cfg.active = !!fields.active;
  const ph = (cfg.publicHost || cfg.domain).toLowerCase();
  const ah = (cfg.adminHost || "app." + cfg.domain).toLowerCase();
  if (cfg.active && ph === ah) return { ok: false, error: "公開ホストと管理ホストは別にしてください（同一だと隔離が成立しません）。" };
  await ctx.storage.kv.put(KV_DOMAIN, JSON.stringify(cfg));
  return { ok: true, config: cfg };
}
export {
  getCustomDomain,
  getPublicHomeSlug,
  getSiteHosts,
  sanitizeDomain,
  setCustomDomain,
  setSiteConfig,
  siteHostsOf
};
