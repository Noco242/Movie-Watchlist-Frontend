import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginPageComponent } from './features/auth/login-page.component';
import { RegisterPageComponent } from './features/auth/register-page.component';
import { HomePageComponent } from './features/home/home-page.component';
import { WatchlistPageComponent } from './features/watchlist/watchlist-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'entdecken' },
  { path: 'entdecken', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'watchlist', component: WatchlistPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'entdecken' }
];
