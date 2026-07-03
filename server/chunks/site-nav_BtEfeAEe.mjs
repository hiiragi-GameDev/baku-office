globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
const KEY = "site_nav";
const STYLES = ["links", "buttons", "pills", "minimal"];
const DEFAULT_BUILTIN = { brand: true, events: false, account: false };
function safeHref(h) {
  const s = String(h ?? "").trim();
  if (s.startsWith("/") && !s.startsWith("//")) return s.slice(0, 300);
  if (/^https:\/\//i.test(s)) return s.slice(0, 300);
  return null;
}
function items(v, max) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const it of v) {
    const label = String(it?.label ?? "").trim().slice(0, 40);
    const href = safeHref(it?.href);
    if (label && href) out.push({ label, href });
    if (out.length >= max) break;
  }
  return out;
}
function langs(v, max) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const it of v) {
    const label = String(it?.label ?? "").trim().slice(0, 24);
    const href = safeHref(it?.href);
    const code = String(it?.code ?? "").trim().toLowerCase().replace(/[^a-z-]/g, "").slice(0, 8);
    if (label && href && code) out.push({ label, href, code });
    if (out.length >= max) break;
  }
  return out;
}
function builtin(v) {
  const o = v && typeof v === "object" ? v : {};
  return {
    brand: o.brand !== false,
    events: o.events === true,
    account: o.account === true
  };
}
function style(v) {
  const s = String(v ?? "").trim();
  return STYLES.includes(s) ? s : "links";
}
async function getSiteNav(env) {
  try {
    const raw = await env.LICENSE.get(KEY);
    if (raw) {
      const o = JSON.parse(raw);
      return {
        menu: items(o.menu, 8),
        footer: items(o.footer, 12),
        langs: langs(o.langs, 8),
        builtin: builtin(o.builtin),
        eventsLabel: String(o.eventsLabel ?? "").trim().slice(0, 24) || "イベント",
        style: style(o.style)
      };
    }
  } catch {
  }
  return { menu: [], footer: [], langs: [], builtin: { ...DEFAULT_BUILTIN }, eventsLabel: "イベント", style: "links" };
}
async function setSiteNav(env, cfg) {
  const clean = {
    menu: items(cfg.menu, 8),
    footer: items(cfg.footer, 12),
    langs: langs(cfg.langs, 8),
    builtin: builtin(cfg.builtin),
    eventsLabel: String(cfg.eventsLabel ?? "").trim().slice(0, 24) || "イベント",
    style: style(cfg.style)
  };
  await kvPut(env, KEY, JSON.stringify(clean));
  return clean;
}
async function aiSiteNav(env, opts) {
  const { inferApp } = await import("./ctx_D9xObGWH.mjs").then((n) => n.M);
  const { parseJsonObject } = await import("./ctx_D9xObGWH.mjs").then((n) => n.R);
  const sys = [
    "あなたは公開サイトの上部メニュー（ナビ）設定アシスタントです。現在の設定と利用者の依頼を踏まえ、新しい設定をJSONのみで返します。",
    '出力スキーマ: {"builtin":{"brand":bool,"events":bool,"account":bool},"eventsLabel":string,"style":"links"|"buttons"|"pills"|"minimal","menu":[{"label":string,"href":string}],"footer":[{"label":string,"href":string}],"note":string}',
    "規則: builtin.brand=タイトル/ロゴ表示, events=イベント導線, account=マイページ/ログアウト/会員ログイン枠。href は /で始まる内部パスか https のみ。menu/footer は依頼で言及された場合のみ変更し、無指定なら現状を保つ。note は日本語1文で変更内容を要約。JSON以外は出力しない。"
  ].join("\n");
  const usr = `現在の設定:
${JSON.stringify({ builtin: opts.current.builtin, eventsLabel: opts.current.eventsLabel, style: opts.current.style, menu: opts.current.menu, footer: opts.current.footer })}

依頼:
${opts.prompt.slice(0, 1500)}`;
  let text;
  try {
    text = await inferApp(env, usr, { system: sys, maxTokens: 1500, modelId: opts.modelId, feature: "site_builder" });
  } catch {
    return { ok: false, error: "AIエンジンを呼び出せませんでした。APIキー設定をご確認ください。" };
  }
  const obj = parseJsonObject(text);
  if (!obj) return { ok: false, error: "AIの応答を解釈できませんでした。依頼を具体的にして再度お試しください。" };
  const nav = await setSiteNav(env, {
    builtin: obj.builtin ?? opts.current.builtin,
    eventsLabel: obj.eventsLabel ?? opts.current.eventsLabel,
    style: obj.style ?? opts.current.style,
    menu: Array.isArray(obj.menu) ? obj.menu : opts.current.menu,
    footer: Array.isArray(obj.footer) ? obj.footer : opts.current.footer,
    langs: opts.current.langs
  });
  return { ok: true, nav, note: typeof obj.note === "string" ? obj.note.slice(0, 200) : void 0 };
}
export {
  aiSiteNav,
  getSiteNav,
  setSiteNav
};
