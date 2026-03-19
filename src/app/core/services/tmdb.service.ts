import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MediaType, TmdbListResponse, TmdbMedia } from '../models/tmdb.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly baseUrl = environment.tmdb.baseUrl;

  constructor(private readonly http: HttpClient) {}

  searchMulti(query: string): Observable<TmdbMedia[]> {
    const params = this.createBaseParams().set('query', query);
    return this.http
      .get<TmdbListResponse>(`${this.baseUrl}/search/multi`, { params })
      .pipe(map((response) => this.normalizeResults(response.results)));
  }

  getTrending(): Observable<TmdbMedia[]> {
    const params = this.createBaseParams();
    return this.http
      .get<TmdbListResponse>(`${this.baseUrl}/trending/all/week`, { params })
      .pipe(map((response) => this.normalizeResults(response.results)));
  }

  buildImageUrl(path: string | null): string {
    if (!path) {
      return '';
    }

    return `${environment.tmdb.imageBaseUrl}${path}`;
  }

  hasApiKey(): boolean {
    return environment.tmdb.apiKey.trim().length > 0;
  }

  private createBaseParams(): HttpParams {
    return new HttpParams()
      .set('api_key', environment.tmdb.apiKey)
      .set('language', environment.tmdb.language)
      .set('include_adult', 'false');
  }

  private normalizeResults(results: TmdbListResponse['results']): TmdbMedia[] {
    return results
      .filter((result) => result.media_type !== 'person')
      .map((result) => {
        const mediaType: MediaType = result.media_type === 'tv' ? 'tv' : 'movie';
        return {
          id: result.id,
          mediaType,
          title: (result.title ?? result.name ?? 'Unbekannt').trim(),
          overview: result.overview ?? 'Keine Beschreibung vorhanden.',
          posterPath: result.poster_path ?? null,
          backdropPath: result.backdrop_path ?? null,
          releaseDate: result.release_date ?? result.first_air_date ?? null,
          voteAverage: Number(result.vote_average ?? 0),
          genreIds: result.genre_ids ?? []
        };
      });
  }
}

