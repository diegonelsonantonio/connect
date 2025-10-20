import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header
      class="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
    >
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center space-x-2">
            <div
              class="w-8 h-8 bg-white rounded-full flex items-center justify-center"
            >
              <span class="text-pink-600 font-bold text-lg">✦</span>
            </div>
            <h1 class="text-xl font-bold">Connect</h1>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center space-x-6">
            <a
              routerLink="/home"
              routerLinkActive="text-yellow-300"
              class="hover:text-yellow-300 transition-colors duration-200"
            >
              Home
            </a>
          </nav>

          <!-- User Actions -->
          <div class="flex items-center space-x-4">
            <div class="relative">
              <div
                class="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer"
                (click)="toggleUserMenu()"
              >
                <span class="text-purple-600 font-bold">{{
                  getUserInitial()
                }}</span>
              </div>

              <!-- User Dropdown -->
              <div
                *ngIf="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
              >
                <a
                  routerLink="/upload"
                  class="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  📸 Upload Photo
                </a>
                <a
                  routerLink="/profile"
                  class="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  👤 Profile
                </a>
                <button
                  (click)="logout()"
                  class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  showUserMenu = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  getUserInitial(): string {
    const user = this.authService.currentUser();
    return user?.username?.charAt(0).toUpperCase() || "U";
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/auth"]);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }
}
