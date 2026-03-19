import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppUser } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.backendBaseUrl}/user`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.apiUrl}/profile`);
  }
}

