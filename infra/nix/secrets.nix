# Secrets via sops-nix. The encrypted source file is committed to git;
# the age private key exists ONLY on the VPS (/var/lib/sops/age/keys.txt).
# See infra/BOOTSTRAP.md for creating/editing secrets.
{ config, ... }: {
  sops = {
    defaultSopsFile = ./secrets/prod.enc.yaml;
    age.keyFile = "/var/lib/sops/age/keys.txt";
    secrets = {
      "whoami_env" = { path = "/run/secrets/whoami_env"; };
      "glitchtip_env" = { path = "/run/secrets/glitchtip_env"; };
      "metabase_env" = { path = "/run/secrets/metabase_env"; };
    };
  };
}
