#!/usr/bin/env bash
set -euo pipefail

# Google 連携（キーレス：Workload Identity Federation ＋ ドメイン全体の委任 / DWD）の資格情報を
# ほぼ自動で用意するヘルパー。**サービスアカウント鍵(JSON)は一切作成しない**（鍵レス＝案B）。
#   ・GCP プロジェクト作成（または既存）／必要 API 有効化（Calendar/Gmail/Meet/Drive ＋ IAMCredentials/STS）
#   ・サービスアカウント作成（鍵なし）
#   ・Workload Identity Pool ＋ OIDC プロバイダ作成（issuer = あなたの baku-office Worker の URL）
#   ・IAM 付与（principal://.../subject/baku-office に workloadIdentityUser ＋ serviceAccountTokenCreator）
#   ・最後に、設定画面に貼る JSON（sa_email/client_id/project_number/pool/provider）と DWD 用の値を表示
# OAuth クライアントID/シークレットや SA 鍵は不要。組織ポリシー iam.disableServiceAccountKeyCreation 下でも動く。
# 残る手動は管理コンソールでの委任承認 1 回のみ。
#
# 使い方:
#   WORKER_URL=https://<あなたのbaku-office>.workers.dev scripts/google-service-account-setup.sh [PROJECT_ID] [SA_NAME]
#     WORKER_URL  必須。あなたの baku-office アプリの URL（OIDC issuer になる）。設定画面のコマンドに埋め込み済み。
#     PROJECT_ID  省略時は baku-office-XXXX を自動生成
#     SA_NAME     省略時は baku-office-bot
#   SUBJECT 環境変数で代理ユーザーを表示用に指定可（実際に効くのは設定画面の代理ユーザー欄）。
#
# 前提: gcloud CLI 導入済み・`gcloud auth login` 済み・課金/権限が有効なこと。

# 第1引数でIDを明示できる。未指定なら後段（前提チェック後）で既存の baku-office を探して再利用し、
# 無ければランダムな新IDを採用する（再実行・JSON再生成で新規作成→ID衝突になるのを防ぐ）。
if [ -n "${1:-}" ]; then PROJECT_ID="$1"; PROJECT_ID_EXPLICIT=1; else PROJECT_ID="baku-office-$(printf '%04d' $((RANDOM % 10000)))"; PROJECT_ID_EXPLICIT=0; fi
SA_NAME="${2:-baku-office-bot}"
POOL="${POOL:-baku-office-pool}"
PROVIDER="${PROVIDER:-baku-office-prov}"

# 委任するスコープ（設定画面で選んだ機能に合わせて取捨選択可。既定は Calendar + Meet）。
SCOPES="https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/meetings.space.created,https://www.googleapis.com/auth/meetings.space.readonly"
APIS=(
  "calendar-json.googleapis.com"      # Google Calendar API
  "gmail.googleapis.com"              # Gmail API
  "meet.googleapis.com"              # Google Meet API
  "drive.googleapis.com"             # Google Drive API（書類の取り込み・メタ同期）。未有効だと Drive 403
  "iamcredentials.googleapis.com"     # signJwt（DWDアサーション署名・鍵レスの要）
  "sts.googleapis.com"               # Security Token Service（WIF トークン交換）
)

