globalThis.process ??= {};
globalThis.process.env ??= {};
import { ALLOWED_PERMISSIONS } from "./apps_qko8nJrR.mjs";
import { i as isVersionPinned } from "./cdn-allowlist_rKupC5M_.mjs";
const APP_ROLES = ["admin", "developer", "accounting", "clerical", "other", "member", "guest"];
const APP_SCHEMA = "baku.app/1";
const OPTION_INPUT_TYPES = ["select", "radio", "checkboxes", "scale"];
const RENDER_HTML_MAX = 256 * 1024;
function sanitizeRenderHtml(html) {
  if (typeof html !== "string") return html;
  let h = html.trim();
  const fence = h.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence) h = fence[1].trim();
  const m = h.match(/<(?:!doctype\b|html\b|head\b|body\b|div\b|section\b|main\b|style\b|header\b|h1\b)/i);
  if (m && (m.index ?? 0) > 0) h = h.slice(m.index);
  return h.trim();
}
const OP_PERMISSION = {
  "ai.infer": "ai",
  "transform": null,
  "file.save": "storage:write",
  "file.read": "storage:read",
  "db.query": "db:read",
  "db.write": "db:write",
  // db.delete は任意SQLを取らず、app_records を id＋app_id＋owner でスコープ削除する固定op（CRUDの削除・B1）。
  "db.delete": "db:write",
  // data.* は生SQLを取らない構造化データ op。実行時に app_records へ app_id＋owner を強制（生成アプリ用）。
  "data.list": "db:read",
  "data.get": "db:read",
  "data.create": "db:write",
  "data.update": "db:write",
  "data.remove": "db:write",
  "http.fetch": "net",
  // 通知・メール送信（B2）。アプリ内通知＝notify、メール送信も notify（実行時に組織のGmail連携を要求）。
  "notify": "notify",
  // 組織ナレッジ検索（RAG・B5）。社内文書を根拠に ai.infer を接地する。
  "knowledge.search": "knowledge",
  // 承認ワークフロー（B10）。レコードの status を遷移（申請→承認/却下）。app_id スコープで更新。
  "record.status": "db:write"
};
const ALL_OPS = Object.keys(OP_PERMISSION);
const RAW_SQL_OPS = ["db.query", "db.write"];
const GENERATED_OPS = ALL_OPS.filter((op) => !RAW_SQL_OPS.includes(op));
const INPUT_TYPES = ["text", "textarea", "number", "boolean", "select", "radio", "checkboxes", "scale", "date", "time", "email", "tel", "file", "signature"];
const IDENT = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const opCatalogText = () => GENERATED_OPS.map((op) => `${op}${OP_PERMISSION[op] ? `（要 ${OP_PERMISSION[op]}）` : "（権限不要）"}`).join("、");
function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
function isBlockedHost(host) {
  const h = host.toLowerCase().replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
  if (h === "localhost" || h === "::1" || h === "0.0.0.0" || h === "metadata.google.internal") return true;
  if (h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".localhost")) return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^\d+$/.test(h) || /^0x[0-9a-f]+$/.test(h)) return true;
  if (h.includes(":") && (h.startsWith("::ffff:") || h === "::" || /^f[cd][0-9a-f]{2}:/.test(h) || /^fe[89ab][0-9a-f]:/.test(h))) return true;
  return false;
}
function scanJsSyntax(code) {
  const n = code.length;
  let i = 0;
  let prevSig = "";
  const snip = (p) => JSON.stringify(code.slice(p, Math.min(n, p + 40)));
  const skipString = (q, start) => {
    let j = start + 1;
    while (j < n) {
      const d = code[j];
      if (d === "\\") {
        j += 2;
        continue;
      }
      if (d === "\n") return { j, err: `文字列(${q})が改行で途切れています: ${snip(start)}` };
      if (d === q) return { j: j + 1 };
      j++;
    }
    return { j, err: `文字列(${q})が閉じていません（末尾まで未終端）: ${snip(start)}` };
  };
  const skipTemplate = (start) => {
    let j = start + 1;
    while (j < n) {
      const d = code[j];
      if (d === "\\") {
        j += 2;
        continue;
      }
      if (d === "`") return { j: j + 1 };
      if (d === "$" && code[j + 1] === "{") {
        j += 2;
        let depth = 1;
        while (j < n && depth > 0) {
          const e = code[j];
          if (e === "'" || e === '"') {
            const r = skipString(e, j);
            if (r.err) return r;
            j = r.j;
            continue;
          }
          if (e === "`") {
            const r = skipTemplate(j);
            if (r.err) return r;
            j = r.j;
            continue;
          }
          if (e === "{") depth++;
          else if (e === "}") depth--;
          j++;
        }
        continue;
      }
      j++;
    }
    return { j, err: "テンプレート文字列(`)が閉じていません（末尾まで未終端）" };
  };
  const regexAllowedAfter = /* @__PURE__ */ new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^", "\n"]);
  while (i < n) {
    const c = code[i];
    if (c === "/" && code[i + 1] === "/") {
      i += 2;
      while (i < n && code[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && code[i + 1] === "*") {
      i += 2;
      while (i < n && !(code[i] === "*" && code[i + 1] === "/")) i++;
      if (i >= n) return "ブロックコメント(/* */)が閉じていません";
      i += 2;
      continue;
    }
    if (c === "'" || c === '"') {
      const r = skipString(c, i);
      if (r.err) return r.err;
      i = r.j;
      prevSig = c;
      continue;
    }
    if (c === "`") {
      const r = skipTemplate(i);
      if (r.err) return r.err;
      i = r.j;
      prevSig = "`";
      continue;
    }
    if (c === "/" && regexAllowedAfter.has(prevSig)) {
      let j = i + 1;
      let inClass = false;
      while (j < n) {
        const d = code[j];
        if (d === "\\") {
          j += 2;
          continue;
        }
        if (d === "\n") break;
        if (d === "[") inClass = true;
        else if (d === "]") inClass = false;
        else if (d === "/" && !inClass) {
          j++;
          break;
        }
        j++;
      }
      i = j;
      prevSig = "/";
      continue;
    }
    if (!/\s/.test(c)) prevSig = c;
    i++;
  }
  return null;
}
function checkRenderScripts(html) {
  if (typeof html !== "string") return null;
  const opens = (html.match(/<script\b[^>]*>/gi) ?? []).length;
  const closes = (html.match(/<\/script\s*>/gi) ?? []).length;
  if (opens > closes) return "<script> が閉じられていません（生成が途中で切れた可能性）。スクリプト全体が無効になり、ボタン等が動きません。";
  for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)(?:<\/script\s*>|$)/gi)) {
    const err = scanJsSyntax(m[1]);
    if (err) return err;
  }
  return null;
}
const HANDLER_KEYWORDS = /* @__PURE__ */ new Set(["if", "for", "while", "switch", "catch", "return", "typeof", "function", "do", "else", "new", "delete", "void", "await", "throw", "in", "of", "instanceof", "case", "with", "yield", "super", "var", "let", "const"]);
const HANDLER_BUILTINS = /* @__PURE__ */ new Set(["alert", "confirm", "prompt", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent", "decodeURIComponent", "requestAnimationFrame", "Number", "String", "Boolean", "Array", "Object", "JSON", "Math", "Date", "RegExp", "Map", "Set", "Promise", "fetch", "print", "focus", "blur", "alert", "open", "postMessage", "structuredClone"]);
function checkRenderHandlers(html) {
  if (typeof html !== "string" || !html) return null;
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)(?:<\/script\s*>|$)/gi)].map((m) => m[1]).join("\n");
  if (!scripts) return null;
  const isDefined = (name) => {
    const e = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`function\\s+${e}\\b|\\b(?:const|let|var)\\s+${e}\\b|window\\.${e}\\s*=|\\b${e}\\s*=\\s*(?:function|async|\\()|\\b${e}\\s*:\\s*(?:function|async|\\()`).test(scripts);
  };
  const EVENTS = /\bon(?:click|change|input|submit|keyup|keydown|keypress|mousedown|mouseup|mouseover|mouseout|dblclick|touchstart|touchend|toggle)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  const missing = /* @__PURE__ */ new Set();
  for (const m of html.matchAll(EVENTS)) {
    const code = m[2] ?? m[3] ?? "";
    for (const c of code.matchAll(/(^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) {
      const name = c[2];
      if (HANDLER_KEYWORDS.has(name) || HANDLER_BUILTINS.has(name)) continue;
      if (!isDefined(name)) missing.add(name);
    }
  }
  if (missing.size) {
    const list = [...missing].slice(0, 3).join("()・") + "()";
    return `イベント属性（onclick 等）が未定義の関数を呼んでいます：${list}。ボタン等を押しても動作しません。該当関数を <script> 内に定義するか、呼び出し名を既存の関数に合わせてください。`;
  }
  return null;
}
function checkRenderDataKeys(def) {
  if (!def || typeof def !== "object") return null;
  const d = def;
  const html = d.render?.html;
  if (typeof html !== "string" || !html) return null;
  const screens = Array.isArray(d.screens) ? d.screens : [];
  if (!screens.length) return null;
  const screenInfo = /* @__PURE__ */ new Map();
  for (const s of screens) {
    if (!s || typeof s !== "object") continue;
    const ss = s;
    const id = typeof ss.id === "string" ? ss.id : "";
    if (!id) continue;
    const hasCreate = Array.isArray(ss.steps) && ss.steps.some((st) => st != null && typeof st === "object" && st.op === "data.create");
    const required = /* @__PURE__ */ new Set();
    if (Array.isArray(ss.inputs)) for (const inp of ss.inputs) {
      if (inp != null && typeof inp === "object") {
        const ii = inp;
        if (ii.required === true && typeof ii.name === "string") required.add(ii.name);
      }
    }
    screenInfo.set(id, { required, hasCreate });
  }
  const callKeys = /* @__PURE__ */ new Map();
  for (const m of html.matchAll(/bo\.run\(\s*['"]([A-Za-z0-9_]+)['"]\s*,\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g)) {
    const id = m[1];
    const body = m[2] ?? "";
    const keys = callKeys.get(id) ?? /* @__PURE__ */ new Set();
    for (const k of body.matchAll(/(?:^|[,{])\s*['"]?([A-Za-z_$][\w$]*)['"]?\s*(?=[:,}]|$)/g)) keys.add(k[1]);
    callKeys.set(id, keys);
  }
  for (const [id, info] of screenInfo) {
    if (!info.hasCreate || info.required.size === 0) continue;
    const provided = callKeys.get(id);
    if (!provided) continue;
    const missing = [...info.required].filter((r) => !provided.has(r));
    if (missing.length) {
      return `保存処理（画面「${id}」）に必要な項目「${missing.slice(0, 3).join("・")}」が bo.run の入力キーに渡されていません。入力欄の name と bo.run({…}) のキー名を一致させてください（不一致だと保存が空になります）。`;
    }
  }
  return null;
}
function validateDefinition(input) {
  const issues = [];
  const required = /* @__PURE__ */ new Set();
  const add = (path, message) => issues.push({ path, message });
  if (typeof input !== "object" || input === null) {
    return { ok: false, issues: [{ path: "", message: "定義がオブジェクトではありません。" }], requiredPermissions: [] };
  }
  const d = input;
  if (d.schema !== APP_SCHEMA) add("schema", `schema は "${APP_SCHEMA}" である必要があります。`);
  if (typeof d.id !== "string" || !d.id.trim()) add("id", "id が必要です。");
  if (typeof d.name !== "string" || !d.name.trim()) add("name", "name が必要です。");
  if (typeof d.version !== "string" || !/^\d+\.\d+\.\d+$/.test(d.version ?? "")) add("version", "version は semver（例 0.1.0）で指定してください。");
  const declared = Array.isArray(d.permissions) ? d.permissions : [];
  for (const p of declared) if (!ALLOWED_PERMISSIONS.has(p)) add("permissions", `未知/不許可の権限：${p}`);
  const validateUnit = (inputsArr, stepsArr, output, prefix, optionalOutput = false) => {
    const inputNames = /* @__PURE__ */ new Set();
    const fileProducers = /* @__PURE__ */ new Set();
    if (!Array.isArray(inputsArr)) add(`${prefix}inputs`, "inputs は配列である必要があります。");
    else inputsArr.forEach((inp, i) => {
      if (!inp || typeof inp !== "object") {
        add(`${prefix}inputs[${i}]`, "入力定義が不正です。");
        return;
      }
      if (typeof inp.name !== "string" || !IDENT.test(inp.name)) add(`${prefix}inputs[${i}].name`, "name は識別子（英字始まり）で指定してください。");
      else {
        inputNames.add(inp.name);
        if (inp.type === "file" || inp.type === "signature") fileProducers.add(inp.name);
      }
      if (!INPUT_TYPES.includes(inp.type)) add(`${prefix}inputs[${i}].type`, `type は ${INPUT_TYPES.join("/")} のいずれか。`);
      if (OPTION_INPUT_TYPES.includes(inp.type) && (!Array.isArray(inp.options) || inp.options.length === 0)) add(`${prefix}inputs[${i}].options`, `${inp.type} には options（選択肢）が必要です。`);
    });
    const bound = new Set(inputNames);
    const refOk = (ref) => typeof ref === "string" && (!ref.startsWith("$") || bound.has(ref.slice(1)));
    if (!Array.isArray(stepsArr) || stepsArr.length === 0) add(`${prefix}steps`, "steps は1つ以上必要です。");
    else stepsArr.forEach((s, i) => {
      const at = `${prefix}steps[${i}]`;
      if (!s || typeof s !== "object" || !ALL_OPS.includes(s.op)) {
        add(at, `op は次のいずれか：${ALL_OPS.join("/")}`);
        return;
      }
      const perm = OP_PERMISSION[s.op];
      if (perm) {
        required.add(perm);
        if (!declared.includes(perm)) add(`${at}.op`, `op ${s.op} には権限 ${perm} の宣言が必要です。`);
      }
      switch (s.op) {
        case "ai.infer":
          if (typeof s.prompt !== "string" || !s.prompt.trim()) add(`${at}.prompt`, "ai.infer には prompt が必要です。");
          for (const a of s.attach ?? []) if (!refOk(a)) add(`${at}.attach`, `未定義の参照：${a}`);
          break;
        case "transform":
          if (typeof s.template !== "string" && typeof s.path !== "string") add(at, "transform は template か path が必要です。");
          if (s.from !== void 0 && !refOk(s.from)) add(`${at}.from`, `未定義の参照：${s.from}`);
          break;
        case "file.save":
          if (!refOk(s.from)) add(`${at}.from`, "file.save には保存元 from（参照）が必要です。");
          if (typeof s.filename !== "string" || !s.filename.trim()) add(`${at}.filename`, "file.save には filename が必要です。");
          break;
        case "file.read":
          if (!refOk(s.fileId)) add(`${at}.fileId`, "file.read には fileId（参照）が必要です。");
          break;
        case "db.query":
        case "db.write":
          add(`${at}.op`, `${s.op}（生SQL）は使用できません。保存=data.create／一覧=data.list／取得=data.get／更新=data.update／削除=data.remove を使ってください。`);
          break;
        case "db.delete":
          if (!refOk(s.from)) add(`${at}.from`, 'db.delete には削除するレコードの id 参照（from）が必要です。例：from を "$id"。');
          break;
        case "data.create":
          if (!refOk(s.from)) add(`${at}.from`, 'data.create には保存する内容の参照（from）が必要です。例：from を "$rec"。');
          if (s.collection !== void 0 && !IDENT.test(s.collection)) add(`${at}.collection`, "collection は識別子（英字始まり）で指定してください。");
          break;
        case "data.update":
          if (!refOk(s.recordId)) add(`${at}.recordId`, 'data.update には対象レコードの id 参照（recordId）が必要です。例：recordId を "$id"。');
          if (!refOk(s.from)) add(`${at}.from`, 'data.update には更新内容の参照（from）が必要です。例：from を "$rec"。');
          if (s.collection !== void 0 && !IDENT.test(s.collection)) add(`${at}.collection`, "collection は識別子（英字始まり）で指定してください。");
          break;
        case "data.get":
        case "data.remove":
          if (!refOk(s.recordId)) add(`${at}.recordId`, `${s.op} には対象レコードの id 参照（recordId）が必要です。例：recordId を "$id"。`);
          if (s.collection !== void 0 && !IDENT.test(s.collection)) add(`${at}.collection`, "collection は識別子（英字始まり）で指定してください。");
          break;
        case "data.list":
          if (s.collection !== void 0 && !IDENT.test(s.collection)) add(`${at}.collection`, "collection は識別子（英字始まり）で指定してください。");
          break;
        case "knowledge.search":
          if (!refOk(s.from)) add(`${at}.from`, 'knowledge.search には検索クエリの参照（from）が必要です。例：from を "$question"。');
          break;
        case "record.status":
          if (!refOk(s.from)) add(`${at}.from`, 'record.status には対象レコードの id 参照（from）が必要です。例：from を "$id"。');
          if (typeof s.to !== "string" || !s.to.trim()) add(`${at}.to`, 'record.status には遷移先の状態 to が必要です（例 "approved"）。');
          if (!Array.isArray(s.requiredRoles) || s.requiredRoles.length === 0) add(`${at}.requiredRoles`, 'record.status には実行できるロール requiredRoles（1つ以上）が必要です（例 ["admin"]）。承認操作の権限は省略できません。');
          else if (s.requiredRoles.some((r) => !APP_ROLES.includes(r))) add(`${at}.requiredRoles`, `requiredRoles は ${APP_ROLES.join("/")} の配列で指定してください。`);
          if (typeof s.fromStatus !== "string" || !s.fromStatus.trim()) add(`${at}.fromStatus`, 'record.status には遷移元の状態 fromStatus が必要です（例 "pending"）。未定義の状態遷移を防ぎます。');
          break;
        case "notify":
          if (s.channel !== "inapp" && s.channel !== "email") add(`${at}.channel`, "notify の channel は inapp か email を指定してください。");
          if (typeof s.message !== "string" || !s.message.trim()) add(`${at}.message`, "notify には message（本文）が必要です。");
          if (s.channel === "email") {
            if (typeof s.to !== "string" || !s.to.trim()) add(`${at}.to`, "メール通知には宛先 to が必要です。");
            if (typeof s.subject !== "string" || !s.subject.trim()) add(`${at}.subject`, "メール通知には subject（件名）が必要です。");
          }
          break;
        case "http.fetch": {
          if (typeof s.url !== "string" || !/^https:\/\//.test(s.url)) add(`${at}.url`, "http.fetch の url は https のみ許可されます。");
          else {
            const host = hostOf(s.url);
            const allow = Array.isArray(d.allowHosts) ? d.allowHosts : [];
            if (!host || !allow.includes(host)) add(`${at}.url`, `送信先 ${host ?? s.url} は allowHosts に未登録です。`);
            else if (isBlockedHost(host)) add(`${at}.url`, `内部/ローカルのホストへは送信できません：${host}`);
          }
          break;
        }
      }
      if (typeof s.as === "string") {
        if (!IDENT.test(s.as)) add(`${at}.as`, "as は識別子で指定してください。");
        else {
          bound.add(s.as);
          if (s.op === "file.save") fileProducers.add(s.as);
        }
      }
    });
    if (output === void 0 || output === null) {
      if (!optionalOutput) add(`${prefix}output`, "output が必要です。");
    } else if (typeof output !== "object") {
      add(`${prefix}output`, "output が必要です。");
    } else {
      const o = output;
      if (!["text", "file", "table", "chart"].includes(o.type)) add(`${prefix}output.type`, "output.type は text/file/table/chart のいずれか。");
      if (!refOk(o.from)) add(`${prefix}output.from`, `未定義の参照：${o.from}`);
      else if (o.type === "file") {
        const fromName = typeof o.from === "string" && o.from.startsWith("$") ? o.from.slice(1) : "";
        if (!fileProducers.has(fromName)) add(`${prefix}output.from`, `output.type=file には、ファイル入力（file/signature）か file.save の結果（as）を from に指定してください。テキスト等の結果は file 出力にできません（参照：${o.from}）。`);
      }
    }
  };
  const hasRender = d.render !== void 0 && d.render !== null;
  if (hasRender) {
    const r = d.render;
    const html = r.html;
    if (typeof html !== "string" || !html.trim()) add("render.html", "render.html（HTML文字列）が必要です。");
    else if (html.length > RENDER_HTML_MAX) add("render.html", `render.html が大きすぎます（上限 ${Math.floor(RENDER_HTML_MAX / 1024)}KB）。`);
    else {
      const jsErr = checkRenderScripts(html);
      if (jsErr) add("render.html", `カスタムUIのスクリプトに構文エラーがあり全ボタンが動かなくなります（要修正）：${jsErr}`);
      else {
        const hErr = checkRenderHandlers(html);
        if (hErr) add("render.html", hErr);
      }
    }
    if (r.isolation !== void 0 && r.isolation !== "sandboxed" && r.isolation !== "relaxed") add("render.isolation", 'render.isolation は "sandboxed" か "relaxed" を指定してください。');
    const rHosts = Array.isArray(r.allowHosts) ? r.allowHosts.filter((h) => typeof h === "string") : [];
    for (const ah of rHosts) if (isBlockedHost(ah)) add("render.allowHosts", `内部/ローカルのホストは許可できません：${ah}`);
    const cHosts = Array.isArray(r.connectHosts) ? r.connectHosts.filter((h) => typeof h === "string") : [];
    for (const ch of cHosts) if (isBlockedHost(ch)) add("render.connectHosts", `内部/ローカルのホストは許可できません：${ch}`);
    if (r.isolation === "relaxed" && typeof html === "string") {
      for (const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["'](https?:\/\/([^/"'?#]+)[^"']*)["']/gi)) {
        const url = m[1];
        const host = m[2].toLowerCase();
        if (!rHosts.some((h) => h.toLowerCase() === host)) add("render.allowHosts", `外部スクリプト ${host} を読み込むには render.allowHosts に ${host} を宣言してください。`);
        if (!isVersionPinned(url)) add("render.html", `外部スクリプトは版を固定してください（${host} の URL に @1.2.3 等のバージョンが必要・/latest/ は不可）。`);
      }
      for (const m of html.matchAll(/<link\b[^>]*\bhref\s*=\s*["'](https?:\/\/([^/"'?#]+)[^"']*)["'][^>]*>/gi)) {
        if (!/\brel\s*=\s*["'][^"']*\bstylesheet\b/i.test(m[0])) continue;
        const url = m[1];
        const host = m[2].toLowerCase();
        if (!rHosts.some((h) => h.toLowerCase() === host)) add("render.allowHosts", `外部スタイルシート ${host} を読み込むには render.allowHosts に ${host} を宣言してください。`);
        if (!isVersionPinned(url)) add("render.html", `外部スタイルシートは版を固定してください（${host} の URL に版が必要・/latest/ は不可）。`);
      }
    }
  }
  const uiOnly = hasRender && (!Array.isArray(d.screens) || d.screens.length === 0) && (!Array.isArray(d.steps) || d.steps.length === 0);
  if (Array.isArray(d.screens) && d.screens.length > 0) {
    const ids = /* @__PURE__ */ new Set();
    d.screens.forEach((sc, i) => {
      if (!sc || typeof sc !== "object") {
        add(`screens[${i}]`, "画面定義が不正です。");
        return;
      }
      if (typeof sc.id !== "string" || !IDENT.test(sc.id)) add(`screens[${i}].id`, "画面の id は識別子（英字始まり）で指定してください。");
      else if (ids.has(sc.id)) add(`screens[${i}].id`, `画面の id が重複しています：${sc.id}`);
      else ids.add(sc.id);
      if (!hasRender && (typeof sc.title !== "string" || !sc.title.trim())) add(`screens[${i}].title`, "画面の title が必要です。");
      if (sc.requiredRoles !== void 0 && (!Array.isArray(sc.requiredRoles) || sc.requiredRoles.some((r) => !APP_ROLES.includes(r)))) add(`screens[${i}].requiredRoles`, `requiredRoles は ${APP_ROLES.join("/")} の配列で指定してください。`);
      validateUnit(sc.inputs, sc.steps, sc.output, `screens[${i}].`, hasRender);
    });
  } else if (!uiOnly) {
    validateUnit(d.inputs, d.steps, d.output, "");
  }
  if (d.dataScope !== void 0 && d.dataScope !== "personal" && d.dataScope !== "shared") add("dataScope", "dataScope は personal か shared を指定してください。");
  if (required.has("net") && (!Array.isArray(d.allowHosts) || d.allowHosts.length === 0)) add("allowHosts", "http.fetch（net）を使うには allowHosts の宣言が必要です。");
  for (const ah of d.allowHosts ?? []) if (isBlockedHost(ah)) add("allowHosts", `内部/ローカルのホストは許可できません：${ah}`);
  if (hasRender) {
    const html = d.render.html;
    if (typeof html === "string") {
      const defined = new Set(
        (Array.isArray(d.screens) ? d.screens : []).map((s) => s && typeof s === "object" ? String(s.id ?? "") : "").filter(Boolean)
      );
      const refs = /* @__PURE__ */ new Set();
      for (const m of html.matchAll(/\bbo\s*\.\s*run\(\s*['"]([^'"]+)['"]/g)) refs.add(m[1]);
      for (const r of refs) if (!defined.has(r)) add("render.html", `カスタムUIが呼び出す画面「${r}」が screens[] に定義されていません（bo.run の呼び先が無く動作しません）。`);
    }
  }
  return { ok: issues.length === 0, issues, requiredPermissions: [...required] };
}
function stepsForEffects(def, screenId) {
  if (Array.isArray(def.screens) && def.screens.length > 0) {
    const sc = screenId !== void 0 && screenId !== "" ? def.screens.find((s) => s.id === screenId) : def.screens[0];
    return Array.isArray(sc?.steps) ? sc.steps : [];
  }
  return Array.isArray(def.steps) ? def.steps : [];
}
function appApprovalEffects(def, screenId) {
  let external = false;
  let irreversible = false;
  const ops = /* @__PURE__ */ new Set();
  const hosts = /* @__PURE__ */ new Set();
  const emailTo = /* @__PURE__ */ new Set();
  for (const s of stepsForEffects(def, screenId)) {
    switch (s.op) {
      case "http.fetch":
        external = true;
        ops.add("外部HTTP送信");
        try {
          if (s.url) hosts.add(new URL(s.url).host);
        } catch {
        }
        break;
      case "notify":
        if (s.channel === "email") {
          external = true;
          ops.add("メール送信");
          if (s.to) emailTo.add(s.to);
        }
        break;
      case "data.remove":
      case "db.delete":
        irreversible = true;
        ops.add("データ削除");
        break;
      case "record.status":
        irreversible = true;
        ops.add("承認状態の変更");
        break;
    }
  }
  return { external, irreversible, ops: [...ops], hosts: [...hosts], emailTo: [...emailTo] };
}
function isRenderable(input) {
  const vr = validateDefinition(input);
  if (vr.ok) return true;
  return vr.issues.every((i) => i.path === "render.html" && (i.message.includes("screens[] に定義されていません") || i.message.includes("カスタムUIのスクリプトに構文エラー") || i.message.includes("未定義の関数を呼んでいます")));
}
function roleCanOpenScreen(role, requiredRoles) {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (role === "admin" || role === "developer") return true;
  return !!role && requiredRoles.includes(role);
}
function normalizeInput(raw) {
  const i = raw && typeof raw === "object" ? raw : {};
  const known = INPUT_TYPES.includes(i.type);
  const name = typeof i.name === "string" ? i.name : "";
  return {
    name,
    type: known ? i.type : "text",
    label: typeof i.label === "string" && i.label ? i.label : name,
    required: i.required === true,
    options: Array.isArray(i.options) ? i.options.filter((o) => typeof o === "string") : [],
    accept: typeof i.accept === "string" ? i.accept : "",
    placeholder: typeof i.placeholder === "string" ? i.placeholder : "",
    degraded: !known && i.type !== void 0,
    originalType: known ? void 0 : typeof i.type === "string" ? i.type : void 0
  };
}
const normalizeInputs = (arr) => Array.isArray(arr) ? arr.map(normalizeInput).filter((x) => x.name) : [];
function normalizeScreens(def) {
  const d = def && typeof def === "object" ? def : {};
  if (Array.isArray(d.screens) && d.screens.length > 0) {
    return d.screens.map((s, idx) => {
      const sc = s && typeof s === "object" ? s : {};
      return {
        id: typeof sc.id === "string" ? sc.id : `screen${idx}`,
        title: typeof sc.title === "string" && sc.title ? sc.title : `画面${idx + 1}`,
        inputs: normalizeInputs(sc.inputs),
        submitLabel: sc.ui?.submitLabel ?? "実行する",
        requiredRoles: Array.isArray(sc.requiredRoles) ? sc.requiredRoles.filter((r) => APP_ROLES.includes(r)) : []
      };
    });
  }
  return [{ id: "", title: "", inputs: normalizeInputs(d.inputs), submitLabel: d.ui?.submitLabel ?? "実行する", requiredRoles: [] }];
}
export {
  ALL_OPS,
  APP_ROLES,
  APP_SCHEMA,
  GENERATED_OPS,
  OPTION_INPUT_TYPES,
  OP_PERMISSION,
  RENDER_HTML_MAX,
  appApprovalEffects,
  checkRenderDataKeys,
  checkRenderHandlers,
  checkRenderScripts,
  isBlockedHost,
  isRenderable,
  normalizeScreens,
  opCatalogText,
  roleCanOpenScreen,
  sanitizeRenderHtml,
  validateDefinition
};
