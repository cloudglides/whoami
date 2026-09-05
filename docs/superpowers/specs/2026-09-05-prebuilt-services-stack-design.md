# Hack Club Embassy — Pre-built Services Stack Design

**Date:** 2026-09-05
**Status:** Approved design, pending implementation
**Scope:** Infrastructure plumbing for the whoami app. Domain logic (orders, state machine, roles) stays in the existing Next.js/Prisma codebase.

## Context

The whoami app already models the full Hack Club Embassy workflow in Prisma: `PassportOrder` with an `OrderTransition` state machine, `YSWS` API keys for shop integrations (`/api/orders`), organizer permissions (`Role`, `OrganizerYSWSMembership`), recipient detail collection (`recipientToken`, `PassportRecipient`, `/recipient/[token]`), public tracking (`/track/[token]`, `OrderEvent`), and email tracking (`EmailDelivery`).

The remaining work is plumbing. This spec selects pre-built, self-hostable services for that plumbing so custom code is written only where it is domain logic.

**Constraints:** Hack Club infra, 8 GB RAM single host, self-hostable preferred, email provider is Loops (pending confirmation — design must not depend on it), UI follows GOV.UK conventions with modern accents.

## Decisions

| Concern | Choice | Rejected alternatives | Reason |
|---|---|---|---|
| Error tracking | **GlitchTip** | Sentry self-hosted (too heavy), no tracking (blind) | Sentry-SDK compatible — the app's Sentry code activates with just `SENTRY_DSN` |
| Rate limiting | **Valkey** | Upstash cloud (vendor + CSP carve-out), Dragonfly (overkill) | Redis-compatible; existing `lib/rate-limit.ts` code unchanged |
| Ops dashboards | **Metabase** | Custom admin analytics pages (code hell), PostHog (product analytics, wrong tool) | SQL dashboards over Postgres; zero app code |
| Email | **Provider interface** in `lib/email.ts`; dev = **Mailpit**, prod = **Loops** (pending) | Self-hosted Postal (deliverability pain) | Loops gives managed deliverability + templates; interface keeps it swappable |
| TLS + security headers | **Caddy** | Traefik (more config), app-level headers (currently duplicated in `next.config.ts` + `proxy.ts`) | One copy of CSP/X-Frame-Options; automatic certs |
| Deployment | **NixOS + oci-containers** (app image from CI) | Docker Compose (no atomic rollback), Kubernetes (absurd at scale) | Declarative, atomic updates, one-command rollback, data dirs never touched by rebuilds |
| Uptime monitoring | **Uptime Kuma** | External-only (UptimeRobot) | Self-hosted, cheap, Discord/Slack alerts |
| Secrets | **sops-nix** | Plaintext `.env` on server | Encrypted in git, decrypted at activation |
| Workflow automation | **None** | n8n | Prisma state machine + `OrderEvent` audit trail already own order logic; visual flows would duplicate it |

**Explicitly not building (YAGNI):** custom analytics UI, n8n flows, photo upload storage (`PassportRecipient.photoUrl` — defer until passport photos are actually needed; then MinIO or Hack Club CDN).

## Architecture

**Hosting:** single Hack Club VPS (Prophet-class, 8 GB RAM, Ubuntu), public IPv4. Details in the Hosting Plan section below.

```
                    ┌─────────────── Hack Club VPS, 8 GB ───────────────┐
 Internet ──▶ Caddy │  whoami (Next.js standalone) ──▶ Postgres         │
                    │        │                ▲        ▲                │
                    │        ├──▶ Valkey      │        │                │
                    │        ├──▶ GlitchTip ──┘        │  (read-only)   │
                    │        ├──▶ Mailpit (dev)        └─ Metabase      │
                    │        └──▶ Loops API (prod)                     │
                    └───────────────────────────────────────────────────┘
```

**RAM budget:** caddy ~50 MB · app ~512 MB · postgres ~512 MB · valkey ~50 MB · glitchtip stack (web+worker+pg+redis) ~2 GB · metabase ~1.5 GB · mailpit ~50 MB · uptime-kuma ~100 MB ≈ **4.8 GB used, ~3 GB headroom**.