# ---- 視覚ヘルパ（Cloud Shell は色対応。非TTYなら無色）。値そのもの（ID/メール/URL）には色を付けない＝コピー安全。 ----
if [ -t 1 ]; then B=$'\e[1m'; D=$'\e[2m'; G=$'\e[32m'; R=$'\e[31m'; N=$'\e[0m'; else B=; D=; G=; R=; N=; fi
TOTAL=6
step() { printf '\n%s━━ [%s/%s] %s%s\n' "$B" "$1" "$TOTAL" "$2" "$N"; }
ok()   { printf '   %s✓%s %s\n' "$G" "$N" "$1"; }
info() { printf '   %s%s%s\n' "$D" "$1" "$N"; }
die()  { printf '\n%s✗ %s%s\n' "$R" "$1" "$N" >&2; exit 1; }
# WIF/IAM 系コマンドを実行し、権限不足（制限組織で頻発）なら必要ロールと付与コマンド・再実行方法を案内して終了。
# WHY: scidi.or.jp 等はプロジェクト作成者に Owner を自動付与しないため、SA作成までは通っても WIF プール作成や
# SA への IAM 付与で PERMISSION_DENIED になる。真因と直し方を即時に示し、再実行（冪等）へ誘導する。
run_wif() {
  local desc="$1"; shift; local err n=0 max=6 pd=0 pdmax=6
  while :; do
    if err="$("$@" 2>&1)"; then return 0; fi
    # PERMISSION_DENIED：本スクリプトは直前に必要ロールを自己付与している。IAM ロールの付与は
    # 反映に時間がかかる（eventual consistency）ため、まず数回リトライしてから案内へ落とす。
    # WHY: プール作成は通るのに直後の SA への setIamPolicy だけ denied になるのは、付与済みロールの
    # 反映遅延が主因（実機 scidi.or.jp で確認）。即 die すると毎回手動付与＋再実行を強いてしまう。
    if printf '%s' "${err}" | grep -qi 'PERMISSION_DENIED'; then
      if [ "${pd}" -lt "${pdmax}" ]; then
        pd=$((pd + 1)); printf '   %s…権限の反映待ち (%s/%s)%s\n' "$D" "${pd}" "${pdmax}" "$N"; sleep 10; continue
      fi
      die "${desc}に必要な権限がありません（${ACTIVE_ACCOUNT}）。
   この組織はプロジェクト作成者に Owner を自動付与しないため、WIF 設定に必要なロールが不足しています。
   対処（Owner かプロジェクト管理者が実行）：
     gcloud projects add-iam-policy-binding ${PROJECT_ID} --member=\"user:${ACTIVE_ACCOUNT}\" --role=\"roles/iam.workloadIdentityPoolAdmin\"
     gcloud projects add-iam-policy-binding ${PROJECT_ID} --member=\"user:${ACTIVE_ACCOUNT}\" --role=\"roles/iam.serviceAccountAdmin\"
   付与後、同じプロジェクトで再実行（新規作成を避けるため ID を指定）：
     WORKER_URL=${WORKER_URL} bash google-service-account-setup.sh ${PROJECT_ID}
   詳細：${err}"
    fi
    # 作成直後の反映遅延（NOT_FOUND）は時間で直る→リトライ。
    if printf '%s' "${err}" | grep -qi 'NOT_FOUND' && [ "${n}" -lt "${max}" ]; then
      n=$((n + 1)); printf '   %s…反映待ち (%s/%s)%s\n' "$D" "${n}" "${max}" "$N"; sleep 5; continue
    fi
    die "${desc}に失敗：${err}"
  done
}
# 作成直後の eventual consistency（NOT_FOUND 等）を吸収する汎用リトライ。成功するまで最大 max 回。
retry() { local n=0 max=24; until "$@" >/dev/null 2>&1; do n=$((n + 1)); [ "${n}" -ge "${max}" ] && return 1; printf '   %s…反映待ち (%s/%s)%s\n' "$D" "${n}" "${max}" "$N"; sleep 5; done; }

# API を有効化する。利用規約(ToS)未承諾の API は CLI から承諾できず、gcloud services enable が
# FAILED_PRECONDITION / UREQ_TOS_NOT_ACCEPTED(390003) で必ず失敗する。Google は承諾状態を事前照会する
# API を提供していないため、「1つずつ有効化して失敗＝未承諾」を承諾状態の判定に用いる。未承諾を検知したら
# 対象の規約URLを提示し、対話環境では承諾を待って残りをリトライ、非対話では案内して終了する。
enable_apis_with_tos() {
  local remaining=("$@")
  while :; do
    local pending=() api out tos url
    for api in "${remaining[@]}"; do
      if out="$(gcloud services enable "${api}" 2>&1)"; then
        ok "有効化: ${api}"; continue
      fi
      if printf '%s' "${out}" | grep -qiE 'UREQ_TOS_NOT_ACCEPTED|390003|terms of service'; then
        # 規約未承諾。gcloud が返す tos_id から規約URLを組み立てる（取れなければ API 名の先頭語で代替）。
        tos="$(printf '%s' "${out}" | grep -oiE 'tos_id[=:][[:space:]]*[a-z0-9_-]+' | head -1 | grep -oiE '[a-z0-9_-]+$' || true)"
        [ -n "${tos}" ] || tos="${api%%.*}"
        url="https://console.developers.google.com/terms/${tos}"
        printf '   %s! %s は利用規約の承諾が必要です%s\n' "$R" "${api}" "$N"
        printf '     承諾URL: %s\n' "${url}"
        pending+=("${api}")
      else
        die "API 有効化に失敗（${api}）
   ${out}"
      fi
    done
    [ "${#pending[@]}" -eq 0 ] && return 0
    if [ -t 0 ]; then
      printf '\n   上記URLを %s%s%s でログイン中のブラウザで開き、プロジェクト %s%s%s を選んで「同意」してください。\n' "$B" "${ACTIVE_ACCOUNT}" "$N" "$B" "${PROJECT_ID}" "$N"
      printf '   承諾したら Enter で続行（q + Enter で中止）… '
      local ans; read -r ans
      [ "${ans}" = "q" ] && die "中止しました。承諾後に同じIDで再実行してください: WORKER_URL=${WORKER_URL} bash google-service-account-setup.sh ${PROJECT_ID}"
      remaining=("${pending[@]}"); continue
    fi
    die "上記APIの利用規約が未承諾です。各URLを ${ACTIVE_ACCOUNT} で開いて承諾し、同じIDで再実行してください: WORKER_URL=${WORKER_URL} bash google-service-account-setup.sh ${PROJECT_ID}"
  done
}

