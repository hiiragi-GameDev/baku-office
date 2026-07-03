globalThis.process ??= {};
globalThis.process.env ??= {};
const HOME_SECTIONS = [
  { id: "summary", label: "サマリー（残高・プラン等）" },
  { id: "widgets", label: "アプリの状況（ウィジェット）" },
  // server＝サーバー構成・使用状況カード（Cloudflare・管理者のみ）。ストレージ使用量もこのカードに統合。
  { id: "server", label: "サーバー構成・使用状況（Cloudflare）" },
  // storage＝旧「ストレージ使用量」。管理者は server カードへ統合のため非表示、一般メンバーにのみ描画。
  { id: "storage", label: "ストレージ使用量" },
  { id: "quicklinks", label: "できること（リンク）" }
];
function orderedSections(layout) {
  const hidden = new Set(layout?.hidden ?? []);
  const all = HOME_SECTIONS.map((s) => s.id);
  const order = layout?.order ?? [];
  const rank = (id) => {
    const k = order.indexOf(id);
    return k < 0 ? Number.MAX_SAFE_INTEGER : k;
  };
  return all.filter((id) => !hidden.has(id)).map((id, i) => ({ id, i })).sort((a, b) => rank(a.id) - rank(b.id) || a.i - b.i).map((x) => x.id);
}
const KV_HOME = "home_layout";
async function getHomeLayout(ctx) {
  const raw = await ctx.storage.kv.get(KV_HOME);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}
async function setHomeLayout(ctx, layout) {
  const known = new Set(HOME_SECTIONS.map((s) => s.id));
  const clean = {
    order: (Array.isArray(layout.order) ? layout.order.map(String) : []).filter((id) => known.has(id)),
    hidden: (Array.isArray(layout.hidden) ? layout.hidden.map(String) : []).filter((id) => known.has(id))
  };
  await ctx.storage.kv.put(KV_HOME, JSON.stringify(clean));
  return clean;
}
export {
  HOME_SECTIONS,
  getHomeLayout,
  orderedSections,
  setHomeLayout
};
