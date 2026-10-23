{ pkgs, config, ... }:

let
  backend = "${config.git.root}/backend";
  frontend = "${config.git.root}/frontend";
  clientPort = "3000";
  serverPort = "8000";
in
{
  packages = with pkgs; [
    jq
    vtsls
    vue-language-server
    tailwindcss-language-server
    openssl
    sqlite
  ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs-slim_24;
    directory = frontend;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  languages.python = {
    enable = true;
    package = pkgs.python312;
    directory = backend;
    venv.enable = true;
    lsp.enable = true;
    uv = {
      enable = true;
      sync.enable = true;
    };
  };

  env = {
    CLIENT_PORT = clientPort;
    SERVER_PORT = serverPort;
  };

  processes = {
    frontend = {
      exec = "pnpm run dev";
      cwd = frontend;
    };
    backend = {
      exec = "uv run fastapi dev";
      cwd = backend;
    };
  };

  tasks."api:gen" = {
    exec = ''
      cd ${backend}
      uv run python -c "import json; from src.main import app; print(json.dumps(app.openapi()))" > ${frontend}/openapi.json
      cd ${frontend}
      pnpm exec openapi-ts
    '';
  };

  git-hooks.hooks = {
    ruff.enable = true;
    ruff-format.enable = true;
    eslint.enable = true;
    prettier.enable = true;
  };
}
