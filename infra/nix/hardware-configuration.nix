{ config, lib, pkgs, modulesPath, ... }: {
  # PLACEHOLDER — replaced with the real output of
  # `nixos-generate-config --show-hardware-config` on the VPS at bootstrap.
  imports = [ (modulesPath + "/profiles/qemu-guest.nix") ];

  boot.initrd.availableKernelModules = [ "virtio_pci" "virtio_scsi" "ahci" ];
  boot.loader.grub.device = "/dev/vda";

  fileSystems."/" = {
    device = "/dev/disk/by-label/nixos";
    fsType = "ext4";
  };

  swapDevices = [ ];
  nixpkgs.hostPlatform = "x86_64-linux";
}
