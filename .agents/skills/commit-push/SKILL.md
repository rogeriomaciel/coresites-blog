---
name: commit-push
description: >
  Realiza o processo de salvar alterações (commit) e enviar para o repositório remoto (push).
  Use quando o usuário pedir para "fazer commit", "salvar no github", "fazer push" ou termos semelhantes.
---

# Commit and Push Skill

Esta skill instrui o agente a verificar alterações no código, preparar todas as modificações e enviá-las para o repositório remoto Git.

## Quando Usar Esta Skill

Use quando o usuário pedir para:
- "fazer commit"
- "salvar tudo"
- "enviar pro github"
- "fazer push"
- "guardar alterações"

## Passos para Execução

### Passo 1: Verificar status do Git
Opcionalmente, use `git status` para confirmar o que foi alterado, caso o agente não tenha certeza.

### Passo 2: Adicionar Arquivos
Adicione todas as alterações ao index:
```bash
git add .
```

### Passo 3: Criar o Commit
Faça o commit com uma mensagem descritiva. Se o usuário fornecer a mensagem, utilize-a. Se não, analise rapidamente o que foi feito e crie uma mensagem no padrão Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
```bash
git commit -m "tipo: descrição curta"
```

### Passo 4: Enviar (Push)
Envie as alterações:
```bash
git push
```
*(Se for a primeira vez fazendo push na branch, pode ser necessário `git push -u origin <branch>`)*

### Passo 5: Confirmação
Comunique ao usuário que os arquivos foram salvos e enviados ao repositório remoto.
