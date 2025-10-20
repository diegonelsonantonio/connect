import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">
          Create a new post
        </h2>

        <form (ngSubmit)="handleUpload($event)" class="space-y-6">
          <!-- Photo Upload Area -->
          <div
            class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors duration-200"
          >
            <div *ngIf="!selectedFile" class="space-y-4">
              <div
                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto"
              >
                <svg
                  class="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div>
                <p class="text-lg font-medium text-gray-700">
                  Upload a photo or drag and drop
                </p>
                <p class="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <label
                class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-pink-700 cursor-pointer transition-all duration-200"
              >
                <span>Select Photo</span>
                <input
                  type="file"
                  (change)="onFileSelected($event)"
                  accept="image/*"
                  class="hidden"
                />
              </label>
            </div>

            <div *ngIf="selectedFile" class="space-y-4">
              <div
                class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <svg
                  class="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p class="text-lg font-medium text-gray-700">
                {{ selectedFile.name }}
              </p>
              <button
                type="button"
                (click)="removeFile()"
                class="text-red-600 hover:text-red-800 font-medium"
              >
                Remove file
              </button>
            </div>
          </div>

          <!-- Caption -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Caption</label
            >
            <textarea
              [(ngModel)]="description"
              name="description"
              rows="4"
              placeholder="Write a caption for your photo..."
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isLoading() || !selectedFile || !description.trim()"
            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <span *ngIf="!isLoading()">Publish</span>
            <span *ngIf="isLoading()" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Publishing...
            </span>
          </button>
        </form>

        <!-- Status Messages -->
        <div
          *ngIf="uploadStatus()"
          class="mt-6 p-4 rounded-lg"
          [class.bg-green-50]="!apiError()"
          [class.border-green-200]="!apiError()"
          [class.text-green-700]="!apiError()"
          [class.bg-red-50]="apiError()"
          [class.border-red-200]="apiError()"
          [class.text-red-700]="apiError()"
        >
          {{ uploadStatus() }}
        </div>
      </div>
    </div>
  `,
})
export class UploadComponent {
  isLoading = signal(false);
  uploadStatus = signal("");
  apiError = signal("");
  description = "";
  selectedFile: File | null = null;

  private apiService = inject(ApiService);
  private router = inject(Router);
  private authService = inject(AuthService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadStatus.set("");
      this.apiError.set("");
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadStatus.set("");
    this.apiError.set("");
  }

  handleUpload(event: Event) {
    event.preventDefault();
    if (!this.selectedFile || !this.description.trim()) {
      this.uploadStatus.set(
        "Por favor, selecciona una imagen y añade una descripción."
      );
      this.apiError.set("Datos incompletos");
      return;
    }

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (this.selectedFile.size > maxSize) {
      this.uploadStatus.set("El archivo es demasiado grande. Máximo 10MB.");
      this.apiError.set("Archivo demasiado grande");
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(this.selectedFile.type)) {
      this.uploadStatus.set(
        "Tipo de archivo no permitido. Use JPG, PNG, GIF o WEBP."
      );
      this.apiError.set("Tipo de archivo inválido");
      return;
    }

    this.isLoading.set(true);
    this.uploadStatus.set("Subiendo imagen...");
    this.apiError.set("");

    const formData = new FormData();
    formData.append("photo", this.selectedFile);
    formData.append("description", this.description.trim());

    this.apiService.createPost(formData).subscribe({
      next: (res) => {
        console.log("Upload exitoso:", res);
        this.uploadStatus.set(
          "¡Publicación creada exitosamente! Redirigiendo..."
        );
        this.apiError.set("");
        setTimeout(() => this.router.navigate(["/home"]), 1500);
      },
      error: (err) => {
        console.error("Error completo en upload:", err);
        console.error("Status:", err.status);
        console.error("Error body:", err.error);

        let errorMsg = "Error al crear la publicación.";

        if (err.error?.msg) {
          errorMsg = err.error.msg;
        } else if (err.error?.detail) {
          errorMsg = err.error.detail;
        } else if (err.message) {
          errorMsg = err.message;
        } else if (err.status === 0) {
          errorMsg = "Error de conexión. Verifica tu conexión a internet.";
        } else if (err.status === 413) {
          errorMsg = "El archivo es demasiado grande.";
        } else if (err.status === 415) {
          errorMsg = "Tipo de archivo no soportado.";
        } else if (err.status >= 500) {
          errorMsg = "Error del servidor. Intenta de nuevo más tarde.";
        }

        this.apiError.set(errorMsg);
        this.uploadStatus.set(errorMsg);
        this.isLoading.set(false);
      },
      complete: () => {
        if (!this.apiError()) {
          this.isLoading.set(false);
        }
      },
    });
  }
}
