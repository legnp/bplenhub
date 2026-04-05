---
description: Como buscar o User_Nickname do usuário no Firestore
---

# Regra Global: Extração do User_Nickname (v2.0 🧬)

Sempre que for necessário buscar o nome/apelido do usuário no projeto BPlen HUB, seguir obrigatoriamente esta rota de 2 passos (Soberania de Dados):

## Caminho no Firestore

```
_AuthMap/{userId} → matricula → User/{matricula} → User_Nickname (Raiz)
```

## Passos Detalhados

1. **Buscar a matrícula** na coleção `_AuthMap` usando o `userId` (UID do Firebase Auth):
   ```ts
   const uidMapRef = doc(db, "_AuthMap", userId);
   const uidMapSnap = await getDoc(uidMapRef);
   const matricula = uidMapSnap.data().matricula;
   ```

2. **Buscar o documento do usuário** na coleção `User` usando a matrícula como ID do documento:
   ```ts
   const userRef = doc(db, "User", matricula);
   const userSnap = await getDoc(userRef);
   ```

3. **Extrair o nickname** com os fallbacks corretos (Priorizando Raiz):
   ```ts
   const d = userSnap.data();
   const nickname = d.User_Nickname || d.User_Welcome?.User_Nickname || d.Authentication_Name || d.User_Name || "Membro BPlen";
   ```

## Ordem de Prioridade dos Fallbacks (Soberania)

| Prioridade | Campo                              | Localização        | Motivo                              |
|------------|------------------------------------|--------------------|-------------------------------------|
| 1          | `User_Nickname`                    | Raiz do documento  | **Padrão Atual (Hardening)**        |
| 2          | `User_Welcome.User_Nickname`       | Map aninhado       | Compatibilidade Legada (Pesquisa)   |
| 3          | `Authentication_Name`              | Raiz do documento  | Nome vindo do Google/E-mail        |
| 4          | `User_Name`                        | Raiz do documento  | Fallback de Importação             |
| 5          | `"Membro BPlen"`                   | Fallback genérico  | Garantia contra campos vazios      |

## Regras de Governança

- **PRIORIDADE MÁXIMA**: O campo `User_Nickname` na raiz do documento é o "Estado da Arte" do projeto.
- **LEGADO**: O campo `User_Welcome` (Map) ainda existe para usuários antigos, mas deve ser usado apenas como 2º fallback.
- **SINCRONIA**: Essa mesma lógica deve ser aplicada em: e-mails (Resend), dashboards, cards de agendamento, e qualquer outro ponto que exiba o nome do usuário.
