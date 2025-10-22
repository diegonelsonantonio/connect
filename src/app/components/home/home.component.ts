import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/types';
import { ImageModalComponent } from '../shared/image-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageModalComponent],
  templateUrl: './home.component.html'
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
  
  // Modal de imagen
  showImageModal = false;
  modalImageUrl = '';
  modalImageAlt = '';
  modalUsername = '';
  modalDescription = '';

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

  openImageModal(post: Post): void {
    this.modalImageUrl = post.image_url;
    this.modalImageAlt = post.description;
    this.modalUsername = post.username;
    this.modalDescription = post.description;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }
}