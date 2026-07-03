globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { blockDef } from "./defs_DgmjYFRV.mjs";
const MAX_BLOCKS = 40;
const MAX_TEXT = 4e3;
const MAX_RICH = 2e4;
const MAX_LIST = 12;
const cleanUrl = (v) => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  if (s === "#" || s.startsWith("#")) return s.slice(0, 200);
  return /^https:\/\/[\w./?=&%:#@-]+$/i.test(s) || /^\/[\w./?=&%#-]*$/.test(s) ? s.slice(0, 500) : "";
};
const cleanText = (v, max = MAX_TEXT) => typeof v === "string" ? v.slice(0, max) : "";
const optValues = (f) => f.options.map((o) => o.value);
function cleanField(f, val) {
  switch (f.type) {
    case "text":
      return cleanText(val);
    case "textarea":
      return cleanText(val, 8e3);
    case "richtext":
      return cleanText(val, MAX_RICH);
    case "image":
      return cleanUrl(val);
    case "url":
      return cleanUrl(val);
    // リンク（ボタンhref等）。不正スキーム（javascript: 等）は空に＝XSS防止（P1-23）
    case "icon":
      return typeof val === "string" ? val.slice(0, 24) : "";
    case "number": {
      const n = Math.round(Number(val));
      return Number.isFinite(n) ? Math.max(0, Math.min(n, 100)) : 0;
    }
    case "boolean":
      return !!val;
    case "select":
      return optValues(f).includes(String(val)) ? String(val) : optValues(f)[0];
    case "list": {
      const arr = Array.isArray(val) ? val.slice(0, Math.min(f.max ?? MAX_LIST, MAX_LIST)) : [];
      return arr.map((row) => {
        const out = {};
        for (const sub of f.item) out[sub.key] = cleanField(sub, row?.[sub.key]);
        return out;
      });
    }
    default:
      return "";
  }
}
function validateLayout(input) {
  const obj = input ?? {};
  const rawBlocks = Array.isArray(obj.blocks) ? obj.blocks : null;
  if (!rawBlocks) return { ok: false, error: "blocks がありません" };
  if (rawBlocks.length > MAX_BLOCKS) return { ok: false, error: `ブロックは最大 ${MAX_BLOCKS} 個までです` };
  const blocks = [];
  let dropped = 0;
  for (const rb of rawBlocks) {
    const b = rb ?? {};
    const def = blockDef(String(b.type));
    if (!def) {
      dropped++;
      continue;
    }
    const props = {};
    const src = b.props ?? {};
    for (const f of def.fields) props[f.key] = cleanField(f, src[f.key]);
    blocks.push({ id: typeof b.id === "string" && b.id ? b.id.slice(0, 24) : randomId(8), type: def.type, props, bg: typeof b.bg === "string" ? b.bg.slice(0, 16) : void 0 });
  }
  const json = JSON.stringify({ version: 1, blocks });
  if (json.length > 256e3) return { ok: false, error: "ページが大きすぎます（画像はURL参照にしてください）" };
  return { ok: true, layout: { version: 1, blocks }, dropped };
}
function makeBlock(type) {
  const def = blockDef(type);
  if (!def) return null;
  return { id: randomId(8), type, props: structuredClone(def.defaults) };
}
export {
  makeBlock as m,
  validateLayout as v
};
