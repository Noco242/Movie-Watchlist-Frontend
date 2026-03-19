import { Injectable, computed, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { TmdbMedia } from '../models/tmdb.model';
import { WatchlistItem } from '../models/watchlist-item.model';

const WATCHLIST_STORAGE_KEY = 'mw_watchlist_v1';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly allItems = signal<WatchlistItem[]>(this.readItems());
  readonly userItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return [];
    }

    return this.allItems().filter((item) => item.ownerId === user.id);
  });

  constructor(private readonly authService: AuthService) {}

  addFromTmdb(media: TmdbMedia): { success: boolean; message: string } {
    const user = this.authService.currentUser();
    if (!user) {
      return { success: false, message: 'Bitte zuerst einloggen.' };
    }

    const alreadyExists = this.allItems().some(
      (item) => item.ownerId === user.id && item.tmdbId === media.id && item.type === media.mediaType
    );

    if (alreadyExists) {
      return { success: false, message: 'Titel ist bereits in deiner Watchlist.' };
    }

    const newItem: WatchlistItem = {
      id: crypto.randomUUID(),
      ownerId: user.id,
      tmdbId: media.id,
      title: media.title,
      type: media.mediaType,
      gesehen: false,
      bewertung: 0,
      notiz: '',
      posterPath: media.posterPath,
      jahr: this.extractYear(media.releaseDate),
      hinzugefuegtAm: new Date().toISOString()
    };

    const updated = [...this.allItems(), newItem];
    this.persist(updated);
    return { success: true, message: 'Zur Watchlist hinzugefügt.' };
  }

  updateItem(id: string, changes: Partial<Pick<WatchlistItem, 'gesehen' | 'bewertung' | 'notiz'>>): void {
    const updated = this.allItems().map((item) => (item.id === id ? { ...item, ...changes } : item));
    this.persist(updated);
  }

  removeItem(id: string): void {
    const updated = this.allItems().filter((item) => item.id !== id);
    this.persist(updated);
  }

  private extractYear(dateValue: string | null): string {
    if (!dateValue) {
      return 'Unbekannt';
    }

    return dateValue.slice(0, 4);
  }

  private persist(items: WatchlistItem[]): void {
    this.allItems.set(items);
    this.storage()?.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
  }

  private readItems(): WatchlistItem[] {
    const raw = this.storage()?.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as WatchlistItem[];
    } catch {
      this.storage()?.removeItem(WATCHLIST_STORAGE_KEY);
      return [];
    }
  }

  private storage(): Storage | null {
    const candidate = globalThis.localStorage;
    if (!candidate || typeof candidate.getItem !== 'function') {
      return null;
    }

    return candidate;
  }
}

