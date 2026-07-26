#!/usr/bin/env bash
# ============================================================
# CoreSites Blog — Deploy Local Script (CI/CD Local via Bun)
# ============================================================

set -euo pipefail

# Executa o engine de deploy nativo em TypeScript / Bun
if [ -f "scripts/deploy.ts" ]; then
  bun run scripts/deploy.ts
elif [ -f "core/scripts/deploy.ts" ]; then
  bun run core/scripts/deploy.ts
else
  echo "❌ Erro: Script de deploy scripts/deploy.ts não encontrado!"
  exit 1
fi
