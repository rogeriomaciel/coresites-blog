---
name: write-article
description: >
  Cria um novo artigo para o blog CoreAutoCRM. Gera conteúdo profundo e original em Markdown
  escrito na linguagem dos problemas reais do dono de oficina mecânica, otimizado para SEO orgânico,
  GEO e AEO. Prioriza PROFUNDIDADE, ORIGINALIDADE e EMPATIA COM A DOR DO LEITOR acima de volume.
  Cada artigo deve responder a um problema que o dono acorda pensando — não a um recurso do produto.
---

# Write Article Skill — Na Linguagem do Dono da Oficina

Esta skill instrui o agente a criar artigos de blog **profundos, únicos e ranqueáveis**
para o blog.coreautocrm.com.br, voltados a **donos de oficina mecânica no Brasil**.

> ⚠️ LEIA TUDO ANTES DE ESCREVER. Cada regra abaixo existe por uma razão técnica e estratégica.
> Ignorar qualquer item compromete o ranqueamento do artigo inteiro e do domínio como um todo.

---

## 📂 Fonte da Verdade — Consulte Antes de Descrever o Produto

O CoreAutoCRM é um produto real com código-fonte em **`../coreauto-insight/`** e documentação em **`../coreauto-insight/docs/`** (relativo à raiz do blog). **Antes de descrever qualquer funcionalidade, consulte os arquivos abaixo** para garantir que o artigo seja preciso — não uma versão imaginada do produto.

### Documentos disponíveis e para que servem:

| Arquivo | Conteúdo | Use para artigos sobre |
|---|---|---|
| `dossie_sistema.md` | Visão geral, arquitetura, módulos, stack completo | Qualquer artigo sobre "como funciona" |
| `manual_usuario.md` | Jornada real do cliente, mecânico e consultor | Fluxo de atendimento, WhatsApp, OS |
| `conselho_de_ia.md` | Conselho de IA / CEO Virtual completo | Relatórios executivos, diretoria virtual |
| `PROMPTS_E_MODULOS.md` | 28 módulos operacionais da IA | Como a IA "pensa" e roteia conversas |
| `CONTEXT_ACTIONS.md` | Ações reais da IA no sistema | Automação de tarefas da oficina |
| `contatos_chat_followup.md` | Fluxo de follow-up e resgate de orçamentos | Follow-up, orçamentos parados |
| `painel_tv_modo_cinema.md` | Painel TV para o pátio | Visibilidade da operação em tempo real |
| `backlog_roadmap.md` | Funcionalidades planejadas | Futuro do produto (sinalize como "em breve") |

### Como usar ao escrever:

1. Identifique a funcionalidade do artigo → leia o arquivo relevante
2. Use detalhes reais em vez de descrições genéricas:
   - ❌ "A IA envia mensagens automáticas para o cliente"
   - ✅ "Quando o orçamento fica 45 minutos sem resposta, a Cora envia automaticamente uma mensagem de follow-up no WhatsApp perguntando se o cliente tem dúvidas sobre as peças ou precisa de parcelamento"
3. Funcionalidades reais = credibilidade = conversão

### Fatos reais do produto para usar nos artigos:

Extraídos de `dossie_sistema.md` e `manual_usuario.md`:
- O assistente se chama **Cora** (renomeável pela oficina nas configurações)
- Suporte a **áudio**: mecânico fala o diagnóstico, a IA transcreve e monta o orçamento
- **28 módulos operacionais** de IA (`TRIAGEM_INICIAL`, `APROVACAO_ORCAMENTO`, `EXECUCAO_SERVICO`, etc.)
- **Painel TV** para o pátio: exibe OSs e status em TVs via HDMI em tempo real
- **Conselho de IA**: relatório executivo diário com voz de CEO, CFO, CMO sobre a operação
- **Fila de mensagens inteligente**: agrupa mensagens rápidas do mesmo contato antes de processar (evita respostas fragmentadas)
- **Observabilidade de custo de IA**: cada chamada de LLM é registrada com tokens e custo por módulo
- Case real de cliente: **Kadosh Mecânica** (oficina usada como referência em casos de uso)

---

## 🚦 Protocolo de Início — Execute SEMPRE Antes de Escrever

