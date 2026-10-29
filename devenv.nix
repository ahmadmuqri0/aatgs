{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  packages = with pkgs; [
    openssl
    sqlite
    vtsls
    tailwindcss-language-server
    vscode-css-languageserver
    vscode-html-languageserver
    emmet-language-server
  ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  git-hooks.hooks = {
    biome.enable = true;
  };
}
