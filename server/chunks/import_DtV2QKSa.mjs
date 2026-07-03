globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as randomId } from "./stripe_r-RFTlbb.mjs";
import { getApiKey } from "./client_F4fksau0.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { driveReadToken, listDriveFiles } from "./drive_BU5bDSNm.mjs";
import { saveFile } from "./storage_BHLYBEBb.mjs";
import { getStorageUsage } from "./storage-usage_CAVmHTS3.mjs";
const GB = 1024 * 1024 * 1024;
const META_BYTES_PER_ITEM = 600;
const R2_YEN_PER_GB_MONTH = 2.3;
async function listCandidates(env, source) {
  if (source === "drive") {
    const rows = await listDriveFiles(env);
    if (!rows.length) return { items: [], error: "ドライブのメタが未同期です（ドライブ画面で同期してください）。" };
    return { items: rows.map((r2) => ({ ext_id: r2.id, title: r2.name, mime: r2.mime, size: r2.size ?? 0, url: null })) };
  }
  const token = await getApiKey(env, "notion");
  if (!token) return { items: [], error: "Notion 連携が未設定です（連携設定で Notion トークンを登録してください）。" };
  const r = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28", "content-type": "application/json" },
    body: JSON.stringify({ page_size: 100 })
  });
  if (!r.ok) return { items: [], error: `Notion ${r.status}` };
  const d = await r.json();
  const items = (d.results ?? []).map((p) => ({ ext_id: p.id, title: notionTitle(p), mime: p.object === "database" ? "notion/database" : "notion/page", size: 0, url: p.url ?? null }));
  return { items };
}
function notionTitle(p) {
  try {
    const props = p.properties ?? {};
    for (const v of Object.values(props)) {
      const t = v.title;
      if (Array.isArray(t) && t[0]?.plain_text) return t[0].plain_text;
    }
  } catch {
  }
  return "（無題）";
}
async function simulateImport(env, source, withFiles) {
  const { items, error } = await listCandidates(env, source);
  const empty = { count: 0, totalBytes: 0, metaBytes: 0, binaryBytes: 0, r2CostYen: 0, d1Over: false, r2Over: false, r2Enabled: !!env.MEDIA_R2, withFiles, advice: [] };
  if (error) return { ...empty, error };
  const r2Enabled = !!env.MEDIA_R2;
  const count = items.length;
  const totalBytes = items.reduce((a, b) => a + (b.size || 0), 0);
  const metaBytes = count * META_BYTES_PER_ITEM;
  const binaryBytes = withFiles && r2Enabled ? totalBytes : 0;
  const usage = await getStorageUsage(env);
  const d1 = usage.find((u) => u.key === "d1");
  const r2 = usage.find((u) => u.key === "r2");
  const d1Over = d1.used >= 0 && d1.used + metaBytes > d1.limit;
  const r2Over = binaryBytes > 0 && r2.used + binaryBytes > r2.limit;
  const r2CostYen = Math.round(binaryBytes / GB * R2_YEN_PER_GB_MONTH);
  const advice = [];
  if (withFiles && !r2Enabled) advice.push("実ファイルの取り込みには R2 が必要です。高度なオプションから R2 を有効化してください（メタのみなら不要）。");
  if (d1Over) advice.push("D1 の上限に達する見込みです。高度なオプション → Workers Paid で拡張するか、対象を絞ってください。");
  if (r2Over) advice.push("R2 の上限に達する見込みです。高度なオプションで R2 上限を調整するか、メタのみ取り込みにしてください。");
  if (!advice.length) advice.push("現在の容量で取り込み可能です。");
  return { count, totalBytes, metaBytes, binaryBytes, r2CostYen, d1Over, r2Over, r2Enabled, withFiles, advice };
}
async function runImport(env, source, withFiles) {
  const { items, error } = await listCandidates(env, source);
  if (error) return { imported: 0, files: 0, error };
  const doFiles = withFiles && !!env.MEDIA_R2 && source === "drive";
  const token = doFiles ? await driveReadToken(env) : null;
  let imported = 0, files = 0;
  for (const it of items) {
    let fileId = null;
    if (doFiles && token && it.size > 0) {
      const r = await fetch(`https://www.googleapis.com/drive/v3/files/${it.ext_id}?alt=media`, { headers: { authorization: `Bearer ${token}` } }).catch(() => null);
      if (r && r.ok) {
        const buf = await r.arrayBuffer();
        const f = new File([buf], it.title, { type: it.mime ?? "application/octet-stream" });
        const saved = await saveFile(env, f, `import:${source}`).catch(() => null);
        if (saved) {
          fileId = saved.id;
          files++;
        }
      }
    }
    await env.DB.prepare("INSERT INTO imported_items (id,source,ext_id,title,mime,size,url,file_id,imported_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(randomId(), source, it.ext_id, it.title, it.mime, it.size || null, it.url, fileId, nowSec()).run();
    imported++;
  }
  return { imported, files };
}
async function listImported(env) {
  return (await env.DB.prepare("SELECT id,source,title,mime,size,file_id,imported_at FROM imported_items ORDER BY imported_at DESC LIMIT 300").all()).results;
}
export {
  listCandidates,
  listImported,
  runImport,
  simulateImport
};
