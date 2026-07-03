globalThis.process ??= {};
globalThis.process.env ??= {};
const INTERACTION_PING = 1;
const INTERACTION_APP_CMD = 2;
const INTERACTION_MSG_COMPONENT = 3;
const INTERACTION_MODAL_SUBMIT = 5;
const RESP_PONG = 1;
const RESP_DEFERRED = 5;
const RESP_MODAL = 9;
const FLAG_EPHEMERAL = 64;
const ASK_MODAL = {
  type: RESP_MODAL,
  data: {
    custom_id: "ask_modal",
    title: "メッセージ送信",
    components: [
      { type: 1, components: [{ type: 4, custom_id: "q", style: 2, label: "メッセージ", placeholder: "メッセージを入力してください", required: true, max_length: 2e3 }] }
    ]
  }
};
const ASK_PANEL = {
  content: "下のボタンからメッセージを送信できます。",
  components: [
    { type: 1, components: [{ type: 2, style: 1, label: "💬 メッセージ送信", custom_id: "ask_open" }] }
  ]
};
const LINK_MODAL = {
  type: RESP_MODAL,
  data: {
    custom_id: "link_modal",
    title: "メンバー連携",
    components: [
      { type: 1, components: [{ type: 4, custom_id: "code", style: 1, label: "招待コード", placeholder: "管理者から受け取ったコード", required: true, max_length: 100 }] }
    ]
  }
};
function linkPromptComponents(baseUrl) {
  const row = {
    type: 1,
    components: [{ type: 2, style: 1, label: "招待コードで連携", custom_id: "link_open" }]
  };
  if (baseUrl) row.components.push({ type: 2, style: 5, label: "ログインで連携", url: baseUrl });
  return [row];
}
function continueComponents(sessionId) {
  return [{ type: 1, components: [{ type: 2, style: 2, label: "続けて送信", custom_id: `ask_more:${sessionId}` }] }];
}
function askModalWithSession(sessionId) {
  return { type: RESP_MODAL, data: { ...ASK_MODAL.data, custom_id: `ask_modal:${sessionId}` } };
}
const json = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });
const DISCORD_MAX_FETCH_BYTES = 30 * 1024 * 1024;
class DiscordInbound {
  id = "discord";
  gw;
  appId;
  publicKey;
  constructor(gw, creds) {
    this.gw = gw;
    this.appId = creds.appId;
    this.publicKey = creds.publicKey;
  }
  async handleInbound(req, ic) {
    const sig = req.headers.get("x-signature-ed25519") ?? "";
    const ts = req.headers.get("x-signature-timestamp") ?? "";
    const body = await req.text();
    if (!sig || !ts || !await verifyEd25519(this.publicKey, sig, ts, body)) {
      return new Response("invalid signature", { status: 401 });
    }
    let ix;
    try {
      ix = JSON.parse(body);
    } catch {
      return new Response("bad request", { status: 400 });
    }
    if (ix.type === INTERACTION_PING) return json({ type: RESP_PONG });
    if (ix.type === INTERACTION_MSG_COMPONENT) {
      const cid = ix.data?.custom_id ?? "";
      if (cid === "ask_open") return json(ASK_MODAL);
      if (cid.startsWith("ask_more:")) return json(askModalWithSession(cid.slice("ask_more:".length)));
      if (cid === "link_open") return json(LINK_MODAL);
      return json({ type: RESP_PONG });
    }
    if (ix.type === INTERACTION_MODAL_SUBMIT) {
      const sender2 = ix.member?.user?.id ?? ix.user?.id;
      if (ix.data?.custom_id === "link_modal") {
        if (!sender2) return json({ type: RESP_PONG });
        const code = extractModalValue(ix, "code");
        const username2 = ix.member?.user?.username ?? ix.user?.username;
        ic.waitUntil(
          (async () => {
            const out = code ? (await ic.link(sender2, code, username2)).message : "招待コードを入力してください。";
            await this.editOriginal(ix.token, out);
          })()
        );
        return json({ type: RESP_DEFERRED, data: { flags: FLAG_EPHEMERAL } });
      }
      const mcid = ix.data?.custom_id ?? "";
      if (mcid !== "ask_modal" && !mcid.startsWith("ask_modal:")) return json({ type: RESP_PONG });
      const text2 = extractModalValue(ix, "q");
      const refs2 = modalAttachmentRefs(ix);
      if (!sender2 || !text2 && refs2.length === 0) return json({ type: RESP_PONG });
      const prompt2 = text2 || defaultPrompt(refs2);
      const sessionId2 = `discord:${sender2}`;
      ic.waitUntil(
        (async () => {
          const cls = await this.fetchAndClassify(refs2);
          const out = await ic.respond({ connector: "discord", sender: sender2, text: prompt2, image: cls.image, audio: cls.audio, files: cls.files, replyRef: ix.token, sessionId: sessionId2 });
          await this.deliver(ix.token, out.text, this.replyComponents(out, ic.baseUrl), true);
        })()
      );
      return json({ type: RESP_DEFERRED, data: { flags: FLAG_EPHEMERAL } });
    }
    if (ix.type !== INTERACTION_APP_CMD) return json({ type: RESP_PONG });
    const sender = ix.member?.user?.id ?? ix.user?.id;
    if (!sender) return json({ type: RESP_PONG });
    const username = ix.member?.user?.username ?? ix.user?.username;
    if (ix.data?.name === "参加") {
      const code = ix.data.options?.find((o) => o.name === "招待コード")?.value?.trim();
      ic.waitUntil(
        (async () => {
          const out = code ? (await ic.link(sender, code, username)).message : "招待コードを入力してください。";
          await this.editOriginal(ix.token, out);
        })()
      );
      return json({ type: RESP_DEFERRED });
    }
    const text = extractText(ix);
    const refs = commandAttachmentRefs(ix);
    if (!text && refs.length === 0) return json({ type: RESP_PONG });
    const prompt = text || defaultPrompt(refs);
    const sessionId = `discord:${sender}`;
    ic.waitUntil(
      (async () => {
        const cls = await this.fetchAndClassify(refs);
        const out = await ic.respond({ connector: "discord", sender, text: prompt, image: cls.image, audio: cls.audio, files: cls.files, replyRef: ix.token, sessionId });
        await this.deliver(ix.token, out.text, this.replyComponents(out, ic.baseUrl), true);
      })()
    );
    return json({ type: RESP_DEFERRED, data: { flags: FLAG_EPHEMERAL } });
  }
  // Discord CDN から添付を取得し base64 化（egress 経由・allowlist に CDN を追加済み）。
  // ブースト鯖では添付が最大500MBになり得るため、本体を読み込む前に content-length で上限判定＝Worker の
  // メモリ枯渇(OOM)を防ぐ（Phase 5）。上限内でも保存側(KV)の上限は respondInbound が平易に案内する。
  async fetchBinary(url, mimeType) {
    const r = await this.gw.fetch("discord", url);
    if (!r.ok) return null;
    if (Number(r.headers.get("content-length") ?? 0) > DISCORD_MAX_FETCH_BYTES) return null;
    return { mimeType: r.headers.get("content-type") ?? mimeType, dataB64: bytesToB64(new Uint8Array(await r.arrayBuffer())) };
  }
  // 添付を取得し種別で振り分け：画像→image（最初の1枚）、音声→audio（最初の1つ）、その他→files（PDF/テキスト等）。
  async fetchAndClassify(refs) {
    const out = { files: [] };
    for (const ref of refs) {
      const bin = await this.fetchBinary(ref.url, ref.mimeType);
      if (!bin) continue;
      if (bin.mimeType.startsWith("image/") && !out.image) out.image = bin;
      else if (bin.mimeType.startsWith("audio/") && !out.audio) out.audio = bin;
      else out.files.push({ ...bin, filename: ref.filename });
    }
    return out;
  }
  // 応答に添えるボタン：未連携なら連携導線、会員応答なら「続けて聞く」（会話継続）。
  replyComponents(out, baseUrl) {
    if (out.gate === "not_member") return linkPromptComponents(baseUrl);
    if (out.sessionId) return continueComponents(out.sessionId);
    return void 0;
  }
  async editOriginal(token, content, components) {
    const body = { content: content.slice(0, 1900) };
    if (components) body.components = components;
    await this.gw.fetch("discord", `https://discord.com/api/webhooks/${this.appId}/${token}/messages/@original`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
  }
  // 応答を Discord の本文上限（2000字）に合わせて分割送信。1通目は @original 編集、残りは follow-up。
  // ボタン（続けて聞く/連携）は最後のメッセージにだけ載せる＝末尾に1つ表示する。
  async deliver(token, content, components, ephemeral) {
    const chunks = chunkText(content || "（応答が空でした）", 1900);
    await this.editOriginal(token, chunks[0], chunks.length === 1 ? components : void 0);
    for (let i = 1; i < chunks.length; i++) {
      await this.followUp(token, chunks[i], i === chunks.length - 1 ? components : void 0, ephemeral);
    }
  }
  async followUp(token, content, components, ephemeral) {
    const body = { content: content.slice(0, 1900) };
    if (components) body.components = components;
    if (ephemeral) body.flags = FLAG_EPHEMERAL;
    await this.gw.fetch("discord", `https://discord.com/api/webhooks/${this.appId}/${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
  }
}
const DISCORD_COMMANDS = [
  { type: 1, name: "ask", description: "メッセージを送信する", options: [{ type: 3, name: "メッセージ", description: "メッセージ内容", required: true }, { type: 11, name: "画像", description: "画像を添付（任意）", required: false }] },
  // type1=CHAT_INPUT, opt type3=STRING / type11=ATTACHMENT
  { type: 1, name: "参加", description: "招待コードでメンバー登録する", options: [{ type: 3, name: "招待コード", description: "管理者から受け取ったコード", required: true }] },
  { type: 3, name: "メッセージ送信" }
  // type3=MESSAGE コマンド
];
async function fetchDiscordApp(gw, botToken) {
  const r = await gw.fetch("discord", "https://discord.com/api/v10/applications/@me", { headers: { authorization: `Bot ${botToken}` } });
  if (!r.ok) return null;
  const a = await r.json();
  if (!a.id || !a.verify_key) return null;
  return { id: a.id, verifyKey: a.verify_key };
}
async function setDiscordInteractionsUrl(gw, botToken, url) {
  const r = await gw.fetch("discord", "https://discord.com/api/v10/applications/@me", {
    method: "PATCH",
    headers: { "content-type": "application/json", authorization: `Bot ${botToken}` },
    body: JSON.stringify({ interactions_endpoint_url: url })
  });
  if (r.ok) return { ok: true, status: r.status };
  return { ok: false, status: r.status, detail: (await r.text()).slice(0, 300) };
}
const DISCORD_BASE_PERMISSIONS = 1 << 10 | // VIEW_CHANNEL（チャンネル閲覧）
1 << 11 | // SEND_MESSAGES（メッセージ送信）
1 << 13 | // MANAGE_MESSAGES（ピン留め）
1 << 14 | // EMBED_LINKS（埋め込み）
1 << 15 | // ATTACH_FILES（添付）
1 << 16;
const DISCORD_MANAGE_CHANNELS = 1 << 4;
function discordInviteUrl(appId, opts) {
  const perms = String((opts?.manageChannels === false ? 0 : DISCORD_MANAGE_CHANNELS) | DISCORD_BASE_PERMISSIONS);
  return `https://discord.com/oauth2/authorize?client_id=${appId}&scope=${encodeURIComponent("applications.commands bot")}&permissions=${perms}`;
}
function discordLinkAuthorizeUrl(appId, redirectUri, state) {
  const u = new URL("https://discord.com/oauth2/authorize");
  u.searchParams.set("client_id", appId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "identify");
  u.searchParams.set("state", state);
  return u.toString();
}
async function discordOAuthUserId(gw, appId, clientSecret, code, redirectUri) {
  const tr = await gw.fetch("discord", "https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: appId, client_secret: clientSecret }).toString()
  });
  if (!tr.ok) return null;
  const tok = await tr.json().catch(() => ({}));
  if (!tok.access_token) return null;
  const r = await gw.fetch("discord", "https://discord.com/api/users/@me", { headers: { authorization: `Bearer ${tok.access_token}` } });
  if (!r.ok) return null;
  const u = await r.json().catch(() => ({}));
  return u.id ? { id: u.id, username: u.username } : null;
}
async function createDiscordChannel(gw, botToken, guildId, name) {
  const r = await gw.fetch("discord", `https://discord.com/api/v10/guilds/${guildId}/channels`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bot ${botToken}` },
    body: JSON.stringify({ name, type: 0 })
  });
  if (!r.ok) return null;
  const c = await r.json().catch(() => ({}));
  return c.id ? { id: c.id } : null;
}
async function listDiscordGuilds(gw, botToken) {
  const r = await gw.fetch("discord", "https://discord.com/api/v10/users/@me/guilds", { headers: { authorization: `Bot ${botToken}` } });
  if (!r.ok) return [];
  const a = await r.json().catch(() => []);
  return Array.isArray(a) ? a.filter((g) => g.id).map((g) => ({ id: g.id, name: g.name ?? g.id })) : [];
}
async function listDiscordChannels(gw, botToken, guildId) {
  const r = await gw.fetch("discord", `https://discord.com/api/v10/guilds/${guildId}/channels`, { headers: { authorization: `Bot ${botToken}` } });
  if (!r.ok) return [];
  const a = await r.json().catch(() => []);
  return Array.isArray(a) ? a.filter((c) => c.type === 0 && c.id).map((c) => ({ id: c.id, name: c.name ?? c.id })) : [];
}
async function postAskPanel(gw, botToken, channelId) {
  const r = await gw.fetch("discord", `https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bot ${botToken}` },
    body: JSON.stringify(ASK_PANEL)
  });
  if (!r.ok) return { ok: false, pinned: false, status: r.status };
  const m = await r.json().catch(() => ({}));
  let pinned = false;
  if (m.id) {
    const p = await gw.fetch("discord", `https://discord.com/api/v10/channels/${channelId}/pins/${m.id}`, { method: "PUT", headers: { authorization: `Bot ${botToken}` } });
    pinned = p.ok;
  }
  return { ok: true, messageId: m.id, pinned, status: r.status };
}
async function registerDiscordCommands(gw, appId, botToken) {
  const r = await gw.fetch("discord", `https://discord.com/api/v10/applications/${appId}/commands`, {
    method: "PUT",
    headers: { "content-type": "application/json", authorization: `Bot ${botToken}` },
    body: JSON.stringify(DISCORD_COMMANDS)
  });
  if (r.ok) return { ok: true, status: r.status };
  return { ok: false, status: r.status, detail: (await r.text()).slice(0, 300) };
}
function extractText(ix) {
  const d = ix.data;
  if (!d) return null;
  if (d.target_id && d.resolved?.messages) return d.resolved.messages[d.target_id]?.content?.trim() || null;
  const opt = d.options?.find((o) => o.name === "メッセージ" || o.name === "質問" || o.name === "question");
  return opt?.value?.trim() || null;
}
const toRef = (a) => ({ url: a.url, mimeType: a.content_type ?? "application/octet-stream", filename: a.filename ?? "document" });
function defaultPrompt(refs) {
  const onlyImage = refs.length === 1 && refs[0].mimeType.startsWith("image/");
  return onlyImage ? "この画像について教えてください。" : "";
}
function commandAttachmentRefs(ix) {
  const d = ix.data;
  if (!d) return [];
  const refs = [];
  if (d.target_id && d.resolved?.messages) {
    for (const a2 of d.resolved.messages[d.target_id]?.attachments ?? []) if (a2.url) refs.push(toRef(a2));
  }
  const attId = d.options?.find((o) => o.type === 11)?.value;
  const a = attId ? d.resolved?.attachments?.[attId] : void 0;
  if (a?.url) refs.push(toRef(a));
  return refs;
}
function modalAttachmentRefs(ix) {
  const refs = [];
  for (const id of extractModalFileIds(ix, "files")) {
    const a = ix.data?.resolved?.attachments?.[id];
    if (a?.url) refs.push(toRef(a));
  }
  return refs;
}
function chunkText(text, max) {
  if (text.length <= max) return [text];
  const out = [];
  let s = text;
  while (s.length > max) {
    let cut = s.lastIndexOf("\n", max);
    if (cut < max * 0.5) cut = max;
    out.push(s.slice(0, cut));
    s = s.slice(cut).replace(/^\n/, "");
  }
  if (s) out.push(s);
  return out;
}
function bytesToB64(bytes) {
  let s = "";
  const chunk = 32768;
  for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(s);
}
function* modalInputs(ix) {
  for (const row of ix.data?.components ?? []) {
    if (row.component) yield row.component;
    for (const c of row.components ?? []) yield c;
  }
}
function extractModalValue(ix, customId) {
  for (const c of modalInputs(ix)) if (c.custom_id === customId) return c.value?.trim() || null;
  return null;
}
function extractModalFileIds(ix, customId) {
  for (const c of modalInputs(ix)) if (c.custom_id === customId && Array.isArray(c.values)) return c.values;
  return [];
}
async function verifyEd25519(publicKeyHex, signatureHex, timestamp, body) {
  try {
    const key = await crypto.subtle.importKey("raw", hexToBytes(publicKeyHex), { name: "Ed25519" }, false, ["verify"]);
    return await crypto.subtle.verify("Ed25519", key, hexToBytes(signatureHex), new TextEncoder().encode(timestamp + body));
  } catch {
    return false;
  }
}
function hexToBytes(hex) {
  const clean = hex.trim();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}
export {
  ASK_MODAL,
  ASK_PANEL,
  DISCORD_COMMANDS,
  DiscordInbound,
  LINK_MODAL,
  createDiscordChannel,
  discordInviteUrl,
  discordLinkAuthorizeUrl,
  discordOAuthUserId,
  fetchDiscordApp,
  listDiscordChannels,
  listDiscordGuilds,
  postAskPanel,
  registerDiscordCommands,
  setDiscordInteractionsUrl,
  verifyEd25519
};
