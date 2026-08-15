#!/usr/bin/env bash
# Deploy PR video worker image to Cloud Run (project glassy-filament-413307).
# IAM is unauthenticated at the gateway; the app requires Bearer PR_VIDEO_WORKER_SECRET.
# Does not echo secret values.
# Default: replace the service image only. Existing Cloud Run env
# (PR_VIDEO_WORKER_SECRET, R2_*, NEXT_PUBLIC_SUPABASE_URL) is left unchanged.
set -euo pipefail
PROJECT="${GCP_PROJECT_ID:-glassy-filament-413307}"
REGION="${GCP_REGION:-asia-northeast1}"
SERVICE="${CLOUD_RUN_SERVICE:-brandbridge-pr-video-worker}"
REPO="${ARTIFACT_REPO:-pr-video}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${SERVICE}:$(git rev-parse --short HEAD)"

gcloud config set project "$PROJECT"
if ! gcloud auth print-access-token >/dev/null 2>&1; then
  echo "gcloud is not authenticated. Run: gcloud auth login"
  echo "This script deploys the worker image only and does not change Cloud Run env vars."
  exit 1
fi
if ! gcloud artifacts repositories describe "$REPO" --location="$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --description="BrandBridge PR video"
fi

gcloud builds submit --tag "$IMAGE" --project="$PROJECT" -f services/pr-video-worker/Dockerfile .

gcloud run deploy "$SERVICE" \
  --project="$PROJECT" \
  --image="$IMAGE" \
  --region="$REGION" \
  --allow-unauthenticated \
  --cpu=2 \
  --memory=2Gi \
  --timeout=300 \
  --concurrency=1 \
  --max-instances=3

gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(status.url)'
