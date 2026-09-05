# All services. Native NixOS modules for postgres/caddy/valkey;
# oci-containers (docker) for app + third-party services.
# Ports on localhost only — Caddy is the single public entrypoint.
{ config, pkgs, lib, ... }: let
  # Set real values at bootstrap (infra/BOOTSTRAP.md)
  appImage = "ghcr.io/cloudglides/whoami:latest";
  domain = "passport.hackclub.app";

  csp = lib.concatStringsSep "; " [
    "default-src 'self'"
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    "style-src 'self' 'unsafe-inline'"
    "img-src 'self' data: https:"
    "font-src 'self' data:"
    "connect-src 'self' https://*.hackclub.com https://auth.hackclub.com"
    "frame-ancestors 'none'"
    "base-uri 'self'"
    "form-action 'self'"
  ];
in {
  # ============================================================ Postgres
  services.postgresql = {
    enable = true;
    package = pkgs.postgresql_16;
    ensureDatabases = [ "whoami" "glitchtip" "metabase" ];
    ensureUsers = [
      { name = "whoami"; ensureDBOwnership = true; }
      { name = "glitchtip"; ensureDBOwnership = true; }
      { name = "metabase"; ensureDBOwnership = true; }
      {
        name = "metabase_readonly";
        ensureClauses.login = true;
        ensureDBOwnership = false;
      }
    ];
    settings = {
      listen_addresses = lib.mkForce "127.0.0.1";
      port = 5432;
    };
    # Passwords are set at bootstrap via psql (see BOOTSTRAP.md) — never here.
    initialScript = pkgs.writeText "init.sql" ''
      GRANT CONNECT ON DATABASE metabase TO metabase_readonly;
      GRANT USAGE ON SCHEMA public TO metabase_readonly;
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase_readonly;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO metabase_readonly;
    '';
  };

  # ============================================================ Valkey
  # (In 25.05 `package` is a top-level redis option; valkey is RESP-compatible
  #  so we run the redis module's server process with valkey's binaries.)
  services.redis.package = pkgs.valkey;
  services.redis.servers.whoami = {
    enable = true;
    port = 6379;
    bind = "127.0.0.1";
  };

  # ============================================================ Caddy
  services.caddy = {
    enable = true;
    virtualHosts."${domain}".extraConfig = ''
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

  # ============================================================ Docker backend
  virtualisation.docker.enable = true;

  # ============================================================ Containers
  virtualisation.oci-containers = {
    backend = "docker";
    containers = {
      whoami = {
        image = appImage;
        autoStart = true;
        ports = [ "127.0.0.1:3000:3000" ];
        environmentFiles = [ "/run/secrets/whoami_env" ];
        extraOptions = [ "--add-host=host.docker.internal:host-gateway" ];
      };

      glitchtip-web = {
        image = "glitchtip/glitchtip:latest";
        autoStart = true;
        ports = [ "127.0.0.1:3001:8080" ];
        environmentFiles = [ "/run/secrets/glitchtip_env" ];
        extraOptions = [ "--add-host=host.docker.internal:host-gateway" ];
      };

      glitchtip-worker = {
        image = "glitchtip/glitchtip:latest";
        autoStart = true;
        cmd = [ "./run" ];
        environmentFiles = [ "/run/secrets/glitchtip_env" ];
        extraOptions = [ "--add-host=host.docker.internal:host-gateway" ];
      };

      metabase = {
        image = "metabase/metabase:latest";
        autoStart = true;
        ports = [ "127.0.0.1:3005:3000" ];
        environmentFiles = [ "/run/secrets/metabase_env" ];
        extraOptions = [ "--add-host=host.docker.internal:host-gateway" ];
      };

      uptime-kuma = {
        image = "louislam/uptime-kuma:1";
        autoStart = true;
        ports = [ "127.0.0.1:3100:3001" ];
        volumes = [ "/var/lib/uptime-kuma:/app/data" ];
      };

      # Dev-only email capture. Comment out for prod or gate behind a flag.
      mailpit = {
        image = "axllent/mailpit:latest";
        autoStart = true;
        ports = [ "127.0.0.1:8025:8025" "127.0.0.1:1025:1025" ];
      };
    };
  };

  # ============================================================ Backups
  services.postgresqlBackup = {
    enable = true;
    databases = [ "whoami" ];
    startAt = "*-*-* 03:00:00";
    location = "/var/backup/postgresql";
    compression = "zstd";
  };

  # Weekly off-box copy of the newest dump (rclone remote `b2:` configured at
  # bootstrap with `rclone config`; see BOOTSTRAP.md).
  systemd.services.pg-offbox-sync = {
    description = "Off-box copy of newest postgres dump";
    serviceConfig = {
      Type = "oneshot";
      ExecStart = "${pkgs.bash}/bin/bash -c 'LATEST=$(ls -t /var/backup/postgresql/whoami*.sql.zst 2>/dev/null | head -1); [ -n \"$LATEST\" ] && ${pkgs.rclone}/bin/rclone copy \"$LATEST\" b2:whoami-backups/'";
    };
  };
  systemd.timers.pg-offbox-sync = {
    wantedBy = [ "timers.target" ];
    timerConfig = {
      OnCalendar = "weekly";
      Persistent = true;
    };
  };
}
