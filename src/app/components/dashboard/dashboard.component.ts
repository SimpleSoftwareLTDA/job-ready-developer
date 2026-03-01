import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CompetencyService } from '../../services/competency.service';
import { AuthService } from '../../services/auth.service';
import { Competency } from '../../models/competency.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <div class="dash-header">
        <div class="dash-header-text">
          <h1>Olá, {{ auth.userDisplayName() }} 👋</h1>
          <p>Acompanhe sua jornada rumo ao mercado de trabalho</p>
        </div>
        <a routerLink="/" class="btn-secondary">← Voltar ao Mapa</a>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card main-stat">
          <div class="stat-label">Progresso Geral</div>
          <div class="stat-value">{{ overallPct() }}%</div>
          <div class="progress-bar-wrap">
            <div class="progress-bar" [style.width.%]="overallPct()"></div>
          </div>
          <div class="stat-sub">{{ completedCount() }} / {{ totalCount() }} tópicos concluídos</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Tópicos Completos</div>
          <div class="stat-value highlight">{{ completedCount() }}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Restantes</div>
          <div class="stat-value">{{ totalCount() - completedCount() }}</div>
        </div>
      </div>

      <!-- Progresso por Área -->
      <section class="areas-section">
        <h2>Progresso por Área</h2>
        <div class="areas-grid">
          @for (area of areas(); track area.id) {
            <div class="area-card" [style.border-color]="area.color">
              <div class="area-header">
                <span class="area-icon">{{ area.icon }}</span>
                <span class="area-name">{{ area.name }}</span>
                <span class="area-pct" [style.color]="area.color">{{ area.pct }}%</span>
              </div>
              <div class="progress-bar-wrap thin">
                <div class="progress-bar" [style.width.%]="area.pct" [style.background]="area.color"></div>
              </div>
              <div class="area-topics">
                @for (topic of area.topics; track topic.id) {
                  <div
                    class="topic-chip"
                    [class.done]="progress().has(topic.id)"
                    [class.locked]="isLocked(topic.id)"
                    (click)="toggleProgress(topic.id)">
                    {{ topic.icon }} {{ topic.name }}
                    @if (progress().has(topic.id)) { <span class="chip-check">✓</span> }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Próximos Passos -->
      <section class="next-steps">
        <h2>📌 Próximos Passos Sugeridos</h2>
        <div class="steps-list">
          @for (step of nextSteps(); track step.id) {
            <a routerLink="/" class="step-card" [style.border-color]="step.color">
              <span class="step-icon">{{ step.icon }}</span>
              <div class="step-info">
                <div class="step-name">{{ step.name }}</div>
                <div class="step-desc">{{ step.description }}</div>
              </div>
              <span class="step-arrow">→</span>
            </a>
          }
          @if (nextSteps().length === 0) {
            <div class="all-done">🎉 Parabéns! Você completou todos os tópicos do mapa!</div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    h1 { font-size: 1.8rem; font-weight: 800; margin: 0 0 0.25rem; color: var(--text-primary); }
    .dash-header p { color: var(--text-secondary); margin: 0; }

    .btn-secondary {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.85rem;
      transition: all 0.2s;
      white-space: nowrap;
      &:hover { border-color: var(--text-primary); color: var(--text-primary); }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
    }

    .stat-card {
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.5rem;
    }

    .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem; }
    .stat-value { font-size: 2.5rem; font-weight: 800; color: var(--text-primary); line-height: 1; margin-bottom: 0.75rem; }
    .stat-value.highlight { background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .stat-sub { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem; }

    .progress-bar-wrap {
      background: var(--border);
      border-radius: 999px;
      overflow: hidden;
      height: 8px;
      &.thin { height: 4px; }
    }

    .progress-bar {
      height: 100%;
      background: var(--gradient);
      border-radius: 999px;
      transition: width 0.8s ease;
    }

    h2 { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 1rem; }

    .areas-section { margin-bottom: 2.5rem; }

    .areas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .area-card {
      background: var(--panel-bg);
      border: 1px solid;
      border-opacity: 0.3;
      border-radius: 14px;
      padding: 1.25rem;
    }

    .area-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .area-icon { font-size: 1.2rem; }
    .area-name { flex: 1; font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
    .area-pct { font-weight: 800; font-size: 1rem; }

    .area-topics { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.75rem; }

    .topic-chip {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.15s;
      user-select: none;
      &:hover { border-color: var(--text-muted); color: var(--text-primary); }
      &.done { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.4); color: #10b981; }
      &.locked { opacity: 0.5; background: rgba(239, 68, 68, 0.05); cursor: not-allowed; }
      &.locked:hover { border-color: var(--border); color: var(--text-secondary); }
    }

    .chip-check { font-weight: 700; }

    .next-steps h2 { margin-bottom: 1rem; }

    .steps-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .step-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: var(--panel-bg);
      border: 1px solid;
      border-radius: 12px;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.2s;
      &:hover { transform: translateX(6px); }
    }

    .step-icon { font-size: 1.5rem; }
    .step-info { flex: 1; }
    .step-name { font-weight: 600; font-size: 0.95rem; }
    .step-desc { color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.15rem; }
    .step-arrow { color: var(--text-muted); font-size: 1.2rem; }

    .all-done {
      text-align: center;
      padding: 3rem;
      color: #10b981;
      font-size: 1.2rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 14px;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private competencyService = inject(CompetencyService);

  progress = signal<Set<string>>(new Set());
  private map = signal<Competency | null>(null);
  private sub = new Subscription();

  totalCount = computed(() => {
    const m = this.map();
    return m ? this.competencyService.getTotalCount(m) : 0;
  });

  completedCount = computed(() => {
    const m = this.map();
    if (!m) return 0;
    const all = this.competencyService.flattenCompetencies(m).filter(n => n.id !== 'root');
    return all.filter(n => this.progress().has(n.id)).length;
  });

  overallPct = computed(() => {
    const m = this.map();
    return m ? this.competencyService.getCompletionPercentage(m, this.progress()) : 0;
  });

  areas = computed(() => {
    const m = this.map();
    if (!m?.children) return [];
    return m.children.map(area => {
      const topics = this.competencyService.flattenCompetencies(area).filter(n => n.id !== area.id);
      const done = topics.filter(t => this.progress().has(t.id)).length;
      const pct = topics.length ? Math.round((done / topics.length) * 100) : 0;
      return { ...area, topics, pct };
    });
  });

  nextSteps = computed(() => {
    const m = this.map();
    if (!m) return [];
    const all = this.competencyService.flattenCompetencies(m).filter(n => n.id !== 'root');
    // Mostra apenas tópicos não concluídos E não bloqueados
    return all.filter(n => !this.progress().has(n.id) && !this.competencyService.isLocked(n.id, this.progress(), m)).slice(0, 5);
  });

  ngOnInit(): void {
    this.sub.add(this.competencyService.map$.subscribe(m => this.map.set(m)));
    this.sub.add(this.competencyService.progress$.subscribe(p => this.progress.set(p)));
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  isLocked(id: string): boolean {
    const m = this.map();
    return m ? this.competencyService.isLocked(id, this.progress(), m) : false;
  }

  async toggleProgress(id: string): Promise<void> {
    if (this.isLocked(id)) return;
    await this.competencyService.toggleProgress(id);
  }
}
