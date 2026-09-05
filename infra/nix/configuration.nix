# Base system: users, firewall, ssh, boot.
# Data lives in /var/lib/* — this file (and any rebuild) never touches it.
{ config, pkgs, ... }: {
  imports = [ ./hardware-configuration.nix ];

  networking.hostName = "whoami";
  time.timeZone = "UTC";
  i18n.defaultLocale = "en_US.UTF-8";

  networking.firewall = {
    enable = true;
    allowedTCPPorts = [ 22 80 443 ];
  };

  services.openssh = {
    enable = true;
    settings = {
      PasswordAuthentication = false;
      PermitRootLogin = "prohibit-password";
    };
  };

  users.users.deploy = {
    isNormalUser = true;
    extraGroups = [ "wheel" ];
    openssh.authorizedKeys.keys = [
      # Replace with your real key at bootstrap (see infra/BOOTSTRAP.md)
      "ssh-ed25519 REPLACE_ME_AT_BOOTSTRAP"
    ];
  };

  security.sudo.wheelNeedsPassword = false;

  environment.systemPackages = with pkgs; [
    git
    vim
    curl
    postgresql_16
    rclone
  ];

  nix.settings.experimental-features = [ "nix-command" "flakes" ];

  # DO NOT change after first boot — regeneration of state dirs depends on it.
  system.stateVersion = "25.05";
}
