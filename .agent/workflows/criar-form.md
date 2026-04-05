---
description: Template para criação de novos Formulários (Forms) no BPlen HUB
---

# 📋 Roteiro de Novo Formulário (Form)

Focado em processos operacionais, coleta de dados brutos e sincronização com Google Sheets.

## 1. Identificação Core
- **ID do Form**: (ex: booking_external)
- **Título Visual**: (ex: Solicitação de Mentoria)
- **Workflow**: (ex: INSTITUCIONAL, TESTE, HUB)

## 2. Estrutura de Perguntas (Passo a Passo)
Descreva as perguntas, opções e o tipo de campo (Múltipla Escolha, Texto, Escala 0-10, etc).
> *Exemplo: Passo 1: "Qual sua nota para o mentor?" (Escala 0-10)*

---
(ESCREVA SEU ROTEIRO AQUI)
---

## 3. Lógica de Integração (Drive & Sheets)
O que deve acontecer **após** o usuário clicar em enviar? 
- **Prefixo da Planilha**: (ex: Booking_Mentoria)
- **Pasta no Drive**: (ex: Mentoria_1to1)
- **Efeitos Colaterais (Side-Effects)**: Alguma mudança no Firestore? (Ex: Criar agendamento pendente).

## 4. Instruções Adicionais
(Alguma regra visual específica? Algum redirecionamento customizado após o fim?)
