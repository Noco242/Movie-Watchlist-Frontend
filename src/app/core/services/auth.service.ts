import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { AppUser } from '../models/user.model';
import { environment } from '../../../environments/environment';

const USER_STORAGE_KEY = 'mw_user_v1';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AuthTokensResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AppUser | null>(this.readUser());
  readonly isAuthenticated = computed(() => this.hasAccessToken());
  private readonly apiUrl = `${environment.backendBaseUrl}/auth`;
  private readonly userApiUrl = `${environment.backendBaseUrl}/user/profile`;

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    if (this.hasAccessToken()) {
      this.loadProfile().subscribe({ error: () => undefined });
    }
  }

  register(name: string, email: string, password: string): Observable<void> {
    return this.http
      .post<AuthTokensResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(switchMap((response) => this.handleAuthResponse(response)));
  }

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<AuthTokensResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(switchMap((response) => this.handleAuthResponse(response)));
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthTokensResponse>(`${this.apiUrl}/refresh`, { refresh_token: refreshToken }).pipe(
      tap((response) => this.persistTokens(response)),
      map((response) => response.access_token),
      catchError((error) => {
        this.forceLogout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).pipe(catchError(() => of(null))).subscribe();
    this.forceLogout();
  }

  forceLogout(): void {
    this.currentUser.set(null);
    this.clearTokens();
    this.router.navigateByUrl('/login');
  }

  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  getAccessToken(): string | null {
    return this.storage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  getRefreshToken(): string | null {
    return this.storage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
  }

  private handleAuthResponse(response: AuthTokensResponse): Observable<void> {
    this.persistTokens(response);
    return this.loadProfile();
  }

  private loadProfile(): Observable<void> {
    return this.http.get<AppUser>(this.userApiUrl).pipe(
      tap((profile) => {
        this.currentUser.set(profile);
        this.storage()?.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      }),
      map(() => undefined),
      catchError((error) => {
        if (error?.status === 401) {
          this.clearTokens();
          this.currentUser.set(null);
        }
        return throwError(() => error);
      })
    );
  }

  private persistTokens(response: AuthTokensResponse): void {
    this.storage()?.setItem(ACCESS_TOKEN_KEY, response.access_token);
    this.storage()?.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
  }

  private clearTokens(): void {
    this.storage()?.removeItem(ACCESS_TOKEN_KEY);
    this.storage()?.removeItem(REFRESH_TOKEN_KEY);
    this.storage()?.removeItem(USER_STORAGE_KEY);
  }

  private readUser(): AppUser | null {
    const raw = this.storage()?.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AppUser;
    } catch {
      this.storage()?.removeItem(USER_STORAGE_KEY);
      return null;
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