> **Este protocolo é obrigatório.** Toda vez que esta skill for acionada — mesmo que o usuário já tenha indicado um tema — execute os 4 passos abaixo antes de escrever uma linha sequer. O objetivo é garantir que o artigo seja baseado em contexto real: o que o produto faz hoje, o que o tráfego indica, e o que está em alta no mercado.

---

### Passo 1 — Contexto Completo: Docs + Posts Existentes

**1a. Leia a documentação atualizada do produto:**

Execute no terminal para ver quais arquivos de docs foram modificados recentemente:

```bash
ls -lt ../coreauto-insight/docs/ | head -15
```

Leia os **3 arquivos mais recentemente modificados** que ainda não estejam no seu contexto atual. A documentação é atualizada quase diariamente — artigos escritos com base em docs desatualizados descrevem funcionalidades que podem ter mudado.

Prioridade de leitura:
1. Qualquer arquivo modificado nos últimos 2 dias
2. `dossie_sistema.md` — se não foi lido nesta sessão
3. O arquivo mais específico para o tema do artigo que vai escrever

---

**1b. Mapeie os posts que já existem (OBRIGATÓRIO para evitar duplicação):**

Execute para listar todos os posts publicados:

```bash
ls ../content/posts/pt/
```

Para cada post na lista, extraia o `title` e `keywords` do frontmatter para montar um inventário mental dos temas já cobertos:

```bash
grep -h "^title:\|^keywords:" ../content/posts/pt/*.md | head -120
```

Com esse inventário em mente:
- **Não proponha** um post cujo título ou keyword principal seja idêntico ou muito similar a um já existente
- **Se o tema já existe mas está raso** (post curto, keyword genérica, sem profundidade), é válido propor um post complementar com ângulo diferente — sinalize isso na proposta: *"Este tema já existe em `/post/slug-existente`, mas aquele post aborda X. Este novo abordaria Y com a keyword Z"*
- **Verifique canibalização de keyword**: se dois posts existentes já usam a mesma keyword, não crie um terceiro — isso fragmenta a autoridade SEO

---

### Passo 2 — Consulte o Tráfego Real do Blog (GA4)

Use a `analyze-traffic` skill disponível em `../coreautocrm-blog/core/.agents/skills/analyze-traffic/` ou execute a query diretamente via Google Analytics Data API (credenciais em `.env`: `GA4_PROPERTY_ID` e `GOOGLE_APPLICATION_CREDENTIALS`).

O que você precisa saber:
- **Quais posts têm mais pageviews nas últimas 2 semanas?** → Aprofunde nesses temas, há demanda real
- **Quais posts têm bounce rate > 70%?** → Esses temas atraem mas não retêm — o ângulo pode estar errado
- **Quais posts têm engajamento alto mas pouco tráfego?** → São candidatos para posts complementares com keyword diferente
- **Há posts com zero tráfego depois de 30 dias?** → Avaliar se o tema/keyword está errado

Se não houver dados suficientes (site novo), pule para o Passo 3.

---

### Passo 3 — Verifique Tendências no Nicho

Pesquise no Google Trends e/ou faça uma busca web pelos seguintes temas para ver o que está em alta **agora** no Brasil para o público de oficinas mecânicas:

Termos para pesquisar:
- `"oficina mecânica"` no Google Trends Brasil — últimos 30 dias
- `"gestão de oficina"` — há pico de interesse?
- `"WhatsApp para oficina"` — crescimento?
- Notícias recentes: `"oficina mecânica 2026 brasil"` — há alguma mudança de mercado, regulação ou tendência que pode ser explorada?

Você também pode usar o Search Console se as credenciais estiverem disponíveis, ou fazer uma busca web direta para ver quais resultados aparecem para as keywords que pretende trabalhar — isso mostra com quem você vai competir.

---

### Passo 4 — Proponha 3 Opções de Post (ANTES de Escrever)

Com base nos passos 1-3, **proponha ao usuário 3 opções de artigo** no seguinte formato antes de começar a escrever qualquer um:

