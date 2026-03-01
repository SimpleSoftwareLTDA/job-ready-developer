# 🚀 Job Ready Developer

Mapa interativo de competências para desenvolvedores backend — baseado no conceito de **Círculos de Competência** de Charlie Munger.

---

## 🏗️ Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 17+ (Standalone + Signals) |
| Visualização | D3.js Circle Packing |
| Autenticação | Firebase Auth (Google) |
| Banco de dados | Firestore (tempo real) |
| Hospedagem | Firebase Hosting |

---

## ⚙️ Setup em 10 Passos

### Passo 1 — Instale as dependências

```bash
bun install
```

### Passo 2 — Crie um projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Dê um nome (ex: `job-ready-developer`)
4. Desative o Google Analytics (opcional)
5. Clique em **"Criar projeto"**

### Passo 3 — Adicione um app Web

1. No dashboard do projeto, clique no ícone `</>`
2. Registre o app com o apelido **"Web"**
3. Copie as credenciais `firebaseConfig`

### Passo 4 — Configure as credenciais

Abra `src/environments/environment.ts` e substitua pelos seus valores:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIza...",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
  },
  adminUid: "" // Preencher no Passo 8
};
```

### Passo 5 — Ative o Firestore

1. No Firebase Console → **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de produção"**
4. Selecione a região (ex: `southamerica-east1`)

### Passo 6 — Ative a autenticação com Google

1. No Firebase Console → **Authentication**
2. Clique em **"Começar"**
3. Em **"Provedores de login"**, ative o **Google**
4. Configure o e-mail de suporte
5. Salve

### Passo 7 — Rode o app localmente

```bash
bun start
```

Abra [http://localhost:4200](http://localhost:4200)

### Passo 8 — Descubra seu UID de admin

1. Faça login na aplicação com sua conta Google
2. Abra o **DevTools → Console** do navegador
3. No Firebase Console → **Authentication → Users**
4. Copie seu **UID** (coluna User UID)
5. Cole em `src/environments/environment.ts`:
   ```typescript
   adminUid: "seu-uid-aqui"
   ```

### Passo 9 — Configure as regras do Firestore

1. Abra `firestore.rules`
2. Substitua `"SEU_UID_DE_ADMIN"` pelo seu UID
3. No Firebase Console → **Firestore → Regras**
4. Cole o conteúdo do arquivo e publique

### Passo 10 — Deploy para produção

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
bun run deploy
```

---

## 📁 Estrutura do Projeto

```
src/app/
├── models/
│   └── competency.model.ts      # Tipos + mapa de dados padrão
├── services/
│   ├── auth.service.ts          # Firebase Auth + Google Login
│   └── competency.service.ts   # Firestore CRUD + progresso
├── guards/
│   └── auth.guard.ts            # Proteção de rotas
├── components/
│   ├── map/                     # 🗺️ Visualização D3 (rota /)
│   ├── auth/                    # 🔐 Login (rota /login)
│   ├── dashboard/               # 📊 Progresso aluno (rota /dashboard)
│   └── admin/                   # ⚙️ Painel admin (rota /admin)
├── app.routes.ts
├── app.config.ts
└── app.component.ts             # Navbar global
```

---

## 🗺️ As 3 Visões

### 1. Mapa Público (`/`)
- Todos podem ver sem login
- Círculos D3 interativos
- Clique em qualquer círculo → painel com recursos de aprendizado

### 2. Dashboard do Aluno (`/dashboard`)
- Requer login com Google
- Progresso geral (%)
- Progresso por área
- Marcar tópicos como concluídos
- Próximos passos sugeridos

### 3. Painel Admin (`/admin`)
- Apenas você (UID configurado)
- Editar títulos e URLs dos recursos
- Adicionar/remover recursos
- Alterações salvas no Firestore e refletem **em tempo real** para todos

---

## 🧠 Adicionando Competências

Edite o arquivo `src/app/models/competency.model.ts`.

Estrutura de um nó:
```typescript
{
  id: 'minha-competencia',          // único, sem espaços
  name: 'Nome Exibido',
  description: 'Descrição curta',
  color: '#1e40af',                 // cor do círculo
  icon: '⚡',                       // emoji
  value: 3,                         // tamanho relativo no círculo (1-5)
  resources: [
    {
      title: 'Nome do Recurso',
      url: 'https://...',
      type: 'video',               // video | course | article | docs
      language: 'pt'              // pt | en
    }
  ],
  children: [ /* sub-competências */ ]
}
```

---

## 🔒 Segurança

- Mapa: leitura pública, escrita apenas pelo admin
- Progresso: cada aluno acessa apenas os próprios dados
- Admin: verificado por UID no client + regras no Firestore

---

Desenvolvido com ❤️ para seus alunos. Bons estudos! 🚀
