globalThis.process ??= {};
globalThis.process.env ??= {};
const ICON_OPTIONS = [
  { value: "", label: "（なし）" },
  { value: "spark", label: "きらめき" },
  { value: "check", label: "チェック" },
  { value: "users", label: "人" },
  { value: "calendar", label: "カレンダー" },
  { value: "clock", label: "時計" },
  { value: "pin", label: "ピン" },
  { value: "mail", label: "メール" }
];
const BLOCK_DEFS = [
  {
    type: "contact",
    label: "問い合わせフォーム",
    category: "コンテンツ",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "lead", label: "説明文", type: "textarea" },
      { key: "buttonLabel", label: "送信ボタンの文言", type: "text" }
    ],
    defaults: { heading: "お問い合わせ", lead: "ご質問・ご相談はこちらからお送りください。", buttonLabel: "送信する" }
  },
  {
    type: "app",
    label: "アプリ（申込・フォーム）",
    category: "アプリ",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "lead", label: "説明文", type: "textarea" },
      { key: "slug", label: "公開ページのURL名（設定→公開ページで作成したもの。例 apply-form）", type: "text" },
      { key: "height", label: "高さの目安", type: "select", options: [{ value: "auto", label: "自動（推奨）" }, { value: "s", label: "小" }, { value: "m", label: "中" }, { value: "l", label: "大" }] }
    ],
    defaults: { heading: "", lead: "", slug: "", height: "auto" }
  },
  {
    type: "hero",
    label: "ヒーロー（大見出し）",
    category: "見出し",
    fields: [
      { key: "eyebrow", label: "小見出し（英字など）", type: "text" },
      { key: "title", label: "大見出し", type: "text" },
      { key: "lead", label: "リード文", type: "textarea" },
      { key: "primaryLabel", label: "主ボタンの文言", type: "text" },
      { key: "primaryHref", label: "主ボタンのリンク", type: "url" },
      { key: "secondaryLabel", label: "副ボタンの文言", type: "text" },
      { key: "secondaryHref", label: "副ボタンのリンク", type: "url" },
      { key: "image", label: "背景画像", type: "image" },
      { key: "align", label: "配置", type: "select", options: [{ value: "left", label: "左寄せ" }, { value: "center", label: "中央" }] },
      { key: "height", label: "高さ", type: "select", options: [{ value: "s", label: "小" }, { value: "m", label: "中" }, { value: "l", label: "大" }] },
      // 3D背景演出（Three.js）。実装は core/blocks/hero-effect.ts（プラットフォーム固定＝AIはこの値を選ぶだけ）。
      // "none" を必ず先頭に置く＝site-layout の select 検証は不正値を先頭optionへ倒す（安全側＝演出なし）。
      { key: "effect", label: "背景演出（3D）", type: "select", options: [
        { value: "none", label: "なし（標準）" },
        { value: "particles", label: "金の粒子（浮遊アニメ）" },
        { value: "waves", label: "波形メッシュ（うねる線）" },
        { value: "geometry", label: "幾何オブジェクト（回転体）" }
      ] }
    ],
    defaults: { eyebrow: "", title: "見出しを入力", lead: "", align: "left", height: "m", effect: "none" }
  },
  {
    type: "richText",
    label: "本文（自由テキスト）",
    category: "コンテンツ",
    fields: [
      { key: "html", label: "本文（HTML可・サニタイズされます）", type: "richtext" },
      { key: "width", label: "横幅", type: "select", options: [{ value: "narrow", label: "標準（読みやすい幅）" }, { value: "wide", label: "広め" }] }
    ],
    defaults: { html: "<p>ここに本文を入力します。見出しは ## ではなく &lt;h2&gt; などのHTMLで書けます。</p>", width: "narrow" }
  },
  {
    type: "features",
    label: "特徴（複数カラム）",
    category: "コンテンツ",
    fields: [
      { key: "eyebrow", label: "小見出し", type: "text" },
      { key: "heading", label: "見出し", type: "text" },
      { key: "columns", label: "カラム数", type: "select", options: [{ value: "2", label: "2列" }, { value: "3", label: "3列" }, { value: "4", label: "4列" }] },
      {
        key: "items",
        label: "項目",
        type: "list",
        max: 8,
        item: [
          { key: "icon", label: "アイコン", type: "icon" },
          { key: "title", label: "見出し", type: "text" },
          { key: "body", label: "説明", type: "textarea" }
        ]
      }
    ],
    defaults: { eyebrow: "", heading: "特徴", columns: "3", items: [{ icon: "spark", title: "見出し", body: "説明文を入力します。" }] }
  },
  {
    type: "imageText",
    label: "画像＋テキスト",
    category: "コンテンツ",
    fields: [
      { key: "image", label: "画像", type: "image" },
      { key: "title", label: "見出し", type: "text" },
      { key: "body", label: "本文", type: "textarea" },
      { key: "imageSide", label: "画像の位置", type: "select", options: [{ value: "left", label: "左" }, { value: "right", label: "右" }] },
      { key: "buttonLabel", label: "ボタンの文言", type: "text" },
      { key: "buttonHref", label: "ボタンのリンク", type: "url" }
    ],
    defaults: { title: "見出し", body: "説明文を入力します。", imageSide: "left" }
  },
  {
    type: "events",
    label: "イベント一覧",
    category: "イベント",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "mode", label: "表示", type: "select", options: [{ value: "all", label: "公開中すべて" }, { value: "featured", label: "指定1件（slug）" }] },
      { key: "limit", label: "最大表示数", type: "number" },
      { key: "slug", label: "指定イベントの slug（featured時）", type: "text" }
    ],
    defaults: { heading: "開催イベント", mode: "all", limit: 6 }
  },
  {
    type: "cta",
    label: "CTA（行動喚起）",
    category: "CTA",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "body", label: "本文", type: "textarea" },
      { key: "buttonLabel", label: "ボタンの文言", type: "text" },
      { key: "buttonHref", label: "ボタンのリンク", type: "url" }
    ],
    defaults: { heading: "ご参加をお待ちしています", buttonLabel: "申し込む", buttonHref: "#" }
  },
  {
    type: "steps",
    label: "ステップ（手順）",
    category: "コンテンツ",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "items", label: "ステップ", type: "list", max: 10, item: [{ key: "title", label: "タイトル", type: "text" }, { key: "body", label: "説明", type: "textarea" }] }
    ],
    defaults: { heading: "当日の流れ", items: [{ title: "受付", body: "" }, { title: "開始", body: "" }] }
  },
  {
    type: "stats",
    label: "数値ハイライト",
    category: "コンテンツ",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "items", label: "数値", type: "list", max: 6, item: [{ key: "value", label: "数値", type: "text" }, { key: "label", label: "ラベル", type: "text" }] }
    ],
    defaults: { heading: "", items: [{ value: "120", label: "参加者" }, { value: "12", label: "開催回数" }] }
  },
  {
    type: "gallery",
    label: "ギャラリー（画像）",
    category: "画像",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "items", label: "画像", type: "list", max: 12, item: [{ key: "image", label: "画像", type: "image" }, { key: "caption", label: "キャプション", type: "text" }] }
    ],
    defaults: { heading: "", items: [] }
  },
  {
    type: "faq",
    label: "よくある質問",
    category: "コンテンツ",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "items", label: "Q&A", type: "list", max: 12, item: [{ key: "q", label: "質問", type: "text" }, { key: "a", label: "回答", type: "textarea" }] }
    ],
    defaults: { heading: "よくある質問", items: [{ q: "質問を入力", a: "回答を入力" }] }
  },
  {
    type: "quote",
    label: "引用・推薦",
    category: "コンテンツ",
    fields: [
      { key: "text", label: "引用文", type: "textarea" },
      { key: "author", label: "氏名", type: "text" },
      { key: "role", label: "肩書き", type: "text" }
    ],
    defaults: { text: "参加して視界が広がりました。", author: "参加者", role: "" }
  },
  {
    type: "logos",
    label: "ロゴ列（協賛・導入）",
    category: "画像",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "items", label: "ロゴ", type: "list", max: 12, item: [{ key: "image", label: "画像", type: "image" }, { key: "alt", label: "名称", type: "text" }] }
    ],
    defaults: { heading: "", items: [] }
  },
  {
    type: "embed",
    label: "埋め込み（地図・動画）",
    category: "メディア",
    fields: [
      { key: "heading", label: "見出し", type: "text" },
      { key: "provider", label: "種類", type: "select", options: [{ value: "map", label: "地図（Googleマップ）" }, { value: "youtube", label: "動画（YouTube）" }] },
      { key: "value", label: "地図=住所/キーワード、動画=YouTubeのURLまたはID", type: "text" }
    ],
    defaults: { heading: "", provider: "map", value: "" }
  },
  {
    type: "divider",
    label: "区切り線・余白",
    category: "コンテンツ",
    fields: [{ key: "size", label: "余白の大きさ", type: "select", options: [{ value: "s", label: "小" }, { value: "m", label: "中" }, { value: "l", label: "大" }] }],
    defaults: { size: "m" }
  }
];
const blockDef = (type) => BLOCK_DEFS.find((d) => d.type === type);
export {
  BLOCK_DEFS,
  ICON_OPTIONS,
  blockDef
};