step 1 "前提チェック"
command -v gcloud >/dev/null 2>&1 || die "gcloud が見つかりません: https://cloud.google.com/sdk/docs/install"
ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null || true)"
[ -n "${ACTIVE_ACCOUNT}" ] || die "gcloud にログインしていません。まず実行: gcloud auth login"
# WORKER_URL（OIDC issuer）は必須。未指定なら（対話端末では）入力を促し、非対話では中断。
if [ -z "${WORKER_URL:-}" ]; then
  if [ -t 0 ]; then
    printf '   %sあなたの baku-office アプリの URL を入力してください（例 https://baku-office-app.example.workers.dev）%s\n' "$D" "$N"
    printf '   WORKER_URL = '; read -r WORKER_URL
  fi
fi
[ -n "${WORKER_URL:-}" ] || die "WORKER_URL（あなたの baku-office の URL）が必要です。設定画面に表示されたコマンドをそのままコピーして実行してください。"
WORKER_URL="${WORKER_URL%/}" # 末尾スラッシュ除去（issuer は origin・OIDC iss と一致必須）
case "${WORKER_URL}" in https://*) ;; *) die "WORKER_URL は https:// で始まる必要があります（現在: ${WORKER_URL}）";; esac
SUBJECT="${SUBJECT:-${ACTIVE_ACCOUNT}}"
# ID 未指定なら、このアカウントで作成済みの baku-office プロジェクトを再利用（再実行・JSON再生成を容易に）。
if [ "${PROJECT_ID_EXPLICIT}" = "0" ]; then
  EXISTING_PROJECT="$(gcloud projects list --filter='name:baku-office' --format='value(projectId)' --sort-by=projectId 2>/dev/null | head -n1)"
  if [ -n "${EXISTING_PROJECT}" ]; then PROJECT_ID="${EXISTING_PROJECT}"; fi
fi
ok "アカウント   : ${ACTIVE_ACCOUNT}"
ok "Worker URL  : ${WORKER_URL}（OIDC issuer）"
info "プロジェクト: ${PROJECT_ID} ／ SA: ${SA_NAME} ／ Pool: ${POOL} ／ Provider: ${PROVIDER}"

step 2 "プロジェクトの用意"
if gcloud projects describe "${PROJECT_ID}" >/dev/null 2>&1; then
  ok "既存を使用: ${PROJECT_ID}"
else
  # 新規作成。プロジェクトIDはGoogle全体で一意のため、ランダムIDが他で使用済み（別プロジェクト／削除済みで予約中）
  # のことがある。ID未指定のときは別IDで数回まで自動リトライする。明示指定のときはそのIDで失敗＝即終了。
  created=""
  for _ in 1 2 3 4 5; do
    if gcloud projects create "${PROJECT_ID}" --name="baku-office" >/dev/null 2>&1; then created=1; break; fi
    [ "${PROJECT_ID_EXPLICIT}" = "1" ] && break
    info "プロジェクトID ${PROJECT_ID} は使用済みのため、別のIDで再試行します"
    PROJECT_ID="baku-office-$(printf '%04d' $((RANDOM % 10000)))"
  done
  [ -n "${created}" ] || die "プロジェクト作成に失敗しました。課金が有効か／プロジェクト作成権限があるかをご確認ください。
   すでに一度設定済みの場合は、そのプロジェクトIDを指定して再実行してください（JSONだけ作り直せます）：
     WORKER_URL=${WORKER_URL} bash google-service-account-setup.sh <既存のPROJECT_ID>
   プロジェクトIDの確認： gcloud projects list --filter='name:baku-office'"
  ok "作成: ${PROJECT_ID}"
