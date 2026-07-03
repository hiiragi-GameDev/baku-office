globalThis.process ??= {};
globalThis.process.env ??= {};
import { kvPut } from "./kv_JIFmI05h.mjs";
import { d as decryptField, b as decryptBytes, e as encryptField, a as encryptBytes } from "./stripe_r-RFTlbb.mjs";
import { masterKey, APP_VERSION } from "./client_F4fksau0.mjs";
import { n as nowSec } from "./accounting_D4tRmfws.mjs";
import { readRawBlob, putRawBlob } from "./storage_BHLYBEBb.mjs";
import { a as applyMigrations } from "./migrate_Ck12DMSM.mjs";
const STATE_KEY = "backup_state";
const SCHED_KEY = "backup_schedule";
const FILE_PREFIX = "f/";
const EPHEMERAL_KV = ["loginrl:", "deployreportrl:", "schema_lock"];
const BACKUP_STALE_SEC = 7 * 86400;
async function getBackupState(env) {
  try {
    const s = await env.LICENSE.get(STATE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
async function setBackupState(env, s) {
  await kvPut(env, STATE_KEY, JSON.stringify(s));
}
async function getBackupSchedule(env) {
  try {
    return JSON.parse(await env.LICENSE.get(SCHED_KEY) ?? '{"enabled":false,"mode":"raw"}');
  } catch {
    return { enabled: false, mode: "raw" };
  }
}
async function setBackupSchedule(env, s) {
  await kvPut(env, SCHED_KEY, JSON.stringify({ enabled: !!s.enabled, mode: s.mode === "decrypted" ? "decrypted" : "raw" }));
}
async function backupAlert(env) {
  const s = await getBackupState(env);
  if (!s) return { alert: true, never: true, lastAt: null };
  return { alert: nowSec() - s.lastAt > BACKUP_STALE_SEC, never: false, lastAt: s.lastAt };
}
function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  const CH = 32768;
  for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode(...bytes.subarray(i, i + CH));
  return btoa(s);
}
function b64ToBuf(s) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
}
async function buildBackup(env, opts) {
  const key = await masterKey(env);
  const tableNames = (await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'd1_%' ORDER BY name"
  ).all()).results;
  const d1 = {};
  for (const t of tableNames) {
    const rows = (await env.DB.prepare(`SELECT * FROM "${t.name}"`).all()).results;
    if (opts.decrypt && t.name === "users") {
      for (const r of rows) {
        if (r.display_name) {
          try {
            r.display_name = await decryptField(key, String(r.display_name), "member-pii");
          } catch {
          }
        }
      }
    }
    d1[t.name] = { rows };
  }
  const kv = {};
  let cursor;
  do {
    const page = await env.LICENSE.list({ cursor });
    for (const k of page.keys) {
      const name = k.name;
      if (name.startsWith(FILE_PREFIX) || EPHEMERAL_KV.some((p) => name.startsWith(p))) continue;
      const val = await env.LICENSE.get(name);
      if (val == null) continue;
      if (opts.decrypt && name.startsWith("apikey:")) {
        try {
          kv[name] = await decryptField(key, val, "api-keys");
        } catch {
          kv[name] = val;
        }
      } else {
        kv[name] = val;
      }
    }
    cursor = page.list_complete ? void 0 : page.cursor;
  } while (cursor);
  const files = [];
  const fileRows = (await env.DB.prepare("SELECT id,name,mime,ref,enc FROM files WHERE deleted_at IS NULL AND ref<>''").all()).results;
  for (const f of fileRows) {
    const raw = await readRawBlob(env, f.ref);
    if (!raw) continue;
    let bytes = raw;
    let plain = f.enc === 0;
    if (opts.decrypt && f.enc) {
      try {
        bytes = await decryptBytes(key, raw, "files");
        plain = true;
      } catch {
        bytes = raw;
        plain = false;
      }
    }
    files.push({ id: f.id, ref: f.ref, dbEnc: f.enc, plain, name: f.name, mime: f.mime, b64: bufToB64(bytes) });
  }
  const archive = {
    format: "baku-office-backup",
    version: 1,
    createdAt: nowSec(),
    appVersion: APP_VERSION,
    schemaVersion: await env.LICENSE.get("schema_version"),
    decrypted: opts.decrypt,
    d1,
    kv,
    files
  };
  return { json: JSON.stringify(archive), tables: tableNames.length, files: files.length };
}
function backupFileName(decrypt) {
  return `baku-office-backup-${decrypt ? "decrypted" : "encrypted"}.json`;
}
async function recordBackupDone(env, dest, mode, tables, files) {
  await setBackupState(env, { lastAt: nowSec(), dest, mode, tables, files });
}
async function restoreBackup(env, archive) {
  const a = archive;
  if (!a || a.format !== "baku-office-backup") throw new Error("バックアップ形式が不正です。");
  await applyMigrations(env);
  const key = await masterKey(env);
  let rowCount = 0;
  for (const [table, { rows }] of Object.entries(a.d1 ?? {})) {
    for (const row of rows) {
      const r = { ...row };
      if (a.decrypted && table === "users" && r.display_name) {
        r.display_name = await encryptField(key, String(r.display_name), "member-pii");
      }
      const cols = Object.keys(r);
      if (!cols.length) continue;
      const ph = cols.map(() => "?").join(",");
      const colSql = cols.map((c) => `"${c}"`).join(",");
      await env.DB.prepare(`INSERT OR REPLACE INTO "${table}" (${colSql}) VALUES (${ph})`).bind(...cols.map((c) => r[c])).run();
      rowCount++;
    }
  }
  let kvCount = 0;
  for (const [name, val] of Object.entries(a.kv ?? {})) {
    if (a.decrypted && name === "master_key") continue;
    let out = val;
    if (a.decrypted && name.startsWith("apikey:")) out = await encryptField(key, val, "api-keys");
    await kvPut(env, name, out);
    kvCount++;
  }
  let fileCount = 0;
  for (const f of a.files ?? []) {
    let bytes = b64ToBuf(f.b64);
    if (f.dbEnc === 1 && f.plain) bytes = await encryptBytes(key, bytes, "files");
    await putRawBlob(env, f.ref, bytes);
    fileCount++;
  }
  return { tables: Object.keys(a.d1 ?? {}).length, rows: rowCount, kv: kvCount, files: fileCount };
}
export {
  BACKUP_STALE_SEC,
  backupAlert,
  backupFileName,
  buildBackup,
  getBackupSchedule,
  getBackupState,
  recordBackupDone,
  restoreBackup,
  setBackupSchedule
};
