-- フォーク元(上流)更新のAIマージ提案を一時保持する。
-- merge_proposal=AIが生成した提案JSON（推奨可否・根拠・統合定義・上流版）。
-- 提案を保存→ユーザー確認後に apply で適用（クライアントが定義を送り返さず、サーバ側の提案を正典にする＝改竄防止）。
ALTER TABLE app_drafts ADD COLUMN merge_proposal TEXT;
