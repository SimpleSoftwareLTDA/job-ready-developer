# AGENTS.md — Job Ready Developer

Guia completo para que qualquer agente de IA (ou desenvolvedor) possa dar continuidade a este projeto com o máximo de contexto e qualidade.

---

## 1. Visão do Produto

### O que é
**Job Ready Developer** é uma plataforma educacional interativa que mapeia todo o conhecimento necessário para um desenvolvedor backend se tornar pronto para o mercado de trabalho. O conteúdo abrange: Fundamentos de Ciência da Computação, Redes, Banco de Dados, Linux, DevOps e Cloud.
Esse conteúdo é baseado em evidências, dados e provas extraídas através de entrevistas reais de vários candidatos e várias tecnologias de STEC ao longo de cinco anos. Além disso, esse conteúdo também deriva da experiência prática profissional de Robson Cassiano, que é um desenvolvedor experiente no mercado de trabalho nacional e internacional. 

### Conceito central
A visualização é baseada nos **Círculos de Competência de Charlie Munger**: círculos menores estão contidos em círculos maiores, representando hierarquia de conhecimento. Ex: `Docker ⊂ DevOps ⊂ Linux ⊂ Cloud`. O objetivo é que o aluno enxergue todo o conhecimento como um universo unificado e coeso.

### Nome do treinamento associado
O projeto foi criado no contexto do treinamento **"Fábrica de Programadores"** (PT) / **"Job Ready Developer"** (EN). Manter essa identidade nas comunicações com o aluno.

### Público-alvo
Programadores **iniciantes** buscando sua primeira vaga no mercado. A linguagem deve ser acessível, encorajadora e focada em resultado prático.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Angular | 17+ |
| Estilo de componentes | Standalone Components | obrigatório |
| Reatividade | Signals + `effect()` | preferir sobre RxJS quando possível |
| Visualização | D3.js Circle Packing | v7 |
| Autenticação | Firebase Auth — Google Sign-In | via `@angular/fire` |
| Banco de dados | Firestore (NoSQL, tempo real) | via `@angular/fire` |
| Hospedagem | Firebase Hosting | — |
| Estilos | SCSS com CSS Variables | sem CSS-in-JS |
| Tipografia | Space Grotesk (display) + JetBrains Mono (código) | Google Fonts |

**Proibido introduzir sem alinhamento prévio:** NgRx, Angular Material, PrimeNG, Tailwind, React, Vue, qualquer outro framework CSS utilitário.

---

## 3. Arquitetura do Projeto

```
src/
├── environments/
│   └── environment.ts              ← credenciais Firebase + adminUid
├── styles.scss                     ← design system global (CSS variables)
└── app/
    ├── app.component.ts            ← Navbar global + effect de progresso
    ├── app.config.ts               ← providers Firebase + router
    ├── app.routes.ts               ← rotas com lazy loading
    ├── models/
    │   └── competency.model.ts     ← tipos + DEFAULT_COMPETENCY_MAP
    ├── services/
    │   ├── auth.service.ts         ← login, logout, isAdmin, currentUser
    │   └── competency.service.ts   ← mapa, progresso, CRUD Firestore
    ├── guards/
    │   └── auth.guard.ts           ← authGuard + adminGuard
    └── components/
        ├── map/                    ← rota /  — visualização D3
        ├── auth/                   ← rota /login
        ├── dashboard/              ← rota /dashboard (requer authGuard)
        └── admin/                  ← rota /admin (requer adminGuard)
```

### As 3 visões e suas responsabilidades

| Rota | Visão | Guard | Descrição |
|---|---|---|---|
| `/` | Pública (read-only) | nenhum | Mapa D3, painel de detalhes, link de login |
| `/dashboard` | Aluno | `authGuard` | Progresso geral, por área, marcar tópicos |
| `/admin` | Administrador | `authGuard` + `adminGuard` | Editar links/recursos de cada competência |

---

## 4. Modelo de Dados

### Estrutura de uma Competency
```typescript
interface Competency {
  id: string;          // snake_case, único, sem espaços
  name: string;        // nome exibido na UI
  description: string; // frase curta, máx ~100 chars
  color: string;       // hex — tom escuro/saturado (fundo dark)
  icon: string;        // 1 emoji
  resources: Resource[];
  children?: Competency[]; // sub-competências
  value?: number;      // peso visual no D3 (1–5), só em folhas
}

interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'docs';
  language: 'pt' | 'en';
}
```

### Firestore — coleções

```
config/competency-map         ← árvore completa (único documento)
users/{uid}/data/progress     ← { completedIds: string[] }
```

### Regras de segurança (firestore.rules)
- `config/competency-map`: leitura pública, escrita apenas pelo `adminUid`
- `users/{uid}/data/*`: leitura e escrita somente pelo próprio usuário autenticado

---