fi
gcloud config set project "${PROJECT_ID}" >/dev/null
PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
[ -n "${PROJECT_NUMBER}" ] || die "プロジェクト番号の取得に失敗しました"
ok "プロジェクト番号: ${PROJECT_NUMBER}"

step 3 "API の有効化（Calendar / Gmail / Meet / Drive ＋ IAMCredentials / STS）"
info "各 API の利用規約(ToS)承諾を確認しながら有効化します（未承諾なら承諾URLを案内）"
enable_apis_with_tos "${APIS[@]}"
ok "有効化完了"

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
step 4 "サービスアカウント作成（鍵は作りません）"
if gcloud iam service-accounts describe "${SA_EMAIL}" >/dev/null 2>&1; then
  ok "SA 既存: ${SA_EMAIL}"
else
  gcloud iam service-accounts create "${SA_NAME}" --display-name="baku-office bot" >/dev/null || die "サービスアカウント作成に失敗"
  ok "SA 作成: ${SA_EMAIL}"
fi
# 作成直後は IAM 反映待ちで describe が NOT_FOUND を返すことがある。SA が見えるまで待ってから client_id を取得。
retry gcloud iam service-accounts describe "${SA_EMAIL}" \
  || die "サービスアカウントの反映待ちがタイムアウトしました。1分ほど待って同じIDで再実行してください: WORKER_URL=${WORKER_URL} bash google-service-account-setup.sh ${PROJECT_ID}"
CLIENT_ID="$(gcloud iam service-accounts describe "${SA_EMAIL}" --format='value(oauth2ClientId)')"
[ -n "${CLIENT_ID}" ] || die "client_id（oauth2ClientId）の取得に失敗しました"

step 5 "Workload Identity Federation（プール / OIDC プロバイダ / IAM）"
# 制限組織ではプロジェクト作成者に WIF 関連権限が無いことがある（SA作成までは通る）。
# Owner/プロジェクト管理者なら自分で付与できるので、必要ロールを best-effort で自己付与しておく（失敗は無視）。
# これで「権限付与→再実行」の往復を多くのケースで1回に圧縮できる。足りなければ後段の run_wif が手順を案内する。
case "${ACTIVE_ACCOUNT}" in
  *@*.gserviceaccount.com) : ;; # SA実行は user: プレフィクス不適のためスキップ
  *@*)
    for ROLE in roles/iam.workloadIdentityPoolAdmin roles/iam.serviceAccountAdmin; do
      gcloud projects add-iam-policy-binding "${PROJECT_ID}" --member="user:${ACTIVE_ACCOUNT}" --role="${ROLE}" >/dev/null 2>&1 || true
    done
    ;;
esac
if gcloud iam workload-identity-pools describe "${POOL}" --location=global >/dev/null 2>&1; then
  ok "Pool 既存: ${POOL}"
else
  run_wif "Pool 作成" gcloud iam workload-identity-pools create "${POOL}" --location=global --display-name="baku-office"
  ok "Pool 作成: ${POOL}"
fi
# OIDC プロバイダ：issuer=あなたの Worker URL。subject クレームを google.subject にマップ（principal で参照）。
# 既定の許可 audience（https://iam.googleapis.com/projects/.../providers/<PROV>）が Worker 自署名 JWT の aud と一致する。
if gcloud iam workload-identity-pools providers describe "${PROVIDER}" --location=global --workload-identity-pool="${POOL}" >/dev/null 2>&1; then
  ok "Provider 既存: ${PROVIDER}（issuer 更新）"
  run_wif "Provider 更新" gcloud iam workload-identity-pools providers update-oidc "${PROVIDER}" --location=global --workload-identity-pool="${POOL}" \
    --issuer-uri="${WORKER_URL}" --attribute-mapping="google.subject=assertion.sub"
else
  run_wif "Provider 作成" gcloud iam workload-identity-pools providers create-oidc "${PROVIDER}" --location=global --workload-identity-pool="${POOL}" \
    --issuer-uri="${WORKER_URL}" --attribute-mapping="google.subject=assertion.sub" --display-name="baku-office"
  ok "Provider 作成: ${PROVIDER}"
