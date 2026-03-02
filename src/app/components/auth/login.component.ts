import { Component, inject, ChangeDetectionStrategy, signal, effect, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="card-glow"></div>
        <span class="login-icon">🗺️</span>
        <h1>Job Ready Developer</h1>
        <p>Faça login para acompanhar seu progresso no mapa de conhecimentos e conquistar sua vaga no mercado.</p>

        <div class="munger-quote">
          <span class="quote-mark">"</span>
          Adquira toda a sabedoria que você puder; sempre que você encontrar algo que você não entende, lembre-se de aprender isso.
          <div class="quote-author">— Charlie Munger</div>
        </div>

        <button class="google-btn" (click)="loginWithGoogle()" [disabled]="loading()">
          @if (loading()) {
            <span class="spinner"></span> Entrando...
          } @else {
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          }
        </button>

        @if (error()) {
          <p class="error-msg">{{ error() }}</p>
        }

        <p class="privacy-note">Usamos sua conta Google apenas para autenticação. Não compartilhamos seus dados.</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
    }

    .login-card {
      position: relative;
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      max-width: 460px;
      width: 100%;
      text-align: center;
      overflow: hidden;
    }

    .card-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.06), transparent 50%);
      pointer-events: none;
    }

    .login-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

    h1 {
      font-size: 1.8rem;
      font-weight: 800;
      margin: 0 0 0.75rem;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p { color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.5rem; font-size: 0.95rem; }

    .munger-quote {
      background: rgba(250, 190, 20, 0.06);
      border: 1px solid rgba(250, 190, 20, 0.2);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 2rem;
      font-style: italic;
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.6;
      text-align: left;
    }

    .quote-mark { font-size: 2rem; color: #fbbf24; line-height: 0; vertical-align: -0.4em; margin-right: 0.2rem; }
    .quote-author { margin-top: 0.75rem; font-weight: 700; color: #fbbf24; font-style: normal; font-size: 0.8rem; }

    .google-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.875rem;
      border: 1px solid var(--border);
      background: var(--card-bg);
      color: var(--text-primary);
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 1rem;
      &:hover:not(:disabled) { border-color: #4285F4; box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.15); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-msg { color: #ef4444; font-size: 0.85rem; margin-bottom: 1rem; }

    .privacy-note { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) {
        untracked(() => {
          this.router.navigate(['/']);
        });
      }
    });
  }

  loading = signal(false);
  error = signal('');

  async loginWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.loginWithGoogle();
    } catch (err: any) {
      this.error.set('Erro ao fazer login. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