```
## 📝 Sugestões de Post — [Data]

### Opção 1
**Título provisório:** [título com keyword de cauda longa]
**Keyword principal:** [keyword exata]
**Ângulo de dor:** [em 1 frase como o dono verbalizaria o problema]
**Por que agora:** [o que nos dados ou trends justifica este post hoje]
**Funcionalidade real do produto:** [o que da documentação embasa este post]
**Estimativa de dificuldade SEO:** [baixa / média / alta]

### Opção 2
[mesma estrutura]

### Opção 3
[mesma estrutura]
```

Aguarde o usuário escolher uma das opções (ou propor outra) antes de escrever.

> **Exceção:** Se o usuário já indicou explicitamente o tema E a keyword no pedido de acionamento da skill, pule as opções e vá direto para a escrita — mas ainda execute os passos 1-3 para coletar contexto.

---

## 🧠 Mentalidade Antes de Começar — O Teste da Manhã

Antes de escrever qualquer linha, faça o **Teste da Manhã**: imagine o dono da oficina acordando às 7h e entrando no pátio. O que está passando pela cabeça dele?

Não é:
- "Preciso de um CRM."
- "Preciso de IA."
- "Preciso de automação."

É algo como:
- *"Tenho 12 carros esperando orçamento e meu WhatsApp não para de tocar."*
- *"Meu consultor esqueceu de dar retorno num cliente de R$ 15 mil."*
- *"Minha agenda está vazia para sexta-feira."*
- *"Três clientes sumiram depois de receber o orçamento esta semana."*
- *"Minha equipe não faz follow-up de jeito nenhum."*

**O artigo deve começar e terminar nessa linguagem.** O CoreAutoCRM aparece como consequência natural — nunca como ponto de partida.

Responda essas 3 perguntas antes de escrever:
1. **Qual é o "problema da manhã" que esse artigo resolve?** Escreva em 1 frase como o dono verbalizaria.
2. **Essa pessoa procuraria isso no Google?** Se a resposta depende dela já conhecer CRM ou IA, a keyword está errada.
3. **Quanto dinheiro ela está perdendo hoje por não saber isso?** Se você não consegue calcular, o artigo é fraco.

---

## 🎯 Regra #0 — Estratégia de Conteúdo: Dor Antes de Solução

Esta é a regra mais importante da skill. **Todo artigo deve ser escrito na perspectiva do problema sentido pelo dono — não na perspectiva do que o CoreAutoCRM faz.**

### O que o dono da oficina pesquisa no Google:

**Grupo A — Alta demanda, vocabulário emocional/situacional (USE ESTES):**
- "oficina sem movimento o que fazer"
- "cliente não responde orçamento oficina"
- "como aumentar faturamento da oficina mecânica"
- "consultor não faz follow-up o que fazer"
- "como conseguir mais clientes para oficina mecânica"
- "oficina perdendo clientes para a concorrência"
- "como vender mais revisão preventiva na oficina"
- "equipe esquecendo clientes oficina mecânica"
- "como organizar atendimento de oficina que está crescendo"
- "mecânico bom mas oficina não lucra por que"
- "orçamento aprovado mas cliente não volta buscar o carro"
- "como não perder cliente após o orçamento"

**Grupo B — Baixa demanda, vocabulário técnico/produto (EVITE como foco principal):**
- "CRM para oficina mecânica" (pouca gente pesquisa isso)
- "software de gestão automotiva" (alta concorrência, baixa demanda)
- "IA para oficina" (abstrato, sem intenção de compra)

> A diferença é decisiva: o Grupo A tem muito mais gente pesquisando porque descreve a DOR, não a solução. O dono da Kadosh não acorda pensando em CRM — acorda pensando em orçamentos parados.

### Como o CoreAutoCRM deve aparecer no artigo:
- ✅ Como **consequência lógica** da solução apresentada: "É por isso que sistemas como o CoreAutoCRM automatizam exatamente esse passo..."
- ✅ Como **prova concreta** de que a solução funciona: "Oficinas que implementaram esse fluxo relatam redução de X% no tempo de resposta..."
- ❌ Nunca como abertura do artigo: "O CoreAutoCRM é uma plataforma que..."
- ❌ Nunca como CTA óbvio de venda logo no segundo parágrafo

---

## 🔑 Regra #1 — Keywords de Cauda Longa (OBRIGATÓRIO)

