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
      <p>Erstelle ein Konto für deine persönliche Watchlist.</p>

      <label for="name">Name</label>
      <input id="name" name="name" type="text" [(ngModel)]="name" [disabled]="isLoading()" />

      <label for="email">E-Mail</label>
      <input id="email" name="email" type="email" [(ngModel)]="email" [disabled]="isLoading()" />

      <label for="password">Passwort</label>
      <input id="password" name="password" type="password" [(ngModel)]="password" [disabled]="isLoading()" />

      <label for="passwordRepeat">Passwort wiederholen</label>
      <input id="passwordRepeat" name="passwordRepeat" type="password" [(ngModel)]="passwordRepeat" [disabled]="isLoading()" />

      <button type="button" (click)="submit()" [disabled]="isLoading()">
        {{ isLoading() ? 'wird registriert...' : 'Registrieren' }}
      </button>

      @if (message()) {
        <p class="meldung" [class.fehler]="isError()">{{ message() }}</p>
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
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected name = '';
  protected email = '';
  protected password = '';
  protected passwordRepeat = '';
  protected readonly message = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isError = signal(false);

  protected submit(): void {
    this.message.set('');
    this.isError.set(false);

    if (!this.name.trim() || !this.email.trim() || !this.password.trim()) {
      this.message.set('Bitte alle Pflichtfelder ausfüllen.');
      this.isError.set(true);
      return;
    }

    if (this.password.length < 6) {
      this.message.set('Das Passwort muss mindestens 6 Zeichen haben.');
      this.isError.set(true);
      return;
    }

    if (this.password !== this.passwordRepeat) {
      this.message.set('Die Passwörter stimmen nicht überein.');
      this.isError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.authService.register(this.name.trim(), this.email.trim(), this.password).subscribe({
      next: () => {
        this.message.set('Registrierung erfolgreich!');
        this.isError.set(false);
        setTimeout(() => this.router.navigateByUrl('/watchlist'), 500);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 409) {
          this.message.set('Diese E-Mail ist bereits registriert.');
        } else if (error.status === 422) {
          this.message.set('Validierungsfehler. Überprüfe deine Eingaben.');
        } else {
          this.message.set('Registrierung fehlgeschlagen. Versuche es später erneut.');
        }
        this.isError.set(true);
      }
    });
  }
}

