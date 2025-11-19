import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, User } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Use email verification to access your account
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <!-- Step 1: Email Input -->
          <form *ngIf="currentStep === 'email'" (ngSubmit)="onRequestLoginCode()" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div class="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  [(ngModel)]="loginForm.email"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div *ngIf="errorMessage" class="text-red-600 text-sm">
              {{ errorMessage }}
            </div>

            <div *ngIf="successMessage" class="text-green-600 text-sm">
              {{ successMessage }}
            </div>

            <div>
              <button
                type="submit"
                [disabled]="isLoading || !loginForm.email"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <span *ngIf="!isLoading">Request Login Code</span>
                <span *ngIf="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              </button>
            </div>
          </form>

          <!-- Step 2: Login Code Verification -->
          <form *ngIf="currentStep === 'code'" (ngSubmit)="onLogin()" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Enter Login Code</h3>
              <p class="mt-2 text-sm text-gray-600">
                We've sent a 6-digit login code to {{ loginForm.email }}
              </p>
            </div>

            <div>
              <label for="loginCode" class="block text-sm font-medium text-gray-700">
                Login Code *
              </label>
              <div class="mt-1">
                <input
                  id="loginCode"
                  name="loginCode"
                  type="text"
                  maxlength="6"
                  required
                  [(ngModel)]="loginCode"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>
            </div>

            <div *ngIf="errorMessage" class="text-red-600 text-sm">
              {{ errorMessage }}
            </div>

            <div *ngIf="successMessage" class="text-green-600 text-sm">
              {{ successMessage }}
            </div>

            <div class="space-y-3">
              <button
                type="submit"
                [disabled]="isLoading || loginCode.length !== 6"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <span *ngIf="!isLoading">Sign In</span>
                <span *ngIf="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              </button>

              <button
                type="button"
                (click)="onRequestLoginCode()"
                [disabled]="isLoading || countdown > 0"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <span *ngIf="countdown > 0">Send new code in {{ countdown }}s</span>
                <span *ngIf="countdown === 0">Send New Code</span>
              </button>
            </div>
          </form>

          <!-- Navigation Links -->
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div class="mt-6">
              <button
                (click)="goToSignup()"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  currentStep: 'email' | 'code' = 'email';
  
  loginForm = {
    email: ''
  };
  
  loginCode = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  countdown = 0;
  private countdownTimer?: any;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onRequestLoginCode(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    if (!this.loginForm.email) {
      this.errorMessage = 'Please enter your email address';
      this.isLoading = false;
      return;
    }

    this.apiService.requestLoginCode(this.loginForm.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Show login code if available in response
          if (response.data?.login_code) {
            this.successMessage = `Login code: ${response.data.login_code} (Check your email or use this code)`;
          } else {
            this.successMessage = 'Login code sent to your email';
          }
          this.currentStep = 'code';
          this.startCountdown();
        } else {
          this.errorMessage = response.error || 'Failed to send login code';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.apiService.getErrorMessage(error);
      }
    });
  }

  onLogin(): void {
    if (this.loginCode.length !== 6) {
      this.errorMessage = 'Please enter a 6-digit login code';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.apiService.loginWithCode(this.loginForm.email, this.loginCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Set user and token
          this.apiService.setCurrentUser(response.data.user);
          this.apiService.setAuthToken(response.data.session_token);
          
          // Clear countdown
          this.clearCountdown();
          
          // Navigate to dashboard or announcements
          this.router.navigate(['/announcements']);
        } else {
          this.errorMessage = response.error || 'Login failed';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.apiService.getErrorMessage(error);
      }
    });
  }

  private startCountdown(): void {
    this.countdown = 60;
    this.countdownTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.clearCountdown();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
    this.countdown = 0;
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }
}