**NUNCA use keywords genéricas como palavra-chave principal.** O domínio blog.coreautocrm.com.br é novo e não tem autoridade de domínio para competir em termos amplos.

### ❌ Keywords PROIBIDAS como foco principal:
- "IA para oficina mecânica" (competição altíssima, impossível ranquear)
- "automação de oficina" (muito amplo, sem intenção de compra)
- "futuro das oficinas mecânicas" (sem intenção de conversão)
- "inteligência artificial" (impossível ranquear sem autoridade)

### ✅ Keywords CORRETAS — cauda longa, dor específica, linguagem do dono:

**Sobre perda de clientes e orçamentos:**
- "por que clientes somem depois de receber orçamento oficina"
- "cliente aprovou orçamento mas não voltou buscar o carro"
- "como não perder cliente após enviar orçamento no WhatsApp"
- "oficina perdendo clientes para concorrência o que fazer"

**Sobre faturamento e crescimento:**
- "como aumentar faturamento da oficina mecânica sem abrir mais box"
- "como aumentar ticket médio de oficina mecânica"
- "oficina com movimento mas sem lucro por que"
- "oficina boa mas não cresce o que está errado"

**Sobre operação e equipe:**
- "consultor de oficina não faz follow-up como resolver"
- "como organizar atendimento de oficina mecânica crescendo"
- "mecânico bom mas oficina desorganizada como melhorar"
- "como controlar WhatsApp da oficina sem perder mensagem"

**Sobre custos e gargalos:**
- "quanto custa elevador parado aguardando aprovação de orçamento"
- "como calcular custo de ineficiência da oficina mecânica"
- "por que minha oficina não lucra mesmo com muito movimento"

**Sobre agenda e demanda:**
- "como encher agenda da oficina mecânica"
- "oficina sem movimento o que fazer"
- "como conseguir mais clientes para oficina mecânica pequena"
- "como vender mais revisão preventiva na oficina"

### Como escolher a keyword do artigo:
1. A keyword principal deve soar como algo que o dono **falaria para um colega** ou **digitaria no Google num momento de frustração**.
2. Deve aparecer no `title`, no `meta_title`, no `meta_description`, no **primeiro parágrafo** e em pelo menos **1 H2**.
3. Densidade ideal: mencione a keyword principal **3-5 vezes** naturalmente no corpo do texto.
4. **Teste final:** Se a keyword pudesse ser sobre qualquer tipo de negócio (não só oficina), ela é genérica demais.

---

## 📏 Regra #2 — Tamanho Mínimo e Profundidade (CRÍTICO para SEO)

### Tamanho obrigatório:
- **Mínimo absoluto: 900 palavras no corpo do artigo** (excluindo frontmatter, FAQ e seção de links)
- **Ideal: 1.200-1.800 palavras**
- Posts com menos de 900 palavras sobre qualquer tópico com concorrência **não serão ranqueados pelo Google**. Isso não é opinião — é como o algoritmo funciona.

### O que conta como profundidade real:
- ✅ Dados numéricos concretos (ex: "rampa parada 4h = R$1.400 de oportunidade perdida")
- ✅ Cenários reais e específicos (ex: "É segunda-feira, 9h30, o mecânico acabou de identificar que...")
- ✅ Tabelas comparativas com pelo menos 3 linhas de dados reais do setor
- ✅ Passos numerados com instruções acionáveis (como fazer, não apenas o que é)
- ✅ Pelo menos 1 referência a dado do mercado automotivo brasileiro
- ❌ Parágrafos de 2-3 frases que apenas definem conceitos sem aprofundar
- ❌ Afirmações sem exemplos ("a IA melhora a eficiência" não serve — mostre como e quanto)
- ❌ Conteúdo que poderia ser sobre qualquer produto de qualquer setor

---

## 🚫 Regra #3 — FAQ ÚNICO por Artigo (PROIBIÇÃO ABSOLUTA de Repetição)

**PROIBIDO** usar blocos de FAQ genéricos copiados de outros artigos. O seguinte bloco está **BANIDO permanentemente**:

```
❌ NUNCA COPIE ISSO EM NENHUM ARTIGO:

### O que é a tecnologia de IA aplicada a oficinas mecânicas?
Trata-se da utilização de inteligência artificial...

### Como o CoreAutoCRM aumenta a aprovação de orçamentos?
Ao enviar notificações automáticas...

### Preciso trocar o ERP atual da minha oficina para usar essas soluções?
Não! O CoreAutoCRM opera de forma integrada...
```