## 5. Diretrizes Angular — Obrigatórias

### 5.1 Sempre usar Standalone Components
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  // ...
})
```
Nunca usar `NgModule`. O projeto não tem nenhum `app.module.ts`.

### 5.2 Signals para estado local
```typescript
// ✅ correto
const count = signal(0);
const double = computed(() => count() * 2);

// ❌ evitar para estado local simples
count$ = new BehaviorSubject(0);
```
Usar RxJS (`Observable`, `BehaviorSubject`) apenas para fluxos assíncronos de serviços (Firestore `onSnapshot`, `combineLatest`, etc).

### 5.3 `@for` — regras do Angular 17+
```html
<!-- ✅ correto -->
@for (item of list; track item.id) { }
@for (item of list; track item; let i = $index) { }

<!-- ❌ ERRO de compilação -->
@for (item of list; track $index) { }
```
O `track` **nunca** aceita `$index`. Sempre rastrear por propriedade única do objeto (`item.id`, `item.url`, etc) ou pelo próprio `item`.

### 5.4 `@if` / `@else` — nova sintaxe
```html
@if (condition) {
  <div>A</div>
} @else {
  <div>B</div>
}
```
Nunca usar `*ngIf` — o projeto usa a nova sintaxe de controle de fluxo.

### 5.5 Lazy loading obrigatório nas rotas
```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./components/dashboard/dashboard.component')
    .then(m => m.DashboardComponent)
}
```
Nunca importar componentes de página diretamente no `app.routes.ts`.

### 5.6 `effect()` para reações a Signals
```typescript
// No constructor ou em ngOnInit
effect(() => {
  const user = this.auth.currentUser(); // Signal
  if (user) this.loadData(user.uid);
});
```

### 5.7 `toSignal()` para converter Observables
```typescript
// Em services ou components
readonly currentUser = toSignal(user(this.auth));
```

### 5.8 `inject()` ao invés de constructor injection
```typescript
// ✅ moderno
private auth = inject(AuthService);

// ❌ evitar (ainda funciona, mas não é o padrão do projeto)
constructor(private auth: AuthService) {}
```

### 5.9 Subscriptions — sempre desinscrever
```typescript
private sub = new Subscription();

ngOnInit() {
  this.sub.add(this.service.data$.subscribe(...));
}

ngOnDestroy() {
  this.sub.unsubscribe();
}
```

### 5.10 Tipagem estrita — sem `any`
O `tsconfig.json` tem `"strict": true`. Nunca usar `any` implícito. Em casos de tipos desconhecidos, preferir `unknown` com type guard.

---

## 6. Diretrizes de Design

### 6.1 Design system — CSS Variables globais
Todas as cores e tokens estão em `src/styles.scss`. **Nunca** usar valores hardcoded de cor nos components; sempre referenciar as variáveis:

```scss
// Fundos
--bg              // fundo da página
--panel-bg        // cards e painéis
--card-bg         // cards internos
--border          // bordas e divisores

// Texto
--text-primary    // título, destaque
--text-secondary  // corpo de texto
--text-muted      // hints, labels pequenos

// Acento
--accent          // indigo #6366f1
--accent-gold     // dourado #fbbf24 (Munger/destaque)
--danger          // vermelho #ef4444

