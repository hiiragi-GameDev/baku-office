globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { buildBackup, recordBackupDone, backupFileName, restoreBackup, setBackupSchedule, getBackupState, getBackupSchedule, backupAlert } from "./backup_CQuZgyNM.mjs";
import { driveStatus, uploadBufferToDrive } from "./drive_BU5bDSNm.mjs";
import { audit } from "./storage_BHLYBEBb.mjs";
import { logDiag } from "./diag_CY3PJnOM.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const isAdminOrg = (ses) => !!ses && ses.role === "admin";
const asMode = (m) => m === "raw" ? "raw" : "decrypted";
const GET = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!isAdminOrg(ses)) return json({ error: "権限がありません（管理者のみ）" }, 403);
  const mode = asMode(new URL(request.url).searchParams.get("mode"));
  try {
    const { json: body, tables, files } = await buildBackup(env, { decrypt: mode === "decrypted" });
    await recordBackupDone(env, "local", mode, tables, files);
    await audit(env, ses.uid, "backup.download", `mode=${mode} tables=${tables} files=${files}`);
    return new Response(body, {
      status: 200,
      headers: {
        // octet-stream＝直アクセス時もブラウザがインライン表示せず確実に添付ファイル扱いにする。
        "content-type": "application/octet-stream",
        "content-disposition": `attachment; filename="${backupFileName(mode === "decrypted")}"`,
        "cache-control": "no-store"
      }
    });
  } catch (e) {
    await logDiag(env, "error", "backup", `download 失敗: ${e.message}`);
    return json({ error: e.message }, 500);
  }
};
const POST = async ({ request, locals }) => {
  const ses = await getSession(env, request);
  if (!isAdminOrg(ses)) return json({ error: "権限がありません（管理者のみ）" }, 403);
  const b = await request.json().catch(() => ({}));
  switch (b._action) {
    case "status": {
      const state = await getBackupState(env);
      const schedule = await getBackupSchedule(env);
      const alert = await backupAlert(env);
      const ds = await driveStatus(env).catch(() => ({ read: false, write: false, via: null }));
      return json({ ok: true, state, schedule, alert, drive: ds.write, driveStatus: ds });
    }
    case "drive": {
      if (!(await driveStatus(env)).write) return json({ error: "Google ドライブへの書き込み連携がありません（書き込み許可の再承認が必要です）。" }, 400);
      const mode = asMode(b.mode);
      try {
        const { json: body, tables, files } = await buildBackup(env, { decrypt: mode === "decrypted" });
        const buf = new TextEncoder().encode(body).buffer;
        const up = await uploadBufferToDrive(env, backupFileName(mode === "decrypted"), "application/json", buf);
        if (!up.ok) return json({ error: up.error ?? "アップロードに失敗しました。" }, 502);
        await recordBackupDone(env, "drive", mode, tables, files);
        await audit(env, ses.uid, "backup.drive", `mode=${mode} tables=${tables} files=${files} id=${up.id}`);
        return json({ ok: true, tables, files, id: up.id });
      } catch (e) {
        await logDiag(env, "error", "backup", `drive 失敗: ${e.message}`);
        return json({ error: e.message }, 500);
      }
    }
    case "schedule": {
      await setBackupSchedule(env, { enabled: !!b.enabled, mode: asMode(b.mode) });
      return json({ ok: true });
    }
    case "restore": {
      if (!b.archive) return json({ error: "アーカイブが空です。" }, 400);
      try {
        const r = await restoreBackup(env, b.archive);
        await audit(env, ses.uid, "backup.restore", `tables=${r.tables} rows=${r.rows} kv=${r.kv} files=${r.files}`);
        return json({ ok: true, ...r });
      } catch (e) {
        await logDiag(env, "error", "backup", `restore 失敗: ${e.message}`);
        return json({ error: e.message }, 500);
      }
    }
    default:
      return json({ error: "不明な操作" }, 400);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
