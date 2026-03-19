import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TmdbService } from '../../core/services/tmdb.service';
import { WatchlistItem } from '../../core/models/watchlist-item.model';
import { WatchlistService } from '../../core/services/watchlist.service';

@Component({
  selector: 'an-watchlist-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="kopfzeile">
      <h1>Meine Watchlist</h1>
      <p>Verwalte hier deine Titel, Status, Bewertung und Notizen.</p>
    </section>

    @if (items().length === 0) {
      <p class="leer">Noch keine Eintraege. Fuege zuerst Titel unter "Entdecken" hinzu.</p>
    } @else {
      <div class="liste">
        @for (item of items(); track item.id) {
          <article class="eintrag">
            <img [src]="imageFor(item.posterPath) || fallbackPoster" [alt]="item.title" />

            <div class="details">
              <h2>{{ item.title }}</h2>
              <p>{{ item.type === 'movie' ? 'Film' : 'Serie' }} · {{ item.jahr }}</p>

              <label class="inline">
                <input
                  type="checkbox"
                  [ngModel]="item.gesehen"
                  (ngModelChange)="onSeenChanged(item, $event)"
                />
                Gesehen
              </label>

              <label for="rating-{{ item.id }}">Bewertung (0-10)</label>
              <input
                id="rating-{{ item.id }}"
                type="number"
                min="0"
                max="10"
                step="0.5"
                [ngModel]="item.bewertung"
                (ngModelChange)="onRatingChanged(item, $event)"
              />

              <label for="note-{{ item.id }}">Notiz</label>
              <textarea
                id="note-{{ item.id }}"
                rows="3"
                [ngModel]="item.notiz"
                (ngModelChange)="onNoteChanged(item, $event)"
              ></textarea>

              <button type="button" class="delete" (click)="remove(item)">Entfernen</button>
            </div>
          </article>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      color: #f3f3f3;
    }

    .kopfzeile h1 {
      margin: 0;
      font-size: 1.9rem;
    }

    .kopfzeile p {
      color: #c9c9c9;
      margin: 0.4rem 0 1.2rem;
    }

    .leer {
      color: #bdbdbd;
      padding: 1rem;
      border: 1px dashed #4b4b4b;
      border-radius: 8px;
    }

    .liste {
      display: grid;
      gap: 1rem;
    }

    .eintrag {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 1rem;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 10px;
      padding: 0.85rem;
    }

    img {
      width: 100%;
      border-radius: 8px;
      object-fit: cover;
      min-height: 235px;
      background: #0f0f0f;
    }

    .details {
      display: grid;
      gap: 0.5rem;
      align-content: start;
    }

    h2,
    p {
      margin: 0;
    }

    p {
      color: #bcbcbc;
    }

    .inline {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    input[type='number'],
    textarea {
      border-radius: 8px;
      border: 1px solid #3a3a3a;
      background: #101010;
      color: #fff;
      padding: 0.55rem;
      font: inherit;
    }

    .delete {
      justify-self: start;
      border: 0;
      border-radius: 8px;
      min-height: 38px;
      padding: 0 0.8rem;
      background: #551219;
      color: #fff;
      cursor: pointer;
    }

    @media (max-width: 750px) {
      .eintrag {
        grid-template-columns: 1fr;
      }

      img {
        max-width: 220px;
      }
    }
  `
})
export class WatchlistPageComponent {
  private readonly watchlistService = inject(WatchlistService);
  private readonly tmdbService = inject(TmdbService);

  protected readonly fallbackPoster =
    'https://placehold.co/500x750/151515/f2f2f2?text=Kein+Poster';

  protected readonly items = this.watchlistService.userItems;

  protected remove(item: WatchlistItem): void {
    this.watchlistService.removeItem(item.id);
  }

  protected onSeenChanged(item: WatchlistItem, value: boolean): void {
    this.watchlistService.updateItem(item.id, { gesehen: value });
  }

  protected onRatingChanged(item: WatchlistItem, value: string | number): void {
    const parsed = Number(value);
    const bewertung = Number.isFinite(parsed) ? Math.max(0, Math.min(10, parsed)) : 0;
    this.watchlistService.updateItem(item.id, { bewertung });
  }

  protected onNoteChanged(item: WatchlistItem, value: string): void {
    this.watchlistService.updateItem(item.id, { notiz: value.slice(0, 400) });
  }

  protected imageFor(path: string | null): string {
    return this.tmdbService.buildImageUrl(path);
  }
}

