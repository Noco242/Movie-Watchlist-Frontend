import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'an-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly authService = inject(AuthService);

  protected readonly appName = 'Movie Watchlist';
  protected readonly currentUser = this.authService.currentUser;
  protected readonly isLoggedIn = computed(() => this.currentUser() !== null);

  protected logout(): void {
    this.authService.logout();
  }
}
