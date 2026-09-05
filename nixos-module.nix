# NixOS Module for whoami deployment
# Place this in /etc/nixos/configuration.nix or import from your configuration.nix

{ config, pkgs, ... }:

{
  services.whoami = {
    enable = true;
    package = pkgs.whoami;  # or your built package

    # Database configuration
    database = {
      host = "localhost";
      port = 5432;
      name = "whoami";
      user = "whoami";
      password = "changeme";  # Override in production!
    };

    # Redis configuration
    redis = {
      host = "localhost";
      port = 6379;
      password = "";  # Optional
    };

    # Authentication configuration
    auth = {
      secret = "generate-with-openssl-rand-base64-32";  # Generate with: openssl rand -base64 32
      url = "https://your-domain.com";
      hcaClientId = "";  # From Hack Club Auth
      hcaClientSecret = "";  # From Hack Club Auth
    };

    # Superadmin emails (comma-separated)
    superadminEmails = "admin@example.com";

    # PII encryption key (32 bytes base64)
    piiEncryptionKey = "";  # Generate with: openssl rand -base64 32
  };

  # PostgreSQL service
  services.postgresql = {
    enable = true;
    package = pkgs.postgresql_16;
    authentication = ''
      local all all trust
      host all all 127.0.0.1/32 trust
    '';
    initialScript = pkgs.writeText "init-db.sql" ''
      CREATE USER whoami WITH PASSWORD 'changeme';
      CREATE DATABASE whoami OWNER whoami;
      GRANT ALL PRIVILEGES ON DATABASE whoami TO whoami;
    '';
  };

  # Redis service
  services.redis = {
    enable = true;
    package = pkgs.redis;
    settings = {
      bind = "127.0.0.1";
      port = 6379;
    };
  };

  # Firewall
  networking.firewall.allowedTCPPorts = [ 3000 5432 6379 ];

  # Systemd service for whoami
  systemd.services.whoami = {
    description = "Hack Club Passport / Embassy";
    wantedBy = [ "multi-user.target" ];
    after = [ "postgresql.service" "redis.service" ];
    serviceConfig = {
      User = "whoami";
      Group = "whoami";
      WorkingDirectory = "/var/lib/whoami";
      ExecStart = "${pkgs.whoami}/bin/server.js";
      Environment = [
        "NODE_ENV=production"
        "PORT=3000"
        "HOSTNAME=0.0.0.0"
        "DATABASE_URL=postgresql://whoami:changeme@localhost:5432/whoami"
        "AUTH_SECRET=${config.services.whoami.auth.secret}"
        "AUTH_URL=${config.services.whoami.auth.url}"
        "AUTH_HCA_CLIENT_ID=${config.services.whoami.auth.hcaClientId}"
        "AUTH_HCA_CLIENT_SECRET=${config.services.whoami.auth.hcaClientSecret}"
        "SUPERADMIN_EMAILS=${config.services.whoami.superadminEmails}"
        "UPSTASH_REDIS_REST_URL=http://localhost:6379"
        "UPSTASH_REDIS_REST_TOKEN="
        "PII_ENCRYPTION_KEY=${config.services.whoami.piiEncryptionKey}"
      ];
      Restart = "on-failure";
      RestartSec = 5;
    };
  };

  # Create whoami user
  users.users.whoami = {
    isSystemUser = true;
    home = "/var/lib/whoami";
    shell = "/bin/bash";
  };

  # Create data directory
  systemd.tmpfiles.rules = [
    "d /var/lib/whoami 0750 whoami whoami -"
  ];
}