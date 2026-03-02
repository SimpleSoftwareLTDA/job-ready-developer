import { Component, inject, effect, ChangeDetectionStrategy, untracked } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CompetencyService } from './services/competency.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navbar">
      <a routerLink="/" class="brand">
        <span class="brand-icon">🗺️</span>
        <span class="brand-name">Job Ready Developer</span>
      </a>

      <div class="nav-links">
        <a routerLink="/" class="nav-link">Mapa</a>
        @if (auth.isLoggedIn()) {
          <a routerLink="/dashboard" class="nav-link">Meu Progresso</a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin" class="nav-link nav-admin">⚙️ Admin</a>
          }
          <div class="user-info">
            @if (auth.userPhotoUrl()) {
              <img [ngSrc]="auth.userPhotoUrl()!" width="32" height="32" class="avatar" [alt]="auth.userDisplayName()" />
            }
            <span class="username">{{ auth.userDisplayName() }}</span>
            <button class="btn-logout" (click)="logout()">Sair</button>
          </div>
        } @else {
          <a routerLink="/login" class="btn-login">Login com Google</a>
        }
      </div>
    </nav>

    <main>
      <router-outlet />
    </main>

    <a href="https://robsoncassiano.software/notebook/fabrica-de-programadores" target="_blank" rel="noopener noreferrer" class="fab-notebook" title="Acessar o Chat Interativo">
      ✨ Chat Interativo
    </a>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }

    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 64px;
      background: var(--nav-bg);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-primary);
    }

    .brand-icon { font-size: 1.4rem; }
    .brand-name { background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s;
      &:hover { color: var(--text-primary); }
    }

    .nav-admin { color: var(--accent-gold) !important; }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid var(--accent);
    }

    .username {
      font-size: 0.875rem;
      color: var(--text-secondary);
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-login {
      background: var(--gradient);
      color: white;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      transition: opacity 0.2s, transform 0.1s;
      &:hover { opacity: 0.9; transform: translateY(-1px); }
    }

    .btn-logout {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
      &:hover { border-color: var(--danger); color: var(--danger); }
    }

    main { flex: 1; position: relative; }

    .fab-notebook {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--panel-bg);
      border: 1px solid var(--border);
      color: var(--text-primary);
      padding: 0.75rem 1.25rem;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      z-index: 1000;
      transition: all 0.2s;
      backdrop-filter: blur(10px);
    }

    .fab-notebook:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
      color: var(--accent);
      box-shadow: 0 15px 35px rgba(99, 102, 241, 0.2);
    }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  private competencyService = inject(CompetencyService);
  private router = inject(Router);

  constructor() {
    // Carrega progresso de forma isolada do loop reativo primário para que 
    // o listener interno do Firebase escape da detecção do Zone/Signal do Angular 18+
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        untracked(() => {
          this.competencyService.loadUserProgress(user.uid);
        });
      }
    });
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/']);
  }
}