// Gradiente principal
--gradient        // indigo → violet → cyan
```

### 6.2 Tema escuro obrigatório
O projeto é **dark-only**. Não implementar light mode sem alinhamento com o dono do projeto.

### 6.3 Tipografia
- Títulos e UI: `Space Grotesk` (importado via Google Fonts no `styles.scss`)
- Código e monospace: `JetBrains Mono`
- Nunca usar `Inter`, `Roboto`, `Arial` ou fontes do sistema

### 6.4 Animações
- Entrada de páginas: `fadeInUp` definido globalmente em `styles.scss`
- Transições de rota: `withViewTransitions()` já configurado no `app.config.ts`
- D3: transições de `width` no progress bar com `transition: width 0.8s ease`
- Painel lateral: `slideIn` via `@keyframes` no próprio component

### 6.5 Componentes — estilos encapsulados
Cada component tem seus estilos no array `styles: []`. Só o design system (tokens, reset, fontes, animações globais) vai em `styles.scss`.

---

## 7. Diretrizes Firebase

### 7.1 Credenciais
Ficam **exclusivamente** em `src/environments/environment.ts`. Nunca hardcodar credenciais Firebase em components ou services.

### 7.2 adminUid
O controle de admin é feito via `environment.adminUid` comparado com `Auth.currentUser.uid`. É simples e funciona para um único admin. Se precisar de múltiplos admins no futuro, migrar para Firestore Custom Claims.

### 7.3 Escrita no Firestore — sempre via `CompetencyService`
Nenhum component deve importar `Firestore` diretamente. Todo acesso ao banco passa pelos services.

### 7.4 `onSnapshot` — tempo real
O mapa de competências e o progresso do aluno usam `onSnapshot` para atualização em tempo real. Alterações feitas pelo admin no painel refletem imediatamente para todos os alunos conectados.

### 7.5 Estrutura do mapa — documento único
O mapa inteiro é salvo como **um único documento** em `config/competency-map`. Isso simplifica leitura e escrita. Se o mapa crescer demais (>500 competências), avaliar sharding por área.

---

## 8. Adicionando Conteúdo ao Mapa

Para adicionar novas competências, edite `src/app/models/competency.model.ts`:

```typescript
{
  id: 'kubernetes',           // único, snake_case
  name: 'Kubernetes',
  description: 'Orquestração de containers em produção',
  color: '#1e3a8a',           // tom escuro, legível em dark theme
  icon: '☸️',
  value: 3,                   // tamanho no D3 (apenas em folhas)
  resources: [
    {
      title: 'Kubernetes para Iniciantes',
      url: 'https://...',
      type: 'video',          // video | course | article | docs
      language: 'pt'          // pt | en
    }
  ],
  children: []                // sub-competências, se houver
}
```

**Onde encaixar:** sempre dentro do `children` de uma competência existente. A raiz (`root`) nunca deve ser modificada diretamente — apenas seus `children` de primeiro nível (áreas principais).

**Hierarquia atual das áreas:**
- `cs-fundamentals` → algoritmos, lógica, sistemas numéricos
- `networking` → TCP/IP, HTTP/REST, DNS
- `databases` → SQL, NoSQL, design/performance
- `os-linux` → linux, shell, devops (docker, git)
- `cloud` → conceitos, AWS, serverless
- `backend-dev` → Python, API design, segurança

---

## 9. Erros Conhecidos e Soluções

| Erro | Causa | Solução |
|---|---|---|
| `NG8009: Cannot access '$index' inside of a track expression` | Usar `$index` no `track` do `@for` | Usar `track item` ou `track item.id` |
| `FirebaseError: Missing or insufficient permissions` | Regras do Firestore não configuradas | Publicar `firestore.rules` com o UID correto |
| `Google Sign-In blocked` | Domínio não autorizado no Firebase Auth | Firebase Console → Auth → Domínios autorizados → adicionar o domínio |
| `No provider for Firestore` | Firebase não inicializado no `app.config.ts` | Verificar `provideFirestore(() => getFirestore())` |
| Círculos D3 não renderizando | Container sem largura no momento do render | Garantir que `container.clientWidth > 0` antes de renderizar; usar `HostListener('window:resize')` |

---

## 10. Fluxo de Desenvolvimento

### Rodar localmente
```bash
npm install
bun install
bun start
# http://localhost:4200
```

### Build de produção
```bash
ng build
bun run build
# output: dist/job-ready-developer/browser/
```

### Deploy completo
```bash
npm run deploy
bun run deploy
# equivale a: bun run build && firebase deploy
```

### Verificar antes de qualquer PR/commit
- [ ] `bun run build` sem erros
- [ ] Nenhum `any` introduzido
- [ ] `@for` usando `track` correto (nunca `$index` no track)
- [ ] Novos components são `standalone: true`
- [ ] Credenciais não estão hardcoded
- [ ] CSS usa variáveis do design system

---

## 11. Decisões de Arquitetura Registradas

| Decisão | Motivo |
|---|---|
| Firebase ao invés de backend próprio | Máximo de frontend, sem custo de servidor, tempo real nativo |
| Firestore ao invés de Realtime Database | Melhor suporte a queries, estrutura de documentos mais flexível |
| Mapa em documento único no Firestore | Simplicidade de leitura/escrita; o mapa raramente ultrapassa 1MB |
| D3 Circle Packing ao invés de mapa mental | Representa visualmente a hierarquia de contenção (conceito Munger) |
| adminUid em `environment.ts` ao invés de Custom Claims | Suficiente para um admin; evita Cloud Functions |
| Signals ao invés de NgRx | Menor complexidade; NgRx seria overkill para o escopo atual |
| SCSS com CSS Variables ao invés de Tailwind | Controle total do design system; evita dependência de compilação |

---

## 12. Contexto do Criador

- **Dono do projeto:** Robson (Ubatuba, SP, BR)
- **Treinamento:** Fábrica de Programadores
- **Idioma da UI:** Português brasileiro
- **Idioma dos recursos:** Mistos (PT e EN), sempre indicados na interface
- **Perfil dos alunos:** Iniciantes absolutos em programação
- **Tom de voz:** Encorajador, direto, focado em resultado prático e mercado de trabalho

---

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection


*Este arquivo deve ser atualizado sempre que uma decisão de arquitetura relevante for tomada, um padrão for estabelecido ou um erro recorrente for identificado.*
