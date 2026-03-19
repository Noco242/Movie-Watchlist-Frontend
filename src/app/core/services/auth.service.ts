import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppUser, StoredUser } from '../models/user.model';

const USERS_STORAGE_KEY = 'mw_users_v1';
const SESSION_STORAGE_KEY = 'mw_session_v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = signal<StoredUser[]>(this.readUsers());
  readonly currentUser = signal<AppUser | null>(this.readSession());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(private readonly router: Router) {}

  register(name: string, email: string, password: string): { success: boolean; message: string } {
    const normalizedEmail = email.trim().toLowerCase();

    if (this.users().some((user) => user.email === normalizedEmail)) {
      return { success: false, message: 'Diese E-Mail ist bereits registriert.' };
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password
    };

    const updatedUsers = [...this.users(), newUser];
    this.users.set(updatedUsers);
    this.storage()?.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    this.setSession(newUser);
    return { success: true, message: 'Registrierung erfolgreich.' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users().find((entry) => entry.email === normalizedEmail && entry.password === password);

    if (!user) {
      return { success: false, message: 'E-Mail oder Passwort ist ungültig.' };
    }

    this.setSession(user);
    return { success: true, message: 'Login erfolgreich.' };
  }

  logout(): void {
    this.currentUser.set(null);
    this.storage()?.removeItem(SESSION_STORAGE_KEY);
    this.router.navigateByUrl('/login');
  }

  private setSession(user: AppUser): void {
    const sessionUser: AppUser = { id: user.id, name: user.name, email: user.email };
    this.currentUser.set(sessionUser);
    this.storage()?.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
  }

  private readUsers(): StoredUser[] {
    const raw = this.storage()?.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as StoredUser[];
    } catch {
      this.storage()?.removeItem(USERS_STORAGE_KEY);
      return [];
    }
  }

  private readSession(): AppUser | null {
    const raw = this.storage()?.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AppUser;
    } catch {
      this.storage()?.removeItem(SESSION_STORAGE_KEY);
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

