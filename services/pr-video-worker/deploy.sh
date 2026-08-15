#!/usr/bin/env bash
# Deploy PR video worker to Cloud Run (project glassy-filament-413307).
# IAM is unauthenticated at the gateway; the app requires Bearer PR_VIDEO_WORKER_SECRET.
# Does not echo secret values.
set -euo pipefail
PROJECT="${GCP_PROJECT_ID:-glassy-filament-413307}"
REGION="${GCP_REGION:-asia-northeast1}"
SERVICE="${CLOUD_RUN_SERVICE:-pr-video-worker}"
REPO="${ARTIFACT_REPO:-pr-video}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${SERVICE}:$(git rev-parse --short HEAD)"

missing=0
for name in PR_VIDEO_WORKER_SECRET R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY NEXT_PUBLIC_SUPABASE_URL; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required env: $name"
    missing=1
  fi
done
if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

gcloud config set project "$PROJECT"
if ! gcloud artifacts repositories describe "$REPO" --location="$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --description="BrandBridge PR video"
fi

gcloud builds submit --tag "$IMAGE" --project="$PROJECT" -f services/pr-video-worker/Dockerfile .

ENV_FILE="$(mktemp)"
trap 'rm -f "$ENV_FILE"' EXIT
{
  printf 'PR_VIDEO_WORKER_SECRET=%s\n' "$PR_VIDEO_WORKER_SECRET"
  printf 'R2_ACCOUNT_ID=%s\n' "$R2_ACCOUNT_ID"
  printf 'R2_ACCESS_KEY_ID=%s\n' "$R2_ACCESS_KEY_ID"
  printf 'R2_SECRET_ACCESS_KEY=%s\n' "$R2_SECRET_ACCESS_KEY"
  printf 'R2_BUCKET_NAME=%s\n' "${R2_BUCKET_NAME:-brandbridge-pr-videos}"
  printf 'NEXT_PUBLIC_SUPABASE_URL=%s\n' "$NEXT_PUBLIC_SUPABASE_URL"
} > "$ENV_FILE"

gcloud run deploy "$SERVICE" \
  --project="$PROJECT" \
  --image="$IMAGE" \
  --region="$REGION" \
  --allow-unauthenticated \
  --cpu=2 \
  --memory=4Gi \
  --timeout=300 \
  --concurrency=1 \
  --max-instances=3 \
  --env-vars-file="$ENV_FILE"

gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(status.url)'
