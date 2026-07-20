# Arquitetura e Frontend

O módulo `core` foi desenvolvido utilizando uma stack moderna e de alta performance, voltada para otimização de motores de busca (SEO/GEO) e facilidade de manutenção.

## A Abordagem Headless (ReadOnly)
Diferente de templates tradicionais, o `core` é instanciado como um **submódulo Git**. 
Isso significa que toda a lógica de renderização, roteamento e estilização principal vive dentro do `core`, mas o conteúdo real (arquivos `.md`, imagens em `public/`, chaves `.env`) vive no **projeto pai**.

O `core` nunca deve ser alterado para fins de conteúdo de cliente. Ele apenas lê o diretório `../content/` e `../public/` durante a execução e o build.

## Stack Tecnológica
- **Vite:** Bundler ultrarrápido para desenvolvimento e compilação.
- **React 19 + TypeScript:** Base de UI e tipagem rigorosa.
- **Dompurify & Marked:** Renderização segura de arquivos Markdown.
- **React Router:** Gerenciamento de rotas estáticas e dinâmicas do blog.

## Scripts de Build (Compilação Avançada)
O comando de build do projeto não apenas transpila o código, mas engatilha uma série de otimizações estáticas.
O fluxo (definido no `package.json`) é:

1. `tsc -b`: Verificação rigorosa de tipagem.
2. `bun run scripts/generate-og-images.ts`: Script em Node/Bun que lê o diretório de posts, utiliza a biblioteca gráfica **Sharp**, e gera dinamicamente imagens em formato SVG para `og:image` de cada artigo.
3. `vite build`: Empacota o bundle base do SPA (Single Page Application).
4. `bun run scripts/prerender-seo.ts`: (Crucial) Lê as rotas geradas pelo Vite e injeta todo o conteúdo do Markdown e Meta Tags de SEO diretamente no HTML cru final. Isso garante que os bots do Google e do LinkedIn consigam ler a página antes que o React carregue.
5. `bun run scripts/generate-sitemap.ts`: Produz um `sitemap.xml` dinâmico contendo todas as URLs, pronto para o Google Search Console.
