{ pkgs ? import <nixpkgs>{} }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs
    pkg-config
    pixman
    cairo
    pango
    python3
  ] ++ lib.optionals stdenv.isDarwin [
    # Dependency for canvas package
    darwin.apple_sdk.frameworks.CoreText
  ];
}
