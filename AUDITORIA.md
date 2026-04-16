# BPlen HUB — Protocolo de Auditoria Técnica 🔬

Este documento formaliza o protocolo de auditoria completa do ecossistema BPlen HUB.
Utilize-o como prompt para solicitar uma análise profunda do projeto a qualquer agente de IA.

---

## Instrução de Auditoria

Analise **todo o projeto** sob os seguintes eixos:

### 1. Governança & Conformidade
- Alinhamento com as regras de governança documentadas (`GOVERNANCE.md`, `FORMS_GLOBAL.md`, `SURVEY_GLOBAL.md`)
- Aderência à **Política Zero-Any** (TypeScript)
- Conformidade do pipeline de qualidade (`npm run check`: lint, test, type-check, build)
- Classificação correta de ativos (Survey vs Form vs Hybrid)

### 2. Segurança
- Proteção de rotas (middleware, guards, cookies, tokens)
- Firestore Security Rules e modelo de acesso (dono da matrícula)
- Gestão de segredos e variáveis de ambiente (Sensor Zod)
- Headers HTTP de segurança (CSP, HSTS, X-Frame-Options)
- Rate limiting e proteção contra abuso
- Sanitização de inputs e prevenção de XSS/Injection

### 3. Design System & Arquitetura de UI
- Consistência do Design System Glassmorphism v3.1 entre temas
- Contraste mínimo 4.5:1 (WCAG AA) em todos os modos
- Responsividade e adaptação mobile
- Uso correto de componentes reutilizáveis vs código ad-hoc
- Otimização de imagens e assets

### 4. Arquitetura de Software
- Separação de responsabilidades (Server Actions, Client Components, Shared Libs)
- Tamanho e coesão dos módulos (identificar God Files)
- Duplicação de lógica entre arquivos
- Padrão de tipagem e contratos de interface
- Error handling e resiliência (Error Boundaries, fallbacks)

### 5. Infraestrutura & Escalabilidade
- Configuração do `next.config.ts` (otimizações, headers, imagens)
- Cold start e bundle size das Server Actions
- Caching e memoização (React, Firestore)
- Estratégia de deploy (Vercel) e limites de plano

### 6. Performance
- Core Web Vitals (LCP, FID, CLS)
- Bloqueios de renderização (AuthProvider, loading gates)
- Lazy loading e code splitting
- Overhead de animações CSS/Framer Motion

### 7. Responsividade Mobile
- Breakpoints e media queries: cobertura consistente (sm, md, lg, xl)
- Touch targets mínimos de 44×44px (padrão Apple/Google)
- Navegação mobile: menus, drawers, gestos — funcionalidade plena sem mouse
- Tipografia e espaçamento: escala legível em telas ≤375px
- Viewport meta tag e comportamento de zoom
- Elementos `position: fixed` e sobreposições em telas pequenas
- Tabelas, formulários e modais: adaptação a larguras estreitas
- Teste em orientação paisagem (landscape)
- Preparação para PWA (manifest, service worker, ícones)

---

## Formato de Saída Esperado

### Pontos Fortes
- Liste os aspectos positivos que devem ser mantidos e reforçados.

### Pontos Fracos
- Liste as deficiências identificadas em cada eixo.

### Top Criticidades
Para cada criticidade, forneça:

- **Descrição**: O que está errado e onde (com referência a arquivos)
- **Impacto**: Consequências reais se não corrigido
- **3 Propostas de Correção**, cada uma avaliada com:

| Critério | Escala |
|---|---|
| **Complexidade de Implementação** | 🟢 Baixa · 🟡 Média · 🔴 Alta |
| **Grau de Risco de Implementação** | 🟢 Baixo · 🟡 Médio · 🔴 Alto |
| **Benefícios Reais Pós-Implementação** | Descrição concreta do ganho |

### Plano de Ação
- Organize as correções em ondas priorizadas por severidade e Quick Wins.

---

*Este protocolo deve ser executado periodicamente ou antes de grandes releases.*