**Por que isso é crítico:** FAQ duplicado em múltiplos artigos é detectado pelo Google como conteúdo de baixo esforço. O Google Helpful Content Update penaliza sites inteiros (não só artigos individuais) por esse padrão. Isso explica a ausência de tráfego orgânico.

### Regras para o FAQ correto:
1. **Cada artigo DEVE ter FAQ 100% único e específico sobre aquele tema**
2. As perguntas devem ser exatamente o que um leitor daquele artigo específico perguntaria
3. As respostas devem ter **mínimo 3 frases completas** (não respostas de 1 linha)
4. Use a keyword de cauda longa naturalmente dentro das respostas
5. **Mínimo 3, máximo 5 perguntas por artigo**

### Exemplo de FAQ correto para artigo sobre elevador parado:
```markdown
## Perguntas Frequentes sobre Custo de Elevador Parado

### Como calcular o custo real de um elevador parado na minha oficina?
Multiplique o seu ticket médio de mão de obra por hora pelo número de horas que o
elevador ficou parado aguardando aprovação de orçamento. Se seu ticket médio é R$180/h
e o elevador ficou parado 4 horas, você perdeu R$720 de receita potencial. Faça esse
cálculo toda segunda-feira usando as OSs da semana anterior — o resultado costuma
surpreender donos de oficina que nunca tinham visto o número.

### Devo liberar o elevador antes do cliente aprovar o orçamento?
Para serviços de valor abaixo de R$400 (como revisões preventivas, trocas simples de
filtro e óleo), liberar o elevador e reagendar pode ser mais lucrativo, pois aumenta
o giro da rampa. Para serviços acima de R$800 envolvendo desmontagem (suspensão,
câmbio, motor), mantenha o carro no elevador — remontar e desmontar novamente custa
mais em mão de obra do que o tempo parado.

### Quanto tempo o cliente tem para responder um orçamento antes de eu encerrar a OS?
A prática mais eficiente no mercado é: 45 minutos para o primeiro follow-up automático,
2 horas para o segundo contato humano, e 24 horas para encerramento da OS como "aguardando
aprovação". Depois de 48 horas sem resposta, o veículo deve ser remontado e liberado, e a
OS reaberta quando o cliente retornar.
```

---

## 📐 Regra #4 — Estrutura Obrigatória do Artigo

Todo artigo deve seguir esta estrutura (nessa ordem):

```
[H1 implícito no title do frontmatter]

[Parágrafo de gancho: cena real, dado surpreendente, ou dor concreta — 3-5 frases]

> **Resumo Rápido:** [1-2 frases diretas respondendo o problema, 40-60 palavras, com keyword]

[Contextualização do problema — 2-3 parágrafos com dados e exemplos reais]

---

## [H2 — o problema em detalhes com dado numérico ou cenário]
[3-5 parágrafos densos]

## [H2 — por que acontece / diagnóstico da causa raiz]
[2-3 parágrafos]

## [H2 — como resolver — passo a passo numerado]
### 1. [Ação concreta]
### 2. [Ação concreta]
### 3. [Ação concreta]

## [H2 — exemplo prático / cenário de uso real]
[Narrativa de 2-3 parágrafos com dono de oficina fictício mas realista]

## Conclusão: [benefício principal resumido]
[2-3 parágrafos de fechamento com CTA para CoreAutoCRM ou próximo artigo]

### 🔗 Leituras Recomendadas:
[2-3 links internos genuinamente relevantes]

## Perguntas Frequentes sobre [Tema Específico do Artigo]
[3-5 perguntas 100% únicas para este artigo — ver Regra #3]
```

---

## 📋 Regra #5 — Frontmatter Completo e Correto

