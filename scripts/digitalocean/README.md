# DigitalOcean Droplet Deployment

## Files
- `docker-compose.prod.yml`
- `deploy/Caddyfile`
- `.env.production`
- `scripts/digitalocean/bootstrap-droplet.sh`
- `scripts/digitalocean/deploy-droplet.sh`

## Flow
1. Create Droplet (Ubuntu 24.04 recommended)
2. SSH in as `root`
3. Run `bootstrap-droplet.sh`
4. Copy Meomul repo to `/srv/meomul`
5. Copy `.env.production.example` to `/srv/meomul/.env.production` and fill values
6. Point domain DNS:
   - `APP_DOMAIN` -> Droplet IP
   - `API_DOMAIN` -> Droplet IP
7. Run `deploy-droplet.sh`

## Notes
- Uploads persist at `/srv/meomul/data/uploads`
- Redis runs locally in Docker
- MongoDB should stay on Atlas
- Caddy handles HTTPS automatically once DNS is pointed
