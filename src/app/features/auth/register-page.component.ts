import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'an-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Registrieren</h1>
      <p>Erstelle ein Konto fuer deine persoenliche Watchlist.</p>

      <label for="name">Name</label>
      <input id="name" name="name" type="text" [(ngModel)]="name" />

      <label for="email">E-Mail</label>
      <input id="email" name="email" type="email" [(ngModel)]="email" />

      <label for="password">Passwort</label>
      <input id="password" name="password" type="password" [(ngModel)]="password" />

      <label for="passwordRepeat">Passwort wiederholen</label>
      <input id="passwordRepeat" name="passwordRepeat" type="password" [(ngModel)]="passwordRepeat" />

      <button type="button" (click)="submit()">Registrieren</button>

      @if (message()) {
        <p class="meldung">{{ message() }}</p>
      }

      <a routerLink="/login">Schon ein Konto? Zum Login</a>
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
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected name = '';
  protected email = '';
  protected password = '';
  protected passwordRepeat = '';
  protected readonly message = signal('');

  protected submit(): void {
    this.message.set('');

    if (!this.name.trim() || !this.email.trim() || !this.password.trim()) {
      this.message.set('Bitte alle Pflichtfelder ausfuellen.');
      return;
    }

    if (this.password.length < 6) {
      this.message.set('Das Passwort muss mindestens 6 Zeichen haben.');
      return;
    }

    if (this.password !== this.passwordRepeat) {
      this.message.set('Die Passwoerter stimmen nicht ueberein.');
      return;
    }

    const result = this.authService.register(this.name, this.email, this.password);
    if (!result.success) {
      this.message.set(result.message);
      return;
    }

    this.router.navigateByUrl('/watchlist');
  }
}

