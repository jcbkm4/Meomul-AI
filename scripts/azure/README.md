# Meomul Azure Container Apps Deployment

This deployment flow is terminal-driven and follows the same structure as the Unity Azure setup.

Files:

- `scripts/azure/.env`
- `scripts/azure/deploy.env.example`
- `scripts/azure/deploy-container-apps.sh`
- `scripts/azure/deploy-verify-rollback.sh`
- `scripts/azure/smoke-test.sh`
- `scripts/azure/rollback-container-apps.sh`
- `scripts/azure/setup-uploads-storage.sh`
- `scripts/azure/cleanup-uploads-share.sh`

Main steps:

1. Fill required app secrets in:
   - `scripts/azure/.env`
2. Optional: configure uploads storage by running:
   - `set -a && source scripts/azure/.env && set +a && bash scripts/azure/setup-uploads-storage.sh`
3. Deploy:
   - `set -a && source scripts/azure/.env && set +a && bash scripts/azure/deploy-verify-rollback.sh`

What gets deployed:

- frontend container app:
  - `meomul-frontend`
- API container app:
  - `meomul-api`
- batch container app:
  - `meomul-batch`

Notes:

- frontend uses the existing Dockerfile at:
  - `meomul-web/Dockerfile`
- backend uses:
  - `meomul/Dockerfile`
- batch uses:
  - `meomul/Dockerfile.batch`
- uploads mount path is:
  - `/app/uploads`
