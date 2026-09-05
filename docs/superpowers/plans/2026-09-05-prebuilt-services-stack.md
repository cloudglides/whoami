# Pre-built Services Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the self-hosted services stack (Valkey, GlitchTip, Caddy, Mailpit, Metabase, Uptime Kuma) declared as NixOS config, plus the app-code changes (Redis client swap, email provider interface, Dockerfile fix) that wire the whoami app to them.

**Architecture:** NixOS host config in `infra/nix/` (native modules for postgres/caddy/valkey; `oci-containers` for app/GlitchTip/Metabase/Mailpit/Uptime Kuma). App keeps its interface contracts: `lib/redis.ts` swaps Upstash REST for a TCP Redis client, `lib/email.ts` gains a provider interface selected by `EMAIL_PROVIDER`, headers move to Caddy. Data lives in `/var/lib/*`, rebuilds never touch it.

**Tech Stack:** NixOS flake (nixpkgs 25.05), sops-nix, `oci-containers` (docker backend), Bun 1.3, Next.js 16 standalone Docker image, GitHub Actions → GHCR.

**Spec:** `docs/superpowers/specs/2026-09-05-prebuilt-services-stack-design.md`

## Global Constraints

- Nixpkgs pin: `github:NixOS/nixpkgs/nixos-25.05`
- Secrets never in plaintext in git; use sops-nix with age
- Valkey binds `127.0.0.1` only; Postgres binds `127.0.0.1` only (Caddy is the only public listener besides SSH)
- Metabase connects to Postgres with a dedicated read-only role `metabase_readonly`
- Firewall: allow 22/80/443 only
- No `.env` on the production server; secrets via sops
- App container image: non-root, built by CI from `Dockerfile`
- Local Nix is available (2.34.8); `nix flake check` gates every infra commit
- Do not commit unrelated user WIP files; stage only files this plan touches

---

### Task 1: Redis client swap (Upstash REST → Valkey/TCP)

**Files:**
- Create: `lib/redis.ts` (rewrite), `lib/redis.test.ts`
- Modify: `lib/rate-limit.ts`, `.env.example`
- Modify: `package.json` (add `ioredis`, drop `@upstash/redis` if unused elsewhere)

**Interfaces:**
- Consumes: existing `RATE_LIMITS` config shape (unchanged)
- Produces: `export const redis: Redis` (ioredis instance), `export function getClientIdentifier(req: Request): string`, `export async function rateLimit(req: Request, config: RateLimitConfig): Promise<RateLimitResult>` — same call sites in `app/api/feedback/route.ts` and `app/api/orders/route.ts` keep working unchanged

- [ ] **Step 1: Verify all @upstash/redis call sites**

Run: `grep -rn "upstash" /home/cloudglides/whoami/app /home/cloudglides/whoami/lib --include="*.ts" -i`
Expected: only `lib/redis.ts` and `lib/rate-limit.ts` reference the client. Note CSP line in `next.config.ts` mentions upstash — removed in Task 4.

- [ ] **Step 2: Install ioredis, remove @upstash/redis**

```bash
bun add ioredis && bun remove @upstash/redis
```

- [ ] **Step 3: Write failing test for rate-limit shape**

Create `lib/redis.test.ts`:

```ts
import { describe, expect, it } from "bun:test";

describe("getClientIdentifier", () => {
  it("derives identifier from x-forwarded-for and user-agent", () => {
    const req = new Request("https://x.test/api", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8", "user-agent": "UA" },
    });
    const id = getClientIdentifier(req);
    expect(id).toStartWith("1.2.3.4:");
  });
  it("falls back to unknown when headers missing", () => {
    const id = getClientIdentifier(new Request("https://x.test/api"));
    expect(id).toStartWith("unknown:");
  });
});
```

Run: `bun test lib/redis.test.ts`
Expected: FAIL (module has no `getClientIdentifier` export after rewrite, or old one — if old one passes, proceed; test is regression protection)

- [ ] **Step 4: Rewrite lib/redis.ts**

```ts
import Redis from "ioredis";

function redisUrl(): string {
  const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
  return url;
}

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

export const redis: Redis =
  globalThis.__redis ??
  new Redis(redisUrl(), {
    maxRetriesPerRequest: 2,
    lazyConnect: false,
  });

if (process.env.NODE_ENV !== "production") globalThis.__redis = redis;

export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? (forwarded.split(",")[0] ?? "").trim() : "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  return `${ip}:${Buffer.from(ua).toString("base64").slice(0, 32)}`;
}
```

