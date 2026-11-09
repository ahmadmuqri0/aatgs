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
    pnpm.enable = true;
    npm.enable = true;
  };

  git-hooks.hooks = {
    oxlint = {
      enable = true;
      excludes = [
        "^\\.claude/"
        "^\\.agents/"
      ];
      settings = {
        binPath = "./node_modules/.bin/oxlint";
        configPath = "./oxlint.config.ts";
      };
    };
    oxfmt = {
      enable = true;
      excludes = [
        "^\\.claude/"
        "^\\.agents/"
        "^src/components/ui/"
        "^src/routeTree\\.gen\\.ts$"
        "^drizzle/"
      ];
      settings = {
        binPath = "./node_modules/.bin/oxfmt";
        configPath = "./oxfmt.config.ts";
      };
    };
  };

}
