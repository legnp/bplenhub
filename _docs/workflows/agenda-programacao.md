# Workflow: Gestão de Agenda e Programação 🛰️

Este documento descreve o fluxo de dados entre o Google Calendar, o Firestore e o Front-end do BPlen HUB, com foco na arquitetura de alta performance 'Datas_Center'.

## 🏗️ Arquitetura de Dados
O sistema utiliza uma estrutura de **Duas Camadas** para garantir integridade e velocidade:
- **Banco A (Fonte da Verdade)**: Coleção `Calendar_Events`. Contém os dados brutos e subcoleções de participantes (`attendees`).
- **Banco B (Registro Global)**: Documento `Datas_Center/Programacao_Registry`. Um snapshot consolidado (Materialized View) para leitura instantânea no Admin.

---

## 🔄 Ciclo de Vida do Workflow

### 1. Criação e Origem
- **Ação**: Criação de eventos, definição de horários e mentores.
- **Responsável**: Humano (Manual).
- **Ferramenta**: Google Calendar.

### 2. Sincronização e Ingestão
- **Ação**: Importação dos dados do Google para o HUB.
- **Responsável**: Admin (Manual via botão "Sincronizar").
- **Ferramenta**: Server Action `getSyncedEvents`.
- **Efeito**: Popula o Banco A e dispara a atualização do Banco B.

### 3. Distribuição e Snapshot (Automático)
- **Ação**: Consolidação de métricas (vagas, presenças, NPS).
- **Processo**: Script interno percorre o Banco A e gera o snapshot no Banco B.
- **Trigger**: Sempre disparado ao final de um Sync ou alteração transacional.

### 4. Gestão de Operação (Real-time)
- **Ação**: Agendar, Reagendar, Cancelar ou Avaliar eventos.
- **Responsável**: Membro ou Admin.
- **Impacto**: Atualiza o Banco A e dispara imediatamente um "Incremental Update" no Banco B para manter o dashboard sincronizado.

### 5. Consumo e Fechamento
- **Resumo de Programação**: Consulta exclusiva ao **Banco B** (Snapshot), garantindo carga em milissegundos.
- **Fechamento de Evento**: Registro de presença no **Banco A** + atualização automática das métricas no **Banco B**.

---

## 🛠️ Manutenção e Auditoria
### O "Big Heal" (Cura)
Caso haja divergência entre o Banco A e o Banco B, o sistema possui um mecanismo de reconstrução retroativa.
- **Ferramenta**: Botão "Recalcular Métricas" no Admin HUB.
- **Ação**: `healProgramacaoMasterAction`.
- **Uso**: Recomendado após grandes migrações de dados ou detecção de inconsistências nas métricas do resumo.

---
*Última atualização: 11/04/2026*
