# Governança & Estabilidade do BPlen HUB

Este documento formaliza as práticas de engenharia, garantia de qualidade e ritos de entrega para manter o ecossistema BPlen HUB estável em produção.

## 1. Definição de Pronto (Definition of Done - DoD)

Um épico, feature ou ajuste é considerado **PRONTO** apenas quando:

1.  **Zero Erros de Compilação & Lint**: `npm run build` e `npm run lint` passam sem falhas locais.
2.  **Lógica de Usuário Mapeada**: O `User_Nickname` deve ser extraído obrigatoriamente via `/user-nickname`.
3.  **Fluxos Críticos Validados**:
    -   🔐 Login e Sessão.
    -   🌱 Fluxo de Onboarding (preenchimento no Firestore).
    -   📅 Agendamento e Cancelamento de Eventos (Governança SI).
    -   🛡️ Permissões de Admin (Acesso restrito bloqueado para outros usuários).
4.  **Sincronização**: O deploy no GitHub deve refletir fielmente o código local validado.

## 2. Bloqueadores de Entrega

É terminantemente proibido subir código que contenha:
- Erros de TypeScript/Lint no build.
- Mudanças em coleções do Firestore sem o respectivo mapeamento no `/user-nickname`.
- Falhas na regra de negócio de "1 agendamento por semana" (Governança SI).

## 3. Rotina Padrão de Validação

Antes de qualquer push crucial, o desenvolvedor deve rodar:

```bash
npm run check
```

O comando `check` orquestra:
1.  `npm run lint` (Garagem Limpa).
2.  `npm test` (Proteção de Fluxos Críticos).
3.  `npm run type-check` (Integridade de Tipos).
4.  `npm run build` (Preparo para Produção).

## 4. Matriz de Riscos Atuais

- **Sincronização Manual**: O push manual no Git Desktop exige atenção dupla do desenvolvedor para não pular as checagens `check`.
- **Governança de Tipos**: Algumas extensões de arquivos podem carregar `any` silenciados — prioridade é erradicação total do `any` em fluxos financeiros ou de agenda.

---
**Equipe AI Antigravity & BPlen Team**
