globalThis.process ??= {};
globalThis.process.env ??= {};
const DROP_SUBTREE = /* @__PURE__ */ new Set([
  "script",
  "style",
  "svg",
  "math",
  "iframe",
  "object",
  "embed",
  "template",
  "noscript",
  "link",
  "meta",
  "base",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option"
]);
const ALLOWED = /* @__PURE__ */ new Set([
  "a",
  "p",
  "br",
  "hr",
  "span",
  "div",
  "section",
  "article",
  "header",
  "footer",
  "main",
  "aside",
  "nav",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "small",
  "mark",
  "sub",
  "sup",
  "code",
  "pre",
  "blockquote",
  "q",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  "caption",
  "colgroup",
  "col",
  "img",
  "figure",
  "figcaption",
  "picture",
  "source",
  "time",
  "abbr",
  "address"
]);
const VOID = /* @__PURE__ */ new Set(["br", "hr", "img", "col", "source"]);
const GLOBAL_ATTRS = /* @__PURE__ */ new Set(["class", "id", "title", "lang", "dir"]);
const TAG_ATTRS = {
  a: /* @__PURE__ */ new Set(["href", "name", "target", "rel"]),
  img: /* @__PURE__ */ new Set(["src", "alt", "width", "height", "loading"]),
  source: /* @__PURE__ */ new Set(["src", "srcset", "type", "media"]),
  td: /* @__PURE__ */ new Set(["colspan", "rowspan"]),
  th: /* @__PURE__ */ new Set(["colspan", "rowspan", "scope"]),
  col: /* @__PURE__ */ new Set(["span"]),
  time: /* @__PURE__ */ new Set(["datetime"]),
  abbr: /* @__PURE__ */ new Set(["title"])
};
const URL_ATTRS = /* @__PURE__ */ new Set(["href", "src", "srcset"]);
const ALLOWED_SCHEMES = /* @__PURE__ */ new Set(["http", "https", "mailto", "tel"]);
const NAMED = /* @__PURE__ */ new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["colon", ":"],
  ["#x3a", ":"],
  ["#58", ":"],
  ["tab", "	"],
  ["newline", "\n"]
]);
function decodeEntities(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);?/gi, (m, body) => {
    const b = body.toLowerCase();
    if (b[0] === "#") {
      const code = b[1] === "x" ? parseInt(b.slice(2), 16) : parseInt(b.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return NAMED.get(b) ?? m;
  });
}
function safeUrl(raw) {
  const v = decodeEntities(raw).replace(/[\x00-\x20]/g, "").toLowerCase();
  if (v === "") return true;
  if (v.startsWith("//")) return false;
  if (v.startsWith("#") || v.startsWith("/") || v.startsWith("./") || v.startsWith("../") || v.startsWith("?")) return true;
  const m = /^([a-z][a-z0-9+.-]*):/.exec(v);
  if (!m) return true;
  return ALLOWED_SCHEMES.has(m[1]);
}
function safeUrlAttr(key, raw) {
  if (key !== "srcset") return safeUrl(raw);
  return raw.split(",").every((cand) => {
    const url = cand.trim().split(/\s+/)[0] ?? "";
    return safeUrl(url);
  });
}
const esc = (s) => s.replace(/&(?![a-z#0-9]+;)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function safeCssUrl(raw) {
  if (!raw) return "";
  const clean = String(raw).replace(/['"()\\]/g, "").replace(/[\x00-\x1f]/g, "").trim();
  return clean && safeUrl(clean) ? clean : "";
}
function parseTag(inner) {
  let i = 0;
  const selfClose = inner.trimEnd().endsWith("/");
  const body = selfClose ? inner.trimEnd().slice(0, -1) : inner;
  const nm = /^[a-z][a-z0-9:-]*/i.exec(body);
  const name = (nm?.[0] ?? "").toLowerCase();
  i = nm ? nm[0].length : body.length;
  const attrs = [];
  while (i < body.length) {
    while (i < body.length && /\s/.test(body[i])) i++;
    const am = /^[^\s=/>]+/.exec(body.slice(i));
    if (!am) break;
    const key = am[0].toLowerCase();
    i += am[0].length;
    while (i < body.length && /\s/.test(body[i])) i++;
    if (body[i] === "=") {
      i++;
      while (i < body.length && /\s/.test(body[i])) i++;
      let val = "";
      if (body[i] === '"' || body[i] === "'") {
        const q = body[i];
        i++;
        const end = body.indexOf(q, i);
        val = end === -1 ? body.slice(i) : body.slice(i, end);
        i = end === -1 ? body.length : end + 1;
      } else {
        const vm = /^[^\s>]+/.exec(body.slice(i));
        val = vm?.[0] ?? "";
        i += val.length;
      }
      attrs.push([key, val]);
    } else {
      attrs.push([key, null]);
    }
  }
  return { name, attrs, selfClose };
}
function rebuildAttrs(name, attrs) {
  const allow = TAG_ATTRS[name];
  const out = [];
  for (const [k, v] of attrs) {
    if (k.startsWith("on")) continue;
    if (k === "style") continue;
    if (!GLOBAL_ATTRS.has(k) && !(allow && allow.has(k))) continue;
    if (URL_ATTRS.has(k) && v != null && !safeUrlAttr(k, v)) continue;
    if (v == null) {
      out.push(k);
      continue;
    }
    out.push(`${k}="${v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}"`);
  }
  if (name === "a" && out.some((a) => /^target=/.test(a)) && !out.some((a) => /^rel=/.test(a))) out.push('rel="noopener noreferrer"');
  return out.length ? " " + out.join(" ") : "";
}
function sanitizeHtml(html) {
  let out = "";
  let i = 0;
  const n = html.length;
  while (i < n) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      out += esc(html.slice(i));
      break;
    }
    out += esc(html.slice(i, lt));
    if (html.startsWith("<!--", lt)) {
      const e = html.indexOf("-->", lt + 4);
      i = e === -1 ? n : e + 3;
      continue;
    }
    if (html[lt + 1] === "!") {
      const e = html.indexOf(">", lt);
      i = e === -1 ? n : e + 1;
      continue;
    }
    const gt = html.indexOf(">", lt);
    if (gt === -1) {
      out += esc(html.slice(lt));
      break;
    }
    const closing = html[lt + 1] === "/";
    const inner = html.slice(lt + 1 + (closing ? 1 : 0), gt);
    const { name, attrs } = parseTag(closing ? inner.replace(/^\/?/, "") : inner);
    if (!name) {
      out += "&lt;";
      i = lt + 1;
      continue;
    }
    i = gt + 1;
    if (DROP_SUBTREE.has(name)) {
      if (closing) continue;
      const open = new RegExp(`<${name}\\b`, "ig");
      const close = new RegExp(`</${name}\\s*>`, "ig");
      let depth = 1, pos = i;
      while (depth > 0) {
        close.lastIndex = pos;
        const cm = close.exec(html);
        if (!cm) {
          pos = -1;
          break;
        }
        open.lastIndex = pos;
        const om = open.exec(html);
        if (om && om.index < cm.index) {
          depth++;
          pos = om.index + name.length + 1;
          continue;
        }
        depth--;
        pos = cm.index + cm[0].length;
      }
      if (pos === -1) continue;
      i = pos;
      continue;
    }
    if (!ALLOWED.has(name)) continue;
    if (closing) {
      out += `</${name}>`;
      continue;
    }
    out += `<${name}${rebuildAttrs(name, attrs)}${VOID.has(name) ? " /" : ""}>`;
  }
  return out;
}
export {
  safeCssUrl as a,
  sanitizeHtml as s
};
