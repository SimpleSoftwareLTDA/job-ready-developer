import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, onSnapshot, collection, writeBatch } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Competency, UserProgress, DEFAULT_COMPETENCY_MAP } from '../models/competency.model';

@Injectable({ providedIn: 'root' })
export class CompetencyService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private injector = inject(Injector);

  private mapSubject = new BehaviorSubject<Competency>(DEFAULT_COMPETENCY_MAP);
  private progressSubject = new BehaviorSubject<Set<string>>(new Set());

  readonly map$: Observable<Competency> = this.mapSubject.asObservable();
  readonly progress$: Observable<Set<string>> = this.progressSubject.asObservable();

  constructor() {
    this.loadMap();
  }

  // ── Carrega o mapa do Firestore (ou usa o padrão) ──────────────────
  private async loadMap(): Promise<void> {
    try {
      const ref = doc(this.firestore, 'config', 'competency-map');
      runInInjectionContext(this.injector, () => {
        onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            console.log('[Firestore] Mapa carregado com sucesso!');
            this.mapSubject.next(snap.data() as Competency);
          } else {
            console.log('[Firestore] Mapa não encontrado. Criando mapa padrão...');
            // Primeiro acesso: salva o mapa padrão
            setDoc(ref, DEFAULT_COMPETENCY_MAP).then(() => {
              console.log('[Firestore] Mapa padrão criado no banco!');
            }).catch(e => console.error('[Firestore] Erro ao criar mapa:', e));
          }
        }, (error) => {
          console.error('[Firestore Snapshot Error]', error);
        });
      });
    } catch (err) {
      console.warn('Firestore unavailable, using default map:', err);
    }
  }

  // ── Carrega progresso do aluno ────────────────────────────────────
  loadUserProgress(uid: string): void {
    const ref = doc(this.firestore, 'users', uid, 'data', 'progress');
    runInInjectionContext(this.injector, () => {
      onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { completedIds: string[] };
          this.progressSubject.next(new Set(data.completedIds ?? []));
        }
      });
    });
  }

  // ── Marca/desmarca competência como concluída ─────────────────────
  async toggleProgress(competencyId: string): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const current = new Set(this.progressSubject.value);
    if (current.has(competencyId)) {
      current.delete(competencyId);
    } else {
      if (this.isLocked(competencyId, current)) {
        return; // não permite concluir se estiver bloqueado
      }
      current.add(competencyId);
    }

    const ref = doc(this.firestore, 'users', uid, 'data', 'progress');
    await setDoc(ref, { completedIds: Array.from(current) });
  }

  // ── Admin: Atualiza link de um recurso ────────────────────────────
  async updateMap(newMap: Competency): Promise<void> {
    const ref = doc(this.firestore, 'config', 'competency-map');
    await setDoc(ref, newMap);
  }

  // ── Utilitários ───────────────────────────────────────────────────
  flattenCompetencies(node: Competency): Competency[] {
    const result: Competency[] = [node];
    if (node.children) {
      for (const child of node.children) {
        result.push(...this.flattenCompetencies(child));
      }
    }
    return result;
  }

  getTotalCount(node: Competency): number {
    return this.flattenCompetencies(node).filter(n => n.id !== 'root').length;
  }

  getCompletionPercentage(node: Competency, progress: Set<string>): number {
    const all = this.flattenCompetencies(node).filter(n => n.id !== 'root');
    if (all.length === 0) return 0;
    const done = all.filter(n => progress.has(n.id)).length;
    return Math.round((done / all.length) * 100);
  }

  isLocked(competencyId: string, progress?: Set<string>, map?: Competency): boolean {
    const p = progress ?? this.progressSubject.value;
    const m = map ?? this.mapSubject.value;
    const comp = this.flattenCompetencies(m).find(c => c.id === competencyId);
    if (!comp || !comp.requiresIds || comp.requiresIds.length === 0) return false;

    // Bloqueado se faltar algum pré-requisito
    return comp.requiresIds.some(reqId => !p.has(reqId));
  }
}