## Hosting Plan (Nix-first)

**Host:** Hack Club VPS, 8 GB RAM, running **NixOS** (most Hack Club infra images offer Ubuntu; if the VPS must start as Ubuntu, bootstrap NixOS via `nixos-infect` or a cloud-init ISO — one-time step).

**Philosophy:** the *system* is declarative and versioned in git (NixOS config = this repo's `infra/nix/`), while *data* lives in stateful directories that rebuilds never touch. Updating is atomic; rollback is one command.

**Why NixOS over Docker Compose:** every service becomes a line of versioned config, every change is applied atomically, every previous system state is a bootable generation. "Update without losing the database" is the default behavior, not a discipline.

### Service declaration strategy (`infra/nix/`)

| Service | How it runs | Notes |
|---|---|---|
| Postgres | **Native NixOS module** (`services.postgresql`) | Data in `/var/lib/postgresql/<version>`; module handles version-pinned upgrades |
| Caddy | **Native module** (`services.caddy`) | TLS + headers in the NixOS config; ACME automatic |
| Valkey | **Native module** (`services.valkey`) | Binds localhost only |
| App (whoami) | **`oci-containers` container** (built by CI → GHCR) | Only the app is a container; stateless by design |
| GlitchTip | **`oci-containers` containers** (web + worker; reuses host Postgres) | No official NixOS module exists |
| Metabase | **`oci-containers` container** | Read-only Postgres user |
| Mailpit | **`oci-containers` container**, dev only | Not deployed to prod |
| Uptime Kuma | **`oci-containers` container** | State in `/var/lib/uptime-kuma` |

(`oci-containers` is NixOS's built-in declarative Docker layer — containers declared in the same flake, started by systemd, no hand-written compose file.)

### Repo layout

```
infra/nix/
  flake.nix            # entry point: host definition + pins (nixpkgs rev = system version)
  configuration.nix    # base: users, firewall, ssh, boot
  services.nix         # postgres, caddy, valkey, oci-containers
  secrets.nix          # sops-nix encrypted secrets, committed to git
```

Secrets: **sops-nix** — encrypted in git (age key on the VPS), decrypted at activation. No plaintext `.env` on the server.

### Deploy pipeline (GitHub Actions)

1. On push to `main`: `tsc --noEmit` + eslint + `nix flake check`.
2. Build app image → GHCR.
3. `deploy-rs` (or `nixos-rebuild switch --target-host --use-remote-sudo`) applies the flake to the VPS: pulls new image, switches system config, runs health check.
4. **If the health check fails, deploy-rs auto-rolls back** to the previous generation.

### The data-safety model (your "no data loss" guarantee)

- **What is data:** `/var/lib/postgresql` (the database), `/var/lib/uptime-kuma`. Nothing else persists.
- **What is code:** everything else — packages, configs, users, firewall, service definitions. All of it is the flake in git.
- **`nixos-rebuild switch` never touches `/var/lib`.** You can upgrade the entire OS, replace every service, and roll back — the database directory is passed through untouched.
- **Rollback:** `nixos-rebuild switch --rollback` (or select the previous generation in the boot menu, even if SSH is broken). App image rollbacks: pin the previous GHCR tag in `services.nix`.
- **Schema changes:** Prisma `migrate deploy` runs as a deploy step — migrations are versioned SQL, applied incrementally, never auto-destructive. Destructive changes require an explicit migration file you wrote.
- **Postgres major-version upgrades** (rare, e.g. 16→17): bump the version in `services.nix`; NixOS module refuses to start if the data dir version mismatches — you then run `pg_upgrade`/restore from the nightly dump. The safety stop is built in.
- **Backups (unchanged, still the last line of defense):** nightly `pg_dump` cron → 14-day local retention; weekly off-box copy (rclone → B2 or Hack Club storage).

### One-time bootstrap (`infra/bootstrap.md` documented, ~20 min)

1. Point DNS A record at VPS IP.
2. Install NixOS (or `nixos-infect` from Ubuntu).
3. `age` keygen for sops; `nixos-rebuild switch --flake .#whoami` from the repo.
4. Done — everything after that is git commits.

**RAM budget:** caddy ~50 MB · app ~512 MB · postgres ~512 MB · valkey ~50 MB · glitchtip stack (web+worker) ~1.5 GB · metabase ~1.5 GB · mailpit (dev only) ~50 MB · uptime-kuma ~100 MB · NixOS overhead ~200 MB ≈ **4.4 GB used, ~3.5 GB headroom**.

## Component boundaries

1. **`lib/email.ts`** — exports `sendEmail(event, recipient, data)`. Provider selected by env (`EMAIL_PROVIDER=mailpit|loops`). Always writes an `EmailDelivery` row; provider failures set `status: "failed"` with `errorMessage`. Callers never see provider details.
2. **`lib/redis.ts`** — connection URL from env only. No other change.
3. **Caddyfile** — owns TLS and all security headers. The `headers()` block in `next.config.ts` and `SECURITY_HEADERS` in `proxy.ts` are removed; `proxy.ts` keeps only auth-redirect logic and request IDs.
4. **GlitchTip** — activated by `SENTRY_DSN` env. `lib/sentry.ts` and `instrumentation.ts` need no code change.
5. **Metabase** — connects to Postgres as a dedicated **read-only** user (`metabase_readonly`). Never gets write credentials.

## Data flow

Order placed (organizer dashboard or `/api/orders` with YSWS API key) → state `AWAITING_RECIPIENT_DETAILS` → email sends the `/recipient/[token]` form link → recipient submits details → `PassportRecipient` row created, state advances → `DRAFTING → DRAFT_READY → SENT_TO_HQ → RECEIVED_FROM_HQ → SHIPPING → DELIVERED` (admin-driven) → each transition writes an `OrderEvent` → `/track/[token]` renders the timeline. Metabase reads Postgres directly for dashboards; GlitchTip receives SDK events from server and browser.

## Error handling

- Email: `EmailDelivery.status` + retry counter, dashboards surface failures in Metabase.
- Errors/exceptions: GlitchTip captures both server (`instrumentation.ts`) and browser SDK.
- TLS: Caddy automatic Let's Encrypt issuance/renewal.

## Testing

- Deployment smoke test: `curl` app health endpoint, send a test email (verify it appears in Mailpit), hit a rate-limited route, confirm GlitchTip ingests a thrown test error, confirm `nixos-rebuild dry-activate` passes in CI.
- App level: existing `tsc --noEmit` + eslint gates remain the baseline.

## Rollout order (each step independently revertible)

1. NixOS bootstrap on the VPS + base flake (users, firewall, SSH, sops)
2. Postgres + Valkey + Caddy as native modules (DB restored from nightly dump or re-seeded)
3. App container via `oci-containers` + CI build to GHCR
4. Valkey swap in app code (`lib/redis.ts` env only)
5. GlitchTip + `SENTRY_DSN`
6. Caddy headers dedup (delete from `next.config.ts` + `proxy.ts`)
7. Email provider interface + Mailpit (dev)
8. Metabase + first dashboards (orders per YSWS, state funnel, email delivery rates)
9. Uptime Kuma
10. Loops integration when confirmed

## Risks

- **GlitchTip footprint** (requires its own Postgres + Redis): acceptable within budget; can move Metabase to a second box if pressure appears.
- **Loops unconfirmed:** Mailpit interface means zero rework either way.
- **Metabase DB access:** mitigated by read-only credentials.
- **NixOS learning curve:** mitigated by keeping app in a familiar container (`oci-containers`) and using native modules only for the boring standard services (postgres/caddy/valkey).
- **Hack Club infra may not offer a NixOS image:** fallback is Ubuntu + `nixos-infect`, or plain Nix (home-manager) on Ubuntu with systemd units — the flake structure carries over either way.

## Open decisions

- Loops confirmation → swap `EMAIL_PROVIDER=loops`, add `LOOPS_API_KEY`, build the transactional templates.
- Photo uploads deferred until product needs them.
- Domain choice: `*.hackclub.app` subdomain vs owned domain (either works with the Caddy setup unchanged).
