{
  description = "Hack Club Passport / Embassy - Nix flake for development and deployment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        # Prisma engines from nixpkgs
        prismaEngines = pkgs.prisma-engines;
        # Bun for JavaScript runtime
        bun = pkgs.bun;
        # Node.js for Next.js
        nodejs = pkgs.nodejs_22;
        # PostgreSQL for database
        postgresql = pkgs.postgresql_16;
        # Redis for caching/sessions
        redis = pkgs.redis;
        # OpenSSL for Prisma
        openssl = pkgs.openssl;
        # Tools for development
        git = pkgs.git;
        curl = pkgs.curl;
        jq = pkgs.jq;
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            nodejs_22
            prismaEngines
            postgresql
            redis
            openssl
            git
            curl
            jq
            cargo
            rustup
            # Prisma CLI
            pkgs.prisma
          ];

          shellHook = ''
            export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig"
            export PRISMA_SCHEMA_ENGINE_BINARY="${prismaEngines}/bin/schema-engine"
            export PRISMA_QUERY_ENGINE_BINARY="${prismaEngines}/bin/query-engine"
            export PRISMA_MIGRATION_ENGINE_BINARY="${prismaEngines}/bin/migration-engine"
            export PRISMA_INTROSPECTION_ENGINE_BINARY="${prismaEngines}/bin/introspection-engine"
            export PRISMA_FMT_BINARY="${prismaEngines}/bin/prisma-fmt"

            # Allow Prisma to download missing engines if needed
            export PRISMA_ENGINES_MIRROR="https://binaries.prisma.sh/all_commits"
            export PRISMA_CLIENT_ENGINE_TYPE="binary"

            # Database configuration
            export DATABASE_URL="postgresql://whoami:whoami@localhost:5432/whoami?schema=public"

            # Prisma CLI shortcuts
            alias db:push="PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push"
            alias db:migrate="PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev"
            alias db:migrate:deploy="PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate deploy"
            alias db:studio="PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma studio"
            alias db:generate="PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate"
            alias db:reset="PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate reset --force"
            alias db:seed="npx tsx prisma/seed.ts"

            # Development helpers
            alias dev="bun run dev"
            alias build="bun run build"
            alias test="bun test"
            alias lint="bun run lint"
            alias typecheck="npx tsc --noEmit"
          '';
        };

        # Docker image build
        dockerImage = pkgs.dockerTools.buildLayeredImage {
          name = "whoami";
          tag = "latest";
          contents = with pkgs; [
            bun
            nodejs_22
            openssl
            ca-certificates
            libc6-compat
          ];
          config = {
            Cmd = [ "bun" "server.js" ];
            WorkingDir = "/app";
            ExposedPorts = { "3000" = {}; };
            Env = [
              "NODE_ENV=production"
              "PORT=3000"
              "HOSTNAME=0.0.0.0"
            ];
            User = "1001";
            Volumes = {
              "/app/prisma" = {};
            };
          };
        };

        # NixOS module for production deployment
        nixosModule = { config, pkgs, ... }: {
          services.whoami = {
            enable = config.services.whoami.enable or false;
            package = self.packages.${system}.default;
            database = {
              host = "localhost";
              port = 5432;
              name = "whoami";
              user = "whoami";
              password = config.services.whoami.database.password or "whoami";
            };
            redis = {
              host = "localhost";
              port = 6379;
            };
            environment = {
              NODE_ENV = "production";
              AUTH_SECRET = config.services.whoami.authSecret;
              AUTH_URL = config.services.whoami.authUrl;
              AUTH_HCA_CLIENT_ID = config.services.whoami.hcaClientId;
              AUTH_HCA_CLIENT_SECRET = config.services.whoami.hcaClientSecret;
              SUPERADMIN_EMAILS = config.services.whoami.superadminEmails or "";
              UPSTASH_REDIS_REST_URL = config.services.whoami.redis.url;
              UPSTASH_REDIS_REST_TOKEN = config.services.whoami.redis.token;
              PII_ENCRYPTION_KEY = config.services.whoami.piiEncryptionKey;
            };
          };
        };

        # Default package for nix build
        default = pkgs.stdenv.mkDerivation {
          pname = "whoami";
          version = "0.1.0";
          src = self;
          nativeBuildInputs = with pkgs; [ bun ];
          buildPhase = ''
            bun run build
          '';
          installPhase = ''
            mkdir -p $out
            cp -r .next/standalone/* $out/
            cp -r .next/static $out/.next/static
            cp -r public $out/
            cp -r prisma $out/
          '';
        };
      }
    );
}