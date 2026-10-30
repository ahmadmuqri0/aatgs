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

  processes = {
    nitro = {
      exec = "pnpm dev";
    };
    drizzle = {
      exec = "pnpm db:studio";
    };
  };

  git-hooks.hooks = {
    biome = {
      enable = true;
      settings.binPath = "./node_modules/.bin/biome";
    };
  };
}
