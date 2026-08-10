# ================================================
# Planzo AI — Google Cloud Run Deploy Script (PowerShell)
# ================================================

$ErrorActionPreference = "Continue"

$PROJECT_ID = "planzo-504402"
$SERVICE_NAME = "planzo-ai"
$REGION = "us-west1"
$REPO_NAME = "planzo-repo"
$IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME"

Write-Host "==> [1/6] Setting GCP project..." -ForegroundColor Green
gcloud config set project $PROJECT_ID

Write-Host "==> [2/6] Enabling required GCP APIs..." -ForegroundColor Green
gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com storage.googleapis.com

Write-Host "==> [3/6] Creating Artifact Registry repository & Storage bucket..." -ForegroundColor Green
$repoExists = $null
try {
  $repoExists = gcloud artifacts repositories describe $REPO_NAME --location=$REGION 2>$null
} catch {}

if (-not $repoExists) {
  gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="Planzo AI Docker images"
} else {
  Write-Host "  (Artifact Registry repo '$REPO_NAME' already exists, skipping creation)" -ForegroundColor Gray
}

$bucketExists = $null
try {
  $bucketExists = gcloud storage buckets describe "gs://$PROJECT_ID-build-source" 2>$null
} catch {}

if (-not $bucketExists) {
  gcloud storage buckets create "gs://$PROJECT_ID-build-source" --location=$REGION
} else {
  Write-Host "  (Storage bucket 'gs://$PROJECT_ID-build-source' already exists, skipping creation)" -ForegroundColor Gray
}

Write-Host "==> [4/6] Building and pushing Docker image via Cloud Build..." -ForegroundColor Green
gcloud builds submit --gcs-source-staging-dir="gs://$PROJECT_ID-build-source/staging" --tag $IMAGE --project $PROJECT_ID

Write-Host "==> [4.5/6] Granting Secret Manager Accessor role to Cloud Run Service Account..." -ForegroundColor Green
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" 2>$null

Write-Host "==> [5/6] Deploying to Cloud Run..." -ForegroundColor Green
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --port 3000 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest `
  --set-secrets GOOGLE_MAPS_PLATFORM_KEY=GOOGLE_MAPS_PLATFORM_KEY:latest `
  --set-env-vars NODE_ENV=production

Write-Host "==> [6/6] Getting deployed service URL..." -ForegroundColor Green
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format "value(status.url)"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅  Planzo AI deployed successfully!" -ForegroundColor Cyan
Write-Host "    URL: $SERVICE_URL" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Magenta
Write-Host "  1. Update APP_URL in Cloud Run:"
Write-Host "     gcloud run services update $SERVICE_NAME --region $REGION --set-env-vars APP_URL=$SERVICE_URL"
Write-Host ""
Write-Host "  2. Add '$SERVICE_URL' to Firebase Authorized Domains:"
Write-Host "     Firebase Console -> Authentication -> Settings -> Authorized domains"
Write-Host ""
Write-Host "  3. Update Google OAuth Redirect URIs:"
Write-Host "     GCP Console -> APIs & Services -> Credentials -> OAuth 2.0 Client IDs"
Write-Host "     Add: $SERVICE_URL/__/auth/handler"
