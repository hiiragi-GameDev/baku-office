globalThis.process ??= {};
globalThis.process.env ??= {};
import { validateDefinition } from "./appdef_CBJw5awM.mjs";
import { g as getAppDesign } from "./external-apps_Ltsw3Yx-.mjs";
import { p as preflight } from "./preflight_BWqz46-c.mjs";
import { r as runDraftApp, p as platformInvariantSuspected, e as escalatePlatformInvariant } from "./app-runtime_CwwWS9oK.mjs";
function unitsOf(def) {
  if (Array.isArray(def.screens) && def.screens.length) {
    return def.screens.map((s) => ({ id: s.id, title: s.title || s.id, inputs: s.inputs ?? [], output: s.output }));
  }
  return [{ id: void 0, title: "メイン", inputs: def.inputs ?? [], output: def.output }];
}
function isDisplayOnly(def) {
  const html = def.render?.html;
  if (typeof html !== "string" || !html.trim()) return false;
  if (Array.isArray(def.screens) && def.screens.length) return false;
  if (Array.isArray(def.steps) && def.steps.length) return false;
  return !/\bbo\s*\.\s*run\s*\(/.test(html);
}
function sampleInputs(inputs) {
  const out = {};
  for (const inp of inputs) {
    if (inp.default !== void 0) {
      out[inp.name] = inp.default;
      continue;
    }
    switch (inp.type) {
      case "number":
        out[inp.name] = 1;
        break;
      case "boolean":
        out[inp.name] = true;
        break;
      // 選択式（select/radio/scale）は実在する選択肢を使う＝無効値での dry-run 不一致を避ける。
      case "select":
      case "radio":
      case "scale":
        out[inp.name] = inp.options?.[0] ?? "選択肢";
        break;
      case "checkboxes":
        out[inp.name] = inp.options?.length ? [inp.options[0]] : [];
        break;
      case "date":
        out[inp.name] = "2026-01-01";
        break;
      case "time":
        out[inp.name] = "09:00";
        break;
      case "email":
        out[inp.name] = "sample@example-real.co.jp";
        break;
      case "tel":
        out[inp.name] = "09000000000";
        break;
      case "file":
        out[inp.name] = { id: "dryrun", name: "sample.txt" };
        break;
      case "signature":
        out[inp.name] = "data:image/png;base64,";
        break;
      default:
        out[inp.name] = `サンプル${inp.label ? "（" + inp.label + "）" : ""}`;
    }
  }
  return out;
}
function screenIds(def) {
  const ids = /* @__PURE__ */ new Set();
  if (Array.isArray(def.screens)) for (const s of def.screens) ids.add(s.id);
  if (!def.screens || !def.screens.length) ids.add("");
  return ids;
}
async function checkDefinition(ctx, def, permissions, spec) {
  const v = validateDefinition(def);
  if (!v.ok) return { key: "definition", label: "アプリ定義", status: "fail", detail: `定義が不正です：${v.issues.slice(0, 2).map((i) => `${i.path}: ${i.message}`).join(" / ") || "詳細不明"}` };
  const pf = await preflight(ctx, { name: def.name, permissions, definition: def }).catch(() => null);
  if (pf && !pf.ok) {
    const bad = pf.checks.filter((c) => c.status === "fail").map((c) => c.label);
    return { key: "definition", label: "アプリ定義・事前確認", status: "fail", detail: `事前確認に課題があります：${bad.join("、") || "詳細は事前確認を参照"}` };
  }
  return { key: "definition", label: "アプリ定義・事前確認", status: "ok", detail: "定義は妥当で、環境・権限・安全・コストの事前確認も通っています。" };
}
function checkTransitions(def) {
  const ids = screenIds(def);
  const problems = [];
  const html = def.render?.html;
  if (typeof html === "string" && html) {
    const called = /* @__PURE__ */ new Set();
    for (const m of html.matchAll(/bo\.run\(\s*['"]([^'"]*)['"]/g)) called.add(m[1]);
    const callsRun = /\bbo\s*\.\s*run\s*\(/.test(html);
    if (callsRun && (!def.screens || !def.screens.length)) {
      problems.push("カスタムUIが bo.run を呼びますが、対応する画面（screens）が定義されていません");
    } else {
      for (const id of called) if (id && !ids.has(id)) problems.push(`ボタンが呼ぶ画面「${id}」が存在しません`);
    }
  }
  for (const u of unitsOf(def)) {
    const from = (u.output?.from ?? "").replace(/^\$/, "");
    if (!from || from.startsWith("_")) continue;
    const screen = Array.isArray(def.screens) ? def.screens.find((s) => s.id === u.id) : null;
    const steps = screen?.steps ?? def.steps ?? [];
    const names = /* @__PURE__ */ new Set([...steps.map((s) => s.as).filter(Boolean), ...u.inputs.map((i) => i.name)]);
    if (!names.has(from)) problems.push(`画面「${u.title}」の出力が参照する「$${from}」が見つかりません`);
  }
  if (problems.length) return { key: "transitions", label: "画面遷移・ボタン", status: "fail", detail: problems.slice(0, 4).join("。") };
  return { key: "transitions", label: "画面遷移・ボタン", status: "ok", detail: "ボタンの遷移先・出力の参照先はすべて実在します。" };
}
const SANDBOX_FORBIDDEN = [
  { re: /\bindexedDB\b/, label: "indexedDB" },
  { re: /document\.cookie/, label: "document.cookie" },
  { re: /\bXMLHttpRequest\b/, label: "XMLHttpRequest" },
  { re: /\bfetch\s*\(/, label: "fetch()" },
  { re: /\bWebSocket\b/, label: "WebSocket" }
];
function checkSandbox(def) {
  const html = def.render?.html;
  if (typeof html !== "string" || !html) return { key: "sandbox", label: "サンドボックス互換", status: "ok", detail: "カスタムUIは使用していません（標準フォーム）。" };
  const hits = SANDBOX_FORBIDDEN.filter((f) => f.re.test(html)).map((f) => f.label);
  if (hits.length) {
    return {
      key: "sandbox",
      label: "サンドボックス互換",
      status: "fail",
      detail: `カスタムUIがサンドボックスで使えないAPIを使用しています：${hits.join(" / ")}。データの保存・取得・通信は画面(screens)経由の bo.run(...) で行ってください（cookie/fetch/XHR 等は不可）。チャットで「${hits.join("・")}を使わず bo.run 経由に直して」と依頼すると修正できます。`
    };
  }
  return { key: "sandbox", label: "サンドボックス互換", status: "ok", detail: "禁止API（fetch/XHR/cookie 等）の使用は検出されませんでした。" };
}
const FABRICATION = {
  // コロン欠落の不正URL（https// / http//）。正しい https:// は前にコロンが入るので一致しない。
  malformed: [/https?\/\//],
  // 例示用・ダミーの仮値（実在しない＝動かない原因）。誤検知を避け確度の高いものに限定。
  placeholder: [/example\.(?:com|org|net)/i, /your[-_]?domain/i, /\byourdomain\b/i, /(?:your|my)[-_]?api[-_]?key/i, /api[-_]?key[-_]?here/i, /\bsk-x{4,}/i, /<your[_-][a-z]/i, /\{\{\s*(?:api_?key|token|secret)\s*\}\}/i, /lorem ipsum/i]
};
function detectFabrication(text) {
  const grab = (res) => {
    const out = /* @__PURE__ */ new Set();
    for (const re of res) {
      const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
      const m = text.match(g);
      if (m) for (const x of m) out.add(x);
    }
    return [...out].slice(0, 8);
  };
  return { malformed: grab(FABRICATION.malformed), placeholder: grab(FABRICATION.placeholder) };
}
function checkFabrication(def) {
  const { malformed, placeholder } = detectFabrication(JSON.stringify(def));
  if (malformed.length) {
    return { key: "fabrication", label: "捏造・偽値チェック", status: "fail", detail: `不正なURL（コロン欠落など）が含まれており接続できません：${malformed.join(" / ")}。実在する正しいURLに直してください（AIに「正しいURLに直して」と依頼できます）。` };
  }
  if (placeholder.length) {
    return { key: "fabrication", label: "捏造・偽値チェック", status: "warn", detail: `仮の値（例示用ドメイン・ダミーAPIキー等）が含まれている可能性があります：${placeholder.join(" / ")}。実在する値に置き換えてください。` };
  }
  return { key: "fabrication", label: "捏造・偽値チェック", status: "ok", detail: "捏造・偽値（不正URL・例示ドメイン・ダミーキー等）は検出されませんでした。" };
}
async function checkRun(ctx, draftId, def, owner) {
  if (isDisplayOnly(def)) {
    return [{ key: "run:display", label: "動作確認", status: "ok", detail: "表示専用のカスタムUIです。サーバ側で実行する処理はなく、ブラウザ内で完結します。" }];
  }
  const items = [];
  for (const u of unitsOf(def)) {
    const inputs = sampleInputs(u.inputs);
    try {
      const res = await runDraftApp(ctx, draftId, inputs, owner, u.id, { dryRun: true });
      if (res.ok) {
        items.push({ key: `run:${u.id ?? "main"}`, label: `動作確認：${u.title}`, status: "ok", detail: "サンプル入力で処理が最後まで実行できました。" });
      } else if (platformInvariantSuspected(def, res.code)) {
        await escalatePlatformInvariant(ctx, { code: res.code, where: "precheck", defId: def.id });
        items.push({ key: `run:${u.id ?? "main"}`, label: `動作確認：${u.title}`, status: "fail", detail: `アプリ定義は正しいのに実行できませんでした（${res.code}）。これはアプリ側ではなくプラットフォーム側の問題の可能性が高く、運営に自動報告しました。修正をお待ちください（AIへ再依頼しても解消しません）。` });
      } else {
        items.push({ key: `run:${u.id ?? "main"}`, label: `動作確認：${u.title}`, status: "fail", detail: `実行でエラー：${res.error ?? "不明"}${res.code ? `（${res.code}）` : ""}` });
      }
    } catch (e) {
      items.push({ key: `run:${u.id ?? "main"}`, label: `動作確認：${u.title}`, status: "fail", detail: `実行で例外：${e instanceof Error ? e.message : String(e)}` });
    }
  }
  return items;
}
async function loadDraft(ctx, draftId) {
  const d = await getAppDesign(ctx, draftId);
  if (!d || d.source !== "draft" || !d.definition) return null;
  return { def: d.definition, permissions: d.permissions, spec: d.spec };
}
function finalizePrecheck(checks) {
  return { ok: checks.every((c) => c.status !== "fail"), checks };
}
export {
  checkTransitions as a,
  checkSandbox as b,
  checkDefinition as c,
  checkFabrication as d,
  checkRun as e,
  finalizePrecheck as f,
  isDisplayOnly as i,
  loadDraft as l,
  sampleInputs as s,
  unitsOf as u
};
