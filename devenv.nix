{
  pkgs,
  ...
}:

{
  packages = with pkgs; [
    openssl
    tailwindcss-language-server
    vscode-css-languageserver
    vscode-html-languageserver
    emmet-language-server
  ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs-slim_24;
    lsp = {
      enable = true;
      package = pkgs.vtsls;
    };
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  git-hooks.hooks = {
    oxlint = {
      enable = true;
      settings = {
        binPath = "./node_modules/.bin/oxlint";
        configPath = "./oxlint.config.ts";
      };
    };
    oxfmt = {
      enable = true;
      settings = {
        binPath = "./node_modules/.bin/oxfmt";
        configPath = "./oxfmt.config.ts";
      };
    };
  };

}
