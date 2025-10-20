import { Injectable, signal } from '@angular/core';
import { User } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'authToken';
  private userKey = 'currentUser';
  
  currentUser = signal<User | null>(this.getUser());

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string, username?: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.decodeAndSetUser(token, username);
  }

  private decodeAndSetUser(token: string, username?: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      // Usar el identity del JWT que contiene el user_id
      const user = { 
        _id: payload.identity || payload.sub || payload.user_id, 
        username: username || payload.username || 'Usuario'
      };
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.currentUser.set(user);
    } catch (e) {
      console.error('Error decoding token', e);
      this.logout();
    }
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }
}
