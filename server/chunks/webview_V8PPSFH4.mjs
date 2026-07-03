globalThis.process ??= {};
globalThis.process.env ??= {};
function isWebViewUA(ua) {
  if (!ua) return false;
  return /\bLine\//i.test(ua) || // LINE
  /FBAN|FBAV|FB_IAB|FBIOS/i.test(ua) || // Facebook / Messenger
  /Instagram/i.test(ua) || // Instagram
  /MicroMessenger/i.test(ua) || // WeChat
  /KAKAOTALK/i.test(ua) || // KakaoTalk
  /\bTwitter\b|TwitterAndroid/i.test(ua) || // X / Twitter
  /; wv\)/i.test(ua);
}
function webviewBlockedPage(loginUrl) {
  const url = String(loginUrl);
  const safe = url.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>標準ブラウザで開いてください — baku-office</title>
<style>
  body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #f7f7f8; padding: 20px; box-sizing: border-box; }
  .card { background: #fff; padding: 32px 28px; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,.08); max-width: 380px; width: 100%; }
  h1 { font-size: 1.15rem; margin: 0 0 .2rem; color: #1B1D22; }
  .lead { font-weight: 600; color: #3c4043; margin: 1rem 0 .3rem; }
  .note { color: #5f6368; font-size: 14px; margin: 0 0 1rem; }
  .urlbox { margin: 12px 0; padding: 10px 12px; background: #f1f3f4; border-radius: 8px; font-size: 13px; word-break: break-all; color: #3c4043; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; box-sizing: border-box; padding: 12px 20px; border: 0; border-radius: 8px; background: #1B1D22; color: #fff; font-weight: 600; text-decoration: none; cursor: pointer; font-size: 15px; }
  .btn:active { opacity: .85; }
  .hint { color: #80868b; font-size: 12px; margin-top: 20px; line-height: 1.6; }
</style>
</head>
<body>
  <div class="card">
    <h1>baku-office</h1>
    <p class="lead">このアプリ内ブラウザでは Google ログインができません。</p>
    <p class="note">Safari や Chrome などの<strong>標準ブラウザ</strong>で開き直してください（下のURLをコピーして貼り付け）。</p>
    <div class="urlbox"><span id="lurl">${safe}</span></div>
    <button class="btn" id="copy" type="button">リンクをコピー</button>
    <p class="hint">LINE の場合：画面右下（または右上）の「<strong>…</strong>」→「<strong>他のブラウザで開く</strong>」でも開けます。<br />Instagram / Facebook の場合も同様に「ブラウザで開く」を選んでください。</p>
  </div>
  <script>
    document.getElementById('copy').addEventListener('click', function () {
      var t = document.getElementById('lurl').textContent || '';
      var done = function () { var b = document.getElementById('copy'); b.textContent = 'コピーしました'; b.disabled = true; };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(done, function () {}); }
      else { var r = document.createRange(); r.selectNode(document.getElementById('lurl')); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand('copy'); done(); } catch (e) {} }
    });
  <\/script>
</body>
</html>`;
}
export {
  isWebViewUA,
  webviewBlockedPage
};
