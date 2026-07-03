globalThis.process ??= {};
globalThis.process.env ??= {};
import { getApiKey } from "./client_F4fksau0.mjs";
const SOCIAL_PLATFORMS = ["x", "facebook", "instagram", "youtube", "tiktok"];
const GRAPH = "https://graph.facebook.com/v21.0";
const enc = (s) => encodeURIComponent(s);
async function readErr(r) {
  try {
    const t = await r.text();
    return `${r.status}: ${t.slice(0, 300)}`;
  } catch {
    return `${r.status}`;
  }
}
async function postX(env, text) {
  const token = await getApiKey(env, "x_access_token");
  if (!token) return { ok: false, error: "X が未設定です（設定→SNS連携で X のアクセストークンを登録してください）。" };
  const r = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ text: text.slice(0, 280) })
  });
  if (!r.ok) return { ok: false, error: `X 投稿に失敗（${await readErr(r)}）` };
  const d = await r.json();
  const id = d.data?.id;
  return { ok: true, id, url: id ? `https://twitter.com/i/web/status/${id}` : void 0 };
}
async function postFacebook(env, text, link) {
  const pageId = await getApiKey(env, "facebook_page_id");
  const token = await getApiKey(env, "facebook_page_token");
  if (!pageId || !token) return { ok: false, error: "Facebook が未設定です（設定→SNS連携で Page ID と Page アクセストークンを登録してください）。" };
  const body = new URLSearchParams({ message: text, access_token: token });
  if (link) body.set("link", link);
  const r = await fetch(`${GRAPH}/${enc(pageId)}/feed`, { method: "POST", body });
  if (!r.ok) return { ok: false, error: `Facebook 投稿に失敗（${await readErr(r)}）` };
  const d = await r.json();
  return { ok: true, id: d.id, url: d.id ? `https://www.facebook.com/${d.id}` : void 0 };
}
async function postInstagram(env, imageUrl, caption) {
  const igId = await getApiKey(env, "instagram_user_id");
  const token = await getApiKey(env, "instagram_token");
  if (!igId || !token) return { ok: false, error: "Instagram が未設定です（設定→SNS連携で IG ユーザーID とトークンを登録してください）。" };
  if (!imageUrl) return { ok: false, error: "Instagram は画像URL（公開httpsの画像）が必要です。" };
  const c = await fetch(`${GRAPH}/${enc(igId)}/media`, { method: "POST", body: new URLSearchParams({ image_url: imageUrl, caption, access_token: token }) });
  if (!c.ok) return { ok: false, error: `Instagram メディア作成に失敗（${await readErr(c)}）` };
  const cd = await c.json();
  if (!cd.id) return { ok: false, error: "Instagram メディアIDを取得できませんでした。" };
  const p = await fetch(`${GRAPH}/${enc(igId)}/media_publish`, { method: "POST", body: new URLSearchParams({ creation_id: cd.id, access_token: token }) });
  if (!p.ok) return { ok: false, error: `Instagram 公開に失敗（${await readErr(p)}）` };
  const pd = await p.json();
  return { ok: true, id: pd.id };
}
async function searchYoutube(env, query, max = 10) {
  const key = await getApiKey(env, "youtube_api_key");
  if (!key) return { ok: false, error: "YouTube が未設定です（設定→SNS連携で YouTube Data API キーを登録してください）。" };
  const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${Math.min(Math.max(max, 1), 25)}&q=${enc(query)}&key=${enc(key)}`);
  if (!r.ok) return { ok: false, error: `YouTube 検索に失敗（${await readErr(r)}）` };
  const d = await r.json();
  const items = (d.items ?? []).filter((i) => i.id?.videoId).map((i) => ({
    id: i.id.videoId,
    title: i.snippet?.title,
    text: i.snippet?.description,
    author: i.snippet?.channelTitle,
    publishedAt: i.snippet?.publishedAt,
    url: `https://www.youtube.com/watch?v=${i.id.videoId}`
  }));
  return { ok: true, items };
}
async function readYoutubeVideo(env, id) {
  const key = await getApiKey(env, "youtube_api_key");
  if (!key) return { ok: false, error: "YouTube が未設定です（設定→SNS連携で YouTube Data API キーを登録してください）。" };
  const vid = id.match(/[?&]v=([\w-]{11})/)?.[1] ?? id.match(/youtu\.be\/([\w-]{11})/)?.[1] ?? id.trim();
  const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${enc(vid)}&key=${enc(key)}`);
  if (!r.ok) return { ok: false, error: `YouTube 取得に失敗（${await readErr(r)}）` };
  const d = await r.json();
  const v = d.items?.[0];
  if (!v) return { ok: false, error: "動画が見つかりませんでした。" };
  const stats = {};
  for (const [k, val] of Object.entries(v.statistics ?? {})) {
    const n = Number(val);
    if (Number.isFinite(n)) stats[k] = n;
  }
  return { ok: true, items: [{ id: v.id ?? vid, title: v.snippet?.title, text: v.snippet?.description, author: v.snippet?.channelTitle, publishedAt: v.snippet?.publishedAt, url: `https://www.youtube.com/watch?v=${v.id ?? vid}`, stats }] };
}
async function searchX(env, query) {
  const token = await getApiKey(env, "x_access_token");
  if (!token) return { ok: false, error: "X が未設定です（設定→SNS連携で X のアクセストークンを登録してください）。" };
  const r = await fetch(`https://api.twitter.com/2/tweets/search/recent?max_results=10&tweet.fields=created_at,public_metrics&query=${enc(query)}`, { headers: { authorization: `Bearer ${token}` } });
  if (!r.ok) return { ok: false, error: `X 検索に失敗（${await readErr(r)}）。検索は X の Basic 以上の有料プランが必要です。` };
  const d = await r.json();
  return { ok: true, items: (d.data ?? []).map((t) => ({ id: t.id, text: t.text, publishedAt: t.created_at, url: `https://twitter.com/i/web/status/${t.id}`, stats: t.public_metrics })) };
}
async function readXTweet(env, target) {
  const token = await getApiKey(env, "x_access_token");
  if (!token) return { ok: false, error: "X が未設定です。" };
  const id = target.match(/status\/(\d+)/)?.[1] ?? target.trim();
  const r = await fetch(`https://api.twitter.com/2/tweets/${enc(id)}?tweet.fields=created_at,public_metrics`, { headers: { authorization: `Bearer ${token}` } });
  if (!r.ok) return { ok: false, error: `X 取得に失敗（${await readErr(r)}）` };
  const d = await r.json();
  if (!d.data) return { ok: false, error: "投稿が見つかりませんでした。" };
  return { ok: true, items: [{ id: d.data.id, text: d.data.text, publishedAt: d.data.created_at, url: `https://twitter.com/i/web/status/${d.data.id}`, stats: d.data.public_metrics }] };
}
async function readFacebookPosts(env) {
  const pageId = await getApiKey(env, "facebook_page_id");
  const token = await getApiKey(env, "facebook_page_token");
  if (!pageId || !token) return { ok: false, error: "Facebook が未設定です。" };
  const r = await fetch(`${GRAPH}/${enc(pageId)}/posts?fields=message,permalink_url,created_time&limit=10&access_token=${enc(token)}`);
  if (!r.ok) return { ok: false, error: `Facebook 取得に失敗（${await readErr(r)}）` };
  const d = await r.json();
  return { ok: true, items: (d.data ?? []).map((p) => ({ id: p.id, text: p.message, url: p.permalink_url, publishedAt: p.created_time })) };
}
async function readInstagramMedia(env) {
  const igId = await getApiKey(env, "instagram_user_id");
  const token = await getApiKey(env, "instagram_token");
  if (!igId || !token) return { ok: false, error: "Instagram が未設定です。" };
  const r = await fetch(`${GRAPH}/${enc(igId)}/media?fields=caption,permalink,media_type,timestamp&limit=10&access_token=${enc(token)}`);
  if (!r.ok) return { ok: false, error: `Instagram 取得に失敗（${await readErr(r)}）` };
  const d = await r.json();
  return { ok: true, items: (d.data ?? []).map((m) => ({ id: m.id, text: m.caption, url: m.permalink, publishedAt: m.timestamp })) };
}
async function postTiktok(env, videoUrl, title) {
  const token = await getApiKey(env, "tiktok_access_token");
  if (!token) return { ok: false, error: "TikTok が未設定です（設定→SNS連携で TikTok のアクセストークンを登録してください）。" };
  if (!videoUrl) return { ok: false, error: "TikTok は動画URL（公開httpsの動画）が必要です（image_url に動画URLを指定）。" };
  const r = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
    method: "POST",
    headers: { "content-type": "application/json; charset=UTF-8", authorization: `Bearer ${token}` },
    body: JSON.stringify({ post_info: { title: title.slice(0, 150), privacy_level: "SELF_ONLY" }, source_info: { source: "PULL_FROM_URL", video_url: videoUrl } })
  });
  if (!r.ok) return { ok: false, error: `TikTok 投稿に失敗（${await readErr(r)}）。Content Posting API のアプリ審査が必要です。` };
  const d = await r.json();
  if (d.error?.message && !d.data?.publish_id) return { ok: false, error: `TikTok 投稿に失敗（${d.error.message}）` };
  return { ok: true, id: d.data?.publish_id };
}
async function readTiktokVideos(env) {
  const token = await getApiKey(env, "tiktok_access_token");
  if (!token) return { ok: false, error: "TikTok が未設定です。" };
  const r = await fetch("https://open.tiktokapis.com/v2/video/list/?fields=id,title,share_url,view_count,create_time", {
    method: "POST",
    headers: { "content-type": "application/json; charset=UTF-8", authorization: `Bearer ${token}` },
    body: JSON.stringify({ max_count: 10 })
  });
  if (!r.ok) return { ok: false, error: `TikTok 取得に失敗（${await readErr(r)}）` };
  const d = await r.json();
  return { ok: true, items: (d.data?.videos ?? []).map((v) => ({ id: v.id, title: v.title, url: v.share_url, stats: v.view_count != null ? { view_count: v.view_count } : void 0, publishedAt: v.create_time ? new Date(v.create_time * 1e3).toISOString() : void 0 })) };
}
async function socialPost(env, platform, a) {
  const text = (a.text ?? "").trim();
  if (platform === "x") return text ? postX(env, text) : { ok: false, error: "投稿本文が空です。" };
  if (platform === "facebook") return text ? postFacebook(env, text, a.link) : { ok: false, error: "投稿本文が空です。" };
  if (platform === "instagram") return postInstagram(env, a.mediaUrl ?? "", text);
  if (platform === "tiktok") return postTiktok(env, a.mediaUrl ?? "", text);
  return { ok: false, error: `${platform} への投稿は未対応です。` };
}
async function socialSearch(env, platform, query) {
  if (platform === "youtube") return searchYoutube(env, query);
  if (platform === "x") return searchX(env, query);
  if (platform === "facebook" || platform === "instagram") return { ok: false, error: `${platform} は公開全体の検索を Meta API が提供していません。自社ページ/アカウントの投稿は read_social（閲覧）で取得できます。` };
  if (platform === "tiktok") return { ok: false, error: "TikTok の公開検索は Research API（要審査）が必要です。自社動画は read_social（閲覧）で取得できます。" };
  return { ok: false, error: `${platform} の検索は未対応です。` };
}
async function socialRead(env, platform, target) {
  if (platform === "youtube") return readYoutubeVideo(env, target);
  if (platform === "x") return readXTweet(env, target);
  if (platform === "facebook") return readFacebookPosts(env);
  if (platform === "instagram") return readInstagramMedia(env);
  if (platform === "tiktok") return readTiktokVideos(env);
  return { ok: false, error: `${platform} の閲覧は未対応です。` };
}
async function socialStatus(env) {
  const has = async (n) => !!await getApiKey(env, n);
  return {
    x: await has("x_access_token"),
    facebook: await has("facebook_page_id") && await has("facebook_page_token"),
    instagram: await has("instagram_user_id") && await has("instagram_token"),
    youtube: await has("youtube_api_key"),
    tiktok: await has("tiktok_access_token")
  };
}
export {
  SOCIAL_PLATFORMS,
  socialPost,
  socialRead,
  socialSearch,
  socialStatus
};
