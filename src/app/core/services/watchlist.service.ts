import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CreateWatchlistItemRequest, WatchlistItem } from '../models/watchlist-item.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly apiUrl = `${environment.backendBaseUrl}/watchlist`;
  private readonly watchlistSubject = new BehaviorSubject<WatchlistItem[]>([]);
  readonly watchlist$ = this.watchlistSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getWatchlist(): Observable<WatchlistItem[]> {
    return this.http.get<WatchlistItem[]>(this.apiUrl).pipe(
      tap((items) => {
        this.watchlistSubject.next(items);
      })
    );
  }

  addToWatchlist(item: CreateWatchlistItemRequest): Observable<WatchlistItem> {
    return this.http.post<WatchlistItem>(this.apiUrl, item).pipe(
      tap((newItem) => {
        const current = this.watchlistSubject.value;
        this.watchlistSubject.next([...current, newItem]);
      })
    );
  }

  updateWatchlistItem(
    id: number,
    updates: Partial<Pick<WatchlistItem, 'gesehen' | 'bewertung' | 'notiz'>>
  ): Observable<WatchlistItem> {
    return this.http.patch<WatchlistItem>(`${this.apiUrl}/${id}`, updates).pipe(
      tap((updated) => {
        const current = this.watchlistSubject.value;
        const index = current.findIndex((item) => item.id === id);
        if (index !== -1) {
          current[index] = updated;
          this.watchlistSubject.next([...current]);
        }
      })
    );
  }

  removeFromWatchlist(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.watchlistSubject.value;
        this.watchlistSubject.next(current.filter((item) => item.id !== id));
      })
    );
  }
}

