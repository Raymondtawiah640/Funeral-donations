import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ApiService, User } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600 cursor-pointer" routerLink="/">Legacy Donation</h1>
            </div>
            
            <!-- Desktop Navigation -->
            <nav class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a routerLink="/" routerLinkActive="text-blue-600" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a routerLink="/announcements" routerLinkActive="text-blue-600" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Announcements</a>
                <a routerLink="/about" routerLinkActive="text-blue-600" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</a>
                <a routerLink="/contact" routerLinkActive="text-blue-600" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Contact</a>
                
                <!-- Authenticated User Menu -->
                <div *ngIf="currentUser" class="relative ml-6">
                  <button (click)="toggleUserMenu()" class="flex items-center text-sm text-gray-600 hover:text-blue-600 focus:outline-none">
                    <span class="mr-2">{{ currentUser.full_name }}</span>
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  <!-- Dropdown Menu -->
                  <div *ngIf="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <a routerLink="/create-announcement" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Create Announcement
                    </a>
                    <a routerLink="/my-announcements" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Announcements
                    </a>
                    <div class="border-t border-gray-100"></div>
                    <button (click)="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Sign Out
                    </button>
                  </div>
                </div>
                
                <!-- Unauthenticated Links -->
                <div *ngIf="!currentUser" class="flex items-center space-x-4 ml-6">
                  <a routerLink="/login" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Login</a>
                  <a routerLink="/signup" class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">Sign Up</a>
                </div>
              </div>
            </nav>

            <!-- Mobile menu button -->
            <div class="md:hidden">
              <button (click)="toggleMobileMenu()" class="text-gray-600 hover:text-blue-600 focus:outline-none">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  <path *ngIf="showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Mobile Navigation Menu -->
        <div *ngIf="showMobileMenu" class="md:hidden border-t border-gray-200">
          <div class="px-4 pt-2 pb-3 space-y-1">
            <a routerLink="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">Home</a>
            <a routerLink="/announcements" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">Announcements</a>
            <a routerLink="/about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">About</a>
            <a routerLink="/contact" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">Contact</a>
            
            <!-- Mobile User Menu -->
            <div *ngIf="currentUser" class="border-t border-gray-200 pt-4">
              <div class="flex items-center px-3 py-2">
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span class="text-sm font-medium text-white">{{ getUserInitials() }}</span>
                  </div>
                </div>
                <div class="ml-3">
                  <div class="text-base font-medium text-gray-800">{{ currentUser.full_name }}</div>
                  <div class="text-sm font-medium text-gray-500">{{ currentUser.email }}</div>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <a routerLink="/create-announcement" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">Create Announcement</a>
                <a routerLink="/my-announcements" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">My Announcements</a>
                <button (click)="logout()" class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">Sign Out</button>
              </div>
            </div>
            
            <!-- Mobile Unauthenticated Links -->
            <div *ngIf="!currentUser" class="border-t border-gray-200 pt-4 space-y-1">
              <a routerLink="/login" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600">Login</a>
              <a routerLink="/signup" class="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700">Sign Up</a>
            </div>
          </div>
        </div>
      </header>

        <router-outlet></router-outlet>

      <!-- Footer -->
      <footer class="bg-white">
        <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div class="flex justify-center space-x-6 md:order-2">
            <a href="#" class="text-gray-400 hover:text-gray-500">
              <span class="sr-only">Facebook</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-500">
              <span class="sr-only">Twitter</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <div class="mt-8 md:mt-0 md:order-1">
            <p class="text-center text-base text-gray-400">
              &copy; 2025 Legacy Donation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Legacy Donation';
  currentUser: User | null = null;
  showUserMenu = false;
  showMobileMenu = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.apiService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  logout(): void {
    this.apiService.logout();
    this.showUserMenu = false;
    this.showMobileMenu = false;
  }

  getUserInitials(): string {
    if (!this.currentUser?.full_name) return 'U';
    
    return this.currentUser.full_name
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  // Close menus when clicking outside
  onClickOutside(event: Event): void {
    const target = event.target as Element;
    if (!target.closest('.relative') && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }
}