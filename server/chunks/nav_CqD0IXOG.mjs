globalThis.process ??= {};
globalThis.process.env ??= {};
function buildNav(base, partItems, ov) {
  const hidden = new Set(ov?.hidden ?? []);
  const labels = ov?.labels ?? {};
  let items = [...base, ...partItems].filter((i) => i.show !== false && !hidden.has(i.href)).map((i) => ({ href: i.href, label: labels[i.href] ?? i.label }));
  const seen = /* @__PURE__ */ new Set();
  items = items.filter((i) => seen.has(i.href) ? false : (seen.add(i.href), true));
  if (ov?.order?.length) {
    const rank = (h) => {
      const k = ov.order.indexOf(h);
      return k < 0 ? Number.MAX_SAFE_INTEGER : k;
    };
    items = items.map((it, i) => ({ it, i })).sort((a, b) => rank(a.it.href) - rank(b.it.href) || a.i - b.i).map((x) => x.it);
  }
  return items;
}
const KV_NAV = "nav_overrides";
async function getNavOverrides(ctx) {
  const raw = await ctx.storage.kv.get(KV_NAV);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}
async function setNavOverrides(ctx, ov) {
  const clean = {
    hidden: Array.isArray(ov.hidden) ? ov.hidden.map(String) : [],
    labels: ov.labels && typeof ov.labels === "object" ? ov.labels : {},
    order: Array.isArray(ov.order) ? ov.order.map(String) : []
  };
  await ctx.storage.kv.put(KV_NAV, JSON.stringify(clean));
  return clean;
}
export {
  buildNav,
  getNavOverrides,
  setNavOverrides
};
