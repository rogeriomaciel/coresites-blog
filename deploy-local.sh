#!/usr/bin/env bash
# ============================================================
# CoreSites Blog — Deploy Local Script
# Compila o projeto e envia para a VPS de produção via rsync.
# Compatível com a skill publish-site do Antigravity.
# ============================================================

set -euo pipefail

# Load environment variables
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

DEPLOY_VPS_IP="${DEPLOY_VPS_IP:?'DEPLOY_VPS_IP não configurado no .env'}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/blog}"

echo "========================================"
echo "  CoreSites Blog — Deploy"
echo "========================================"

# Step 1: Build
echo ""
echo "📦 Compilando o projeto..."
bun run build

if [ ! -d "dist" ]; then
  echo "❌ Erro: pasta dist/ não foi gerada."
  exit 1
fi

echo "✅ Build concluído com sucesso."

# Step 2: Generate sitemap
echo ""
echo "🗺️  Gerando sitemap.xml..."
bun run generate-sitemap
echo "✅ Sitemap gerado."

# Step 3: Git commit & push (if there are changes)
echo ""
echo "📝 Verificando alterações no Git..."
if [ -n "$(git status --porcelain)" ]; then
  COMMIT_MSG="${1:-"chore: publish new content $(date '+%Y-%m-%d %H:%M')"}"
  git add -A
  git commit -m "$COMMIT_MSG"
  git push origin main
  echo "✅ Alterações commitadas e pushadas."
else
  echo "ℹ️  Nenhuma alteração pendente no Git."
fi

# Step 4: Deploy via rsync
echo ""
echo "🚀 Enviando para ${DEPLOY_USER}@${DEPLOY_VPS_IP}:${DEPLOY_PATH}..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='.env' \
  dist/ "${DEPLOY_USER}@${DEPLOY_VPS_IP}:${DEPLOY_PATH}/"

echo ""
echo "========================================"
echo "  ✅ Deploy concluído com sucesso!"
echo "========================================"
