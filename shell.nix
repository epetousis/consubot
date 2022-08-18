{ pkgs ? import <nixpkgs>{} }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs
    pkg-config
    pixman
    cairo
    pango
  ] ++ lib.optionals stdenv.isDarwin [
    # Dependency for canvas package
    darwin.apple_sdk.frameworks.CoreText
  ];
}