- [ ] **Step 5: Rewrite lib/rate-limit.ts to use shared client**

```ts
import type { Redis } from "ioredis";
import { redis, getClientIdentifier } from "./redis";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

export async function rateLimit(
  req: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(req);
  const key = `ratelimit:${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const results = await redis
    .multi()
    .zremrangebyscore(key, 0, windowStart)
    .zadd(key, `${now}-${Math.random()}`, `${now}`)
    .zcard(key)
    .pexpire(key, config.windowMs)
    .exec();

  const current = (results?.[2]?.[1] as number) ?? 0;
  const allowed = current <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - current);
  const resetTime = now + config.windowMs;

  return { allowed, remaining, resetTime, totalRequests: current };
}
```

Keep `getRateLimitHeaders`, `createRateLimitResponse`, `RATE_LIMITS` exactly as they are.

- [ ] **Step 6: Update .env.example Redis section**

Replace Upstash block with:

```
# =============================================================================
# Redis / Valkey (rate limiting)
# =============================================================================
# Local dev: redis://127.0.0.1:6379 (default). Prod: set via sops secret.
REDIS_URL="redis://127.0.0.1:6379"
```

- [ ] **Step 7: Typecheck + tests + start valkey and verify live**

Run: `npx tsc --noEmit && bun test lib/redis.test.ts`
Expected: clean.

Then live-verify (this machine has NixOS; use nix-shell):

```bash
nix-shell -p valkey --run "redis-server --port 6379 --daemonize no --save '' & sleep 1; REDIS_URL=redis://127.0.0.1:6379 bun test lib/redis.test.ts; kill %1"
```

- [ ] **Step 8: Commit**

```bash
git add lib/redis.ts lib/redis.test.ts lib/rate-limit.ts package.json bun.lock .env.example
git commit -m "feat(infra): swap Upstash REST for Valkey TCP client (ioredis)"
```

---

### Task 2: Email provider interface (Mailpit dev + Loops stub)

**Files:**
- Create: `lib/email/send.ts`, `lib/email/providers/mailpit.ts`, `lib/email/providers/loops.ts`, `lib/email/templates.ts`
- Modify: `lib/email.ts` (re-export), `.env.example`
- Test: `lib/email/send.test.ts`

**Interfaces:**
- Produces:
  - `export interface EmailProvider { send(opts: { to: string; subject: string; html: string; text: string; meta?: Record<string, unknown> }): Promise<{ id: string }> }`
  - `export async function sendEmail(opts: { orderId?: string; recipientEmail: string; eventType: EventType; subject: string; html: string; text: string }): Promise<{ ok: boolean; deliveryId?: string; error?: string }>` — always writes an `EmailDelivery` row; never throws to caller
  - `export function renderRecipientFormEmail(name: string, token: string, baseUrl: string): { subject: string; html: string; text: string }`
- Consumes: `EventType` enum from `@/generated/prisma/client`, prisma from `@/lib/prisma`

- [ ] **Step 1: Write failing test**

Create `lib/email/send.test.ts`:

```ts
import { describe, expect, it } from "bun:test";

describe("email provider selection", () => {
  it("selects mailpit provider by default", async () => {
    process.env.EMAIL_PROVIDER = "mailpit";
    const { getProvider } = await import("./send");
    expect(getProvider().name).toBe("mailpit");
  });
  it("throws on unknown provider", async () => {
    process.env.EMAIL_PROVIDER = "carrier-pigeon";
    const { getProvider } = await import("./send");
    expect(() => getProvider()).toThrow("Unknown EMAIL_PROVIDER");
  });
});
```

Run: `bun test lib/email/send.test.ts`
Expected: FAIL (no `./send` module)

- [ ] **Step 2: Create provider interface + mailpit provider**

`lib/email/send.ts`:

```ts
import { prisma } from "@/lib/prisma";
import type { EventType } from "@/generated/prisma/client";
import { logger } from "@/lib/logger";

export interface EmailSendOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  meta?: Record<string, unknown>;
}

export interface EmailProvider {
  readonly name: string;
  send(opts: EmailSendOptions): Promise<{ id: string }>;
}

