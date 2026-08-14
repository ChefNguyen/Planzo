#!/usr/bin/env bash
# ================================================
# Planzo AI — Google Cloud Run Deploy Script
# ================================================
# Prerequisites:
#   - gcloud CLI installed & authenticated (gcloud auth login)
#   - Docker Desktop running (for local test)
#   - Firebase project already set up (planzo-504402)
#
# Usage:
#   chmod +x deploy-gcp.sh
#   ./deploy-gcp.sh
# ================================================

set -e  # Exit immediately on error

# ---- CONFIGURE THESE ----
PROJECT_ID="planzo-504402"
SERVICE_NAME="planzo-ai"
REGION="us-west1"
REPO_NAME="planzo-repo"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME"
# -------------------------

echo "==> [1/6] Setting GCP project..."
gcloud config set project "$PROJECT_ID"

echo "==> [2/6] Enabling required GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com

echo "==> [3/6] Creating Artifact Registry repository (skip if exists)..."
gcloud artifacts repositories create "$REPO_NAME" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Planzo AI Docker images" 2>/dev/null || echo "  (repository already exists, continuing...)"

echo "==> [4/6] Building and pushing Docker image via Cloud Build..."
gcloud builds submit \
  --tag "$IMAGE" \
  --project "$PROJECT_ID"

# Auto-create PEXELS_API_KEY in Secret Manager if missing
if ! gcloud secrets describe PEXELS_API_KEY >/dev/null 2>&1; then
  echo "  (Creating PEXELS_API_KEY secret in Secret Manager...)"
  echo -n "thQ6usGDSNEoWQQsMNprXF8vSjLt2qyVN8jlXFAFOvZpt4jidsRosUhL" | gcloud secrets create PEXELS_API_KEY --data-file=-
fi

echo "==> [5/6] Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-secrets GOOGLE_MAPS_PLATFORM_KEY=GOOGLE_MAPS_PLATFORM_KEY:latest \
  --set-secrets PEXELS_API_KEY=PEXELS_API_KEY:latest \
  --set-env-vars NODE_ENV=production

echo "==> [6/6] Getting deployed service URL..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --format "value(status.url)")

echo ""
echo "=========================================="
echo "✅  Planzo AI deployed successfully!"
echo "    URL: $SERVICE_URL"
echo "=========================================="
echo ""
echo "NEXT STEPS:"
echo "  1. Update APP_URL in Cloud Run:"
echo "     gcloud run services update $SERVICE_NAME --region $REGION --set-env-vars APP_URL=$SERVICE_URL"
echo ""
echo "  2. Add '$SERVICE_URL' to Firebase Authorized Domains:"
echo "     Firebase Console → Authentication → Settings → Authorized domains"
echo ""
echo "  3. Update Google OAuth Redirect URIs:"
echo "     GCP Console → APIs & Services → Credentials → OAuth 2.0 Client IDs"
echo "     Add: $SERVICE_URL/__/auth/handler"
