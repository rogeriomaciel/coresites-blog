# Deploy e CI/CD Local

Toda a lógica de publicação para a produção no CoreSites é centralizada e automatizada pelo script bash `deploy-local.sh`, que deve ser executado pelo agente ou pelo administrador **a partir da raiz do projeto cliente**, acessando o script via `./core/deploy-local.sh`.

## Fluxo do Deploy (Passo a Passo)

1. **Versionamento:** 
   O script verifica se há alterações locais. Caso haja (ex: novos artigos em Markdown), ele cria automaticamente uma nova branch de publicação (com data e hora), adiciona os arquivos, faz o commit e cria um *Merge Request* via GitHub CLI (`gh pr create`).
2. **Build Isolation:** 
   O script garante que a compilação ocorra no diretório correto (`cd core`). Ele aciona o `bun run build`, gerando a pasta de artefatos finais no diretório `dist/`. O sitemap também é engatilhado neste momento.
3. **Upload (Rsync / SSH):** 
   Apenas os arquivos estáticos (HTML, JS, CSS gerados) são transferidos. O script utiliza o comando `rsync` integrado com `sshpass` para deletar os arquivos antigos e publicar o pacote novo no servidor VPS definido no `.env`. O código-fonte nunca trafega para o servidor de produção, preservando a segurança.
4. **Acionamento de Webhooks Sociais:** 
   Se tudo ocorreu bem e a variável de supressão (`SKIP_SOCIAL`) não foi passada, os scripts do n8n são disparados (detalhado em *social-automation.md*).

## Requisitos: Variáveis de Ambiente (.env)

O motor exige um arquivo `.env` preenchido na **raiz do projeto pai** (não no core). O `deploy-local.sh` lerá automaticamente esse arquivo:

### Credenciais da VPS de Produção
- `DEPLOY_VPS_IP` = Endereço IP do servidor Linux de destino.
- `DEPLOY_USER` = Usuário do servidor SSH (Padrão: root).
- `DEPLOY_PATH` = Caminho do destino web (Ex: /var/www/meublog).
- `DEPLOY_USERPASSWORD` = Senha do usuário SSH para envio via `sshpass` (Opcional, se usar chaves de rede públicas, este campo pode ser omitido).

### Credenciais Google Analytics (Skills)
- `GA4_PROPERTY_ID` = O ID numérico da propriedade do GA4 (ex: 544168154).
- `GOOGLE_APPLICATION_CREDENTIALS` = Caminho ABSOLUTO para o arquivo `.json` das chaves Service Account.

> **Dica de Segurança:** Salve o arquivo JSON na raiz do projeto em uma pasta chamada `security/` e garanta que ela está no `.gitignore`.
