globalThis.process ??= {};
globalThis.process.env ??= {};
import { getSession } from "./auth_DL5yvmzT.mjs";
import { s as sanitizeSvg, b as storeMedia, l as listMediaAssets, d as deleteMediaAsset } from "./site-media_DAdK9838.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const IMG_MAX = 5 * 1024 * 1024;
const FILE_MAX = 200 * 1024 * 1024;
const b64ToBuf = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
const POST = async ({ request }) => {
  const ses = await getSession(env, request);
  if (!ses || ses.role !== "admin") return json({ error: "管理者のみ" }, 403);
  const ctype = request.headers.get("content-type") || "";
  if (ctype.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File) || file.size === 0) return json({ error: "ファイルがありません" }, 400);
    if (file.size > FILE_MAX) return json({ error: "ファイルが大きすぎます（200MBまで）" }, 400);
    const mime2 = file.type || "application/octet-stream";
    if (!/^(image\/(png|jpe?g|webp|gif|svg\+xml)|video\/(mp4|webm|ogg|quicktime))$/.test(mime2)) return json({ error: "対応形式：画像（PNG/JPEG/WebP/GIF/SVG）・動画（MP4/WebM）" }, 400);
    let buf2 = await file.arrayBuffer();
    let kind;
    if (/svg/.test(mime2)) {
      const clean = sanitizeSvg(new TextDecoder().decode(buf2));
      if (!clean) return json({ error: "SVG を安全化できませんでした（不正なSVG）" }, 400);
      buf2 = new TextEncoder().encode(clean).buffer;
      kind = "svg";
    } else if (/^video\//.test(mime2)) kind = "video";
    const r2 = await storeMedia(env, buf2, mime2, { name: file.name, kind, createdBy: ses.uid });
    return r2.ok ? json({ ok: true, url: r2.url, id: r2.id, kind: r2.kind }) : json({ error: r2.error }, 400);
  }
  const b = await request.json().catch(() => ({}));
  if (b._action === "list") return json({ ok: true, assets: await listMediaAssets(env) });
  if (b._action === "delete") {
    if (!b.id) return json({ error: "id が必要" }, 400);
    await deleteMediaAsset(env, b.id);
    return json({ ok: true });
  }
  if (b._action !== "upload") return json({ error: "不明な操作" }, 400);
  const mime = String(b.mime || "");
  const isSvg = mime === "image/svg+xml";
  if (!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(mime)) return json({ error: "画像（PNG/JPEG/WebP/GIF/SVG）のみ。動画は multipart で送ってください。" }, 400);
  let buf;
  try {
    buf = b64ToBuf(b.dataB64 || "");
  } catch {
    return json({ error: "画像データが不正です" }, 400);
  }
  if (buf.byteLength === 0) return json({ error: "画像が空です" }, 400);
  if (buf.byteLength > IMG_MAX) return json({ error: "画像が大きすぎます（5MBまで）" }, 400);
  if (isSvg) {
    const clean = sanitizeSvg(new TextDecoder().decode(buf));
    if (!clean) return json({ error: "SVG を安全化できませんでした（不正なSVG）" }, 400);
    buf = new TextEncoder().encode(clean).buffer;
  }
  const r = await storeMedia(env, buf, mime, { name: b.name, kind: isSvg ? "svg" : "image", createdBy: ses.uid });
  return r.ok ? json({ ok: true, url: r.url, id: r.id }) : json({ error: r.error }, 400);
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
