globalThis.process ??= {};
globalThis.process.env ??= {};
import { b as injectCatalogSri } from "./cdn-allowlist_rKupC5M_.mjs";
const BRIDGE_SDK = `(function(){
  var seq = 0; var pending = {}; var listeners = {};
  window.addEventListener("message", function(e){
    if (e.source !== window.parent) return;
    var m = e.data;
    if (!m || m.__bo !== 1) return;
    if (m.type === "result") {
      var cb = pending[m.reqId];
      if (!cb) return;
      delete pending[m.reqId];
      cb({ ok: !!m.ok, output: m.output, error: m.error, code: m.code });
      return;
    }
    // 音声認識（bo.listen）：親（通常オリジン＝SpeechRecognition が動く側）からの結果/エラー/終了を配送する。
    if (m.type === "listenResult" || m.type === "listenError" || m.type === "listenEnd") {
      var L = listeners[m.reqId]; if (!L) return;
      if (m.type === "listenResult" && L.onResult) { try { L.onResult(String(m.text||""), !!m.isFinal); } catch(_){} }
      else if (m.type === "listenError") { if (L.onError) { try { L.onError(String(m.error||"error")); } catch(_){} } delete listeners[m.reqId]; }
      else if (m.type === "listenEnd") { if (L.onEnd) { try { L.onEnd(); } catch(_){} } delete listeners[m.reqId]; }
      return;
    }
  });
  function post(msg){ try { window.parent.postMessage(msg, "*"); } catch(_){} }
  // 実コンテンツ高は body から測る（base CSS で body/html の min-height を無効化済みなので
  // documentElement.scrollHeight のように iframe 高へクランプされず、縮小も正しく反映される）。
  function ch(){ var b=document.body; return b ? Math.max(b.scrollHeight, b.offsetHeight) : document.documentElement.scrollHeight; }
  var _rt=null;
  function resize(){ if(_rt) return; var raf=window.requestAnimationFrame||function(f){return setTimeout(f,16);}; _rt=raf(function(){ _rt=null; post({ __bo:1, type:"resize", height: ch() }); }); }
  window.bo = {
    // screens[] のデータ操作を呼ぶ。戻り値は { ok, output:{type,value}, error?, code? } の Promise。
    run: function(screenId, inputs){
      return new Promise(function(resolve){
        var reqId = ++seq; pending[reqId] = resolve;
        post({ __bo:1, type:"run", reqId: reqId, screenId: screenId || "", inputs: (inputs && typeof inputs === "object") ? inputs : {} });
      });
    },
    resize: resize,
    // 音声認識：サンドボックス iframe では Web Speech API が not-allowed になるため、親（通常オリジン）で認識させ
    // 結果をここで受け取る。opts={lang,interim,onResult(text,isFinal),onError(err),onEnd}。戻り値 {stop()} で停止。
    // 例：var h=bo.listen({onResult:function(t,f){ box.textContent=t; }}); 停止ボタンで h.stop();
    listen: function(opts){
      opts = opts || {};
      var reqId = ++seq; listeners[reqId] = { onResult: opts.onResult, onError: opts.onError, onEnd: opts.onEnd };
      post({ __bo:1, type:"listen", action:"start", reqId: reqId, lang: opts.lang || "ja-JP", interim: opts.interim !== false, continuous: opts.continuous !== false });
      return { stop: function(){ post({ __bo:1, type:"listen", action:"stop", reqId: reqId }); } };
    },
    // 実行コンテキスト："app"=社内アプリ画面（ログイン済み・data.list等の管理操作が可能）。
    // カスタムUIは bo.context で「公開フォーム部分」と「社内の管理/可視化部分」を1つの render.html 内で出し分ける。
    context: "app",
    // 閲覧者が管理者(admin/developer)か＝管理タブ/管理ビューの表示・非表示に使う。
    // 注：これは表示制御のヒント。実データ取得(data.list等)は画面の requiredRoles でサーバ側RBACでも担保する。
    admin: !!(typeof window.__BO_VIEWER === "object" && window.__BO_VIEWER && window.__BO_VIEWER.admin),
    role: (typeof window.__BO_VIEWER === "object" && window.__BO_VIEWER && window.__BO_VIEWER.role) || "member",
    // ディープリンク：親URLのクエリ（?key=value）がオブジェクトで入る（srcdocの window.location は使えない）。
    params: (typeof window.__BO_PARAMS === "object" && window.__BO_PARAMS) ? window.__BO_PARAMS : {}
  };
  // 初回はレイアウト/フォント確定後に複数回測り直す（タブ非表示などの後続変化も拾う）。
  window.addEventListener("load", function(){ resize(); setTimeout(resize,120); setTimeout(resize,500); });
  if (window.ResizeObserver) { try { var ro=new ResizeObserver(resize); ro.observe(document.documentElement); if(document.body) ro.observe(document.body); } catch(_){} }
  if (window.MutationObserver) { try { new MutationObserver(resize).observe(document.documentElement, { subtree:true, childList:true, attributes:true, attributeFilter:["style","class","hidden"] }); } catch(_){} }
  post({ __bo:1, type:"ready" });
})();`;
const PUBLIC_BRIDGE_SDK = `(function(){
  function post(msg){ try { window.parent.postMessage(msg, "*"); } catch(_){} }
  function ch(){ var b=document.body; return b ? Math.max(b.scrollHeight, b.offsetHeight) : document.documentElement.scrollHeight; }
  var _rt=null;
  function resize(){ if(_rt) return; var raf=window.requestAnimationFrame||function(f){return setTimeout(f,16);}; _rt=raf(function(){ _rt=null; post({ __bo:1, type:"resize", height: ch() }); }); }
  function statusEl(){ var e=document.getElementById("bo-status"); if(!e){ e=document.createElement("div"); e.id="bo-status"; e.style.margin="12px 0"; e.style.fontWeight="600"; (document.body||document.documentElement).appendChild(e);} return e; }
  var busy=false;
  function setDisabled(d){ var b=document.querySelectorAll("button[type=submit],input[type=submit],.bo-btn"); for(var i=0;i<b.length;i++){ b[i].disabled=d; } }
  function gather(form){
    var values={}, files=[];
    var els=form.querySelectorAll("input[name],select[name],textarea[name]");
    for(var i=0;i<els.length;i++){ var el=els[i]; var n=el.name; if(!n) continue;
      if(el.type==="file"){ for(var j=0;j<el.files.length;j++){ files.push({ field:n, file: el.files[j] }); } }
      else if(el.type==="checkbox"){ values[n]= !!el.checked; }
      else if(el.type==="radio"){ if(el.checked) values[n]=el.value; }
      else { values[n]=el.value; }
    }
    return { values:values, files:files };
  }
  // bo.run（公開）：内部アプリと同じ呼び出し名だが、公開では「任意の画面実行」はさせず、必ずモデレーション付き
  // 送信（=フォーム送信と同じ安全経路）にマップする。匿名ユーザーがデータ読み取り・他画面実行をできないようにするため。
  var _runRes=null;
  function submit(values, files, viaRun){
    if(busy) return _runRes ? Promise.resolve({ ok:false, error:"送信中です" }) : undefined;
    busy=true; setDisabled(true);
    if(!viaRun){ var s=statusEl(); s.textContent="送信中…"; s.style.color="#6E7179"; }
    post({ __bo:1, type:"submit", values: values||{}, files: files||[] });
  }
  var listeners={}, lseq=0;
  window.addEventListener("message", function(e){
    if(e.source!==window.parent) return; var m=e.data; if(!m||m.__bo!==1) return;
    // 音声認識（bo.listen）：親で認識した結果/エラー/終了を配送（公開ページでも音声入力を使えるように）。
    if(m.type==="listenResult"||m.type==="listenError"||m.type==="listenEnd"){
      var L=listeners[m.reqId]; if(!L) return;
      if(m.type==="listenResult"&&L.onResult){ try{ L.onResult(String(m.text||""), !!m.isFinal); }catch(_){} }
      else if(m.type==="listenError"){ if(L.onError){ try{ L.onError(String(m.error||"error")); }catch(_){} } delete listeners[m.reqId]; }
      else if(m.type==="listenEnd"){ if(L.onEnd){ try{ L.onEnd(); }catch(_){} } delete listeners[m.reqId]; }
      return;
    }
    if(m.type!=="submitResult") return;
    busy=false; setDisabled(false);
    // bo.run 経由なら Promise を解決して呼び出し元（カスタムUIのJS）に結果を返す。
    if(_runRes){ var r=_runRes; _runRes=null; r({ ok: !!m.ok, output: { type:"text", value: m.ok ? (m.message||"送信しました。ありがとうございました。") : "" }, error: m.ok ? undefined : (m.error||"送信に失敗しました。") }); resize(); return; }
    var s=statusEl();
    if(m.ok){ s.textContent=m.message||"送信しました。ありがとうございました。"; s.style.color="#946F2C"; var f=document.querySelector("form"); if(f) f.style.display="none"; }
    else { s.textContent=m.error||"送信に失敗しました。時間をおいて再度お試しください。"; s.style.color="#b00020"; }
    resize();
  });
  document.addEventListener("submit", function(ev){
    var f=ev.target; if(!f||f.tagName!=="FORM") return; ev.preventDefault();
    var g=gather(f); submit(g.values, g.files);
  }, true);
  window.bo = {
    submit: function(values, files){ submit(values, files); },
    // 公開ページの bo.run は「送信（モデレーション）」専用。screenId は無視し inputs を申込として送る＝
    // 内部アプリ向けに bo.run('save', inputs) で作られたカスタムUIも、公開ではそのまま安全に送信できる。
    run: function(screenId, inputs){ return new Promise(function(res){ _runRes=res; submit(inputs||{}, [], true); }); },
    // 音声認識（公開ページでも利用可）：親で認識し結果を受け取る。opts={lang,interim,onResult,onError,onEnd}→{stop()}。
    listen: function(opts){ opts=opts||{}; var reqId=++lseq; listeners[reqId]={ onResult:opts.onResult, onError:opts.onError, onEnd:opts.onEnd }; post({ __bo:1, type:"listen", action:"start", reqId:reqId, lang:opts.lang||"ja-JP", interim:opts.interim!==false, continuous:opts.continuous!==false }); return { stop:function(){ post({ __bo:1, type:"listen", action:"stop", reqId:reqId }); } }; },
    resize: resize,
    // 実行コンテキスト："public"=匿名の公開ページ。data.list等の管理操作は不可（送信のみ）。
    // カスタムUIは bo.context!=="app" のとき管理/可視化UIを隠し、公開ではフォームだけ見せる。
    context: "public",
    // 公開ページは常に非管理者扱い（管理タブ/管理ビューは出さない）。
    admin: false,
    role: "public",
    params: (typeof window.__BO_PARAMS === "object" && window.__BO_PARAMS) ? window.__BO_PARAMS : {},
  };
  window.addEventListener("load", function(){ resize(); setTimeout(resize,120); setTimeout(resize,500); });
  if (window.ResizeObserver) { try { var ro=new ResizeObserver(resize); ro.observe(document.documentElement); if(document.body) ro.observe(document.body); } catch(_){} }
  if (window.MutationObserver) { try { new MutationObserver(resize).observe(document.documentElement, { subtree:true, childList:true, attributes:true, attributeFilter:["style","class","hidden"] }); } catch(_){} }
  post({ __bo:1, type:"ready" });
})();`;
const PUBLIC_FULLPAGE_SDK = `(function(){
  var SLUG = (typeof window.__BO_SLUG === "string") ? window.__BO_SLUG : "";
  function statusEl(){ var e=document.getElementById("bo-status"); if(!e){ e=document.createElement("div"); e.id="bo-status"; e.style.margin="12px 0"; e.style.fontWeight="600"; (document.body||document.documentElement).appendChild(e);} return e; }
  var busy=false;
  function setDisabled(d){ var b=document.querySelectorAll("button[type=submit],input[type=submit],.bo-btn"); for(var i=0;i<b.length;i++){ b[i].disabled=d; } }
  function gather(form){
    var values={}, files=[];
    var els=form.querySelectorAll("input[name],select[name],textarea[name]");
    for(var i=0;i<els.length;i++){ var el=els[i]; var n=el.name; if(!n) continue;
      if(el.type==="file"){ for(var j=0;j<el.files.length;j++){ files.push({ field:n, file: el.files[j] }); } }
      else if(el.type==="checkbox"){ values[n]= !!el.checked; }
      else if(el.type==="radio"){ if(el.checked) values[n]=el.value; }
      else { values[n]=el.value; }
    }
    return { values:values, files:files };
  }
  function submit(values, files){
    if(busy) return Promise.resolve({ ok:false, error:"送信中です" });
    busy=true; setDisabled(true); var s=statusEl(); s.textContent="送信中…"; s.style.color="#6E7179";
    var fd=new FormData(); fd.append("values", JSON.stringify(values||{}));
    var fl=files||[]; for(var i=0;i<fl.length;i++){ if(fl[i]&&fl[i].file) fd.append("file", fl[i].file, (fl[i].file.name||"file")); }
    return fetch("/api/p/"+encodeURIComponent(SLUG), { method:"POST", body:fd }).then(function(r){ return r.json(); }).then(function(j){
      busy=false; setDisabled(false);
      if(j && j.ok){ s.textContent=j.message||"送信しました。ありがとうございました。"; s.style.color="#946F2C"; var f=document.querySelector("form"); if(f) f.style.display="none"; }
      else { s.textContent=(j&&j.error)||"送信に失敗しました。時間をおいて再度お試しください。"; s.style.color="#b00020"; }
      return j||{ ok:false };
    }).catch(function(){ busy=false; setDisabled(false); s.textContent="送信に失敗しました。時間をおいて再度お試しください。"; s.style.color="#b00020"; return { ok:false }; });
  }
  document.addEventListener("submit", function(ev){ var f=ev.target; if(!f||f.tagName!=="FORM") return; ev.preventDefault(); var g=gather(f); submit(g.values, g.files); }, true);
  window.bo = {
    submit: function(values, files){ return submit(values, files); },
    run: function(screenId, inputs){ return submit(inputs||{}, []).then(function(j){ return { ok: !!(j&&j.ok), output:{ type:"text", value: (j&&j.ok)?(j.message||"送信しました。"):"" }, error: (j&&j.ok)?undefined:((j&&j.error)||"送信に失敗しました。") }; }); },
    listen: function(opts){ opts=opts||{}; var SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ if(opts.onError) try{ opts.onError("unsupported"); }catch(_){ } return { stop:function(){} }; }
      var rec=new SR(); rec.lang=opts.lang||"ja-JP"; rec.interimResults=opts.interim!==false; rec.continuous=opts.continuous!==false;
      rec.onresult=function(e){ for(var i=e.resultIndex;i<e.results.length;i++){ var t=e.results[i][0].transcript; if(opts.onResult) try{ opts.onResult(String(t||""), !!e.results[i].isFinal); }catch(_){} } };
      rec.onerror=function(e){ if(opts.onError) try{ opts.onError(String((e&&e.error)||"error")); }catch(_){} };
      rec.onend=function(){ if(opts.onEnd) try{ opts.onEnd(); }catch(_){} };
      try{ rec.start(); }catch(_){}
      return { stop:function(){ try{ rec.stop(); }catch(_){} } };
    },
    resize: function(){},
    context: "public", admin: false, role: "public",
    params: (typeof window.__BO_PARAMS === "object" && window.__BO_PARAMS) ? window.__BO_PARAMS : {},
  };
})();`;
const BAKU_APP_BASE_CSS = `
:root{--bo-bg:#F2F1F4;--bo-surface:#fff;--bo-ink:#1B1D22;--bo-muted:#6E7179;--bo-line:#E3E1E6;
--bo-navy:#1B1D22;--bo-gold:#C9A86A;--bo-gold-strong:#946F2C;--bo-gold-soft:#F4EDDD;--bo-r:12px;--bo-r-card:20px;}
*{box-sizing:border-box}
/* 自動高さ iframe では body/html を画面高に固定しない。生成HTMLの min-height:100vh は、親が iframe 高を
   そのまま 100vh にするフィードバックで「初回に高く測ると高いまま固定」する不具合の原因。無効化して
   コンテンツ実寸で測れるようにする（リロードでしか直らない過剰な余白の根治）。 */
html,body{margin:0;max-width:100%;overflow-x:hidden;min-height:0!important;height:auto!important}
/* スマホ対応の構造的担保（AIの指示有無に依存しない）：生成HTMLが固定px幅（width:600px 等）でも、要素を
   親幅で頭打ちにして横はみ出し/横スクロールを防ぐ。max-width はクラス指定（.bo-wrap 等）が優先されるため
   意図的な最大幅は維持される。inline の width 指定は width のままだが max-width:100% で実効幅が親に収まる。 */
body *{max-width:100%}
body{background:var(--bo-bg);color:var(--bo-ink);font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;line-height:1.7;font-size:16px;padding:16px}
/* レスポンシブ強制（生成HTMLが固定幅でも崩さない）：画像は親幅に収め、長い表は横スクロール、
   長い文字列は折り返す。狭幅では余白を詰める。AI 出力に依存せず土台で構造的に担保する。 */
img,video,canvas{max-width:100%;height:auto}
table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
pre,code{white-space:pre-wrap;overflow-wrap:anywhere}
@media (max-width:480px){body{padding:12px;font-size:15px}.bo-card{padding:14px}.bo-wrap{max-width:100%}}
h1,h2,h3{color:var(--bo-ink);line-height:1.35;margin:0 0 .5em}
h1{font-size:1.5rem}h2{font-size:1.25rem}h3{font-size:1.08rem}
p{margin:0 0 .8em}
a{color:var(--bo-gold-strong);text-decoration:none;font-weight:600}
a:hover{text-decoration:underline}
small,.bo-muted{color:var(--bo-muted);font-size:.92em}
label,.bo-label{display:block;font-weight:600;color:var(--bo-ink);margin:0 0 6px;font-size:.95rem}
input,select,textarea,.bo-input{width:100%;font:inherit;color:var(--bo-ink);background:var(--bo-surface);border:1px solid var(--bo-line);border-radius:var(--bo-r);padding:11px 13px;outline:none}
input:focus,select:focus,textarea:focus,.bo-input:focus{border-color:var(--bo-gold);box-shadow:0 0 0 3px var(--bo-gold-soft)}
textarea{min-height:96px;resize:vertical}
.bo-field{margin:0 0 14px}
button,.bo-btn{appearance:none;border:0;cursor:pointer;font:inherit;font-weight:700;background:var(--bo-navy);color:#fff;border-radius:var(--bo-r);padding:12px 18px;transition:filter .15s,transform .05s}
button:hover,.bo-btn:hover{filter:brightness(1.12)}
button:active,.bo-btn:active{transform:translateY(1px)}
button:disabled,.bo-btn:disabled{opacity:.5;cursor:default}
.bo-btn-ghost{background:var(--bo-gold-soft);color:var(--bo-gold-strong);border:1px solid var(--bo-gold)}
.bo-card{background:var(--bo-surface);border:1px solid var(--bo-line);border-radius:var(--bo-r-card);padding:20px;margin:0 0 16px}
.bo-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
.bo-result{font-size:1.6rem;font-weight:800;color:var(--bo-ink)}
.bo-result .unit{color:var(--bo-gold-strong);font-size:1rem;font-weight:700;margin-left:4px}
table,.bo-table{width:100%;border-collapse:collapse;font-size:.95rem}
.bo-table th,.bo-table td,table th,table td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--bo-line)}
.bo-table th,table th{color:var(--bo-muted);font-weight:600;font-size:.85rem}
.bo-wrap{max-width:680px;margin:0 auto}`;
const FRAME_CSP = [
  "default-src 'none'",
  "img-src data: https: blob:",
  "media-src data: https: blob: mediastream:",
  "style-src 'unsafe-inline'",
  "font-src data: https: blob:",
  "script-src 'unsafe-inline'",
  "object-src data: https: blob:",
  "frame-src data: https: blob:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'"
].join("; ");
const FRAME_SANDBOX = "allow-scripts allow-forms allow-modals allow-downloads allow-top-navigation-to-custom-protocols";
const FRAME_ALLOW = "clipboard-write; microphone; camera; autoplay; geolocation; fullscreen";
const STORAGE_SHIM = `(function(){
  function post(op,k,v){ try{ window.parent.postMessage({__bo:1,type:"storage",op:op,key:k,value:v},"*"); }catch(_){} }
  function mk(persist){
    var map = Object.create(null);
    var api = {
      getItem:function(k){ k=String(k); return (k in map)?map[k]:null; },
      setItem:function(k,v){ k=String(k); map[k]=String(v); if(persist) post("set",k,map[k]); },
      removeItem:function(k){ k=String(k); delete map[k]; if(persist) post("remove",k); },
      clear:function(){ for(var k in map) delete map[k]; if(persist) post("clear"); },
      key:function(i){ var ks=Object.keys(map); return (i>=0&&i<ks.length)?ks[i]:null; },
      __hydrate:function(d){ if(d&&typeof d==="object"){ for(var k in d){ if(Object.prototype.hasOwnProperty.call(d,k)) map[k]=String(d[k]); } } }
    };
    Object.defineProperty(api,"length",{get:function(){ return Object.keys(map).length; }});
    return api;
  }
  var ls=mk(true), ss=mk(false);
  try{ Object.defineProperty(window,"localStorage",{value:ls,configurable:true}); }catch(_){}
  try{ Object.defineProperty(window,"sessionStorage",{value:ss,configurable:true}); }catch(_){}
  window.addEventListener("message",function(e){
    if(e.source!==window.parent) return; var m=e.data;
    if(!m||m.__bo!==1||m.type!=="storageInit") return;
    ls.__hydrate(m.data);
    try{ window.dispatchEvent(new Event("bo:storageready")); }catch(_){}
  });
  try{ window.parent.postMessage({__bo:1,type:"storageReq"},"*"); }catch(_){}
})();`;
function frameCsp(isolation = "sandboxed", allowHosts = [], connectHosts = []) {
  if (isolation !== "relaxed") return FRAME_CSP;
  const norm = (arr) => (arr || []).map((h) => String(h).trim().toLowerCase()).filter((h) => /^[a-z0-9.-]+(?::\d+)?$/.test(h)).map((h) => "https://" + h);
  const libSrc = norm(allowHosts).join(" ");
  const connSrc = norm(connectHosts).join(" ");
  return [
    "default-src 'none'",
    "img-src data: https: blob:",
    "media-src data: https: blob: mediastream:",
    // §15-2：relaxed では外部CSS（CDN配布のデザインシステム/アイコンCSS）も読込許可ホストへ。
    // sandboxed は従来通り 'unsafe-inline' のみ（この関数は relaxed のみ到達）。style は読込でありデータ送信路ではない。
    `style-src 'unsafe-inline'${libSrc ? " " + libSrc : ""}`,
    "font-src data: https: blob:",
    `script-src 'unsafe-inline'${libSrc ? " " + libSrc : ""}`,
    "object-src data: https: blob:",
    "frame-src data: https: blob:",
    // §15-1：connect-src は connectHosts のみ。allowHosts（lib読込用CDN）は通信路に入れない＝既定は 'none'。
    `connect-src ${connSrc || "'none'"}`,
    "form-action 'none'",
    "base-uri 'none'"
  ].join("; ");
}
function buildFrameSrcdoc(html, sdk = BRIDGE_SDK, params = {}, viewer = {}, frame = {}) {
  const paramsJson = JSON.stringify(params || {}).replace(/</g, "\\u003c");
  const viewerJson = JSON.stringify({ admin: !!viewer.admin, role: viewer.role ?? "member" }).replace(/</g, "\\u003c");
  const nonce = typeof frame.nonce === "string" && /^[A-Za-z0-9+/_-]+={0,2}$/.test(frame.nonce) ? frame.nonce : "";
  const nonceAttr = nonce ? ` nonce="${nonce}"` : "";
  const body = frame.isolation === "relaxed" ? injectCatalogSri(html) : html;
  return [
    '<!doctype html><html lang="ja"><head>',
    '<meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${frameCsp(frame.isolation, frame.allowHosts, frame.connectHosts)}">`,
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<style>${BAKU_APP_BASE_CSS}</style>`,
    `<script${nonceAttr}>window.__BO_PARAMS=${paramsJson};window.__BO_VIEWER=${viewerJson};${STORAGE_SHIM}<\/script>`,
    "</head><body>",
    body,
    `<script${nonceAttr}>${sdk}<\/script>`,
    "</body></html>"
  ].join("");
}
function escAttr(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}
function buildPublicFullPage(html, opts) {
  const body = injectCatalogSri(html);
  const nonce = typeof opts.nonce === "string" && /^[A-Za-z0-9+/_-]+={0,2}$/.test(opts.nonce) ? opts.nonce : "";
  const nonceAttr = nonce ? ` nonce="${nonce}"` : "";
  const paramsJson = JSON.stringify(opts.params || {}).replace(/</g, "\\u003c");
  const title = escAttr(opts.title || "");
  const desc = opts.description ? escAttr(opts.description) : "";
  const head = [
    `<title>${title}</title>`,
    desc ? `<meta name="description" content="${desc}">` : "",
    opts.canonical ? `<link rel="canonical" href="${escAttr(opts.canonical)}">` : "",
    `<meta property="og:title" content="${title}">`,
    desc ? `<meta property="og:description" content="${desc}">` : "",
    opts.canonical ? `<meta property="og:url" content="${escAttr(opts.canonical)}">` : "",
    `<meta property="og:type" content="website">`
  ].filter(Boolean).join("");
  return [
    '<!doctype html><html lang="ja"><head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    head,
    `<style>${BAKU_APP_BASE_CSS}</style>`,
    `<script${nonceAttr}>window.__BO_SLUG=${JSON.stringify(opts.slug)};window.__BO_PARAMS=${paramsJson};<\/script>`,
    "</head><body>",
    body,
    `<script${nonceAttr}>${PUBLIC_FULLPAGE_SDK}<\/script>`,
    "</body></html>"
  ].join("");
}
const appFrame = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BAKU_APP_BASE_CSS,
  FRAME_ALLOW,
  FRAME_SANDBOX,
  STORAGE_SHIM,
  buildFrameSrcdoc,
  buildPublicFullPage
}, Symbol.toStringTag, { value: "Module" }));
export {
  FRAME_SANDBOX as F,
  PUBLIC_BRIDGE_SDK as P,
  buildFrameSrcdoc as a,
  buildPublicFullPage as b,
  FRAME_ALLOW as c,
  appFrame as d
};
