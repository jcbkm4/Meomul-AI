# Meomul Azure Container Apps Deployment

This deployment flow is terminal-driven and follows the same structure as the Unity Azure setup.

Files:

- `/Users/kamil/Desktop/Meomul/scripts/azure/.env`
- `/Users/kamil/Desktop/Meomul/scripts/azure/deploy.env.example`
- `/Users/kamil/Desktop/Meomul/scripts/azure/deploy-container-apps.sh`
- `/Users/kamil/Desktop/Meomul/scripts/azure/deploy-verify-rollback.sh`
- `/Users/kamil/Desktop/Meomul/scripts/azure/smoke-test.sh`
- `/Users/kamil/Desktop/Meomul/scripts/azure/rollback-container-apps.sh`
- `/Users/kamil/Desktop/Meomul/scripts/azure/setup-uploads-storage.sh`
- `/Users/kamil/Desktop/Meomul/scripts/azure/cleanup-uploads-share.sh`

Main steps:

1. Fill required app secrets in:
   - `/Users/kamil/Desktop/Meomul/scripts/azure/.env`
2. Optional: configure uploads storage by running:
   - `set -a && source /Users/kamil/Desktop/Meomul/scripts/azure/.env && set +a && bash /Users/kamil/Desktop/Meomul/scripts/azure/setup-uploads-storage.sh`
3. Deploy:
   - `set -a && source /Users/kamil/Desktop/Meomul/scripts/azure/.env && set +a && bash /Users/kamil/Desktop/Meomul/scripts/azure/deploy-verify-rollback.sh`

What gets deployed:

- frontend container app:
  - `meomul-frontend`
- API container app:
  - `meomul-api`
- batch container app:
  - `meomul-batch`

Notes:

- frontend uses the existing Dockerfile at:
  - `/Users/kamil/Desktop/Meomul/meomul-web/Dockerfile`
- backend uses:
  - `/Users/kamil/Desktop/Meomul/meomul/Dockerfile`
- batch uses:
  - `/Users/kamil/Desktop/Meomul/meomul/Dockerfile.batch`
- uploads mount path is:
  - `/app/uploads`
