import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Post, User } from '../../models/types';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-6 max-w-4xl">
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="apiError()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {{ apiError() }}
      </div>

      <!-- Profile Content -->
      <div *ngIf="!isLoading() && currentUser()" class="space-y-8">
        <!-- Profile Header -->
        <div class="text-center">
          <div class="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-4xl">{{ (currentUser()?.username || 'U').charAt(0).toUpperCase() }}</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ currentUser()?.username || 'User' }}</h1>
          <p class="text-gray-600 mb-4">{{ '@' + (currentUser()?.username?.toLowerCase() || 'user') }}</p>
          
          <!-- Stats -->
          <div class="flex justify-center space-x-8 mb-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ userPosts().length }}</div>
              <div class="text-sm text-gray-600">Posts</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ getTotalLikes() }}</div>
              <div class="text-sm text-gray-600">Likes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ getTotalComments() }}</div>
              <div class="text-sm text-gray-600">Comments</div>
            </div>
          </div>

          <button (click)="navigateToUpload()" 
                  class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
            Upload New Photo
          </button>
        </div>

        <!-- Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let post of userPosts()" class="bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Post Image -->
            <div class="relative group">
              <img [src]="post.image_url" [alt]="post.description" 
                   class="w-full h-64 object-cover">
              
              <!-- Overlay with actions -->
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                  <button (click)="startEditPost(post)" 
                          class="bg-white text-gray-800 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                    Edit
                  </button>
                  <button (click)="deletePost(post._id)" 
                          class="bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <!-- Post Info -->
            <div class="p-4">
              <!-- Edit Mode -->
              <div *ngIf="editingPost === post._id" class="space-y-3">
                <textarea [(ngModel)]="editDescription" 
                          name="edit-description-{{post._id}}"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          rows="3"
                          placeholder="Edit your caption..."></textarea>
                <div class="flex space-x-2">
                  <button (click)="saveEditPost(post._id)" 
                          class="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200">
                    Save
                  </button>
                  <button (click)="cancelEditPost()" 
                          class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors duration-200">
                    Cancel
                  </button>
                </div>
              </div>
              
              <!-- Normal Mode -->
              <div *ngIf="editingPost !== post._id">
                <p class="text-gray-800 text-sm mb-3">{{ post.description }}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{{ formatDate(post.createdAt) }}</span>
                  <div class="flex space-x-4">
                    <span>{{ post.likes.length }} likes</span>
                    <span>{{ post.comments.length }} comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="userPosts().length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p class="text-gray-600 mb-4">Share your first moment with the world!</p>
          <button (click)="navigateToUpload()" 
                  class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
            Upload Your First Photo
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  isLoading = signal(true);
  apiError = signal('');
  userPosts = signal<Post[]>([]);
  currentUser = this.authService.currentUser;
  editingPost: string | null = null;
  editDescription: string = '';

  private apiService = inject(ApiService);
  private router = inject(Router);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.loadUserPosts(user._id);
    }
  }

  loadUserPosts(userId: string): void {
    this.isLoading.set(true);
    this.apiService.getPosts().subscribe({
      next: (posts) => {
        // Filtrar posts del usuario actual
        const userPosts = Array.isArray(posts) ? posts.filter(post => post.user_id === userId) : [];
        this.userPosts.set(userPosts);
      },
      error: (err) => {
        console.error('Error cargando posts del usuario:', err);
        this.apiError.set('No se pudieron cargar tus publicaciones.');
      },
      complete: () => this.isLoading.set(false)
    });
  }

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }

  getTotalLikes(): number {
    return this.userPosts().reduce((total, post) => total + post.likes.length, 0);
  }

  getTotalComments(): number {
    return this.userPosts().reduce((total, post) => total + post.comments.length, 0);
  }

  startEditPost(post: Post): void {
    this.editingPost = post._id;
    this.editDescription = post.description;
  }

  saveEditPost(postId: string): void {
    if (!this.editDescription.trim()) {
      alert('Description cannot be empty');
      return;
    }

    this.apiService.updatePost(postId, this.editDescription.trim()).subscribe({
      next: (res) => {
        console.log('Post updated:', res);
        this.editingPost = null;
        this.editDescription = '';
        // Recargar posts para mostrar cambios
        const user = this.currentUser();
        if (user) {
          this.loadUserPosts(user._id);
        }
      },
      error: (err) => {
        console.error('Error updating post:', err);
        alert('Error updating post: ' + (err.error?.msg || 'Unknown error'));
      }
    });
  }

  cancelEditPost(): void {
    this.editingPost = null;
    this.editDescription = '';
  }

  deletePost(postId: string): void {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    this.apiService.deletePost(postId).subscribe({
      next: (res) => {
        console.log('Post deleted:', res);
        // Recargar posts para mostrar cambios
        const user = this.currentUser();
        if (user) {
          this.loadUserPosts(user._id);
        }
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        alert('Error deleting post: ' + (err.error?.msg || 'Unknown error'));
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  }
}