```yaml
---
title: 'Título com keyword principal: benefício concreto em até 65 caracteres'
slug: titulo-do-artigo-em-kebab-case-sem-acentos
date: 'YYYY-MM-DD'
author: Rogério Maciel
excerpt: 'Resumo de 1-2 linhas focado no benefício concreto — sem buzzwords, com dado específico'
meta_title: 'Keyword de Cauda Longa na Oficina Mecânica | CoreAutoCRM Blog'
meta_description: 'Descrição de 140-160 caracteres que responde o problema diretamente e inclui a keyword principal. Deve ser específica o suficiente para que o leitor entenda o benefício antes de clicar.'
keywords:
  - keyword-cauda-longa-principal-do-artigo
  - keyword-secundaria-especifica-do-tema
  - oficina mecanica [variação contextual]
  - CoreAutoCRM
category: 'Gestão | Automação | IA | Financeiro | Operação'
tags:
  - [Tags específicas do tema — nunca tags genéricas como "IA" sozinha]
cover_image: /images/posts/slug-do-artigo.png
published: true
social_published: []
aeo_enhanced: true
---
```

---

## 🖼️ Regra #10 — Imagem de Capa: Foto-Realística, Não Gráfico

> ⚠️ **OBRIGATÓRIO.** A imagem de capa é o primeiro elemento visual que o leitor vê. Ela deve ser uma **fotografia realística** do cotidiano de uma oficina mecânica — não um infográfico, gráfico de barras, SVG decorativo ou dashboard genérico.

### Como gerar a imagem de capa:

Use a tool `generate_image` com o seguinte padrão de prompt:

```
Photorealistic editorial photograph of [cena específica relacionada ao tema do artigo].
Brazilian auto repair shop setting. Professional DSLR photo, natural lighting, shallow depth of field.
No text overlays, no charts, no diagrams. Cinematic, documentary style.
Aspect ratio 16:9. Wide shot or medium shot. High detail, sharp focus on main subject.
```

### Exemplos de prompts corretos por tema:

| Tema do artigo | Prompt da cena |
|---|---|
| Orçamentos parados no WhatsApp | Mechanic looking at phone in a busy auto shop, worried expression, cars in background waiting for service |
| Elevador parado / carro na rampa | Car lifted on hydraulic lift in auto repair shop, no mechanic present, lift idle, other cars queued |
| Follow-up de clientes | Auto shop consultant at front desk looking at tablet showing WhatsApp conversations |
| Gestão financeira da oficina | Auto shop owner reviewing paperwork at desk, frustrated expression, cluttered workshop behind him |
| Equipe e mecânicos | Team of mechanics working together in well-lit auto repair shop, professional environment |
| IA e automação | Mechanic in blue uniform using tablet in a modern auto shop, looking at dashboard |

### Onde salvar:

```bash
# O generate_image salva automaticamente como artifact.
# Depois, copie para:
public/images/posts/{slug}.png
```

### Regras da imagem:
- ✅ Foto-realística, estilo editorial/documental
- ✅ Cena específica do cotidiano de oficina mecânica
- ✅ Relacionada ao problema/tema do artigo
- ✅ Sem texto sobreposto
- ✅ Sem gráficos, dashboards ou elementos UI
- ✅ Proporção 16:9 (1200×630px ideal)
- ❌ SVG de infográfico ou gráfico genérico
- ❌ Imagem genérica de tecnologia (circuito, robô, IA abstrata)
- ❌ Dashboard ou mockup de software
- ❌ Stock photo de homem de terno com tablet (genérico demais)

**Limites rígidos:**
- `title`: **máximo 65 caracteres** (o Google corta depois disso no resultado de busca)
- `meta_description`: **entre 140 e 160 caracteres** (conta os espaços)
- `keywords`: mínimo 4, máximo 8 — todas específicas do tema deste artigo
- `slug`: kebab-case, sem acentos, sem underscores, sem números desnecessários
- `social_published`: **sempre vazio `[]`** ao criar — será preenchido pela skill de publicação

---

## 🖼️ Regra #11 — Separação Estrita de Imagens: Blog (Limpa) vs Redes Sociais (Com Overlay)

