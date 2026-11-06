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

}