export function getProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER ?? "mailpit";
  switch (provider) {
    case "mailpit":
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return { name: "mailpit", send: require("./providers/mailpit").sendMailpit };
    case "loops":
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return { name: "loops", send: require("./providers/loops").sendLoops };
    default:
      throw new Error(`Unknown EMAIL_PROVIDER: ${provider}`);
  }
}

export async function sendEmail(opts: {
  orderId?: string;
  recipientEmail: string;
  eventType: EventType;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; deliveryId?: string; error?: string }> {
  try {
    const result = await getProvider().send({
      to: opts.recipientEmail,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      meta: { orderId: opts.orderId },
    });
    const delivery = await prisma.emailDelivery.create({
      data: {
        orderId: opts.orderId,
        recipientEmail: opts.recipientEmail,
        eventType: opts.eventType,
        status: "sent",
        sentAt: new Date(),
        attempts: 1,
      },
    });
    return { ok: true, deliveryId: delivery.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    logger.error({ err: message, eventType: opts.eventType }, "email_send_failed");
    try {
      await prisma.emailDelivery.create({
        data: {
          orderId: opts.orderId,
          recipientEmail: opts.recipientEmail,
          eventType: opts.eventType,
          status: "failed",
          attempts: 1,
          lastAttemptAt: new Date(),
          errorMessage: message.slice(0, 500),
        },
      });
    } catch {
      // DB itself down — nothing more we can do
    }
    return { ok: false, error: message };
  }
}
```

`lib/email/providers/mailpit.ts`:

```ts
import type { EmailSendOptions } from "../send";

const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:8025";

export async function sendMailpit(
  opts: EmailSendOptions
): Promise<{ id: string }> {
  const boundary = `----whoami${Date.now()}`;
  const res = await fetch(`${MAILPIT_URL}/api/v1/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      From: process.env.EMAIL_FROM ?? "noreply@whoami.local",
      To: [opts.to],
      Subject: opts.subject,
      HTML: opts.html,
      Text: opts.text,
    }),
  });
  if (!res.ok) throw new Error(`Mailpit send failed: ${res.status}`);
  return { id: await res.text() };
}
```

`lib/email/providers/loops.ts`:

```ts
import type { EmailSendOptions } from "../send";

// Loops transactional email — activated when LOOPS_API_KEY is set.
// Docs: https://loops.so/docs/api/transactional
export async function sendLoops(
  opts: EmailSendOptions
): Promise<{ id: string }> {
  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) throw new Error("LOOPS_API_KEY not set");
  const res = await fetch("https://app.loops.so/api/v1/transactional", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactionalId: process.env.LOOPS_TX_RECIPIENT_FORM_ID ?? "",
      email: opts.to,
      dataVariables: opts.meta ?? {},
    }),
  });
  if (!res.ok) throw new Error(`Loops send failed: ${res.status}`);
  const json = (await res.json()) as { messageId?: string };
  return { id: json.messageId ?? "unknown" };
}
```

- [ ] **Step 3: Run test, verify pass**

Run: `bun test lib/email/send.test.ts`
Expected: PASS

- [ ] **Step 4: Template helper for the recipient form email**

`lib/email/templates.ts`:

```ts
export function renderRecipientFormEmail(
  recipientName: string,
  token: string,
  baseUrl: string
): { subject: string; html: string; text: string } {
  const link = `${baseUrl}/recipient/${token}`;
  return {
    subject: "Your Hack Club Passport — details needed",
    html: `<p>Hi ${recipientName},</p><p>Your Hack Club Passport is being prepared. Please fill in your delivery details:</p><p><a href="${link}">${link}</a></p>`,
    text: `Hi ${recipientName},\n\nYour Hack Club Passport is being prepared. Fill in your delivery details: ${link}\n`,
  };
}
```

- [ ] **Step 5: Update .env.example email section**

Replace Resend block with:

```
# =============================================================================
# Email (provider interface; Mailpit in dev, Loops in prod when confirmed)
# =============================================================================
EMAIL_PROVIDER="mailpit"          # mailpit | loops
MAILPIT_URL="http://127.0.0.1:8025"
EMAIL_FROM="noreply@your-domain.com"
# Loops (prod, pending confirmation):
LOOPS_API_KEY=""
LOOPS_TX_RECIPIENT_FORM_ID=""
```

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit && bun test lib/email/`
Expected: clean / PASS

```bash
git add lib/email.ts lib/email/ .env.example
git commit -m "feat(email): provider interface with Mailpit dev + Loops prod stub"
```

---

### Task 3: Fix Dockerfile for Prisma 7 generated client

**Files:**
- Modify: `Dockerfile`
- Modify: `.dockerignore` (create if missing)

**Interfaces:**
- Produces: working `docker build` producing a runnable standalone image (later tasks rely on this in CI and `oci-containers`)

- [ ] **Step 1: Fix Dockerfile — remove .prisma copy lines, add generated client**

Key fixes to the existing file: Stage 3 generates the client (output `generated/prisma`); Stage 4 must not try `bun run build` without DATABASE_URL-independent generation; runner copies `generated/prisma` instead of `node_modules/.prisma`. Final file:

```dockerfile
# Stage 1: Base
FROM oven/bun:1.2-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat ca-certificates

# Stage 2: deps
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 3: prisma generate (new client: generated/prisma)
FROM base AS prisma
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN bunx prisma generate

# Stage 4: build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/generated ./generated
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Stage 5: runner
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated
COPY --from=prisma --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["bun", "server.js"]
```

- [ ] **Step 2: Create .dockerignore**

```
node_modules
.next
.git
.env
.env.*
!.env.example
docs
generated
```

Wait — `generated` must NOT be ignored (it's copied from the prisma stage). Final:

```
node_modules
.next
.git
.env
.env.*
!.env.example
docs
```

- [ ] **Step 3: Verify build**

Run: `docker build -t whoami:test .` (if docker unavailable locally, this verifies in CI Task 8; document skip)
Expected: image builds, `docker run --rm whoami:test node -e "1"` — or defer to CI.

- [ ] **Step 4: Commit**

```bash
git add Dockerfile .dockerignore
git commit -m "fix(docker): correct Prisma 7 generated-client copy in Dockerfile"
```

---

### Task 4: Caddy owns security headers (dedup from app)

**Files:**
- Modify: `next.config.ts` (remove `headers()`)
- Modify: `proxy.ts` (remove `SECURITY_HEADERS` application)

**Interfaces:**
- Consumes: header values (CSP etc.) — they move verbatim into `infra/nix/services.nix` (Task 5)
- Produces: `proxy.ts` keeps auth redirect + request-id only; `next.config.ts` keeps turbopack.root, serverActions, images

- [ ] **Step 1: Remove headers() from next.config.ts**

Delete the entire `async headers() {...}` block. Keep `output: "standalone"`, `turbopack.root`, `experimental.serverActions`, `images`.

- [ ] **Step 2: Remove SECURITY_HEADERS from proxy.ts**

Delete the `SECURITY_HEADERS` const and the loop applying it to `response`. Keep request-id + auth redirect. Remove now-unused `Object.entries` usage.

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit`
Expected: clean

```bash
git add next.config.ts proxy.ts
git commit -m "refactor(security): move security headers to Caddy (dedup)"
```

---

### Task 5: NixOS flake — base host + services

**Files:**
- Create: `infra/nix/flake.nix`, `infra/nix/configuration.nix`, `infra/nix/services.nix`, `infra/nix/secrets.nix` (sops stub), `.sops.yaml`
- Test: `nix flake check` + `nixos-rebuild dry-build --flake .#whoami`

**Interfaces:**
- Produces: complete host config `whoami` — postgres 16, caddy (TLS + all security headers from Task 4), valkey (localhost), oci-containers: app/GlitchTip(web+worker)/Metabase/Mailpit/Uptime Kuma, sops-nix secrets wiring, nightly pg_dump backup systemd timer
- Consumes: `ghcr.io/<org>/whoami:latest` image name (CI in Task 8 builds it; until then app container can be disabled with `enableApp` flag defaulting true but skipped if image missing — implement as plain `oci-containers` entry)

- [ ] **Step 1: flake.nix**

```nix
{
  description = "Hack Club Passport (whoami) production host";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    sops-nix = {
      url = "github:Mic92/sops-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, sops-nix, ... }: {
    nixosConfigurations.whoami = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./configuration.nix
        ./services.nix
        ./secrets.nix
        sops-nix.nixosModules.sops
      ];
    };
  };
}
```

- [ ] **Step 2: configuration.nix (base system)**

```nix
{ config, pkgs, ... }: {
  imports = [ ./hardware-configuration.nix ];  # generated on the VPS

  networking.hostName = "whoami";
  time.timeZone = "UTC";
  i18n.defaultLocale = "en_US.UTF-8";

  networking.firewall = {
    enable = true;
    allowedTCPPorts = [ 22 80 443 ];
  };

  services.openssh = {
    enable = true;
    settings = { PasswordAuthentication = false; PermitRootLogin = "prohibit-password"; };
  };

  users.users.deploy = {
    isNormalUser = true;
    extraGroups = [ "wheel" ];
    openssh.authorizedKeys.keys = [ /* set via sops or manually at bootstrap */ ];
  };

  security.sudo.wheelNeedsPassword = false;

  environment.systemPackages = with pkgs; [ git vim curl pg_dump ];

  system.stateVersion = "25.05";
}
```

- [ ] **Step 3: services.nix (the meat)**

```nix
{ config, pkgs, lib, ... }: let
  appImage = "ghcr.io/cloudglides/whoami:latest";
  domain = "passport.hackclub.app";  # placeholder, set at bootstrap
  csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.upstash.io https://*.hackclub.com https://auth.hackclub.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
in {
  # --- Postgres ---
  services.postgresql = {
    enable = true;
    package = pkgs.postgresql_16;
    ensureDatabases = [ "whoami" ];
    ensureUsers = [
      { name = "whoami"; ensureDBOwnership = true; }
      {
        name = "metabase_readonly";
        ensureClauses = { login = true; };
      }
    ];
    settings = { listen_addresses = "127.0.0.1"; port = 5432; };
    initialScript = pkgs.writeText "init.sql" ''
      CREATE ROLE metabase_readonly LOGIN PASSWORD 'changeme-set-via-sops';
      GRANT CONNECT ON DATABASE whoami TO metabase_readonly;
      GRANT USAGE ON SCHEMA public TO metabase_readonly;
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase_readonly;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO metabase_readonly;
    '';
  };

  # --- Valkey ---
  services.valkey = {
    enable = true;
    port = 6379;
    bind = "127.0.0.1";
  };

  # --- Caddy ---
  services.caddy = {
    enable = true;
    virtualHosts."${domain}" = {
      extraConfig = ''
        handle /metabase/* {
          uri strip_prefix /metabase
          reverse_proxy 127.0.0.1:3005
        }
        handle {
          reverse_proxy 127.0.0.1:3000
        }
        header {
          X-Frame-Options DENY
          X-Content-Type-Options nosniff
          Referrer-Policy strict-origin-when-cross-origin
          Permissions-Policy "camera=(), microphone=(), geolocation=()"
          Content-Security-Policy "${csp}"
          Strict-Transport-Security "max-age=31536000; includeSubDomains"
          -Server
        }
      '';
    };
  };

  # --- Docker for oci-containers ---
  virtualisation.docker.enable = true;

  # --- App ---
  virtualisation.oci-containers = {
    backend = "docker";
    containers = {
      whoami = {
        image = appImage;
        autoStart = true;
        ports = [ "127.0.0.1:3000:3000" ];
        environmentFiles = [ "/run/secrets/whoami_env" ];
        dependsOn = [ "postgres" ];  # note: host postgres, not a container; systemd After= instead
      };
      glitchtip-web = {
        image = "glitchtip/glitchtip:latest";
        autoStart = true;
        ports = [ "127.0.0.1:3001:8080" ];
        environmentFiles = [ "/run/secrets/glitchtip_env" ];
      };
      glitchtip-worker = {
        image = "glitchtip/glitchtip:latest";
        autoStart = true;
        cmd = [ "./run" ];
        environmentFiles = [ "/run/secrets/glitchtip_env" ];
      };
      metabase = {
        image = "metabase/metabase:latest";
        autoStart = true;
        ports = [ "127.0.0.1:3005:3000" ];
        environmentFiles = [ "/run/secrets/metabase_env" ];
      };
      uptime-kuma = {
        image = "louislam/uptime-kuma:1";
        autoStart = true;
        ports = [ "127.0.0.1:3001:3001" ];
        volumes = [ "/var/lib/uptime-kuma:/app/data" ];
      };
    };
  };

  # Fix port collision: glitchtip-web 3001 vs uptime-kuma 3001 → glitchtip 3001, kuma 3100
  # (applied above in final edit)

  # --- Mailpit (dev only; comment out for prod) ---
  # virtualisation.oci-containers.containers.mailpit = {
  #   image = "axllent/mailpit:latest";
  #   ports = [ "127.0.0.1:8025:8025" "127.0.0.1:1025:1025" ];
  # };

  # --- Nightly backups ---
  services.postgresqlBackup = {
    enable = true;
    databases = [ "whoami" ];
    startAt = "*-*-* 03:00:00";
    location = "/var/backup/postgresql";
    compression = "zstd";
  };

  systemd.services.pg-offbox-sync = {
    description = "Weekly off-box copy of newest pg dump";
    serviceConfig.Type = "oneshot";
    path = [ pkgs.rclone pkgs.bash ];
    script = ''
      LATEST=$(ls -t /var/backup/postgresql/whoami.sql.zst | head -1)
      rclone copy "/var/backup/postgresql/$LATEST" b2:whoami-backups/
    '';
  };
  systemd.timers.pg-offbox-sync = {
    wantedBy = [ "timers.target" ];
    timerConfig = { OnCalendar = "weekly"; Persistent = true; };
  };
}
```

- [ ] **Step 4: secrets.nix (sops stub) + .sops.yaml**

`secrets.nix`:

```nix
{ config, ... }: {
  sops.defaultSopsFile = ./secrets/prod.enc.yaml;
  sops.age.keyFile = "/var/lib/sops/age/keys.txt";
  sops.secrets = {
    "whoami_env" = { owner = "root"; path = "/run/secrets/whoami_env"; };
    "glitchtip_env" = { owner = "root"; path = "/run/secrets/glitchtip_env"; };
    "metabase_env" = { owner = "root"; path = "/run/secrets/metabase_env"; };
  };
}
```

`.sops.yaml` (repo root):

```yaml
keys:
  - &deploy_age age1REPLACE_AT_BOOTSTRAP
creation_rules:
  - path_regex: infra/nix/secrets/.*\.enc\.yaml$
    key_groups:
      - age:
          - *deploy_age
```

Create placeholder `infra/nix/secrets/prod.enc.yaml` with sops structure documented in `infra/BOOTSTRAP.md` (Task 6).

- [ ] **Step 5: Validate**

Run:
```bash
cd infra/nix && nix flake check
nix-instantiate --parse services.nix configuration.nix secrets.nix  # syntax
```
Note: `nixos-rebuild dry-build` requires `hardware-configuration.nix`; create a placeholder that VPS bootstrap overwrites:

`infra/nix/hardware-configuration.nix`:
```nix
{ config, lib, pkgs, modulesPath, ... }: {
  imports = [ (modulesPath + "/profiles/qemu-guest.nix") ];
  boot.initrd.availableKernelModules = [ "virtio_pci" "virtio_scsi" ];
  fileSystems."/" = { device = "/dev/disk/by-label/nixos"; fsType = "ext4"; };
  swapDevices = [ ];
  nixpkgs.hostPlatform = "x86_64-linux";
}
```

Then: `nixos-rebuild dry-build --flake .#whoami` (from `infra/nix/`). Expected: evaluation succeeds, build plan printed.

- [ ] **Step 6: Commit**

```bash
git add infra/nix/ .sops.yaml
git commit -m "feat(infra): NixOS host flake — postgres/caddy/valkey + oci-containers + backups"
```

---

### Task 6: Bootstrap documentation (VPS one-time runbook)

**Files:**
- Create: `infra/BOOTSTRAP.md`

**Interfaces:**
- Consumes: flake from Task 5
- Produces: exact commands an operator runs on a fresh Hack Club VPS

- [ ] **Step 1: Write BOOTSTRAP.md**

Content (full runbook, no placeholders):

```markdown
# VPS Bootstrap Runbook

## 1. DNS
Point an A record (e.g. `passport.hackclub.app`) at the VPS IPv4. Wait for propagation.

## 2. Install NixOS
If the box offers a NixOS image: boot it, set root SSH key.
If Ubuntu: `curl -L https://raw.githubusercontent.com/NixOS/nixos-infect/master/nixos-infect | bash -` (runs ~10 min, then reboots into NixOS).

## 3. Clone + first build
ssh root@VPS
git clone <repo> /root/whoami
cd /root/whoami/infra/nix
# replace hardware-configuration.nix with the real one:
nixos-generate-config --show-hardware-config > hardware-configuration.nix

## 4. Age key + sops
nix-shell -p sops age
mkdir -p /var/lib/sops/age
age-keygen -o /var/lib/sops/age/keys.txt   # copy the public key
# Put the public key in .sops.yaml (repo), then locally:
sops infra/nix/secrets/prod.enc.yaml
# Structure:
# whoami_env: |
#   DATABASE_URL=postgresql://whoami:STRONGPASS@127.0.0.1:5432/whoami?schema=public
#   AUTH_SECRET=<openssl rand -base64 32>
#   AUTH_URL=https://passport.hackclub.app
#   AUTH_HCA_CLIENT_ID=...
#   AUTH_HCA_CLIENT_SECRET=...
#   SUPERADMIN_EMAILS=you@hackclub.com
#   REDIS_URL=redis://127.0.0.1:6379
#   SENTRY_DSN=https://key@glitchtip-host/1   (from GlitchTip UI after first boot)
#   EMAIL_PROVIDER=mailpit   (swap to loops when confirmed)
#   PII_ENCRYPTION_KEY=<openssl rand -base64 32>
# glitchtip_env: |
#   DATABASE_URL=postgresql://glitchtip:GPASS@127.0.0.1:5432/glitchtip
#   REDIS_URL=redis://127.0.0.1:6379/1
#   SECRET_KEY=<openssl rand -hex 32>
#   GLITCHTIP_DOMAIN=https://passport.hackclub.app
# metabase_env: |
#   MB_DB_TYPE=postgres
#   MB_DB_DBNAME=whoami  (or dedicated metabase db)
#   MB_DB_USER=metabase_readonly
#   MB_DB_PASS=...
#   MB_DB_HOST=172.17.0.1  (docker bridge → host postgres)

## 5. Set placeholders in services.nix
domain = "passport.hackclub.app"  # your real subdomain
appImage = "ghcr.io/<org>/whoami:latest"

## 6. Apply
nixos-rebuild switch --flake .#whoami

## 7. Postgres grants (one-time, after first start)
sudo -u postgres psql -c "ALTER USER metabase_readonly PASSWORD '<real>';"
sudo -u postgres psql -c "CREATE DATABASE glitchtip OWNER glitchtip;"
sudo -u postgres psql -c "CREATE USER glitchtip WITH PASSWORD '<real>';"

## 8. Run migrations (first deploy only)
docker exec -it whoami bunx prisma migrate deploy

## 9. Verify
curl -s https://passport.hackclub.app/api/health → {"status":"ok"}
GlitchTip at /metabase path → Metabase first-run wizard
Caddy cert auto-issued (check `journalctl -u caddy`)
```

- [ ] **Step 2: Commit**

```bash
git add infra/BOOTSTRAP.md
git commit -m "docs(infra): VPS bootstrap runbook"
```

---

### Task 7: GitHub Actions CI/CD

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: on `main` push → build image to `ghcr.io/<owner>/whoami:<sha>` + `:latest`, then deploy via SSH `nixos-rebuild switch --flake .#whoami --use-remote-sudo` (repo already on VPS at `/root/whoami`, fetched by deploy script)
- Consumes: Dockerfile (Task 3), flake (Task 5)

- [ ] **Step 1: ci.yml (PR gate)**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with: { bun-version: latest }
      - run: bun install --frozen-lockfile
      - run: bunx prisma generate
        env:
          DATABASE_URL: "postgresql://placeholder:5432/db"
      - run: bunx tsc --noEmit
      - run: bun run lint
      - uses: cachix/install-nix-action@v30
        with: { nix_path: nixpkgs=channel:nixos-25.05 }
      - run: nix flake check ./infra/nix
```

- [ ] **Step 2: deploy.yml (main → GHCR → VPS)**

```yaml
name: Deploy
on:
  push:
    branches: [main]

concurrency:
  group: deploy-prod
  cancel-in-progress: false

jobs:
  build-push:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository_owner }}/whoami:${{ github.sha }}
            ghcr.io/${{ github.repository_owner }}/whoami:latest

  deploy:
    needs: build-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /root/whoami && git fetch --all && git reset --hard origin/main
            cd infra/nix
            nixos-rebuild switch --flake .#whoami --use-remote-sudo
            curl -fsS http://127.0.0.1:3000/api/health > /dev/null || exit 1
```

- [ ] **Step 3: Validate YAML**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"` (or `yamllint`)
Expected: parses

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/
git commit -m "ci: PR gates (tsc/lint/flake-check) + deploy pipeline to NixOS VPS"
```

---

### Task 8: GlitchTip activation + smoke test harness

**Files:**
- Create: `scripts/smoke-test.sh`
- Modify: `.env` (local dev: add `SENTRY_DSN` pointing at local GlitchTip when running — optional)

**Interfaces:**
- Consumes: `lib/sentry.ts` (exists, no changes), compose/flake services
- Produces: one-command verification of the whole stack per spec's Testing section

- [ ] **Step 1: smoke-test.sh**

```bash
#!/usr/bin/env bash
# Smoke tests for the whoami stack. Usage: ./scripts/smoke-test.sh [BASE_URL]
set -euo pipefail
BASE="${1:-http://127.0.0.1:3000}"
fail() { echo "FAIL: $1"; exit 1; }

echo "→ app health"
curl -fsS "$BASE/api/health" | grep -q ok || fail "health endpoint"

echo "→ security headers via Caddy (if BASE is public URL)"
if [[ "$BASE" == https:* ]]; then
  curl -fsSI "$BASE" | grep -qi "x-frame-options: DENY" || fail "CSP headers missing"
fi

echo "→ rate limit responds 429 after burst"
for i in $(seq 1 40); do curl -s -o /dev/null "$BASE/api/feedback"; done
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/feedback")
[[ "$code" == "429" ]] || echo "WARN: expected 429 after burst, got $code"

echo "→ Mailpit captured a test email (dev only)"
if [[ "${EMAIL_PROVIDER:-}" == "mailpit" ]]; then
  curl -fsS "${MAILPIT_URL:-http://127.0.0.1:8025}/api/v1/messages" | grep -q "total" || fail "mailpit api"
fi

echo "ALL SMOKE TESTS PASSED"
```

- [ ] **Step 2: chmod +x, test locally against dev server**

Run: `bun run dev & sleep 5; ./scripts/smoke-test.sh http://127.0.0.1:3000`
Expected: app health passes; rate-limit/mailpit steps report WARN/SKIP when those services are not running locally — script must not hard-fail without the stack.

- [ ] **Step 3: Commit**

```bash
git add scripts/smoke-test.sh
git commit -m "test: stack smoke-test script"
```

---

### Task 9: Metabase first-run + read-only role verification

**Files:**
- Modify: none (operational task; documents outcomes in spec's Data flow)

- [ ] **Step 1: Verify metabase_readonly cannot write**

Run (local postgres or VPS):
```bash
sudo -u postgres psql whoami -c "SET ROLE metabase_readonly; INSERT INTO \"Org\" (id,name,slug) VALUES ('x','x','x');"
```
Expected: `ERROR: permission denied for table Org`

- [ ] **Step 2: Document dashboards to build**

Append to spec's Open decisions → resolved: first three Metabase questions:
1. Orders per YSWS (bar, `SELECT y.name, count(*) FROM "PassportOrder" o JOIN "YSWS" y ON y.id=o."yswsId" GROUP BY 1`)
2. State pipeline funnel (`SELECT "currentState", count(*) FROM "PassportOrder" GROUP BY 1 ORDER BY 1`)
3. Email delivery rate (`SELECT status, count(*) FROM "EmailDelivery" GROUP BY 1`)

- [ ] **Step 3: Commit spec update**

```bash
git add docs/
git commit -m "docs: metabase initial dashboard queries"
```

---

## Plan self-review notes

- Spec coverage: Valkey (T1), email interface (T2), Dockerfile (T3 — discovered broken, prerequisite for spec's container approach), headers→Caddy (T4), flake (T5), bootstrap (T6), CI/CD (T7), smoke tests (T8), Metabase role (T9). Uptime Kuma + GlitchTip live in T5 flake. Loops activation deferred (spec open decision).
- Ordering: T1–T4 are app-level and safe locally; T5–T7 infra+CI; T8–T9 verification.
- Known plan deviations from spec: none — spec said "Docker Compose dev file" was replaced by Nix-first hosting revision.