> ⚠️ **REGRA OBRIGATÓRIA DE COMPOSIÇÃO DE IMAGENS.**
> Existe uma divisão estrita entre a foto exibida na página do blog e as imagens enviadas para as redes sociais:
>
> 1. **Página do Artigo no Blog (`public/images/posts/{slug}.png`):**
>    - DEVE SER SEMPRE A FOTO LIMPA foto-realística.
>    - NÃO DEVE TER NENHUM TEXTO SOBREPOSTO, GRADIENTE ESCURO OU OVERLAY.
>    - É a imagem apontada pelo `cover_image` no frontmatter.
>
> 2. **Redes Sociais (Facebook, LinkedIn, Open Graph) (`public/images/posts/{slug}-og.png`):**
>    - Gerada AUTOMATICAMENTE pelo script `generate-og-images.ts`.
>    - Possui o gradiente escuro na parte inferior + Título em destaque + Descrição do artigo em texto legível.
>    - É a URL enviada para Facebook/LinkedIn/OG meta tags (`og:image`).
>
> 3. **Instagram (`public/images/posts/{slug}-sq.png`):**
>    - Gerada AUTOMATICAMENTE pelo script `generate-og-images.ts` em formato quadrado 1080x1080 com overlay.
>
> **NUNCA sobrescreva `{slug}.png` com o overlay de texto. A foto do artigo no blog permanece 100% limpa.**

---

## 🎯 Regra #6 — Tom e Voz

O leitor é um **dono de oficina mecânica brasileiro**. Escreva diretamente para ele:

- ✅ Tom direto e pragmático ("Se o cliente não respondeu em 1 hora, você já perdeu R$600 de oportunidade")
- ✅ Referências do cotidiano da oficina (elevador, OS, pátio, mecânico, consultor, rampa)
- ✅ Números concretos sempre preferíveis a adjetivos ("40% mais rápido" é melhor que "muito mais rápido")
- ✅ Segunda pessoa ao falar com o leitor ("Você sabe que quando o cliente some...")
- ✅ Frases curtas: **máximo 25 palavras por frase**
- ✅ Parágrafos curtos: **máximo 5 linhas antes de uma quebra**
- ❌ Linguagem corporativa ("sinergias", "ecossistema holístico", "paradigma de inovação")
- ❌ Frases passivas ("é possível que seja feito" — use "você pode fazer")
- ❌ Começar parágrafos consecutivos com a mesma palavra

---

## 🔗 Regra #7 — Links Internos Obrigatórios

Todo artigo deve ter **mínimo 2 links internos** para outros artigos do blog que sejam genuinamente relevantes ao tema.

Posts disponíveis para linkagem:
- `/post/custo-invisivel-elevador-parado-orcamento-whatsapp` — custo de rampa parada
- `/post/recuperar-orcamentos-parados-whatsapp-oficina` — follow-up de orçamentos
- `/post/relatorio-diario-dono-oficina-mecanica-ia` — relatório diário
- `/post/importar-orcamento-pdf-oficina-mecanica` — importação de PDF
- `/post/como-usar-ia-na-minha-oficina` — guia de IA
- `/post/cerebro-ia-modulos-oficina` — módulos de IA
- `/post/whatsapp-sistema-operacional-oficina` — WhatsApp como central da oficina
- `/post/diario-de-bordo-3-atos-oficina-mecanica` — diário de bordo
- `/post/follow-up-automatico-orcamento-oficina-mecanica` — follow-up automático
- `/post/como-fazer-follow-up-inteligente-oficina` — follow-up inteligente
- `/post/maior-problema-oficina-gargalo-operacional` — gargalo operacional

**Formato correto do link interno:**
```markdown
[como calcular o custo de rampa parada na sua oficina](/post/custo-invisivel-elevador-parado-orcamento-whatsapp)
```
Nunca use "clique aqui", "saiba mais" ou "veja mais" como texto âncora — use texto descritivo com keyword natural.

---

## 💡 Regra #8 — Dados do Setor Automotivo Brasileiro

Use esses dados para dar autoridade e profundidade ao conteúdo:

| Dado | Valor | Uso sugerido |
|------|-------|--------------|
| Mercado de reparação automotiva BR | ~R$100 bilhões/ano (SINDIREPA) | Contextualizar o tamanho do mercado |
| Ticket médio de oficina multimarca | R$450-850 por OS | Calcular impacto financeiro |
| Taxa de aprovação sem follow-up | 35-45% | Mostrar o problema |
| Taxa de aprovação com follow-up | 65-75% | Mostrar a solução |
| Tempo médio de resposta do cliente | 2-4 horas sem automação | Quantificar o atraso |
| Veículos em circulação no Brasil | ~120 milhões (DENATRAN/SENATRAN) | Tamanho do mercado |
| Mecânicos que usam smartphone | >85% | Argumento para WhatsApp |

