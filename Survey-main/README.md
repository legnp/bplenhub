# LENS Partner Survey System

Este é um sistema de cadastro de clientes moderno e elegante, desenvolvido com foco em experiência do usuário (UX nível Disney).

## ✨ Funcionalidades

- **Boas-vindas Personalizada**: Interface dinâmica com animação de digitação que captura o nome do usuário.
- **Segurança de Acesso**: Bloqueio por código de segurança para garantir que apenas pessoas autorizadas respondam.
- **Prevenção de Duplicidade**: O sistema verifica em tempo real se o nome completo já existe no banco de dados para evitar cadastros repetidos.
- **Exportação para Excel**: Todas as respostas são salvas automaticamente em um arquivo `database.xlsx`.
- **Integração IBGE**: Busca automática de Estados e Cidades brasileiras via API oficial.

## 🚀 Como Executar

1. **Instale as dependências**:
   ```bash
   npm install
   ```
2. **Inicie o servidor**:
   ```bash
   npm start
   ```
3. **Acesse o formulário**:
   Abra o arquivo `index.html` no seu navegador.

## 🛠️ Tecnologias
- Node.js + Express
- SheetJS (XLSX)
- Vanilla CSS + JS (Glassmorphism design)
- IBGE Localidades API
