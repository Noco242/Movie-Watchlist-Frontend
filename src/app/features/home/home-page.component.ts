import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { TmdbMedia } from '../../core/models/tmdb.model';

@Component({
  selector: 'an-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="hero">
      <h1>Entdecke Filme und Serien</h1>
      <p>Suche auf TMDB und speichere deine Favoriten direkt in deiner Watchlist.</p>
    </section>

    @if (!hasApiKey()) {
      <div class="warnung">
        Kein TMDB API-Key gesetzt. Trage ihn in <code>src/environments/environment.development.ts</code> ein.
      </div>
    }

    <section class="suche-box">
      <input
        type="text"
        [(ngModel)]="query"
        placeholder="Titel suchen..."
        (keydown.enter)="search()"
      />
      <button type="button" (click)="search()" [disabled]="isSearching()">Suchen</button>
    </section>

    @if (searchError()) {
      <p class="fehler">{{ searchError() }}</p>
    }

    @if (results().length > 0) {
      <h2>Suchergebnisse</h2>
      <div class="cards">
        @for (item of results(); track item.mediaType + '-' + item.id) {
          <article class="card">
            <img [src]="imageFor(item.posterPath) || fallbackPoster" [alt]="item.title" />
            <div class="card-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.mediaType === 'movie' ? 'Film' : 'Serie' }} · {{ yearFrom(item.releaseDate) }}</p>
              <small>TMDB {{ item.voteAverage.toFixed(1) }}/10</small>
              <button type="button" (click)="addToWatchlist(item)">Zur Watchlist</button>
            </div>
          </article>
        }
      </div>
    }

    <h2>Trending diese Woche</h2>

    @if (isTrendingLoading()) {
      <p>Lade Trending-Inhalte...</p>
    } @else {
      <div class="cards">
        @for (item of trending(); track item.mediaType + '-' + item.id) {
          <article class="card">
            <img [src]="imageFor(item.posterPath) || fallbackPoster" [alt]="item.title" />
            <div class="card-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.mediaType === 'movie' ? 'Film' : 'Serie' }} · {{ yearFrom(item.releaseDate) }}</p>
              <button type="button" (click)="addToWatchlist(item)">Zur Watchlist</button>
            </div>
          </article>
        }
      </div>
    }

    @if (watchlistMessage()) {
      <p class="hinweis">{{ watchlistMessage() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      color: #f5f5f5;
      width: 100%;
    }

    .hero h1 {
      margin: 0;
      font-size: 2rem;
    }

    .hero p {
      color: #c8c8c8;
      margin-bottom: 1rem;
    }

    .warnung {
      margin: 1rem 0;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid #b97f00;
      background: #3d2f08;
      color: #ffe6a8;
    }

    .suche-box {
      display: flex;
      gap: 0.6rem;
      margin: 1rem 0 1.5rem;
    }

    .suche-box input {
      flex: 1;
      min-height: 44px;
      border-radius: 8px;
      border: 1px solid #353535;
      background: #181818;
      color: #fff;
      padding: 0 0.8rem;
    }

    button {
      border: 0;
      border-radius: 8px;
      min-height: 44px;
      padding: 0 1rem;
      cursor: pointer;
      background: #e50914;
      color: #fff;
      font-weight: 600;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    h2 {
      margin: 1.5rem 0 0.8rem;
      font-size: 1.2rem;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
      gap: 1rem;
    }

    .card {
      background: #1a1a1a;
      border: 1px solid #272727;
      border-radius: 10px;
      overflow: hidden;
    }

    .card img {
      width: 100%;
      height: 270px;
      object-fit: cover;
      display: block;
    }

    .card-content {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .card-content h3 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.2;
    }

    .card-content p,
    .card-content small {
      margin: 0;
      color: #bbbbbb;
    }

    .fehler {
      color: #ff9fa6;
    }

    .hinweis {
      margin-top: 1rem;
      color: #97d397;
      font-weight: 600;
    }
  `
})
export class HomePageComponent implements OnInit {
  private readonly tmdbService = inject(TmdbService);
  private readonly watchlistService = inject(WatchlistService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly fallbackPoster =
    'https://placehold.co/500x750/151515/f2f2f2?text=Kein+Poster';

  protected query = '';
  protected readonly isSearching = signal(false);
  protected readonly isTrendingLoading = signal(false);
  protected readonly searchError = signal('');
  protected readonly watchlistMessage = signal('');
  protected readonly results = signal<TmdbMedia[]>([]);
  protected readonly trending = signal<TmdbMedia[]>([]);
  protected readonly hasApiKey = computed(() => this.tmdbService.hasApiKey());

  async ngOnInit(): Promise<void> {
    await this.loadTrending();
  }

  protected async search(): Promise<void> {
    this.searchError.set('');
    this.watchlistMessage.set('');

    if (!this.query.trim()) {
      this.results.set([]);
      return;
    }

    if (!this.hasApiKey()) {
      this.searchError.set('TMDB API-Key fehlt in der Environment-Datei.');
      return;
    }

    this.isSearching.set(true);
    try {
      const items = await firstValueFrom(this.tmdbService.searchMulti(this.query.trim()));
      this.results.set(items);
    } catch {
      this.searchError.set('Suche konnte nicht geladen werden.');
    } finally {
      this.isSearching.set(false);
    }
  }

  protected async loadTrending(): Promise<void> {
    if (!this.hasApiKey()) {
      return;
    }

    this.isTrendingLoading.set(true);
    try {
      const items = await firstValueFrom(this.tmdbService.getTrending());
      this.trending.set(items);
    } catch {
      this.searchError.set('Trending-Daten konnten nicht geladen werden.');
    } finally {
      this.isTrendingLoading.set(false);
    }
  }

  protected addToWatchlist(item: TmdbMedia): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const result = this.watchlistService.addFromTmdb(item);
    this.watchlistMessage.set(result.message);
  }

  protected imageFor(path: string | null): string {
    return this.tmdbService.buildImageUrl(path);
  }

  protected yearFrom(dateValue: string | null): string {
    if (!dateValue) {
      return 'Unbekannt';
    }

    return dateValue.slice(0, 4);
  }
}