Se não souber um dado exato, use linguagem cautelosa: "estimativas do setor indicam", "de acordo com especialistas em gestão automotiva", "pesquisas com donos de oficina apontam".

---

## 💸 Regra #9 — CTA de Inércia, Não de Produto

Este é o erro mais comum nos artigos atuais: **terminar com pitch de produto ao invés de mostrar o custo da omissão**.

As pessoas compram quando enxergam o **custo de não agir** — não quando lêem uma descrição do produto.

### ❌ CTAs PROIBIDOS (pitch de produto):
```
"Conheça o CoreAutoCRM e transforme sua oficina."
"O CoreAutoCRM resolve esse problema. Fale com a gente."
"Clique aqui e descubra como o CoreAutoCRM pode ajudar você."
```

### ✅ CTAs CORRETOS (custo da inércia):
```
"Quantos orçamentos você perdeu esta semana por não fazer follow-up? Calcule:
5 orçamentos parados × R$600 de ticket médio = R$3.000 que ficaram na mesa.
Essa é a conta que a maioria dos donos de oficina nunca fez."
```

```
"Enquanto você leu esse artigo, algum carro no seu pátio provavelmente ficou mais
30 minutos parado esperando resposta do cliente. Se o seu elevador fatura R$180/h,
você acabou de perder R$90. Amanhaã vai acontecer de novo."
```

### Estrutura correta de conclusão:
1. **Calcule o custo:** mostre quanto o leitor perde hoje por não resolver o problema
2. **Mostre a alternativa:** descreva como seria a operação se o problema fosse resolvido
3. **Apresente o CoreAutoCRM como ferramenta** (não como salvador): "Ferramentas como o CoreAutoCRM foram construídas especificamente para automatizar esse processo..."
4. **CTA prático e específico:** não "saiba mais" — use algo como "[Veja como calcular o giro de rampa da sua oficina](/post/custo-invisivel-elevador-parado-orcamento-whatsapp)"

---

## ✅ Checklist Final Antes de Salvar

**Confirme cada item antes de salvar o arquivo:**

- [ ] Keyword de cauda longa específica (não genérica) escolhida e usada consistentemente
- [ ] A keyword soa como algo que o dono **falaria / digitaria num momento de frustração** (não como nomenclatura de produto)
- [ ] Corpo do artigo tem **mínimo 900 palavras** (exclua frontmatter e FAQ da contagem)
- [ ] O artigo começa pelo **problema do dono** — não pelo CoreAutoCRM ou pela tecnologia
- [ ] O CoreAutoCRM aparece como **consequência** da solução — nunca no 1º ou 2º parágrafo
- [ ] A conclusão mostra **custo da inércia** (quanto o leitor perde) antes de mencionar o produto
- [ ] FAQ é **100% único** — nenhuma pergunta copiada de outros artigos
- [ ] FAQ tem **mínimo 3 perguntas** com respostas de mínimo 3 frases cada
- [ ] `meta_description` tem entre **140-160 caracteres** (conte!)
- [ ] `title` tem no **máximo 65 caracteres** (conte!)
- [ ] Pelo menos **1 tabela comparativa** ou lista numerada com passos concretos
- [ ] Pelo menos **1 dado numérico do setor** no corpo do texto
- [ ] Pelo menos **2 links internos** com texto âncora descritivo
- [ ] Nenhum bloco de FAQ genérico copiado de artigos anteriores
- [ ] `social_published: []` vazio no frontmatter
- [ ] Parágrafos têm no máximo 5 linhas antes de quebra

---

## 💾 Local do Arquivo

- **Artigo (projeto raiz/pai):** `content/posts/pt/{slug}.md`
- **Artigo (operando a partir do core):** `../content/posts/pt/{slug}.md`
- **Imagem de capa:** gerada com `generate_image` → salva em `public/images/posts/{slug}.png`
- **cover_image no frontmatter:** `/images/posts/{slug}.png` (sempre `.png`, nunca `.svg`)
