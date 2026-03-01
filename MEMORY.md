# Memória de Longo Prazo (Job Ready Developer)

## Regras de Engenharia Arquitetural (Angular Moderna)
As seguintes diretrizes devem ser aplicadas estritamente em qualquer novo código, conforme exigido em `AGENTS.md` e estabelecidas como melhores práticas:

### TypeScript & Padrões
- Evitar `any`, usar `unknown`. O TS deve ser estrito.
- Inferência implícita de tipos onde for óbvio.

### Componentização Angular
- **NÃO** utilizar `standalone: true` explicitamente nos decorators em novas refatorações (padrão implícito).
- Uso obrigatório de `ChangeDetectionStrategy.OnPush`.
- Utilizar as Signal Functions `input()` e `output()` ao invés de `@Input()`/`@Output()`.
- Usar objetos `host` dentro do `@Component` ao invés de `@HostBinding` ou `@HostListener`.
- Templates inline para pequenos componentes. Referências externas de template e estilos devem usar caminho relativo ao arquivo TS.
- Não usar os pipes `ngClass` ou `ngStyle`, usar bindings nativos como `[class]` e `[style]`.

### Estados e Sinais (Signals)
- Manipular estados via `set` ou `update` nos Signals. Jamais utilizar `mutate`.
- Estados derivados estritos via `computed()`.

### Imagens & Acessibilidade
- Sempre utilizar `NgOptimizedImage` para assets estáticos.
- Nenhuma imagem base64 no `NgOptimizedImage`.
- Acesso total: Passar checks da AXE e mínimos WCAG AA (focus, ARIA, contraste).

### Serviços
- `inject()` é a única maneira autorizada de injetar dependência. Nunca via construtor.
- Serviços devem ter Single Responsibility e `providedIn: 'root'`.

### Templates
- Utilizar rigorosamente a nova sintaxe de Control Flow (`@if`, `@for`, `@switch`).
- Tratamento de Promises ou Observables no template sempre geridos via `async` pipe.
- Não acessar ou presumir existência de instâncias globais nativas como `new Date()` ou `window` diretamente do lado do HTML.