fi
# 自署名 JWT の sub="baku-office" を、この SA を使える主体として束縛。
# 単一 subject は **principal://（単数）**。principalSet:// は attribute.*/* 専用で、/subject/ に使うと INVALID_ARGUMENT。
MEMBER="principal://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/subject/baku-office"
# workloadIdentityUser＝この主体が SA として動ける。serviceAccountTokenCreator＝signJwt を呼べる（DWDアサーション署名）。
run_wif "IAM 付与(workloadIdentityUser)" gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" --role="roles/iam.workloadIdentityUser" --member="${MEMBER}"
run_wif "IAM 付与(serviceAccountTokenCreator)" gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" --role="roles/iam.serviceAccountTokenCreator" --member="${MEMBER}"
ok "IAM 付与完了（workloadIdentityUser ＋ serviceAccountTokenCreator）"

WIF_JSON="$(printf '{"sa_email":"%s","client_id":"%s","project_number":"%s","pool":"%s","provider":"%s"}' "${SA_EMAIL}" "${CLIENT_ID}" "${PROJECT_NUMBER}" "${POOL}" "${PROVIDER}")"
# ① 自動ハンドオフ（コピー不要・最優先）：HANDOFF トークンがあれば WIF設定を baku-office へ直接送信する。
# 設定画面がポーリングで受け取り手順2へ自動入力する。送るのは公開識別子のみ（秘密鍵ではない＝キーレス）。
HANDOFF_OK=""
HANDOFF_CODE=""
if [ -n "${HANDOFF:-}" ]; then
  HANDOFF_CODE="$(curl -sS -m 20 -o /dev/null -w '%{http_code}' -X POST "${WORKER_URL}/api/google/wif-handoff" \
       -H 'content-type: application/json' \
       -d "{\"token\":\"${HANDOFF}\",\"wif\":${WIF_JSON}}" 2>/dev/null || echo "000")"
  [ "${HANDOFF_CODE}" = "200" ] && HANDOFF_OK=1
fi
# ② 保険：OSC52 で端末経由クリップボードへ自動コピー（効かない端末でも下に枠表示で手動コピー可）。
b64="$(printf '%s' "${WIF_JSON}" | base64 2>/dev/null | tr -d '\n')"; printf '\e]52;c;%s\a' "${b64}"
# 端末をクリアして最終結果を最上部に固定（長いログで JSON が流れて見づらいのを防ぐ）。
[ -t 1 ] && clear

step 6 "完了 — 設定画面に戻って貼り付けてください"
printf '\n%s✓ Google 側の準備ができました（サービスアカウント鍵は作成していません）。%s\n' "$G" "$N"
if [ -n "${HANDOFF_OK}" ]; then
  printf '\n%s✓ baku-office に WIF設定を自動送信しました。設定画面タブに戻ると自動で入力されます（コピー不要）。%s\n' "$G" "$N"
elif [ -n "${HANDOFF:-}" ]; then
  printf '\n%s⚠ 自動送信に失敗しました（HTTP %s）。下の「WIF設定」枠を手動でコピーして、設定画面の欄に貼り付けてください。%s\n' "$R" "${HANDOFF_CODE}" "$N"
  [ "${HANDOFF_CODE}" = "404" ] && printf '   ヒント：設定画面を一度再読込してから、この手順をやり直すと自動送信が回復します（トークンの有効期限切れ）。\n'
fi
printf '\n%s① WIF設定（自動送信済み。手動で貼る場合はこちら）%s\n' "$B" "$N"
printf '   自動入力されない場合のみ：設定画面の「WIF設定」欄をクリックして貼り付け（Ctrl+V / Cmd+V）。効かなければ下の枠を手動コピー。\n'
printf '%s┌──────────────────────────────────────────────────────────%s\n' "$D" "$N"
printf '%s\n' "${WIF_JSON}"
printf '%s└──────────────────────────────────────────────────────────%s\n' "$D" "$N"
printf '\n%s② ドメイン全体の委任（設定画面の手順に沿って管理コンソールで承認）%s\n' "$B" "$N"
printf '   クライアントID : %s\n' "${CLIENT_ID}"
printf '   スコープ       : %s\n' "${SCOPES}"
printf '\n%s▶ いま開いている baku-office の設定画面タブに戻ってください：%s\n' "$B" "$N"
printf '   %s/settings/google-setup\n' "${WORKER_URL}"
printf '\n%s（この Cloud Shell タブは閉じてかまいません）%s\n' "$D" "$N"
