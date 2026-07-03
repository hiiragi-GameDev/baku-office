globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { env } from "cloudflare:workers";
function csvCell(v) {
  const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function parseRecords(rows) {
  const parsed = rows.map((r) => {
    let d = {};
    try {
      const o = r.data ? JSON.parse(r.data) : {};
      if (o && typeof o === "object" && !Array.isArray(o)) d = o;
    } catch {
    }
    return { d, created_at: r.created_at };
  });
  const keys = [];
  for (const p of parsed) for (const k of Object.keys(p.d)) if (!keys.includes(k)) keys.push(k);
  const ordered = [...keys.filter((k) => !k.startsWith("_")), ...keys.filter((k) => k.startsWith("_"))];
  return { ordered, parsed };
}
function recordsToCsv(rows) {
  const { ordered, parsed } = parseRecords(rows);
  const header = [...ordered, "created_at"];
  const lines = [header.map(csvCell).join(",")];
  for (const p of parsed) {
    const row = ordered.map((k) => csvCell(p.d[k]));
    row.push(p.created_at ? new Date(p.created_at * 1e3).toISOString() : "");
    lines.push(row.join(","));
  }
  return "\uFEFF" + lines.join("\r\n");
}
function recordsToMarkdown(rows, title) {
  const { ordered, parsed } = parseRecords(rows);
  const cell = (v) => (v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)).replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
  const header = [...ordered, "日時"];
  const out = [];
  if (title) out.push(`# ${title}`, "");
  out.push(`件数: ${parsed.length}`, "");
  out.push("| " + header.join(" | ") + " |");
  out.push("| " + header.map(() => "---").join(" | ") + " |");
  for (const p of parsed) {
    const row = ordered.map((k) => cell(p.d[k]));
    row.push(p.created_at ? new Date(p.created_at * 1e3).toLocaleString("ja-JP") : "");
    out.push("| " + row.join(" | ") + " |");
  }
  return out.join("\n");
}
function recordsToPrintHtml(rows, title) {
  const { ordered, parsed } = parseRecords(rows);
  const esc = (v) => (v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const th = [...ordered, "日時"].map((h) => `<th>${esc(h)}</th>`).join("");
  const trs = parsed.map((p) => {
    const tds = ordered.map((k) => `<td>${esc(p.d[k])}</td>`).join("");
    const dt = p.created_at ? new Date(p.created_at * 1e3).toLocaleString("ja-JP") : "";
    return `<tr>${tds}<td>${esc(dt)}</td></tr>`;
  }).join("");
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:system-ui,-apple-system,'Hiragino Sans','Noto Sans JP',sans-serif;color:#1B1D22;padding:24px;margin:0}h1{font-size:18px;margin:0 0 4px}.meta{color:#6E7179;font-size:12px;margin-bottom:16px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #cfcfd6;padding:6px 8px;text-align:left;vertical-align:top;word-break:break-word}th{background:#f2f1f4;color:#1B1D22}.bar{margin-bottom:14px}.bar button{font:inherit;background:#1B1D22;color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer}@media print{.bar{display:none}body{padding:0}}</style></head><body><h1>${esc(title)}</h1><div class="meta">件数: ${parsed.length}</div><div class="bar"><button onclick="window.print()">🖨 印刷 / PDFで保存</button></div><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table><script>window.addEventListener('load',function(){setTimeout(function(){try{window.print()}catch(e){}},400)})<\/script></body></html>`;
}
const prerender = false;
const GET = async ({ request, url }) => {
  const ses = await getSession(env, request);
  if (!ses) return new Response("ログインが必要です", { status: 401 });
  const appId = url.searchParams.get("appId") ?? "";
  const projectId = url.searchParams.get("projectId") ?? "";
  if (!appId && !projectId) return new Response("appId または projectId が必要です", { status: 400 });
  const collection = url.searchParams.get("collection");
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();
  const isAdminOrg = ses.role === "admin";
  let rows = [];
  let title = "";
  let base = "";
  if (projectId) {
    if (ses.role !== "admin") return new Response("管理者のみ", { status: 403 });
    const { projectRecords, getProject } = await import("./projects_B_gexkwU.mjs");
    const project = await getProject(env, projectId);
    if (!project) return new Response("プロジェクトが見つかりません", { status: 404 });
    const recs = await projectRecords(env, projectId, 1e4);
    rows = recs.map((r) => ({ id: r.id, created_at: r.created_at, data: JSON.stringify({ "フォーム": r.app_name, ...r.data }) }));
    title = project.name;
    base = `project_${projectId}`;
  } else {
    const where = ["app_id=?"];
    const params = [appId];
    if (!isAdminOrg) {
      where.push("owner=?");
      params.push(ses.uid);
    }
    if (collection) {
      where.push("collection=?");
      params.push(collection);
    }
    const { results } = await env.DB.prepare(
      `SELECT id,data,created_at FROM app_records WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT 10000`
    ).bind(...params).all();
    rows = results ?? [];
    title = (await env.DB.prepare("SELECT name FROM external_apps WHERE id=?").bind(appId).first().catch(() => null))?.name || appId;
    base = `export_${appId}${collection ? "_" + collection : ""}`;
  }
  const appName = title;
  const dl = (name) => `attachment; filename="${name}"`;
  if (format === "md" || format === "markdown") {
    return new Response(recordsToMarkdown(rows, appName), {
      headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": dl(`${base}.md`) }
    });
  }
  if (format === "pdf" || format === "print") {
    return new Response(recordsToPrintHtml(rows, appName), {
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
  return new Response(recordsToCsv(rows), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": dl(`${base}.csv`) }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
