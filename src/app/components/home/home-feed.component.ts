import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/types';
import { ImageModalComponent } from '../shared/image-modal.component';

@Component({
  selector: 'app-home-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageModalComponent],
  templateUrl: './home.component.html'
})
export class HomeFeedComponent implements OnInit {
  isLoading = signal(true);
  apiError = signal('');
  posts = signal<Post[]>([]);
  currentUserId: string = '';
  
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
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error al dar like:', err);
        this.loadPosts();
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