# VPS Bootstrap Runbook — Hack Club Passport (whoami)

One-time setup. After this, every change is a git commit.
Estimated time: ~30 minutes. Prereqs: a Hack Club VPS (8 GB RAM), your SSH key, DNS control.

## 1. DNS

Point an A record at the VPS IPv4:

```
passport.hackclub.app.  IN  A  <VPS_IP>
```

## 2. Install NixOS on the box

**If a NixOS image is available:** boot it and add your SSH key to root.

**If the box is Ubuntu:** run nixos-infect (destructive to the OS only, ~10 min + reboot):

```bash
curl -L https://raw.githubusercontent.com/NixOS/nixos-infect/master/nixos-infect | bash -
```

After reboot you have NixOS with default config.

## 3. Clone repo + real hardware config

```bash
ssh root@<VPS_IP>
git clone <YOUR_REPO_URL> /root/whoami
cd /root/whoami/infra/nix
nixos-generate-config --show-hardware-config > hardware-configuration.nix
```

(This replaces the placeholder `hardware-configuration.nix` with the real disks.)

## 4. Edit the two placeholders in `services.nix`

```nix
appImage = "ghcr.io/<YOUR_GH_USERNAME_OR_ORG>/whoami:latest";
domain   = "passport.hackclub.app";   # your real subdomain
```

And in `configuration.nix`, replace the placeholder SSH key with yours.

## 5. Age key + sops secrets

```bash
nix-shell -p sops age
mkdir -p /var/lib/sops/age
age-keygen -o /var/lib/sops/age/keys.txt
# prints: Public key: age1....  ← copy this
```

On your **local machine** (with sops installed):

1. Put that public key into `.sops.yaml` (replacing `age1REPLACE_AT_BOOTSTRAP`).
2. Create the secrets file:

```bash
sops infra/nix/secrets/prod.enc.yaml
```

Content structure (sops encrypts values on save):

```yaml
whoami_env: |
  DATABASE_URL=postgresql://whoami:STRONGPASSWORD@127.0.0.1:5432/whoami?schema=public
  AUTH_SECRET=<openssl rand -base64 32>
  AUTH_URL=https://passport.hackclub.app
  AUTH_HCA_CLIENT_ID=<from auth.hackclub.com developer apps>
  AUTH_HCA_CLIENT_SECRET=<same place>
  SUPERADMIN_EMAILS=you@hackclub.com
  REDIS_URL=redis://host.docker.internal:6379
  SENTRY_DSN=<added later, see step 9>
  EMAIL_PROVIDER=mailpit
  MAILPIT_URL=http://host.docker.internal:8025
  EMAIL_FROM=noreply@passport.hackclub.app
  PII_ENCRYPTION_KEY=<openssl rand -base64 32>
glitchtip_env: |
  DATABASE_URL=postgresql://glitchtip:GPASSWORD@host.docker.internal:5432/glitchtip
  REDIS_URL=redis://host.docker.internal:6379/1
  SECRET_KEY=<openssl rand -hex 32>
  GLITCHTIP_DOMAIN=https://passport.hackclub.app
metabase_env: |
  MB_DB_TYPE=postgres
  MB_DB_DBNAME=metabase
  MB_DB_USER=metabase
  MB_DB_PASS=MPASSWORD
  MB_DB_HOST=host.docker.internal
```

Note: containers reach host services (postgres/valkey/mailpit) via
`host.docker.internal` — the flake maps it to the host gateway.

## 6. First apply

```bash
cd /root/whoami/infra/nix
nixos-rebuild switch --flake .#whoami
```

This starts postgres, valkey, caddy, and all containers. Caddy obtains the
TLS certificate automatically (check `journalctl -u caddy`).

## 7. Database passwords (one-time)

The `initialScript` creates roles but no passwords. Set them now:

```bash
sudo -u postgres psql <<'SQL'
ALTER USER whoami PASSWORD 'STRONGPASSWORD';      -- must match whoami_env
ALTER USER glitchtip PASSWORD 'GPASSWORD';        -- must match glitchtip_env
ALTER USER metabase PASSWORD 'MPASSWORD';         -- must match metabase_env
ALTER USER metabase_readonly PASSWORD 'ROPASSWORD';
SQL
```

(Use the same values you put in the sops file.)

## 8. Run migrations

```bash
docker exec -it whoami bunx prisma migrate deploy
```

## 9. Verify

```bash
curl -s https://passport.hackclub.app/api/health        # app
curl -s http://127.0.0.1:3001                            # glitchtip web
curl -s http://127.0.0.1:3005                            # metabase
curl -s http://127.0.0.1:3100                            # uptime kuma
curl -sI https://passport.hackclub.app | grep -i frame  # X-Frame-Options: DENY
```

- GlitchTip: open its web UI, create a project, copy the DSN into
  `whoami_env`'s `SENTRY_DSN` (edit via `sops infra/nix/secrets/prod.enc.yaml`
  locally, commit, then `nixos-rebuild switch` again).
- Metabase: first-run wizard at `https://passport.hackclub.app/metabase`,
  connect with the `metabase_readonly` user.
- Uptime Kuma: first-run at `http://127.0.0.1:3100` (SSH tunnel if you don't
  expose it), add a monitor for `https://passport.hackclub.app/api/health`.

## 10. Configure rclone for off-box backups

```bash
rclone config   # create a remote named `b2:` (Backblaze B2 or any storage)
systemctl start pg-offbox-sync   # test the weekly job manually
```

## 11. Point CI at the box

Add these GitHub Actions secrets (repo → Settings → Secrets):
- `VPS_HOST` — the VPS IP
- `VPS_SSH_KEY` — private key whose public half is in `configuration.nix`
  for the `deploy` user

From now on: push to `main` = build image → deploy → health check.

## Updating things later (the whole point)

| Change | How |
|---|---|
| App code | git push to main — CI builds and deploys automatically |
| Service config (caddy rules, new container) | edit `infra/nix/*.nix`, push |
| NixOS packages / OS upgrade | bump flake input / nixpkgs pin, push |
| Secrets | `sops infra/nix/secrets/prod.enc.yaml` locally, push, rebuild |
| Emergency rollback on the VPS | `nixos-rebuild switch --rollback` |
| Boot into previous generation | pick it in the boot menu |

Database data lives in `/var/lib/postgresql` and is NEVER touched by any of
the above. Nightly dumps are in `/var/backup/postgresql`.
