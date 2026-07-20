# Automação de Redes Sociais (Integração n8n)

Uma das capacidades mais poderosas do projeto Core é a automatização nativa de marketing de conteúdo, que evita o trabalho braçal de copiar links e postar manualmente nas redes sociais.

## O Script Base (`trigger-n8n.ts`)

Sempre que a compilação do blog finaliza com sucesso via `deploy-local.sh`, o CI/CD dispara instâncias do script `bun run scripts/trigger-n8n.ts`. 

Este processo roda individualmente (através das flag `--network`) para cada rede conectada.

- **LinkedIn:** Publicação de posts textuais e carrosséis fatiados.
- **Facebook:** Cross-posting focado nas Fan Pages.
- **Instagram:** Foco na publicação estrita de formatos suportados.

## Fluxo Lógico e Prevenção de Duplicatas

1. **Leitura dos Artigos:** O script varre o diretório do projeto cliente buscando por arquivos Markdown (ex: `content/posts/pt/`).
2. **Verificação de Status (`social_published`):** O ponto crucial do script é analisar o frontmatter de cada artigo buscando o campo/tag que indica o status de postagem.
3. **Filtro:** Se o artigo lido estiver com a tag indicando que já foi publicado na rede *LinkedIn*, o script salta esse arquivo, lançando a notificação no terminal: `Ignorando {slug} (já publicado em linkedin)`.
4. **Disparo do Payload (Webhook):** Se for um post inédito, o Node.js envia o conteúdo textual cru, as URLs das imagens geradas estaticamente (`/images/posts/`) e as metas tags num JSON diretamente para a URL do Webhook do servidor interno do n8n.
5. **Atualização do Frontmatter:** Após a confirmação de recebimento (HTTP 200 OK) pelo n8n, o script reescreve localmente o arquivo Markdown, adicionando o nome da rede (ex: `facebook`) na lista de locais onde aquele post já foi submetido, prevenindo loops na próxima compilação.

## Personalização
Todas as integrações, filtros e formatações pesadas do layout do post não vivem neste script TypeScript, mas sim dentro dos blocos gráficos lógicos criados lá no servidor do n8n. O Core simplesmente funciona como o gatilho.
