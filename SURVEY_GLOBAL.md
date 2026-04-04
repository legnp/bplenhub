# Survey_Global — Marco Institucional de Pesquisas 📊

Survey é um ativo de coleta orientado a análise, diagnóstico e insight. Seu propósito primordial é gerar inteligência sobre o tema pesquisado, não alimentando necessariamente fluxos operacionais imediatos de cadastro.

## 🎯 Finalidade
Consolidar o padrão global de experiência, estrutura, comportamento e persistência de surveys no ecossistema BPlen HUB.

## 📐 Regras de UX
- **Narrativa Guiada**: A experiência deve ser sequencial e humana.
- **Enunciados Únicos**: Exibir apenas um enunciado (pergunta) por vez para garantir foco e atenção.
- **Progressão Fluida**: Uso de animações textuais e transições suaves (ex: `TypedText`).
- **Ritmo Deliberado**: Evitar o overload visual de formulários frios. Foco na jornada do usuário.
- **CTA Contextual**: Botão de avanço que aparece após a interação ou conclusão da leitura.

## 🛠️ Regras de Comportamento
- **Resposta Única**: Por padrão, a resposta é finalizada após a submissão e não permite edição posterior.
- **Edição Restrita**: Edições são excepcionais e devem ser habilitadas explicitamente via configuração.
- **Metadados Analíticos**: Toda survey deve carregar dados de contexto (versão, status, tags de analytics).

## 💾 Persistência e Governança
- **Localização**: Preferencialmente em `User/{matricula}/Surveys/{surveyId}` ou estrutura equivalente por contexto.
- **Snapshot Consolidado**: Armazenar o estado final da resposta para facilitar leituras analíticas rápidas.
- **Espelhamento**: Manter sincronia obrigatória entre Firestore e Google Drive (Sheets/PDF).

## 📊 Analytics & Admin
- **Visão Analítica**: O painel administrativo deve focar em taxas de conclusão, recortes por perfil e insights consolidados.
- **Diferenciação**: Não tratar admin de survey como um CRUD comum; o valor está no dado agregado.

---
*Este documento é a referência oficial para qualquer nova implementação de Survey no projeto. Nenhuma survey deve ser criada sem aderência a estes princípios.*
