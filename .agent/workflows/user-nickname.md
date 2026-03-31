---
description: Como buscar o User_Nickname do usuário no Firestore
---

# Regra Global: Extração do User_Nickname

Sempre que for necessário buscar o nome/apelido do usuário no projeto BPlen HUB, seguir obrigatoriamente esta rota de 3 passos:

## Caminho no Firestore

```
_AuthMap/{userId} → matricula → User/{matricula} → User_Welcome (Map) → User_Nickname
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

3. **Extrair o nickname** do Map `User_Welcome` dentro do documento:
   ```ts
   const d = userSnap.data();
   const welcome = d.User_Welcome || {};
   const nickname = welcome.User_Nickname || welcome.Authentication_Name || d.User_Nickname || d.User_Name || "Membro BPlen";
   ```

## Ordem de Prioridade dos Fallbacks

| Prioridade | Campo                              | Localização        |
|------------|------------------------------------|--------------------|
| 1          | `User_Welcome.User_Nickname`       | Map aninhado       |
| 2          | `User_Welcome.Authentication_Name` | Map aninhado       |
| 3          | `User_Nickname`                    | Raiz do documento  |
| 4          | `User_Name`                        | Raiz do documento  |
| 5          | `"Membro BPlen"`                   | Fallback genérico  |

## Regras

- **NUNCA** acessar `User_Nickname` diretamente na raiz do documento sem antes verificar `User_Welcome.User_Nickname`.
- O campo `User_Welcome` é um **Map** (objeto aninhado) no Firestore, não um documento separado.
- Essa mesma lógica deve ser aplicada em: e-mails (Resend), dashboards, cards de agendamento, e qualquer outro ponto que exiba o nome do usuário.
