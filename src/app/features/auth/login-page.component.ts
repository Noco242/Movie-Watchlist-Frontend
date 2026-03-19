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
      <input id="email" name="email" type="email" [(ngModel)]="email" />

      <label for="password">Passwort</label>
      <input id="password" name="password" type="password" [(ngModel)]="password" />

      <button type="button" (click)="submit()">Einloggen</button>

      @if (message()) {
        <p class="meldung">{{ message() }}</p>
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

    .meldung {
      color: #ffc6ca;
      margin-top: 0.4rem;
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

  protected submit(): void {
    this.message.set('');

    const result = this.authService.login(this.email, this.password);
    if (!result.success) {
      this.message.set(result.message);
      return;
    }

    this.router.navigateByUrl('/watchlist');
  }
}

