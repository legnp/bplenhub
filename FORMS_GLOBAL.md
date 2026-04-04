# Forms_Global — Marco Institucional de Formulários 🏗️

Form é um ativo de coleta orientado a operação, workflow e persistência ativa. Seu propósito é alimentar cadastros, cadastrar demandas, processar matrículas e outras tarefas contínuas no ecossistema.

## 🎯 Finalidade
Consolidar o padrão global de UX operacional, estrutura de edição, persistência ativa e integração com fluxos de trabalho.

## 📐 Regras de UX
- **Interface Direta**: Expor campos de forma clara e visível.
- **Objetividade Máxima**: Textos curtos e diretos, priorizando a velocidade de preenchimento.
- **Sem Narrativa Industrial**: Evitar animações textuais bloqueantes (como `TypedText`) como padrão.
- **Agrupamento Lógico**: Seções claras para dividir blocos de dados.
- **CTA de Salvar**: Botão final previsível de gravação/conclusão.

## 🛠️ Regras de Comportamento
- **Estados de Uso**: Deve suportar nativamente os modos `create`, `edit` e `view`.
- **Edição Flexível**: A política de edição é definida pela regra de negócio do fluxo, não pelo motor.
- **Ciclo de Vida**: O dado nasce no form e evolui através de workflows subsequentes.
- **Status do Registro**: Distinguir entre rascunho, enviado, atualizado ou arquivado.

## 💾 Persistência e Governança
- **Modelagem por Domínio**: Armazenar dados em locais operacionais (ex: `User/{matricula}/Forms/{formKey}` ou `Operations/{domain}/records/{recordId}`).
- **Snapshot Ativo**: O registro deve ser pensado para consulta e atualização contínua.
- **Espelhamento**: Sincronização obrigatória Firestore/Google Drive conforme governança.

## 📊 Gestão Operacional
- **Admin Focado**: Painéis de gestão devem permitir busca, filtros, alteração de status e disparos de processos.
- **Diferenciação**: Forms não são apenas listas de respostas; são registros em movimento.

---
*Este documento é a referência oficial para qualquer nova implementação de Form no projeto. Nenhuma tela de coleta operacional deve nascer sem aderência a estes princípios.*
