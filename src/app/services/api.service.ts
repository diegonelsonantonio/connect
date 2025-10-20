import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private API_BASE_URL = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private getAuthHeadersForFormData(): HttpHeaders {
    const token = this.authService.getToken();
    // Para FormData, solo incluir Authorization - el navegador maneja Content-Type automáticamente
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // --- MÉTODOS DE API ---
  login(data: { email: string; password: string }): Observable<{ access_token: string; username: string }> {
    console.log('Enviando login a:', `${this.API_BASE_URL}/login`);
    console.log('Datos a enviar:', JSON.stringify(data));
    return this.http.post<{ access_token: string; username: string }>(`${this.API_BASE_URL}/login`, data);
  }

  register(data: { username: string; email: string; password: string }): Observable<any> {
    console.log('Enviando registro a:', `${this.API_BASE_URL}/register`);
    console.log('Datos a enviar:', JSON.stringify(data));
    
    // Intentar sin headers primero para ver si es un problema de CORS
    return this.http.post(`${this.API_BASE_URL}/register`, data);
  }

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE_URL}/posts`, { headers: this.getAuthHeaders() });
  }

  getUserPosts(userId: string): Observable<any[]> {
    // Según el informe, no hay endpoint específico para posts de usuario
    // Filtraremos en el frontend
    return this.getPosts();
  }
  
  createPost(formData: FormData): Observable<any> {
    console.log('Enviando FormData a:', `${this.API_BASE_URL}/posts`);
    console.log('FormData object:', formData);
    return this.http.post(`${this.API_BASE_URL}/posts`, formData, { headers: this.getAuthHeadersForFormData() });
  }

  likePost(postId: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.API_BASE_URL}/posts/${postId}/like`, {}, { headers: this.getAuthHeaders() });
  }

  addComment(postId: string, text: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/posts/${postId}/comment`, { text }, { headers: this.getAuthHeaders() });
  }

  updatePost(postId: string, description: string): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/posts/${postId}`, { description }, { headers: this.getAuthHeaders() });
  }

  deletePost(postId: string): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/posts/${postId}`, { headers: this.getAuthHeaders() });
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE_URL}/notifications`, { headers: this.getAuthHeaders() });
  }

  markNotificationRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/notifications/${notificationId}/read`, {}, { headers: this.getAuthHeaders() });
  }
}
