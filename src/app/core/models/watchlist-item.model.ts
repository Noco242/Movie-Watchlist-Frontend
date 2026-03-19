import { MediaType } from './tmdb.model';

export interface WatchlistItem {
  id: number;
  owner_id: number;
  tmdb_id: number;
  title: string;
  type: MediaType;
  gesehen: boolean;
  bewertung: number | null;
  notiz: string | null;
  poster_path: string | null;
  jahr: number | null;
  hinzugefuegtAm: string;
  updated_at: string;
}

export interface CreateWatchlistItemRequest {
  tmdb_id: number;
  title: string;
  type: MediaType;
  poster_path: string | null;
  jahr: number | null;
}

