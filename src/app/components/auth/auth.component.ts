import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <!-- Logo and Welcome -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-2xl">✦</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome to Connect</h1>
          <p class="text-gray-600">Share your moments with the world</p>
        </div>

        <h2 class="text-xl font-semibold text-center mb-6 text-gray-700">
          {{ authMode() === 'login' ? 'Sign In' : 'Create Account' }}
        </h2>
      
      <div class="flex justify-center mb-6">
        <button 
          (click)="authMode.set('login')"
          [class.bg-gradient-to-r]="authMode() === 'login'"
          [class.from-purple-600]="authMode() === 'login'"
          [class.to-pink-600]="authMode() === 'login'"
          [class.text-white]="authMode() === 'login'"
          [class.bg-gray-100]="authMode() !== 'login'"
          [class.text-gray-600]="authMode() !== 'login'"
          class="px-6 py-2 rounded-l-full font-medium transition-all duration-200">
          Sign In
        </button>
        <button 
          (click)="authMode.set('register')"
          [class.bg-gradient-to-r]="authMode() === 'register'"
          [class.from-purple-600]="authMode() === 'register'"
          [class.to-pink-600]="authMode() === 'register'"
          [class.text-white]="authMode() === 'register'"
          [class.bg-gray-100]="authMode() !== 'register'"
          [class.text-gray-600]="authMode() !== 'register'"
          class="px-6 py-2 rounded-r-full font-medium transition-all duration-200">
          Sign Up
        </button>
      </div>

      <form (ngSubmit)="handleAuthSubmit()" class="space-y-4">
        <div *ngIf="authMode() === 'register'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input 
            [(ngModel)]="authForm.username" 
            name="username"
            type="text" 
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            [(ngModel)]="authForm.email" 
            name="email"
            type="email" 
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input 
            [(ngModel)]="authForm.password" 
            name="password"
            type="password" 
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <button 
          type="submit" 
          [disabled]="isLoading()"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">
          {{ isLoading() ? 'Loading...' : (authMode() === 'login' ? 'Sign In' : 'Create Account') }}
        </button>
      </form>

        <div *ngIf="apiError()" class="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {{ apiError() }}
        </div>

        <!-- Social Login Options (placeholder) -->
        <div class="mt-6 text-center">
          <p class="text-gray-500 text-sm mb-4">Or continue with</p>
          <div class="flex justify-center space-x-4">
            <button class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200">
              f
            </button>
            <button class="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200">
              G
            </button>
            <button class="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-200">
              t
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  authMode = signal<'login' | 'register'>('login');
  isLoading = signal(false);
  apiError = signal('');
  authForm = { username: '', email: '', password: '' };

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  handleAuthSubmit() {
    this.isLoading.set(true);
    this.apiError.set('');
    
    // Validación básica
    if (!this.authForm.email || !this.authForm.password) {
      this.apiError.set('Email y contraseña son requeridos');
      this.isLoading.set(false);
      return;
    }
    
    if (this.authMode() === 'register' && !this.authForm.username) {
      this.apiError.set('Usuario es requerido para el registro');
      this.isLoading.set(false);
      return;
    }
    
    console.log('Enviando datos:', this.authForm);
    console.log('Modo:', this.authMode());
    
    const action = this.authMode() === 'login'
      ? this.apiService.login({ email: this.authForm.email, password: this.authForm.password })
      : this.apiService.register(this.authForm);

    action.subscribe({
      next: (res) => {
        const token = res.access_token || res.token;
        this.authService.setToken(token, res.username);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error de API:', err);
        let errorMessage = 'Ocurrió un error en el servidor.';
        
        if (err.status === 409) {
          errorMessage = 'El usuario ya existe. Intenta con otro nombre de usuario.';
        } else if (err.status === 400) {
          errorMessage = 'Datos inválidos. Verifica la información ingresada.';
        } else if (err.status === 401) {
          errorMessage = 'Credenciales incorrectas.';
        } else if (err.status === 500) {
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
        } else if (err.error?.msg) {
          errorMessage = err.error.msg;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        this.apiError.set(errorMessage);
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
    });
  }
}