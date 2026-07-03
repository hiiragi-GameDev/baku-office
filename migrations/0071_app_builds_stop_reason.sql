-- app_builds に stop_reason を追加：終了/打ち切りの理由を型として残し再開・運用判断を可能にする。
-- 値の例: 'completed' / 'partial' / 'age'(時間切れ) / 'attempts'(再試行尽き) / 'no-plan'(プラン生成失敗) /
--          'model-error'(LLM失敗) / 'validate'(検証失敗) / 'system'(内部例外) / 'nochange'(編集で変更なし)。
-- status は TEXT のまま運用値 'done_partial'(失敗工程ありで完了) を追加で用いる（DDL変更不要）。
ALTER TABLE app_builds ADD COLUMN stop_reason TEXT;
