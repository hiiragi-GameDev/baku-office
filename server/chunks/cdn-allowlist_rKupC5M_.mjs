globalThis.process ??= {};
globalThis.process.env ??= {};
const CDN_HOSTS = /* @__PURE__ */ new Set([
  "cdnjs.cloudflare.com",
  // SRI 付きカタログの主配信元
  "cdn.jsdelivr.net",
  // npm/gh パッケージ（版固定URL）
  "unpkg.com",
  // npm パッケージ（版固定URL）
  "esm.sh"
  // ESM 配信（版固定URL）
]);
function isCuratedHost(host) {
  return CDN_HOSTS.has(String(host).trim().toLowerCase());
}
function isVersionPinned(url) {
  const u = String(url).toLowerCase();
  if (/(?:@latest\b|\/latest\/)/.test(u)) return false;
  if (/@\d+\.\d+\.\d+/.test(u)) return true;
  if (/@[0-9a-f]{7,40}\b/.test(u)) return true;
  if (/\/ajax\/libs\/[^/]+\/\d+\.\d+(?:\.\d+)?[^/]*\//.test(u)) return true;
  return false;
}
const LIB_CATALOG = [
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js", integrity: "sha512-Y51n9mtKTVBh3Jbx5pZSJNDDMyY+yGe77DGtBPzRlgsf/YLCh13kSZ3JmfHGzYFCmOndraf0sQgfM654b7dJ3w==" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js", integrity: "sha512-vc58qvvBdrDR4etbxMdlTt4GBQk1qjvyORR2nrsPsFPyrs+/u5c3+1Ct6upOgdZoIl7eq6k3a1UPDSNAQi/32A==" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.15.12/cdn.min.js", integrity: "sha512-xHBdoP9GVH6jVtCb+8CLAqjcFcSUS2FZXXi9Ok/nyaaEhcH0ffHsSuXOuLvha8K9yiZ3uptMO8gzhbk30xiyvg==" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.21/dayjs.min.js", integrity: "sha512-7BnHO0aSsTKlbnXz+vFHMpPBHu2+ObLXRYEFwlf78OxmDxnicV505aojIreJMgZ709oDafpTHkm03/ySCjI3/Q==" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.44/katex.min.js", integrity: "sha512-LV0dhHi1nGl/i/Z9ix7C8FYefB5Vabm8931179LhFcfzFAhqdWgNNpnBIqaTgX7F9rN1vbxCaRDHsOjEkyhpNg==" },
  { kind: "style", url: "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.44/katex.min.css", integrity: "sha512-Wejrt2k+KQnYZXKfoTssRNkow4yPGVJFkb0tFIdedjQ/EphBYUouzY2kOWUExrKIHP0lAB6NMoEiin1RpFO1nw==" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.12.0/mermaid.min.js", integrity: "sha512-5TKaYvhenABhlGIKSxAWLFJBZCSQw7HTV7aL1dJcBokM/+3PNtfgJFlv8E6Us/B1VMlQ4u8sPzjudL9TEQ06ww==" },
  // three.js は r160 以降 ESM 専用（<script src> で読める UMD 版が無い）＝importmap 検出に対応するまで UMD 最終版 0.159.0 を固定採用。
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.159.0/three.min.js", integrity: "sha512-OviGQIoFPxWNbGybQNprasilCxjtXNGCjnaZQvDeCT0lSPwJXd5TC3usI/jsWepKW9lZLZ1ob1q/Vy4MnlTt7g==", note: "3D/背景演出。global THREE（addons非同梱＝OrbitControls/GLTFLoader無し）。形状・材質はコード生成（外部モデル読込不可）" },
  // PDF帳票セット：jsPDF 標準フォントは日本語不可＝html2canvas でDOM画像化→addImage が唯一の確実な和文PDF経路。
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.0.0/jspdf.umd.min.js", integrity: "sha512-RrsL9D48EoJRt9uznAsZqCH7HBDJk+hLW0WzfcU8RMdQUC6QJ3PfMz6n9kwl0TjoU2moqv+krh89HrgItCZ5zw==", note: "PDF生成（global jspdf.jsPDF）。日本語は html2canvas とセットの画像貼付方式のみ（標準フォント和文不可）" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", integrity: "sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==", note: "DOM→canvas画像化（PDF帳票・画像保存に使用）" },
  // FullCalendar は v7 で global ビルド廃止＝<script src> で使える v6 最終系を固定採用。ja ロケールは本体非同梱＝別ファイル必須。
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.19/index.global.min.js", integrity: "sha512-oVdWXnAvkKCjV7eICa4Hbmdrtg2z8hvsQ6lC1/GRQck7hexUrp7fCJZVU/unJviMXCJdpT1rzUpxVKVKP8IcCA==", note: "カレンダー表示（global FullCalendar）。日本語化は ja ロケールファイルも読み込む" },
  { kind: "script", url: "https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.19/locales/ja.global.min.js", integrity: "sha512-oxCfdCW96IDeygnUEomH15hKbxAN6os+Tb70+IyFwmUI7e5MWQehe7LrBWxpdwywKIMvvwMULw/AIWK0UpUTkg==", note: "FullCalendar 日本語ロケール（本体の後に読み込む）" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/tabulator/6.4.0/js/tabulator.min.js", integrity: "sha512-YchcVhmvmEATKLrWGBIQ+6qRQcQKw2ZmlKpH+QkGiZMTnQQQ2Ci8WMSrwvfghrezXQBB+wpmeMjT649Qt5grMg==", note: "高機能テーブル（ソート/絞込/ページング）。CSSも必須" },
  { kind: "style", url: "https://cdnjs.cloudflare.com/ajax/libs/tabulator/6.4.0/css/tabulator.min.css", integrity: "sha512-ENREUVc31VTESSitbyo4H+OYTQ24CP5p33w+KVWR3+l7ndgCMkgJ0bDTtwvFzIw8WI3m+h4FYXmcPF/vCHxv4g==" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js", integrity: "sha512-K/oyQtMXpxI4+K0W7H25UopjM8pzq0yrVdFdG21Fh5dBe91I40pDd9A4lzNlHPHBIP2cwZuoxaUSX0GJSObvGA==", note: "日付/時刻ピッカー。CSSと ja ロケールも読み込む" },
  { kind: "style", url: "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css", integrity: "sha512-MQXduO8IQnJVq1qmySpN87QQkiR1bZHtorbJBD0tzy7/0U9+YIC93QWHeGTEoojMVHWWNkoCp8V6OzVSYrX0oQ==" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/l10n/ja.min.js", integrity: "sha512-XamS5TTeqwEqePo/YxW3AFGwvEcQzN520Om7b1eB/LYHt6tLgXZeutZPPF8D0sIo7YndJEpCEhKwvf62U780Dw==", note: "flatpickr 日本語ロケール" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/marked/16.3.0/lib/marked.umd.min.js", integrity: "sha512-V6rGY7jjOEUc7q5Ews8mMlretz1Vn2wLdMW/qgABLWunzsLfluM0FwHuGjGQ1lc8jO5vGpGIGFE+rTzB+63HdA==", note: "Markdown→HTML。表示は必ず DOMPurify.sanitize を通す" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.8/purify.min.js", integrity: "sha512-JfRHuuInas3e80YgJBTb6JfrK4ngt4FRR9utxm7RbiuRVRNBdPORorA/WTgRKFCK7nbo+9ANMcEOVznsYvi3+A==", note: "HTMLサニタイズ（marked とセット・XSS防止）" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js", integrity: "sha512-dfX5uYVXzyU8+KHqj8bjo7UkOdg18PaOtpa48djpNbZHwExddghZ+ZmzWT06R5v6NSk3ZUfsH6FNEDepLx9hPQ==", note: "CSV解析（取込）。日本のExcel出力CSVは Shift_JIS が多い＝encoding 指定" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.12.1/JsBarcode.all.min.js", integrity: "sha512-fLmJPYDfCIAZ0gpG/iiIzPw113KquhzI1bxG0XhiLYyqm8Ax2lEiq1h1qv2vafH9tLzkjm4HYRWSeKoGFH4xIw==", note: "バーコード生成（CODE128/EAN 等）" },
  { kind: "script", url: "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js", integrity: "sha512-+mRnO4g3gIOjI5DJ5QZZ9GeXdN2a5rSc4Vhgigowv88YJtHMWhxw8j+F8Z7K0uX+1D9J3iJsry4goCRMJV0ltA==", note: "QRコード読取（カメラ映像→jsQR(imageData)）" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/canvas-confetti/1.9.4/confetti.min.js", integrity: "sha512-/GXaNA85TOTnv17yHXIkc2MRkGhiTWWo6HSyNxvMc6Dg6y+uu4S68ledtLoBMyP7n7XknwuNWXMcfs/wH3iqqg==", note: "紙吹雪演出（完了・当選など・1操作1回）" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js", integrity: "sha512-csIng5zcB+XpulRUa+ev1zKo7zRNGpEaVfNB9On1no9KYTEY/rLGAEEpvgdw6nim1WdTuihZY1eqZ31K7/fZjw==", note: "ドラッグ&ドロップ並べ替え" },
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/fuse.js/7.1.0/fuse.min.js", integrity: "sha512-H1bWCnc4dDJwdioqpOCkU76ZxEdvBvOy9R9Dd9EqftlzQg92owjX5IVdiOw00llAyQFUZJNPrzDnWZ/lZtf25A==", note: "あいまい検索（名簿・在庫等）" },
  // 1.4.4 固定＝種ナレッジの実証済みレシピ（stringToBytesFuncs 等の 1.x API）と同一。2.x はAPI差があるため上げる時はレシピごと検証する。
  { kind: "script", url: "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js", integrity: "sha512-ZDSPMa/JM1D+7kdg2x3BsruQ6T/JpJo3jWDWkCZsP+5yVyp1KfESqLI+7RqB5k24F7p2cV7i2YHh/890y6P6Sw==", note: "QRコード生成（実証済み・inline同梱の代替としてCDN読込可）" }
];
const SRI_BY_URL = new Map(LIB_CATALOG.map((e) => [e.url.toLowerCase(), e]));
function catalogEntryForUrl(url) {
  return SRI_BY_URL.get(String(url).trim().toLowerCase()) ?? null;
}
function catalogPromptHint() {
  const lines = LIB_CATALOG.map((e) => `${e.kind === "style" ? "CSS" : "JS"} ${e.url}${e.note ? `（${e.note}）` : ""}`);
  return "厳選CDN（relaxed で読込可・版固定済み・SRIはプラットフォームが自動付与）：\n" + lines.join("\n");
}
function injectCatalogSri(html) {
  if (typeof html !== "string" || !html) return html;
  return html.replace(/<(script|link)\b[^>]*>/gi, (tag, _name) => {
    if (/\bintegrity\s*=/i.test(tag)) return tag;
    const m = tag.match(/\b(?:src|href)\s*=\s*["']([^"']+)["']/i);
    if (!m) return tag;
    const entry = catalogEntryForUrl(m[1]);
    if (!entry) return tag;
    const add = ` integrity="${entry.integrity}" crossorigin="anonymous"`;
    return tag.replace(/\s*\/?>$/, (end) => add + end);
  });
}
const LIB_RECIPES = [
  {
    id: "pdf",
    uses: "PDF帳票の生成・ダウンロード（領収書・請求書・賞状・チケット・名札・報告書）",
    keywords: /PDF|領収書|請求書|賞状|チケット|帳票|証明書|名札|見積書/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.0.0/jspdf.umd.min.js", "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"],
    recipe: "jsPDFの標準フォントは日本語不可（文字化け）＝日本語PDFは必ず『帳票をHTML/CSSで組む→html2canvasで画像化→PDFへ貼る』方式にする。手順：帳票用DOMを画面外（position:fixed;left:-9999px;width:794px;background:#fff）に組む→const canvas=await html2canvas(el,{scale:2,backgroundColor:'#fff'})→const pdf=new jspdf.jsPDF({unit:'mm',format:'a4'})→const w=210,h=canvas.height*w/canvas.width→pdf.addImage(canvas.toDataURL('image/jpeg',0.92),'JPEG',0,0,w,Math.min(h,297))→pdf.save('ファイル名.pdf')。global は jspdf.jsPDF（jsPDF 直ではない）。h が 297mm を超える帳票はページ単位の DOM に分割し addPage で繰り返す。pdf.text() に日本語を渡さない。なお jsPDF は領収書等の『レイアウト帳票』専用＝データ一覧の書き出し（CSV/MD/PDF）はアプリ画面標準の書き出しボタンが担当なので重複ボタンを作らない。"
  },
  {
    id: "calendar",
    uses: "月/週カレンダー表示（予約状況・シフト表・イベント予定の可視化）",
    keywords: /カレンダー|予約表|シフト表|月間予定|週間予定/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.19/index.global.min.js", "https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.19/locales/ja.global.min.js"],
    recipe: "const cal=new FullCalendar.Calendar(el,{initialView:'dayGridMonth',locale:'ja',height:'auto',events:配列,dateClick:関数,eventClick:関数}); cal.render(); 日本語化は ja ロケールJSを本体の後に読み込み locale:'ja' を指定（本体には非同梱）。イベントは bo.run('list') の行を {title,start:'YYYY-MM-DD'}（時刻付きは 'YYYY-MM-DDTHH:mm'）へ変換して渡す。切替は headerToolbar:{left:'prev,next today',center:'title',right:'dayGridMonth,timeGridWeek,listWeek'}。"
  },
  {
    id: "table",
    uses: "大量データの高機能一覧（列ソート・ヘッダ絞り込み・ページング・行編集）",
    keywords: /台帳|一覧.{0,6}(絞り込み|フィルタ|ソート|並び替え)|数百件|大量.{0,4}(一覧|データ)/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/tabulator/6.4.0/js/tabulator.min.js", "https://cdnjs.cloudflare.com/ajax/libs/tabulator/6.4.0/css/tabulator.min.css"],
    recipe: "new Tabulator(el,{data:行配列,layout:'fitColumns',pagination:true,paginationSize:20,columns:[{title:'名前',field:'name',headerFilter:'input'},…]}); CSSも必ず読み込む。データは data.list の戻り（value をJSON.parse→各行の data もJSON.parse）を平坦なオブジェクト配列にしてから渡す。行操作は rowClick/セル editor。件数が少ない普通の一覧は素の table で十分＝本当に必要な時だけ使う。"
  },
  {
    id: "datepicker",
    uses: "使いやすい日付/時刻/期間の入力（予約日時・期間指定）",
    keywords: /日付選択|日時選択|期間.{0,4}(指定|選択)|デートピッカー|カレンダー.{0,4}入力/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js", "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css", "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/l10n/ja.min.js"],
    recipe: "flatpickr(inputEl,{locale:'ja',dateFormat:'Y-m-d'}); 時刻込みは enableTime:true＋dateFormat:'Y-m-d H:i'、期間は mode:'range'。ja ロケール（l10n/ja.min.js）とCSSも読み込む。単純な誕生日入力等は <input type='date'> で十分＝リッチな入力体験が要る時だけ使う。"
  },
  {
    id: "markdown",
    uses: "Markdown文字列の整形表示（ai.infer の出力レポート・お知らせ・説明文）",
    keywords: /markdown|マークダウン|AI.{0,10}(レポート|要約|文章).{0,6}表示/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/marked/16.3.0/lib/marked.umd.min.js", "https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.8/purify.min.js"],
    recipe: "el.innerHTML=DOMPurify.sanitize(marked.parse(mdText,{breaks:true})); 必ず DOMPurify.sanitize を通す（生の innerHTML 代入は XSS）。ai.infer の戻りは Markdown のことが多い＝そのまま textContent に入れると記号だらけになるため、この表示経路を使う。"
  },
  {
    id: "csvimport",
    uses: "CSVファイルの取り込み（Excel台帳からの移行・一括登録）",
    keywords: /CSV.{0,8}(取り込|取込|インポート|読み込|一括)/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"],
    recipe: "<input type='file' accept='.csv'> → Papa.parse(file,{header:true,skipEmptyLines:true,encoding:'Shift_JIS',complete:async r=>{…}}); 日本のExcel出力CSVは Shift_JIS が多い＝encoding:'Shift_JIS' を既定にし、結果が文字化け（\\uFFFD を含む）なら encoding 無し（UTF-8）で再パースする両対応にする。行ごとに bo.run('save',整形した値) で保存し、件数と失敗行を最後に表示する。"
  },
  {
    id: "barcode",
    uses: "バーコード生成（会員証・在庫ラベル・値札。CODE128/EAN）",
    keywords: /バーコード|JAN|CODE ?128|EAN/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.12.1/JsBarcode.all.min.js"],
    recipe: "JsBarcode('#barcode','1234567890',{format:'CODE128',displayValue:true}); 対象は <svg id='barcode'></svg>（印刷が綺麗）。EAN13 は 13桁でチェックデジットが正しくないと描画されない＝任意文字列は CODE128 を使う。"
  },
  {
    id: "qrscan",
    uses: "カメラでQRコードを読み取る（受付チェックイン・在庫照会。生成は qrcode-generator を inline）",
    keywords: /QR.{0,6}(読み取り|読取|スキャン)|チェックイン|受付.{0,6}(QR|コード)/i,
    urls: ["https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"],
    recipe: "getUserMedia({video:{facingMode:'environment'}})→<video autoplay playsinline muted> に表示→毎フレーム（requestAnimationFrame）canvas に drawImage → const d=ctx.getImageData(0,0,w,h); const code=jsQR(d.data,w,h,{inversionAttempts:'dontInvert'}); code が真なら code.data が中身＝bo.run('checkin',{code:code.data}) 等に渡し、stream.getTracks().forEach(t=>t.stop()) で必ず停止。読み取り枠のガイドと手入力フォールバックを付ける。"
  },
  {
    id: "qrgen",
    uses: "QRコードの生成・表示・画像ダウンロード（申込URL配布・会員証・チケット）",
    keywords: /QR.{0,6}(生成|作成|発行|コード)|二次元コード/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"],
    recipe: "自前実装は読み取れないQRになるため必ずこのライブラリを使う。qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8']; const qr=qrcode(0,'M'); qr.addData(text,'Byte'); qr.make(); 描画は getModuleCount()/isDark(r,c) で <canvas> に塗る（1モジュール4px以上＋余白4モジュール＝実機で読めるサイズ）。保存は canvas.toDataURL() を <a download>。エンコードするURLはプラットフォーム発行の公開URLを入力欄で受け取る（自URLの組み立ては不可）。生成後は実際に読み取れることを前提にサイズ・コントラストを保つ。"
  },
  {
    id: "confetti",
    uses: "紙吹雪の演出（申込完了・当選・達成のお祝い）",
    keywords: /紙吹雪|お祝い.{0,4}演出|当選.{0,4}演出|クラッカー/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/canvas-confetti/1.9.4/confetti.min.js"],
    recipe: "confetti({particleCount:120,spread:70,origin:{y:0.7}}); 成功・完了の瞬間に1回だけ（連発しない）。"
  },
  {
    id: "dnd",
    uses: "ドラッグ&ドロップの並べ替え（優先順位付け・かんばん・表示順の管理）",
    keywords: /並べ替え|並び替え.{0,6}(ドラッグ|D&D)|ドラッグ.{0,4}ドロップ|かんばん|カンバン/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js"],
    recipe: "new Sortable(listEl,{animation:150,handle:'.grip',onEnd:async()=>{ DOM順を読み取り bo.run('update',{order:…}) で保存 }}); スマホはスクロールと競合するため必ずハンドル（.grip 要素）を付け、行全体をドラッグ可能にしない。"
  },
  {
    id: "fuzzysearch",
    uses: "あいまい検索（名簿・在庫・メモを表記ゆれ込みで検索）",
    keywords: /あいまい検索|曖昧検索|ファジー/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/fuse.js/7.1.0/fuse.min.js"],
    recipe: "const fuse=new Fuse(rows,{keys:['name','memo'],threshold:0.35}); fuse.search(q) の戻りは [{item}]。かな/カナ・全半角の表記ゆれは、rows 側と query 側の両方に正規化（s.normalize('NFKC') とカタカナ→ひらがな変換）をかけてから検索する。"
  },
  {
    id: "chart",
    uses: "グラフ表示（棒・折れ線・円。集計ダッシュボード）",
    keywords: /グラフ|チャート|ダッシュボード|推移.{0,4}(表示|可視化)/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js"],
    recipe: "new Chart(canvasEl,{type:'bar'|'line'|'pie',data:{labels,datasets:[{label,data,backgroundColor}]},options:{responsive:true,maintainAspectRatio:false}}); maintainAspectRatio:false のときは canvas の親要素に高さを必ず指定（無いと高さ0で見えない）。データは bo.run('list') を集計して渡す。"
  },
  {
    id: "diagram",
    uses: "図の描画（フローチャート・組織図・シーケンス図・ガント）",
    keywords: /フローチャート|組織図|シーケンス図|ガント|関係図|図解/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.12.0/mermaid.min.js"],
    recipe: "mermaid.initialize({startOnLoad:false,securityLevel:'strict'}); const {svg}=await mermaid.render('g1',定義文字列); el.innerHTML=svg; 定義はテンプレート文字列で組み立て、ノード名に日本語可。"
  },
  {
    id: "math",
    uses: "数式の整形表示（学習教材・技術資料）",
    keywords: /数式|数学.{0,4}(表示|教材)|LaTeX|TeX/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.44/katex.min.js", "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.44/katex.min.css"],
    recipe: "katex.render('c=\\\\pm\\\\sqrt{a^2+b^2}',el,{throwOnError:false}); CSSも必ず読み込む。バックスラッシュはJS文字列内で二重にする。"
  },
  {
    id: "threed",
    uses: "3D/背景演出（ヒーロー背景の3Dアニメ・パーティクル・回転ジオメトリ）",
    keywords: /3D|三次元|立体|パーティクル|背景演出/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/three.js/0.159.0/three.min.js"],
    recipe: "global THREE（UMD最終版・OrbitControls/GLTFLoader等のaddons非同梱）。作法：①レンダラ生成は try/catch（new THREE.WebGLRenderer({antialias:true,alpha:true})）で行い、失敗時（WebGL非対応）はCSSグラデーション等の静的背景にフォールバック ②renderer.setPixelRatio(Math.min(devicePixelRatio,2)) ③canvas は width/height:100% を明示しサイズは親要素の実寸（clientWidth/Height）から取得して resize 追従 ④ループは renderer.setAnimationLoop で回し document の visibilitychange で非表示時に setAnimationLoop(null)・再表示で再開 ⑤形状・材質・テクスチャはコードで生成（GLTF等の外部モデルファイルは fetch 遮断で読めない）。"
  },
  {
    id: "datecalc",
    uses: "日付の計算・整形（期限・経過日数・営業日・相対表示）",
    keywords: /日数計算|期限.{0,4}(計算|判定)|経過日数|営業日/i,
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.21/dayjs.min.js"],
    recipe: "dayjs('2026-07-02').add(3,'day').format('YYYY/MM/DD'); 差分は dayjs(a).diff(b,'day')。data.list の created_at は秒＝dayjs(created_at*1000)。単純な整形だけなら Date で足りる＝計算が絡む時に使う。"
  }
];
function libChoices() {
  return LIB_RECIPES.map((r) => `${r.id}｜${r.uses}`).join("\n");
}
function libsMatchingSpec(text) {
  const t = String(text || "");
  return LIB_RECIPES.filter((r) => r.keywords.test(t)).map((r) => r.id);
}
function libsInHtml(html) {
  const h = String(html || "").toLowerCase();
  return LIB_RECIPES.filter((r) => r.urls.some((u) => h.includes(u.toLowerCase()))).map((r) => r.id);
}
function recipesFor(ids) {
  const seen = /* @__PURE__ */ new Set();
  const picked = (ids || []).map((id) => LIB_RECIPES.find((r) => r.id === id)).filter((r) => !!r && !seen.has(r.id) && (seen.add(r.id), true));
  if (!picked.length) return "";
  const blocks = picked.map((r) => {
    const tags = r.urls.map((u) => {
      const e = catalogEntryForUrl(u);
      return e?.kind === "style" ? `<link rel="stylesheet" href="${u}">` : `<script src="${u}"><\/script>`;
    }).join("");
    return `■ ${r.id}（${r.uses}）
読み込み（このまま書く）: ${tags}
作法: ${r.recipe}`;
  });
  return "【このアプリで使うと決めたライブラリ（使い方に厳密に従う・不要な画面では読み込むだけで使わなくてよい）】\n" + blocks.join("\n");
}
export {
  LIB_CATALOG as L,
  isCuratedHost as a,
  injectCatalogSri as b,
  LIB_RECIPES as c,
  catalogPromptHint as d,
  libsMatchingSpec as e,
  libsInHtml as f,
  isVersionPinned as i,
  libChoices as l,
  recipesFor as r
};
