import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { CompetencyService } from "../../services/competency.service";
import { Competency, Resource } from "../../models/competency.model";
import { add_new_area } from "../../models/competency.model";
import { doc } from "firebase/firestore";
@Component({
  selector: "app-admin",
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
            {{ saving() ? "⏳ Salvando..." : "💾 Salvar Alterações" }}
          </button>
          <a routerLink="/" class="btn-secondary">← Voltar ao Mapa</a>
        </div>
      </div>

      @if (saved()) {
        <div class="toast success">
          ✅ Mapa salvo com sucesso! Todos os alunos já verão as mudanças.
        </div>
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
              (click)="selectArea(area)"
            >
              {{ area.icon }} {{ area.name }}
            </button>
          }
          <button class="add-item" id="abrir-modal-admin">
            + Adicionar Área
          </button>

          <!-- Modal de adicionar área na tela admin -->
          <div>
            <div id="modal_admin" class="modal_admin">
              <div id="modal_content_admin">
                <h2>Adicionar Nova Área</h2>
                <div class="campo">
                  <label for="area-name">Nome:</label>
                  <input
                    id="area-name"
                    type="text"
                    placeholder="Ex: Frontend"
                    [(ngModel)]="areaName"
                  />
                </div>
                <div class="campo">
                  <label for="area-desc">Descrição:</label>
                  <input
                    id="area-desc"
                    type="text"
                    placeholder="Brevecd descrição da área"
                    [(ngModel)]="areaDescription"
                  />
                </div>
                <div class="campo">
                  <label for="area-color">Cor:</label>
                  <input
                    id="area-color"
                    type="color"
                    value="#123456"
                    [(ngModel)]="areaColor"
                  />
                </div>
                <div class="campo">
                  <label for="area-icon">Ícone:</label>
                  <input
                    id="area-icon"
                    type="text"
                    placeholder="Emoji ou ícone"
                    [(ngModel)]="areaIcon"
                  />
                </div>
                <button
                  class="btn-save"
                  (click)="
                    addArea(areaName, areaDescription, areaColor, areaIcon)
                  "
                >
                  Salvar
                </button>
              </div>
            </div>
            <button class="add-item" id="remover-id-admin">
              ❌ Remover Área
            </button>
          </div>

          <!-- modal de remover item-->
          <div class="modal_dropdown" id="modal_dropdown_remove">
            <div
              class="modal_content_dropdown"
              id="modal_content_dropdown_remove"
            >
              <h3>Deletar área</h3>
              <div class="dropdown">
                <button
                  (click)="dropdown_active()"
                  id="dropbtn"
                  class="dropbtn"
                >
                  @if (selectedAreaToRemove()) {
                    {{ selectedAreaToRemove()!.icon }}
                    {{ selectedAreaToRemove()!.name }}
                  } @else {
                    Dropdown
                  }
                </button>
                <div id="myDropdown" class="dropdown-content">
                  @for (area of areas(); track area.id) {
                    <button
                      class="remove-item-dropdown"
                      [class.active]="selectedAreaToRemove()?.id === area.id"
                      [style.border-left-color]="area.color"
                      (click)="selectAreaToRemove(area)"
                      type="button"
                    >
                      {{ area.icon }} {{ area.name }}
                    </button>
                  }
                </div>
                <button
                  class="btn-remove-area"
                  (click)="removeArea(selectedAreaToRemove()!)"
                >
                  Remover Área
                </button>
              </div>
            </div>
          </div>
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
                  <span class="node-badge"
                    >{{ node.resources.length }} recursos</span
                  >
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
                      <select
                        [(ngModel)]="res.language"
                        class="res-lang-select"
                      >
                        <option value="pt">PT</option>
                        <option value="en">EN</option>
                      </select>
                      <input
                        [(ngModel)]="res.title"
                        placeholder="Título do recurso"
                        class="res-input"
                      />
                      <input
                        [(ngModel)]="res.url"
                        placeholder="https://..."
                        class="res-input url-input"
                      />
                      <button
                        class="btn-remove"
                        (click)="removeResource(node, i)"
                        title="Remover"
                      >
                        ✕
                      </button>
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
  styles: [
    `
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

      h1 {
        font-size: 1.8rem;
        font-weight: 800;
        margin: 0 0 0.25rem;
        color: var(--text-primary);
      }
      .admin-header > div > p {
        color: var(--text-secondary);
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .btn-save {
        padding: 0.6rem 1.25rem;
        background: var(--gradient);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .btn-secondary {
        padding: 0.6rem 1rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.875rem;
        transition: all 0.2s;
        &:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }
      }

      .toast {
        padding: 1rem 1.25rem;
        border-radius: 10px;
        margin-bottom: 1.5rem;
        font-weight: 500;
        &.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }
      }

      .tree-layout {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 1.5rem;
        min-height: 600px;
      }

      @media (max-width: 640px) {
        .tree-layout {
          grid-template-columns: 1fr;
        }
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

      .nav-title {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.75rem;
        padding: 0 0.5rem;
      }

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
        &:hover {
          background: var(--card-bg);
          color: var(--text-primary);
        }
        &.active {
          background: var(--card-bg);
          color: var(--text-primary);
          font-weight: 600;
        }
      }

      .editor-panel {
        background: var(--panel-bg);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1.5rem;
      }

      h2 {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0 0 1.5rem;
        color: var(--text-primary);
      }

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

      .node-desc {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin: 0 0 1rem;
      }

      .res-row {
        display: grid;
        grid-template-columns: 110px 60px 1fr 1.5fr 32px;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      @media (max-width: 900px) {
        .res-row {
          grid-template-columns: 1fr 1fr;
        }
        .url-input {
          grid-column: span 2;
        }
      }

      input,
      select {
        padding: 0.45rem 0.6rem;
        background: var(--panel-bg);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text-primary);
        font-size: 0.8rem;
        transition: border-color 0.2s;
        &:focus {
          outline: none;
          border-color: var(--accent);
        }
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
        &:hover {
          border-color: #ef4444;
          color: #ef4444;
        }
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
        &:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
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
        span {
          font-size: 3rem;
        }
      }

      .add-item {
        margin-top: 0.5rem;
        padding: 0.45rem 1rem;
        background: transparent;
        border: 1px dashed var(--border);
        border-radius: 6px;
        color: var(--text-secondary);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
      }

      .modal_admin {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        background-color: rgba(20, 20, 20, 0.55);
        justify-content: center;
        align-items: center;
      }

      #modal_content_admin {
        display: flex;
        width: 500px;
        gap: 15px;
        flex-direction: column;
        background-color: #0f172a;
        padding: 20px;
        border-radius: 10px;
      }

      .campo {
        background-color: #0f172a;
        display: flex;
        flex-direction: column;
        padding: 10px;
        border-radius: 8px;
      }

      .dropbtn {
        background-color: transparent;
        color: white;
        padding: 16px;
        font-size: 16px;
        cursor: pointer;
        width: 150px;

        border-radius: 10%;
        text-align: center;
        font-size: 14px;
        border-color: #a6b3c5;
      }

      .dropbtn:hover,
      .dropbtn:focus {
        background-color: #297fb93a;
      }

      .dropdown {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .dropdown-content {
        display: none;
        position: absolute;
        background-color: #203147;
        min-width: 150px;
        border-radius: 10%;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        z-index: 1;
      }

      

      .dropdown-content button {
        color: var(--text-primary); 
        padding: 0.6rem 1rem;
        text-decoration: none;
        display: block;
        background: transparent;
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background 0.15s ease;
        &:hover {
          background: var(--panel-bg);
        }
        &.active {
          background: var(--accent);
          color: white;
          font-weight: 600;
        }
      }

      .dropdown-content button:hover {
        background-color: #4b4343;
      }

      .show {
        display: block;
      }

      .modal_dropdown {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(20, 20, 20, 0.55);
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }

      .modal_dropdown h3 {
        color: white;
      }

      .modal_content_dropdown h3 {
        color: var(--text-primary);
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        letter-spacing: 0.01em;
        text-align: left;
      }

      .modal_content_dropdown {
        background: var(--panel-bg);
        border: 1.5px solid var(--border);
        border-radius: 14px;
        box-shadow: 0 8px 32px 0 rgba(16, 23, 42, 0.45);
        padding: 2rem 2.5rem 1.5rem 2.5rem;
        min-width: 320px;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
      }

      .btn-remove-area {
        padding: 0.75rem 1.25rem;
        background: var(--danger);
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 0.5rem;
        &:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      }
    `,
  ],
})
export class AdminComponent implements OnInit, OnDestroy {
  private competencyService = inject(CompetencyService);

