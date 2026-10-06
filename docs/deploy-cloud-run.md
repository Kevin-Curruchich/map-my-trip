# Deploying to Google Cloud Run

The app is built into a Docker image (see `Dockerfile`) and deployed to Cloud Run by
`.github/workflows/deploy.yml` on every push to `main`. GitHub authenticates to Google Cloud
with Workload Identity Federation, so no service account keys are stored in GitHub.

Configuration is read at runtime from `NUXT_*` environment variables, so the same image works
in any environment.

## One-time setup

Run these commands in [Cloud Shell](https://shell.cloud.google.com) or any terminal with `gcloud`.
Adjust the first block.

```bash
PROJECT_ID="your-project-id"
REGION="us-central1"
GITHUB_REPO="Kevin-Curruchich/map-my-trip"

gcloud config set project "$PROJECT_ID"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
```

### 1. Enable the APIs

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com iamcredentials.googleapis.com
```

### 2. Create the image repository

```bash
gcloud artifacts repositories create map-my-trip \
  --repository-format=docker --location="$REGION"
```

### 3. Create the service accounts

- `map-my-trip-runtime`: identity of the running service; can only read secrets.
- `github-deployer`: used by GitHub Actions to push images and deploy.

```bash
gcloud iam service-accounts create map-my-trip-runtime
gcloud iam service-accounts create github-deployer

RUNTIME_SA="map-my-trip-runtime@$PROJECT_ID.iam.gserviceaccount.com"
DEPLOYER_SA="github-deployer@$PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$RUNTIME_SA" --role="roles/secretmanager.secretAccessor"

for role in roles/run.admin roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$DEPLOYER_SA" --role="$role"
done

# Let the deployer launch the service as the runtime account.
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
  --member="serviceAccount:$DEPLOYER_SA" --role="roles/iam.serviceAccountUser"
```

### 4. Connect GitHub with Workload Identity Federation

Only workflows from this repository can impersonate the deployer.

```bash
gcloud iam workload-identity-pools create github --location=global

gcloud iam workload-identity-pools providers create-oidc github-repo \
  --location=global --workload-identity-pool=github \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository == '$GITHUB_REPO'"

gcloud iam service-accounts add-iam-policy-binding "$DEPLOYER_SA" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$GITHUB_REPO"

echo "Provider: projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github-repo"
```

### 5. Store the secrets

```bash
openssl rand -base64 32 | tr -d '\n' | gcloud secrets create session-password --data-file=-
printf '%s' 'YOUR_GOOGLE_OAUTH_CLIENT_SECRET' | gcloud secrets create oauth-google-client-secret --data-file=-
printf '%s' 'YOUR_OPENAI_API_KEY' | gcloud secrets create openai-api-key --data-file=-
printf '%s' 'YOUR_GOOGLE_PLACES_API_KEY' | gcloud secrets create google-places-api-key --data-file=-
```

To rotate one later: `printf '%s' 'NEW_VALUE' | gcloud secrets versions add openai-api-key --data-file=-`
and redeploy.

### 6. Configure GitHub

In **Settings → Environments**, create an environment named `production` and add these
**variables** (none of them are secret):

| Variable | Value |
|---|---|
| `GCP_PROJECT_ID` | your project ID |
| `GCP_REGION` | e.g. `us-central1` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | the `Provider:` value printed in step 4 |
| `GCP_DEPLOY_SERVICE_ACCOUNT` | `github-deployer@<project>.iam.gserviceaccount.com` |
| `GCP_RUNTIME_SERVICE_ACCOUNT` | `map-my-trip-runtime@<project>.iam.gserviceaccount.com` |
| `OAUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `OAUTH_GOOGLE_REDIRECT_URL` | `https://<your-domain>/auth/google` |
| `GOOGLE_MAPS_API_KEY` | browser Maps key (restrict it by HTTP referrer) |

### 7. First deploy

Run the **Deploy to Cloud Run** workflow from the Actions tab (or push to `main`). Then:

1. Copy the service URL printed by the workflow.
2. Set `OAUTH_GOOGLE_REDIRECT_URL` to `<service-url>/auth/google` and add that URI to the
   OAuth client in Google Cloud Console → APIs & Services → Credentials.
3. Add the service URL to the HTTP referrer restrictions of the Maps key.
4. Re-run the workflow.

## Running the image locally

```bash
docker build -t map-my-trip .
docker run --rm -p 8080:8080 --env-file .env.dev map-my-trip
```
