---
name: publish-blog
description: >
  Compila o blog e realiza o deploy para o servidor de produção.
  Use esta skill quando o usuário solicitar "publicar o blog", "fazer deploy",
  "subir para produção", "enviar para o servidor" ou termos equivalentes.
---

# Publish Blog Skill

Esta skill descreve o processo de compilação e deploy do blog estático para a VPS de produção.

## Quando Usar Esta Skill

Use quando o usuário pedir para:
- "publicar o blog"
- "fazer deploy"
- "subir para produção"
- "enviar para o servidor"
- "publicar"

## Pré-requisitos

1. O arquivo `.env` deve existir na raiz do projeto `/rogerio/core/coresites-blog/` com:
   - `DEPLOY_VPS_IP` — IP da VPS de produção
   - `DEPLOY_USER` — Usuário SSH (padrão: root)
   - `DEPLOY_PATH` — Diretório no servidor (padrão: /var/www/blog)
2. A chave SSH deve estar configurada para acesso sem senha ao servidor.

## Passos para Publicação

### Passo 1: Verificar Ambiente
Verifique se o `.env` existe e tem as variáveis necessárias.

### Passo 2: Executar o Deploy
Execute o script de deploy:

```bash
chmod +x deploy-local.sh
./deploy-local.sh
```

Parâmetros do comando:
- **Command Line:** `./deploy-local.sh` ou `./deploy-local.sh "Mensagem de commit customizada"`
- **Cwd:** `/rogerio/core/coresites-blog`
- **WaitMsBeforeAsync:** `10000`

O script irá automaticamente:
1. Compilar o projeto com `bun run build`
2. Gerar o `sitemap.xml` atualizado
3. Fazer commit e push das alterações para o GitHub
4. Enviar a pasta `dist/` via rsync para a VPS

### Passo 3: Confirmar Resultado
Monitore a saída do terminal. Se retornar "Deploy concluído com sucesso", informe ao usuário.

### Resolução de Problemas
- **Build falhou**: Verifique erros de TypeScript ou dependências faltantes
- **Git falhou**: Verifique autenticação SSH do GitHub
- **Rsync falhou**: Verifique conectividade SSH com a VPS e permissões do diretório
