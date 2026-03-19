import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'an-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Login</h1>
      <p>Melde dich an, um deine Watchlist zu verwalten.</p>

      <label for="email">E-Mail</label>
      <input id="email" name="email" type="email" [(ngModel)]="email" [disabled]="isLoading()" />

      <label for="password">Passwort</label>
      <input id="password" name="password" type="password" [(ngModel)]="password" [disabled]="isLoading()" />

      <button type="button" (click)="submit()" [disabled]="isLoading()">
        {{ isLoading() ? 'wird eingeloggt...' : 'Einloggen' }}
      </button>

      @if (message()) {
        <p class="meldung" [class.fehler]="isError()">{{ message() }}</p>
      }

      <a routerLink="/register">Noch kein Konto? Jetzt registrieren</a>
    </section>
  `,
  styles: `
    .auth-card {
      max-width: 440px;
      margin: 2.5rem auto;
      background: #1a1a1a;
      border: 1px solid #292929;
      border-radius: 10px;
      padding: 1.3rem;
      color: #f4f4f4;
      display: grid;
      gap: 0.65rem;
    }

    h1,
    p {
      margin: 0;
    }

    p {
      color: #bdbdbd;
      margin-bottom: 0.4rem;
    }

    input {
      min-height: 42px;
      border-radius: 8px;
      border: 1px solid #353535;
      background: #101010;
      color: #fff;
      padding: 0 0.7rem;
    }

    input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button {
      margin-top: 0.5rem;
      min-height: 42px;
      border: 0;
      border-radius: 8px;
      color: #fff;
      background: #e50914;
      font-weight: 700;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .meldung {
      color: #97d397;
      margin-top: 0.4rem;
      font-size: 0.9rem;
    }

    .meldung.fehler {
      color: #ffc6ca;
    }

    a {
      color: #ffffff;
      opacity: 0.9;
      margin-top: 0.4rem;
    }
  `
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly message = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isError = signal(false);

  protected submit(): void {
    this.message.set('');
    this.isError.set(false);

    if (!this.email.trim() || !this.password.trim()) {
      this.message.set('Bitte E-Mail und Passwort eingeben.');
      this.isError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.authService.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.message.set('Login erfolgreich!');
        this.isError.set(false);
        setTimeout(() => this.router.navigateByUrl('/watchlist'), 500);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 401) {
          this.message.set('E-Mail oder Passwort ungültig.');
        } else if (error.status === 422) {
          this.message.set('Validierungsfehler. Überprüfe deine Eingaben.');
        } else {
          this.message.set('Login fehlgeschlagen. Versuche es später erneut.');
        }
        this.isError.set(true);
      }
    });
  }
}

