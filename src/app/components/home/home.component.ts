import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-6 max-w-2xl">
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="apiError()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {{ apiError() }}
      </div>

      <!-- Posts Feed -->
      <div *ngIf="!isLoading() && posts().length > 0" class="space-y-6">
        <div *ngFor="let post of posts()" class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- Post Header -->
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ post.username.charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ post.username }}</h3>
                <p class="text-sm text-gray-500">{{ formatDate(post.createdAt) }}</p>
              </div>
            </div>
            
            <!-- Post Options (only for own posts) -->
            <div *ngIf="post.user_id === currentUserId" class="relative">
              <button (click)="togglePostMenu(post._id)" 
                      class="text-gray-500 hover:text-gray-700 p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                </svg>
              </button>
              
              <!-- Post Menu Dropdown -->
              <div *ngIf="showPostMenus[post._id]" 
                   class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <button (click)="startEditPost(post)" 
                        class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Edit Description
                </button>
                <button (click)="deletePost(post._id)" 
                        class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                  Delete Post
                </button>
              </div>
            </div>
          </div>

          <!-- Post Image -->
          <div class="relative">
            <img [src]="post.image_url" [alt]="post.description" 
                 class="w-full h-96 object-cover">
          </div>

          <!-- Post Actions -->
          <div class="p-4">
            <div class="flex items-center space-x-4 mb-3">
              <button (click)="likePost(post._id)" 
                      class="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors duration-200">
                <svg class="w-6 h-6" [class.text-red-500]="isLikedByCurrentUser(post)" 
                     [class.fill-current]="isLikedByCurrentUser(post)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span class="font-medium">{{ post.likes.length }}</span>
              </button>
              
              <button (click)="toggleComments(post._id)" 
                      class="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span class="font-medium">{{ post.comments.length }}</span>
              </button>
            </div>

            <!-- Post Description -->
            <div class="mb-3">
              <span class="font-semibold text-gray-900">{{ post.username }}</span>
              
              <!-- Edit Mode -->
              <div *ngIf="editingPost === post._id" class="mt-2">
                <textarea [(ngModel)]="editDescription" 
                          name="edit-description-{{post._id}}"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          rows="3"></textarea>
                <div class="flex space-x-2 mt-2">
                  <button (click)="saveEditPost(post._id)" 
                          class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                    Save
                  </button>
                  <button (click)="cancelEditPost()" 
                          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
              
              <!-- Normal Mode -->
              <span *ngIf="editingPost !== post._id" class="text-gray-700 ml-2">{{ post.description }}</span>
            </div>

            <!-- Comments Section -->
            <div *ngIf="showComments[post._id]" class="border-t pt-3">
              <!-- Existing Comments -->
              <div *ngIf="post.comments.length > 0" class="space-y-2 mb-3">
                <div *ngFor="let comment of post.comments" class="flex space-x-2">
                  <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-xs font-bold text-gray-600">{{ comment.username.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="flex-1">
                    <span class="font-semibold text-sm text-gray-900">{{ comment.username }}</span>
                    <span class="text-sm text-gray-700 ml-1">{{ comment.text }}</span>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(comment.createdAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- Add Comment Form -->
              <form (ngSubmit)="addComment(post._id)" class="flex space-x-2">
                <input [(ngModel)]="newComments[post._id]" 
                       name="comment-{{post._id}}"
                       placeholder="Add a comment..." 
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <button type="submit" 
                        [disabled]="!newComments[post._id] || !newComments[post._id].trim()"
                        class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && posts().length === 0" class="text-center py-12">
        <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
        <p class="text-gray-600 mb-4">Be the first to share something amazing!</p>
        <a routerLink="/upload" 
           class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
          Create your first post
        </a>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  isLoading = signal(true);
  apiError = signal('');
  posts = signal<Post[]>([]);
  currentUserId: string = '';
  showComments: { [key: string]: boolean } = {};
  newComments: { [key: string]: string } = {};
  showPostMenus: { [key: string]: boolean } = {};
  editingPost: string | null = null;
  editDescription: string = '';

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.currentUserId = this.authService.getUser()?._id || '';
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.apiService.getPosts().subscribe({
      next: (posts) => {
        console.log('Posts recibidos:', posts);
        this.posts.set(Array.isArray(posts) ? posts : []);
      },
      error: (err) => {
        console.error('Error cargando posts:', err);
        this.apiError.set('No se pudieron cargar las publicaciones.');
      },
      complete: () => this.isLoading.set(false)
    });
  }

  likePost(postId: string): void {
    this.apiService.likePost(postId).subscribe({
      next: (res) => {
        // Recargar posts para obtener el estado actualizado
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error al dar like:', err);
        this.loadPosts();
      }
    });
  }

  private updatePostLikeLocally(postId: string): void {
    const currentPosts = this.posts();
    const updatedPosts = currentPosts.map(post => {
      if (post._id === postId) {
        const isCurrentlyLiked = post.likes.includes(this.currentUserId);
        if (isCurrentlyLiked) {
          // Remover like
          post.likes = post.likes.filter(id => id !== this.currentUserId);
        } else {
          // Añadir like
          post.likes = [...post.likes, this.currentUserId];
        }
      }
      return post;
    });
    this.posts.set(updatedPosts);
  }

  toggleComments(postId: string): void {
    this.showComments[postId] = !this.showComments[postId];
  }

  addComment(postId: string): void {
    const commentText = this.newComments[postId]?.trim();
    if (!commentText) return;

    this.apiService.addComment(postId, commentText).subscribe({
      next: (res) => {
        this.newComments[postId] = '';
        // Recargar posts para mostrar el nuevo comentario
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.loadPosts();
      }
    });
  }

  private addCommentLocally(postId: string, commentText: string): void {
    const currentPosts = this.posts();
    const currentUser = this.authService.getUser();
    
    if (!currentUser) return;

    const updatedPosts = currentPosts.map(post => {
      if (post._id === postId) {
        const newComment = {
          comment_id: Date.now().toString(), // ID temporal
          user_id: this.currentUserId,
          username: currentUser.username,
          text: commentText,
          createdAt: new Date().toISOString()
        };
        post.comments = [...post.comments, newComment];
      }
      return post;
    });
    this.posts.set(updatedPosts);
  }

  isLikedByCurrentUser(post: Post): boolean {
    return post.likes.includes(this.currentUserId);
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

  togglePostMenu(postId: string): void {
    this.showPostMenus[postId] = !this.showPostMenus[postId];
    // Cerrar otros menús
    Object.keys(this.showPostMenus).forEach(id => {
      if (id !== postId) this.showPostMenus[id] = false;
    });
  }

  startEditPost(post: Post): void {
    this.editingPost = post._id;
    this.editDescription = post.description;
    this.showPostMenus[post._id] = false;
  }

  saveEditPost(postId: string): void {
    if (!this.editDescription.trim()) return;

    this.apiService.updatePost(postId, this.editDescription.trim()).subscribe({
      next: (res) => {
        console.log('Post updated:', res);
        this.editingPost = null;
        this.editDescription = '';
        this.loadPosts(); // Recargar para mostrar cambios
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
        this.loadPosts(); // Recargar para mostrar cambios
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        alert('Error deleting post: ' + (err.error?.msg || 'Unknown error'));
      }
    });
  }
}