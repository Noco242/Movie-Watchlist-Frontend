import { MediaType } from './tmdb.model';

export interface WatchlistItem {
  id: string;
  tmdbId: number;
  ownerId: string;
  title: string;
  type: MediaType;
  gesehen: boolean;
  bewertung: number;
  notiz: string;
  posterPath: string | null;
  jahr: string;
  hinzugefuegtAm: string;
}

