#!/usr/bin/env bash
# ============================================================
# CoreSites Blog — Deploy Local Script (CI/CD Local)
# Cria branch, MR, builda e envia para a VPS via rsync.
# ============================================================

set -euo pipefail

# Load environment variables (Prioritize client .env if running as submodule)
if [ -f ../.env ]; then
  echo "📄 Carregando .env do diretório do cliente (../.env)"
  set -a
  source ../.env
  set +a
elif [ -f .env ]; then
  echo "📄 Carregando .env local"
  set -a
  source .env
  set +a
fi

DEPLOY_VPS_IP="${DEPLOY_VPS_IP:?'DEPLOY_VPS_IP não configurado no .env'}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/blog}"

BRANCH_NAME="publish-$(date '+%Y%m%d-%H%M%S')"

echo "========================================"
echo "  CoreSites Blog — Local CI/CD Publish"
echo "========================================"

echo "📝 1. Verificando código e versionamento..."
if [ -n "$(git status --porcelain)" ]; then
  git checkout -b "$BRANCH_NAME"
  git add -A
  git commit -m "publish: atualização de conteúdo e build"
  
  echo "🚀 2. Fazendo push e criando Merge Request..."
  git push -u origin "$BRANCH_NAME"
  
  # Cria o MR/PR no GitHub via CLI
  gh pr create --title "Publish: atualização de conteúdo" --body "Automated MR gerado pelo CI/CD local." || echo "Aviso: Não foi possível criar o PR. Verifique a autenticação do gh cli."
else
  echo "ℹ️  Nenhuma alteração pendente no Git. Pulando etapa de branch/MR."
fi

echo ""
echo "📦 3. Compilando o projeto localmente..."
bun run build

if [ ! -d "dist" ]; then
  echo "❌ Erro: pasta dist/ não foi gerada."
  exit 1
fi

echo ""
echo "🗺️  Gerando sitemap.xml..."
bun run generate-sitemap

echo ""
echo "🚀 4. Enviando arquivos buildados para o servidor (Apenas pasta dist)..."
# Usando rsync para enviar apenas o build
if [ -n "${DEPLOY_USERPASSWORD:-}" ]; then
  sshpass -p "$DEPLOY_USERPASSWORD" rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" \
    dist/ "${DEPLOY_USER}@${DEPLOY_VPS_IP}:${DEPLOY_PATH}/"
else
  rsync -avz --delete \
    dist/ "${DEPLOY_USER}@${DEPLOY_VPS_IP}:${DEPLOY_PATH}/"
fi

if [ "${SKIP_SOCIAL:-0}" != "1" ]; then
  echo ""
  echo "📱 5. Disparando publicações para redes sociais (Batch Mode)..."
  echo "-> Enviando fila para o LinkedIn..."
  bun run scripts/trigger-n8n.ts all --batch --network linkedin
  echo "-> Enviando fila para o Facebook..."
  bun run scripts/trigger-n8n.ts all --batch --network facebook
  echo "-> Enviando fila para o Instagram..."
  bun run scripts/trigger-n8n.ts all --batch --network instagram
else
  echo ""
  echo "📱 5. Pulando publicações para redes sociais (SKIP_SOCIAL=1)..."
fi

echo ""
echo "========================================"
echo "  ✅ Publish concluído com sucesso!"
echo "========================================"
