import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CompetencyService } from '../../services/competency.service';
import { Competency, Resource } from '../../models/competency.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin">
      <div class="admin-header">
        <div>
          <h1>⚙️ Painel Admin</h1>
          <p>Gerencie os recursos de aprendizado do mapa</p>
        </div>
        <div class="header-actions">
          <button class="btn-save" (click)="saveMap()" [disabled]="saving()">
            {{ saving() ? '⏳ Salvando...' : '💾 Salvar Alterações' }}
          </button>
          <a routerLink="/" class="btn-secondary">← Voltar ao Mapa</a>
        </div>
      </div>

      @if (saved()) {
        <div class="toast success">✅ Mapa salvo com sucesso! Todos os alunos já verão as mudanças.</div>
      }

      <!-- Árvore de competências -->
      <div class="tree-layout">
        <!-- Navegação esquerda -->
        <nav class="tree-nav">
          <div class="nav-title">Áreas</div>
          @for (area of areas(); track area.id) {
            <button
              class="nav-item"
              [class.active]="selectedArea()?.id === area.id"
              [style.border-left-color]="area.color"
              (click)="selectArea(area)">
              {{ area.icon }} {{ area.name }}
            </button>
          }
        </nav>

        <!-- Editor direito -->
        @if (selectedArea()) {
          <div class="editor-panel">
            <h2>{{ selectedArea()!.icon }} {{ selectedArea()!.name }}</h2>

            <!-- Todos os nós da área -->
            @for (node of getNodesForArea(selectedArea()!); track node.id) {
              <div class="node-section">
                <div class="node-title">
                  <span>{{ node.icon }} {{ node.name }}</span>
                  <span class="node-badge">{{ node.resources.length }} recursos</span>
                </div>

                <p class="node-desc">{{ node.description }}</p>

                <!-- Lista de recursos -->
                <div class="resources-editor">
                  @for (res of node.resources; track $index; let i = $index) {
                    <div class="res-row">
                      <select [(ngModel)]="res.type" class="res-type-select">
                        <option value="video">▶ Vídeo</option>
                        <option value="course">🎓 Curso</option>
                        <option value="article">📄 Artigo</option>
                        <option value="docs">📖 Docs</option>
                      </select>
                      <select [(ngModel)]="res.language" class="res-lang-select">
                        <option value="pt">PT</option>
                        <option value="en">EN</option>
                      </select>
                      <input [(ngModel)]="res.title" placeholder="Título do recurso" class="res-input" />
                      <input [(ngModel)]="res.url" placeholder="https://..." class="res-input url-input" />
                      <button class="btn-remove" (click)="removeResource(node, i)" title="Remover">✕</button>
                    </div>
                  }

                  <!-- Novo recurso -->
                  <button class="btn-add-resource" (click)="addResource(node)">
                    + Adicionar Recurso
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="editor-placeholder">
            <span>👈</span>
            <p>Selecione uma área para editar seus recursos</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    h1 { font-size: 1.8rem; font-weight: 800; margin: 0 0 0.25rem; color: var(--text-primary); }
    .admin-header > div > p { color: var(--text-secondary); margin: 0; }

    .header-actions { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }

    .btn-save {
      padding: 0.6rem 1.25rem;
      background: var(--gradient);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .btn-secondary {
      padding: 0.6rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      transition: all 0.2s;
      &:hover { border-color: var(--text-primary); color: var(--text-primary); }
    }

    .toast {
      padding: 1rem 1.25rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      font-weight: 500;
      &.success { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; }
    }

    .tree-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 1.5rem;
      min-height: 600px;
    }

    @media (max-width: 640px) {
      .tree-layout { grid-template-columns: 1fr; }
    }

    .tree-nav {
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1rem;
      height: fit-content;
      position: sticky;
      top: 80px;
    }

    .nav-title { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; padding: 0 0.5rem; }

    .nav-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.6rem 0.75rem;
      background: transparent;
      border: none;
      border-left: 3px solid transparent;
      border-radius: 0 8px 8px 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.15s;
      margin-bottom: 0.25rem;
      &:hover { background: var(--card-bg); color: var(--text-primary); }
      &.active { background: var(--card-bg); color: var(--text-primary); font-weight: 600; }
    }

    .editor-panel {
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.5rem;
    }

    h2 { font-size: 1.3rem; font-weight: 700; margin: 0 0 1.5rem; color: var(--text-primary); }

    .node-section {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.25rem;
      margin-bottom: 1rem;
    }

    .node-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .node-badge {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--panel-bg);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .node-desc { font-size: 0.8rem; color: var(--text-muted); margin: 0 0 1rem; }

    .res-row {
      display: grid;
      grid-template-columns: 110px 60px 1fr 1.5fr 32px;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 900px) {
      .res-row { grid-template-columns: 1fr 1fr; }
      .url-input { grid-column: span 2; }
    }

    input, select {
      padding: 0.45rem 0.6rem;
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.8rem;
      transition: border-color 0.2s;
      &:focus { outline: none; border-color: var(--accent); }
    }

    .btn-remove {
      width: 32px;
      height: 32px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover { border-color: #ef4444; color: #ef4444; }
    }

    .btn-add-resource {
      margin-top: 0.5rem;
      padding: 0.45rem 1rem;
      background: transparent;
      border: 1px dashed var(--border);
      border-radius: 6px;
      color: var(--text-muted);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: var(--accent); color: var(--accent); }
    }

    .editor-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      gap: 1rem;
      color: var(--text-muted);
      font-size: 0.95rem;
      span { font-size: 3rem; }
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  private competencyService = inject(CompetencyService);

  areas = signal<Competency[]>([]);
  selectedArea = signal<Competency | null>(null);
  saving = signal(false);
  saved = signal(false);

  private mapRef: Competency | null = null;
  private sub = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.competencyService.map$.subscribe(map => {
        this.mapRef = map;
        this.areas.set(map.children ?? []);
        // Refresh selected area reference
        if (this.selectedArea()) {
          const updated = (map.children ?? []).find(a => a.id === this.selectedArea()!.id);
          if (updated) this.selectedArea.set(updated);
        }
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  selectArea(area: Competency): void {
    this.selectedArea.set(area);
  }

  getNodesForArea(area: Competency): Competency[] {
    return this.competencyService.flattenCompetencies(area);
  }

  addResource(node: Competency): void {
    node.resources = [...node.resources, {
      title: '', url: '', type: 'video', language: 'pt'
    }];
  }

  removeResource(node: Competency, index: number): void {
    node.resources = node.resources.filter((_, i) => i !== index);
  }

  async saveMap(): Promise<void> {
    if (!this.mapRef) return;
    this.saving.set(true);
    try {
      await this.competencyService.updateMap(this.mapRef);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 4000);
    } finally {
      this.saving.set(false);
    }
  }
}
