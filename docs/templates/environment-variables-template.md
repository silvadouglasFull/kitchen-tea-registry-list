# ==============================================================================
# Bridal Shower List PoC — Environment Variables Template
# Copy to `.env` for local development. NEVER commit `.env` to version control.
# ==============================================================================

# --- Application ---
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# --- PostgreSQL (Docker Local) ---
POSTGRES_USER="kitchen_tea"
POSTGRES_PASSWORD="kitchen_tea_dev_password"
POSTGRES_DB="kitchen_tea_db"
DATABASE_URL="postgresql://kitchen_tea:kitchen_tea_dev_password@localhost:5432/kitchen_tea_db"

# --- Google OAuth 2.0 (SPEC-004) ---
AUTH_SECRET="replace-with-openssl-rand-base64-32"
AUTH_GOOGLE_ID="replace-with-google-client-id"
AUTH_GOOGLE_SECRET="replace-with-google-client-secret"

# --- Object Storage: Local Garage (S3-Compatible) / Production Cloudflare R2 ---
# In local dev, points to Garage container (http://localhost:3900).
# In production, points to Cloudflare R2 endpoint (https://<ACCOUNT_ID>.r2.cloudflarestorage.com).
STORAGE_REGION="garage"
STORAGE_ENDPOINT="http://localhost:3900"
STORAGE_FORCE_PATH_STYLE="true"
R2_ACCOUNT_ID="local-garage"
R2_ACCESS_KEY_ID="GK0123456789abcdef0123456789abcdef"
R2_SECRET_ACCESS_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
R2_BUCKET_NAME="kitchen-tea-local"
R2_PUBLIC_URL="http://localhost:3900/kitchen-tea-local"