  areaName = "";
  areaDescription = "";
  areaColor = "#123456";
  areaIcon = "";

  areas = signal<Competency[]>([]);
  selectedArea = signal<Competency | null>(null);
  saving = signal(false);
  saved = signal(false);

  private mapRef: Competency | null = null;
  private sub = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.competencyService.map$.subscribe((map) => {
        this.mapRef = map;
        this.areas.set(map.children ?? []);
        // Refresh selected area reference
        if (this.selectedArea()) {
          const updated = (map.children ?? []).find(
            (a) => a.id === this.selectedArea()!.id,
          );
          if (updated) this.selectedArea.set(updated);
        }
      }),
    );

    const dropbtn = document.getElementById("dropbtn");
    const botao_remover = document.getElementById("remover-id-admin");
    const modal_dropdown = document.getElementById("modal_dropdown_remove");
    botao_remover?.addEventListener("click", () => {
      if (modal_dropdown !== null) {
        modal_dropdown.style.display = "flex";
      }
    });

    const modal = document.getElementById("modal_admin");
    const abrirModal = document.getElementById("abrir-modal-admin");
    const fecharModal = document.getElementById("salvar-modal-admin");
    const conteudo = document.getElementById("modal_content_admin");

    abrirModal?.addEventListener("click", () => {
      if (modal !== null) {
        modal.style.display = "flex";
      }
    });

    modal?.addEventListener("click", (event) => {
      modal.style.display = "none";
    });

    conteudo?.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    fecharModal?.addEventListener("click", () => {
      if (modal !== null) {
        modal?.classList.add("inactive");
        modal.style.display = "none";
        modal?.classList.remove("active");
      }
    });

    const modalDropdown = document.getElementById("modal_dropdown_remove");
    const modalDropdownContent = document.getElementById(
      "modal_content_dropdown_remove",
    );

    modalDropdown?.addEventListener("click", (event) => {
      if (event.target === modalDropdown) {
        modalDropdown.style.display = "none";
      }
    });
    modalDropdownContent?.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  dropdown_active() {
    const myDropdown = document.getElementById("myDropdown");

    if (myDropdown !== null) {
      myDropdown.classList.toggle("show");
    }
  }

  dropdown_inactive() {
    const myDropdown = document.getElementById("myDropdown");
    const modalDropdown = document.getElementsByClassName(
      "remove-item-dropdown",
    );

    modalDropdown[0].addEventListener("click", () => {
      if (myDropdown !== null) {
        myDropdown.classList.remove("show");
      }
    });
  }

  addArea(
    name: string,
    description: string,
    color: string,
    icon: string,
  ): void {
    if (this.mapRef) {
      add_new_area(name, description, color, icon, this.mapRef);
      this.areas.set(this.mapRef.children ?? []);
    }
  }

  selectedAreaToRemove = signal<Competency | null>(null);

  removeArea(area: Competency): void {
    if (!this.mapRef) return;
    this.mapRef.children = (this.mapRef.children ?? []).filter(
      (a) => a.id !== area.id,
    );
    this.areas.set(this.mapRef.children);
  }

  selectAreaToRemove(area: Competency): void {
    this.selectedAreaToRemove.set(area);
    const myDropdown = document.getElementById("myDropdown");
    if (myDropdown) {
      myDropdown.classList.remove("show");
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  selectArea(area: Competency): void {
    this.selectedArea.set(area);
  }

  getNodesForArea(area: Competency): Competency[] {
    return this.competencyService.flattenCompetencies(area);
  }

  addResource(node: Competency): void {
    node.resources = [
      ...node.resources,
      {
        title: "",
        url: "",
        type: "video",
        language: "pt",
      },
    ];
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
