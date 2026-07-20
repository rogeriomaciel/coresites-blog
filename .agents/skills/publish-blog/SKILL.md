---
name: publish-blog
description: >
  Compila o blog e realiza o deploy para o servidor de produção, criando branch e MR automaticamente.
  Use esta skill quando o usuário solicitar "publicar o blog", "fazer deploy",
  "subir para produção", "enviar para o servidor" ou termos equivalentes.
---

# Publish Blog Skill

**ATENÇÃO (CRÍTICO)**: O projeto `core` é estritamente **READ-ONLY**. Certifique-se de executar os comandos de deploy e build sempre a partir da raiz do projeto cliente (o diretório pai que consome o core), e NUNCA diretamente de dentro da pasta interna `core/`.

Esta skill descreve o processo de CI/CD local, onde o agente automatiza o controle de versão e o deploy estático do blog.

## Quando Usar Esta Skill

Use quando o usuário pedir para:
- "publicar o blog"
- "fazer deploy"
- "subir para produção"
- "enviar para o servidor"
- "publicar"

## O Novo Fluxo de Trabalho (CI/CD Local)

Quando acionado, o script de deploy fará exatamente as seguintes etapas:
1. **Branch e MR**: Cria uma nova branch com as alterações, faz commit/push e abre um Merge Request (MR/PR) no repositório remoto.
2. **Build Local**: Roda `bun run build` na máquina para gerar os estáticos.
3. **Upload (Deploy)**: Pega **apenas** a pasta resultante do build (`dist/`) e envia via SSH/Rsync para o servidor. O código fonte *não* vai para o servidor.
4. **Redes Sociais**: No final do processo, o script dispara automaticamente o webhook do **n8n**, publicando os novos artigos em português no **LinkedIn, Facebook e Instagram**.

## Pré-requisitos

1. O arquivo `.env` deve existir na raiz do projeto com:
   - `DEPLOY_VPS_IP`
   - `DEPLOY_USER`
   - `DEPLOY_PATH`
2. O `gh cli` (GitHub CLI) deve estar autenticado na máquina para a criação do MR.

## Passos para Publicação

### Passo 1: Executar o Deploy
Execute o script de deploy através do terminal:

```bash
chmod +x deploy-local.sh
./deploy-local.sh
```

Parâmetros do comando no Antigravity:
- **Command Line:** `./deploy-local.sh`
- **Cwd:** `/rogerio/core/coresites-blog`
- **WaitMsBeforeAsync:** `10000`

### Passo 2: Confirmar Resultado
Monitore a saída do terminal.
- Verifique se a branch e o MR foram criados no log.
- Verifique se o rsync terminou sem erros.
Se o terminal retornar "Publish concluído com sucesso!", informe ao usuário que o código já está em MR para histórico e a versão buildada já foi para a VPS!
