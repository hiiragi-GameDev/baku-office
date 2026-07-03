globalThis.process ??= {};
globalThis.process.env ??= {};
import { getApiKey } from "./client_F4fksau0.mjs";
import { googleStatus, SCOPE_GROUPS } from "./google_DFar0IbF.mjs";
import { listCapabilities, CAPABILITY_LABEL } from "./capabilities_DGQUed42.mjs";
import { getRetentionDays } from "./storage_BHLYBEBb.mjs";
const LIMITED_USE = [
  "本アプリの Google ユーザーデータの利用は、Google API Services User Data Policy（Limited Use 要件を含む）に準拠します。具体的には：",
  "・取得した Gmail 等のデータは、ユーザーが要求した機能の提供のみに利用します。",
  "・人による閲覧は、ユーザーの明示的同意、セキュリティ・不正対策・法令遵守、または集計・匿名化された場合を除き行いません。",
  "・第三者への譲渡・販売は行わず、広告目的には利用しません。",
  "・データはユーザーの Cloudflare アカウント内に保存時暗号化（AES-GCM）で保持し、連携解除でアクセスを失効します。"
].join("\n");
async function buildDisclosure(env) {
  const dest = [];
  dest.push({
    name: "Cloudflare（Workers / D1 / KV / R2）",
    purpose: "アプリ稼働・業務データの保存（顧客自身のCloudflareアカウント内）",
    dataKinds: "会員名簿・会計・ファイル等の業務データ全般（ファイル本体は保存時暗号化）",
    region: "顧客が選択するCloudflareのリージョン"
  });
  const has = async (k) => !!await getApiKey(env, k);
  if (await has("gemini")) dest.push({
    name: "Google（Gemini API）",
    purpose: "AIによる応答・要約・検索の生成（応答生成の目的に限定。広告・プロファイリングには利用しない）",
    dataKinds: "チャット入力・要約対象テキスト/ファイル・Web検索クエリ",
    region: "Google（米国等・越境の可能性）",
    note: "利用目的は応答生成に限定。API経由（有料）のプロンプトはモデル学習に使用されません。提供元が不正使用検知等の目的で定める期間のみ一時保持し、その後削除されます（具体的な保持期間は Google の最新の API データ利用規約に従います）。団体が BYOK で有効化した既定のテキストAIです。"
  });
  if (await has("claude")) dest.push({
    name: "Anthropic（Claude API）",
    purpose: "AIによる資料生成・抽出・スキル実行",
    dataKinds: "チャット入力・資料要件・請求書/領収書の画像/PDF",
    region: "Anthropic（米国等・越境の可能性）",
    note: "有料APIのプロンプトはモデル学習に使用されない旨を提供元規約で確認のこと。"
  });
  const g = await googleStatus(env);
  const googleConnected = g.connected && g.groups.length > 0;
  const usesRestricted = g.groups.some((gr) => SCOPE_GROUPS[gr]?.restricted);
  if (googleConnected) {
    const labels = g.groups.map((gr) => SCOPE_GROUPS[gr]?.label).filter(Boolean).join(" / ");
    dest.push({
      name: "Google Workspace（Calendar / Gmail / Meet）",
      purpose: `連携機能（付与: ${labels}）`,
      dataKinds: "予定・メール本文/添付・会議記録（付与した範囲のみ）",
      region: "Google（米国等・越境の可能性）",
      note: "Gmail の閲覧/送信は Restricted scope。最終利用日時・付与scopeは連携画面で確認可。"
    });
  }
  if (await has("line_token")) dest.push({
    name: "LINE（Messaging API）",
    purpose: "LINEでの通知・チャット応答",
    dataKinds: "送受信メッセージ・宛先ユーザーID",
    region: "LINEヤフー（日本等）"
  });
  const caps = await listCapabilities(env, true).catch(() => []);
  for (const c of caps) {
    dest.push({
      name: `任意API：${CAPABILITY_LABEL[c.capability] ?? c.capability}（${c.provider ?? "不明"}）`,
      purpose: "画像/音声/動画生成など団体が有効化した追加AI機能",
      dataKinds: "各機能への入力（プロンプト・テキスト等）",
      region: "各提供元（越境の可能性）",
      note: "団体がBYOKで有効化。利用前に提供元のデータ利用条件を確認のこと。"
    });
  }
  dest.push({
    name: "Stripe（決済・ホスト経由）",
    purpose: "プラン課金の決済処理（ホストが実施）",
    dataKinds: "課金に必要な範囲（業務データは含まない）",
    region: "Stripe（米国・日本等）"
  });
  return {
    destinations: dest,
    retentionDays: await getRetentionDays(env).catch(() => 0),
    encryptedAtRest: true,
    generatedNote: "本一覧は現在の連携設定から自動生成されています。連携の追加・解除で内容は変わります。上記の各送信先は、個人情報の取扱いを委託する「サブプロセッサ（委託先）」一覧としても利用できます。",
    googleConnected,
    limitedUse: usesRestricted ? LIMITED_USE : void 0,
    responsibilityNote: [
      "・業務データ（会員名簿・会計・ファイル等）は顧客（団体）自身の Cloudflare アカウント内に保存され、ホスト（baku-office 提供者）は通常これを閲覧しません。ホストはライセンス・配信・課金・通知のみを担います。",
      "・保存時暗号化に用いる暗号鍵も団体自身の Cloudflare アカウント内で管理されます。したがって団体の Cloudflare アカウント（ログイン情報）の保護が安全性の前提です。アカウントが第三者に侵害された場合、保存時暗号化は保護として機能しないことがあります。",
      "・外部AI/外部API（BYOK で団体が有効化したもの）に送信されるデータの取扱いは各提供元の規約に従い、その有効化判断と費用負担は団体に帰属します。",
      "・Cloudflare/外部API の実費（Workers/D1/KV/R2、AIトークン等）は顧客負担です。アプリ内の上限は推定であり、実請求は各プロバイダの計上が正です。"
    ].join("\n")
  };
}
export {
  buildDisclosure
};
