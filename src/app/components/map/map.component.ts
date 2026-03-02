import {
  Component, OnInit, OnDestroy, ElementRef, ViewChild,
  inject, signal, computed, HostListener, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as d3 from 'd3';
import { Subscription, combineLatest } from 'rxjs';
import { CompetencyService } from '../../services/competency.service';
import { AuthService } from '../../services/auth.service';
import { Competency, Resource } from '../../models/competency.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="map-container">
      <!-- Hero Header -->
      <header class="hero">
        <div class="hero-content">
          <div class="munger-badge">💡 Círculos de Competência — Charlie Munger</div>
          <h1>Seu Mapa para o Mercado de Trabalho</h1>
          <p>Cada círculo é uma área de conhecimento. Círculos maiores contêm os menores — o conhecimento cresce de dentro para fora. Clique em qualquer círculo para explorar.</p>
          @if (!auth.isLoggedIn()) {
            <a routerLink="/login" class="cta-btn">
              🗺️ Fazer Login para Acompanhar Progresso
            </a>
          } @else {
            <a routerLink="/dashboard" class="cta-btn secondary">
              📊 Ver Meu Progresso ({{ progressPct() }}%)
            </a>
          }
        </div>
      </header>

      <!-- Visualização D3 -->
      <div class="viz-wrapper">
        <div class="viz-legend">
          <span class="legend-item"><span class="dot cloud"></span> Cloud</span>
          <span class="legend-item"><span class="dot backend"></span> Backend</span>
          <span class="legend-item"><span class="dot db"></span> Banco de Dados</span>
          <span class="legend-item"><span class="dot net"></span> Redes</span>
          <span class="legend-item"><span class="dot os"></span> Linux / OS</span>
          <span class="legend-item"><span class="dot cs"></span> Fundamentos CS</span>
        </div>
        <div #chart class="chart-area"></div>
      </div>

      <!-- Painel lateral de detalhes -->
      @if (selected()) {
        <div class="detail-panel" [class.open]="!!selected()">
          <button class="close-btn" (click)="clearSelection()">✕</button>

          <div class="detail-header" [style.border-color]="selected()!.color">
            <span class="detail-icon">{{ selected()!.icon }}</span>
            <h2>{{ selected()!.name }}</h2>
          </div>

          <p class="detail-desc">{{ selected()!.description }}</p>

          @if (selected()!.resources.length > 0) {
            <div class="resources-section">
              <h3>📚 Recursos de Aprendizado</h3>
              <div class="resource-list">
                  @for (res of selected()!.resources; track $index) {
                    <a [href]="res.url" target="_blank" rel="noopener" class="resource-card">
                    <span class="res-type" [class]="res.type">{{ typeLabel(res.type) }}</span>
                    <span class="res-lang">{{ res.language.toUpperCase() }}</span>
                    <span class="res-title">{{ res.title }}</span>
                    <span class="res-arrow">→</span>
                  </a>
                }
              </div>
            </div>
          }

          @if (auth.isLoggedIn() && selected()!.id !== 'root') {
            @if (isLocked(selected()!.id)) {
              <div class="locked-warning">
                🔒 Bloqueado. Conclua os pré-requisitos primeiro.
              </div>
            } @else {
              <button
                class="progress-btn"
                [class.completed]="isCompleted(selected()!.id)"
                (click)="toggleProgress(selected()!.id)">
                {{ isCompleted(selected()!.id) ? '✅ Concluído' : '⬜ Marcar como Concluído' }}
              </button>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .map-container { min-height: calc(100vh - 64px); }

    .hero {
      text-align: center;
      padding: 3rem 2rem 2rem;
      background: radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
    }

    .hero-content { max-width: 700px; margin: 0 auto; }

    .munger-badge {
      display: inline-block;
      background: rgba(250, 190, 20, 0.12);
      border: 1px solid rgba(250, 190, 20, 0.3);
      color: #fbbf24;
      padding: 0.35rem 1rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
      letter-spacing: 0.05em;
    }

    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 1rem;
      line-height: 1.2;
    }

    .hero p {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    .cta-btn {
      display: inline-block;
      background: var(--gradient);
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }
      &.secondary { background: transparent; border: 2px solid var(--accent); color: var(--accent); box-shadow: none; }
    }

    .viz-wrapper {
      position: relative;
      padding: 1rem;
    }

    .viz-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .legend-item { display: flex; align-items: center; gap: 0.4rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot.cloud { background: #0369a1; }
    .dot.backend { background: #15803d; }
    .dot.db { background: #6d28d9; }
    .dot.net { background: #047857; }
    .dot.os { background: #9a3412; }
    .dot.cs { background: #1e40af; }

    .chart-area {
      width: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      cursor: pointer;
    }

    /* Detail Panel */
    .detail-panel {
      position: fixed;
      right: 0;
      top: 64px;
      bottom: 0;
      width: min(420px, 100vw);
      background: var(--panel-bg);
      border-left: 1px solid var(--border);
      padding: 2rem;
      overflow-y: auto;
      z-index: 50;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      &:hover { border-color: var(--text-primary); color: var(--text-primary); }
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid;
      padding-left: 1rem;
      margin-bottom: 1rem;
    }

    .detail-icon { font-size: 2rem; }
    h2 { margin: 0; font-size: 1.4rem; color: var(--text-primary); }

    .detail-desc {
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    .resources-section h3 { font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--text-primary); }

    .resource-list { display: flex; flex-direction: column; gap: 0.5rem; }

    .resource-card {
      display: grid;
      grid-template-columns: auto auto 1fr auto;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-primary);
      font-size: 0.85rem;
      transition: all 0.2s;
      &:hover { border-color: var(--accent); transform: translateX(4px); }
    }

    .res-type {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      &.video { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
      &.course { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
      &.article { background: rgba(16, 185, 129, 0.15); color: #10b981; }
      &.docs { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    }

    .res-lang {
      font-size: 0.65rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .res-title { flex: 1; }
    .res-arrow { color: var(--text-muted); }

    .progress-btn {
      margin-top: 1.5rem;
      width: 100%;
      padding: 0.875rem;
      border: 2px solid var(--border);
      background: transparent;
      color: var(--text-primary);
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: var(--accent); }
      &.completed {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
    }

    .locked-warning {
      margin-top: 1.5rem;
      padding: 0.875rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px dashed rgba(239, 68, 68, 0.4);
      color: #ef4444;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      text-align: center;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('chart', { static: true }) chartRef!: ElementRef;

  competencyService = inject(CompetencyService);
  auth = inject(AuthService);

  selected = signal<Competency | null>(null);

  private progress = signal<Set<string>>(new Set());
  private sub = new Subscription();

  progressPct = computed(() =>
    this.competencyService.getCompletionPercentage(
      this.competencyService['mapSubject'].value,
      this.progress()
    )
  );

  ngOnInit(): void {
    this.sub.add(
      combineLatest([
        this.competencyService.map$,
        this.competencyService.progress$
      ]).subscribe(([map, progress]) => {
        this.progress.set(progress);
        this.renderChart(map, progress);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    const map = this.competencyService['mapSubject'].value;
    const progress = this.competencyService['progressSubject'].value;
    this.renderChart(map, progress);
  }

  private renderChart(data: Competency, progress: Set<string>): void {
    const container = this.chartRef.nativeElement;
    container.innerHTML = '';

    const width = Math.min(container.clientWidth || 900, 900);
    const height = width;
    let focus: any;
    let view: [number, number, number];

    const root = d3.hierarchy(data)
      .sum(d => (d as Competency).value ?? (d.children ? 0 : 1))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<Competency>()
      .size([width, height])
      .padding(d => d.depth === 1 ? 25 : 12);

    const packed = pack(root);
    focus = packed;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `-${width / 2} -${height / 2} ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block')
      .style('max-width', '100%')
      .style('background', 'transparent')
      .style('cursor', 'pointer')
      .on('click', (event) => {
        zoom(event, packed);
        this.clearSelection();
      });

    // Defs: filtros e sombras
    const defs = svg.append('defs');
    defs.append('filter')
      .attr('id', 'glow')
      .html(`
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      `);

    const textHalo = (selection: any) => {
      selection
        .clone(true)
        .lower()
        .attr('aria-hidden', 'true')
        .attr('fill', 'none')
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 4)
        .attr('stroke-linejoin', 'round');
    };

    const nodeG = svg.append('g');

    const node = nodeG
      .selectAll('g')
      .data(packed.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.x - packed.x},${d.y - packed.y})`)
      .style('cursor', 'pointer')
      .style('opacity', d => {
        const comp = d.data as Competency;
        return d.depth > 0 && this.competencyService.isLocked(comp.id, progress) ? 0.35 : 1;
      })
      .on('mouseover', function () { d3.select(this).select('circle').attr('stroke-opacity', 1); })
      .on('mouseout', function () { d3.select(this).select('circle').attr('stroke-opacity', 0.6); })
      .on('click', (event, d) => {
        if (focus !== d) {
          zoom(event, d);
          event.stopPropagation();
          this.selected.set(d.data);
        }
      });

    // Círculos
    const circles = node.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => {
        const comp = d.data as Competency;
        if (d.depth === 0) return 'rgba(15, 23, 42, 0.05)';
        if (progress.has(comp.id)) return d3.color(comp.color)!.brighter(0.3).toString() ?? comp.color;
        return comp.color + (d.depth === 1 ? '11' : (d.children ? '22' : '44'));
      })
      .attr('stroke', d => {
        const comp = d.data as Competency;
        if (d.depth === 0) return 'rgba(255,255,255,0.1)';
        if (progress.has(comp.id)) return '#10b981';
        return comp.color;
      })
      .attr('stroke-width', d => {
        if (d.depth === 0) return 1;
        const comp = d.data as Competency;
        if (progress.has(comp.id)) return 3;
        return d.children ? 1 : 1.5;
      })
      .attr('stroke-dasharray', d => d.children ? '4 2' : null)
      .attr('stroke-opacity', 0.6)
      .attr('filter', d => d.depth === 1 ? 'url(#glow)' : null);

    // Labels e Ícones
    const label = node.filter(d => d.depth > 0)
      .append('g')
      .style('pointer-events', 'none')
      .attr('class', 'labels-group');

    const icons = label.filter(d => !d.children)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', d => `${Math.min(d.r * 0.5, 24)}px`)
      .style('user-select', 'none')
      .text(d => {
        const comp = d.data as Competency;
        return comp.icon ?? '';
      });

    // Nomes de Pais
    const parentLabels = label.filter(d => !!d.children)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => -d.r + 18)
      .style('font-size', d => d.depth === 1 ? '14px' : '11px')
      .style('font-weight', '800')
      .style('fill', '#f8fafc')
      .style('text-transform', 'uppercase')
      .style('letter-spacing', '0.05em')
      .text(d => (d.data as Competency).name)
      .call(textHalo);

    // Nomes de Folhas
    const leafLabels = label.filter(d => !d.children)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.6em')
      .style('font-size', d => `${Math.min(d.r * 0.18, 12)}px`)
      .style('font-weight', '600')
      .style('fill', '#cbd5e1')
      .text(d => (d.data as Competency).name)
      .call(textHalo);

    // Inicializar visualização
    zoomTo([packed.x, packed.y, packed.r * 1.05]);

    function zoomTo(v: [number, number, number]) {
      const k = width / (v[2] * 2);
      view = v;
      label.style('display', (d: any) =>
        d.parent === focus || !d.children ? 'inline' : 'none'
      );
      node.attr('transform', (d: any) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      circles.attr('r', (d: any) => d.r * k);

      // Ajustar escala das fontes durante o zoom
      icons.style('font-size', (d: any) => `${Math.min(d.r * k * 0.4, 32)}px`);
      leafLabels.style('font-size', (d: any) => `${Math.min(d.r * k * 0.18, 14)}px`)
        .style('display', (d: any) => d.r * k > 30 ? 'inline' : 'none');
      parentLabels.style('font-size', (d: any) => `${Math.min(d.r * k * 0.08, 16)}px`)
        .attr('y', (d: any) => -d.r * k + 15)
        .style('display', (d: any) => d.r * k > 50 ? 'inline' : 'none');
    }

    function zoom(event: any, d: any) {
      focus = d;
      const transition = svg.transition()
        .duration(750)
        .tween('zoom', () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 1.05]);
          return (t: number) => zoomTo(i(t));
        });
    }
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      video: '▶ Vídeo', course: '🎓 Curso',
      article: '📄 Artigo', docs: '📖 Docs'
    };
    return labels[type] ?? type;
  }

  clearSelection(): void {
    this.selected.set(null);
  }

  isCompleted(id: string): boolean {
    return this.progress().has(id);
  }

  isLocked(id: string): boolean {
    return this.competencyService.isLocked(id, this.progress());
  }

  async toggleProgress(id: string): Promise<void> {
    await this.competencyService.toggleProgress(id);
  }
}
