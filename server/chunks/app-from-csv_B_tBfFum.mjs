globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession, canDevelopApps } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
import { f as startAppBuild, p as processAppBuild } from "./ctx_D9xObGWH.mjs";
import { getWorkersPaid } from "./settings_dTyIbTCR.mjs";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!ses || !canDevelopApps(ses.role, ses.ctx)) return json({ error: "アプリ開発の権限がありません（管理者または開発者のみ）" }, 403);
  const b = await request.json().catch(() => ({}));
  const csv = String(b.csv ?? "").trim();
  if (!csv) return json({ error: "CSV を入力してください" }, 400);
  const rows = csv.split(/\r?\n/).filter((l) => l.trim());
  if (rows.length < 1) return json({ error: "CSV にヘッダー行が必要です" }, 400);
  const headers = splitCsvLine(rows[0]).filter(Boolean).slice(0, 20);
  if (headers.length === 0) return json({ error: "列が読み取れませんでした" }, 400);
  const samples = rows.slice(1, 4).map((r) => splitCsvLine(r).slice(0, headers.length).join(" / ")).join("\n");
  const name = String(b.name ?? "").trim().slice(0, 40) || "データ管理";
  const spec = `「${name}」というデータ管理アプリ（CRUD）をカスタムUIで作ってください。次のCSVの列を入力項目にし、登録・一覧（id付き）・編集・削除（db.delete）ができるようにしてください。一覧は見やすい表で、各行に編集/削除ボタンを置く。
列：${headers.join(", ")}
サンプル行：
${samples || "(なし)"}`;
  const paid = await getWorkersPaid(env).catch(() => false);
  const buildId = await startAppBuild(locals.ctx, { owner: ses.uid, spec, paid });
  try {
    locals.cfContext?.waitUntil(processAppBuild(locals.ctx, buildId, new URL(request.url).origin).then(() => void 0).catch(() => void 0));
  } catch {
  }
  return json({ ok: true, buildId, message: "CSVからアプリの作成を開始しました。完了すると「アプリ開発」に表示されます。" });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
