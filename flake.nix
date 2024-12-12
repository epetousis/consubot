{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = (import (inputs.nixpkgs) { inherit system; });
      in {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            pkg-config
            pixman
            cairo
            pango
            python3
            flyctl
          ] ++ lib.optionals stdenv.isDarwin [
            # Dependency for canvas package
            darwin.apple_sdk.frameworks.CoreText
          ];
        };
      }
    );
}
