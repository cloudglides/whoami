{
  description = "WHOAMI dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      prismaEngines = pkgs.prisma-engines;
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs_22
          openssl
          prismaEngines
          prisma
          postgresql
          cargo
          rustup
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
        '';
      };
    };
}
