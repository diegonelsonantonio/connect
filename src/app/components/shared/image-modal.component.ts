import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-image-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fade-in"
      (click)="closeModal()"
    >
      <!-- Botón de cerrar -->
      <button
        class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-60"
        (click)="closeModal()"
      >
        ×
      </button>

      <!-- Contenedor de la imagen -->
      <div
        class="relative max-w-4xl max-h-full p-4"
        (click)="$event.stopPropagation()"
      >
        <img
          [src]="imageUrl"
          [alt]="imageAlt"
          class="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-in"
        />

        <!-- Información del post -->
        <div
          *ngIf="username"
          class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg"
        >
          <div class="flex items-center space-x-3">
            <img
              class="h-8 w-8 rounded-full object-cover"
              [src]="
                'https://placehold.co/100x100/' +
                (username.length % 2 === 0 ? 'e91e63' : '004d40') +
                '/white?text=' +
                username.charAt(0).toUpperCase()
              "
              [alt]="username"
            />
            <span class="font-semibold">{{ username }}</span>
          </div>
          <p *ngIf="description" class="mt-2 text-sm">{{ description }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes scale-in {
        from {
          transform: scale(0.8);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .animate-scale-in {
        animation: scale-in 0.3s ease-out;
      }
    `,
  ],
})
export class ImageModalComponent {
  @Input() isOpen = false;
  @Input() imageUrl = "";
  @Input() imageAlt = "";
  @Input() username = "";
  @Input() description = "";
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
