import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  // Signal reativo do usuário atual
  readonly currentUser = toSignal(user(this.auth));

  // Computed signals
  readonly isLoggedIn = () => !!this.currentUser();
  readonly isAdmin = () => this.currentUser()?.uid === environment.adminUid;
  readonly userDisplayName = () => this.currentUser()?.displayName ?? 'Visitante';
  readonly userPhotoUrl = () => this.currentUser()?.photoURL ?? null;

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
