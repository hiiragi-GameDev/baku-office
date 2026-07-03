globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { driveAvailable } from "./drive_BU5bDSNm.mjs";
const GB = 1024 * 1024 * 1024;
const fmtBytes = (n) => {
  if (n < 0) return "—";
  if (n < 1024) return n + "B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + "KB";
  if (n < GB) return (n / 1024 / 1024).toFixed(1) + "MB";
  return (n / GB).toFixed(2) + "GB";
};
async function getStorageLimits(env) {
  try {
    return JSON.parse(await env.LICENSE.get("storage_limits") ?? "{}");
  } catch {
    return {};
  }
}
async function setStorageLimits(env, l) {
  await kvPut(env, "storage_limits", JSON.stringify(l ?? {}));
}
async function sumFiles(env, like) {
  try {
    return (await env.DB.prepare("SELECT COALESCE(SUM(size),0) AS s FROM files WHERE ref LIKE ? AND deleted_at IS NULL").bind(like).first())?.s ?? 0;
  } catch {
    return 0;
  }
}
async function getStorageUsage(env) {
  const lim = await getStorageLimits(env);
  let d1 = -1;
  try {
    const pc = await env.DB.prepare("PRAGMA page_count").first() ?? {};
    const ps = await env.DB.prepare("PRAGMA page_size").first() ?? {};
    const pcv = Object.values(pc)[0];
    const psv = Object.values(ps)[0];
    if (typeof pcv === "number" && typeof psv === "number") d1 = pcv * psv;
  } catch {
    d1 = -1;
  }
  const kv = await sumFiles(env, "kv:%");
  const r2 = await sumFiles(env, "r2:%");
  let drive = 0;
  try {
    drive = (await env.DB.prepare("SELECT COALESCE(SUM(size),0) AS s FROM drive_files").first())?.s ?? 0;
  } catch {
    drive = 0;
  }
  const r2Enabled = !!env.MEDIA_R2;
  const driveOn = await driveAvailable(env).catch(() => false);
  return [
    { key: "d1", label: "データベース（D1）", used: d1, limit: (lim.d1 ?? 5) * GB, enabled: true, hint: "paid" },
    { key: "kv", label: "ストレージ（KV）", used: kv, limit: (lim.kv ?? 1) * GB, enabled: true, hint: r2Enabled ? "paid" : "r2" },
    { key: "r2", label: "ストレージ（R2）", used: r2, limit: (lim.r2 ?? 10) * GB, enabled: r2Enabled, hint: "paid" },
    { key: "drive", label: "Googleドライブ", used: drive, limit: (lim.drive ?? 15) * GB, enabled: driveOn, hint: "drive" }
  ];
}
export {
  fmtBytes,
  getStorageLimits,
  getStorageUsage,
  setStorageLimits
};
