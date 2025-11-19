import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign up with your email to start creating funeral announcements
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <!-- Step 1: Signup Form -->
          <form *ngIf="currentStep === 'signup'" (ngSubmit)="onSignup()" class="space-y-6">
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div class="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  [(ngModel)]="signupForm.fullName"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  [(ngModel)]="signupForm.email"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div class="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  [(ngModel)]="signupForm.phone"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number (optional)"
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
                [disabled]="isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <span *ngIf="!isLoading">Sign Up</span>
                <span *ngIf="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              </button>
            </div>
          </form>

          <!-- Step 2: Email Verification -->
          <form *ngIf="currentStep === 'verify'" (ngSubmit)="onVerifyEmail()" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Verify Your Email</h3>
              <p class="mt-2 text-sm text-gray-600">
                We've sent a 6-digit verification code to {{ signupForm.email }}
              </p>
            </div>

            <div>
              <label for="verificationCode" class="block text-sm font-medium text-gray-700">
                Verification Code *
              </label>
              <div class="mt-1">
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  maxlength="6"
                  required
                  [(ngModel)]="verificationCode"
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
                [disabled]="isLoading || verificationCode.length !== 6"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <span *ngIf="!isLoading">Verify Email</span>
                <span *ngIf="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              </button>

              <button
                type="button"
                (click)="resendVerificationCode()"
                [disabled]="isLoading || countdown > 0"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <span *ngIf="countdown > 0">Resend in {{ countdown }}s</span>
                <span *ngIf="countdown === 0">Resend Code</span>
              </button>
            </div>
          </form>

          <!-- Success Message -->
          <div *ngIf="currentStep === 'success'" class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Account created successfully!</h3>
            <p class="mt-1 text-sm text-gray-500">
              Your account has been verified. You can now log in to create funeral announcements.
            </p>
            <div class="mt-6">
              <button
                (click)="goToLogin()"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </button>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="mt-6" *ngIf="currentStep === 'signup'">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div class="mt-6">
              <button
                (click)="goToLogin()"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  currentStep: 'signup' | 'verify' | 'success' = 'signup';
  
  signupForm = {
    fullName: '',
    email: '',
    phone: ''
  };
  
  verificationCode = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  countdown = 0;
  private countdownTimer?: any;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onSignup(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Validate form
    if (!this.signupForm.fullName || !this.signupForm.email) {
      this.errorMessage = 'Please fill in all required fields';
      this.isLoading = false;
      return;
    }

    this.apiService.signup(
      this.signupForm.email,
      this.signupForm.fullName,
      this.signupForm.phone || undefined
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Show verification code if available in response
          if (response.data?.verification_code) {
            this.successMessage = `Verification code: ${response.data.verification_code} (Check your email or use this code)`;
          } else {
            this.successMessage = 'Verification code sent to your email';
          }
          this.currentStep = 'verify';
          this.startCountdown();
        } else {
          this.errorMessage = response.error || 'Failed to create account';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.apiService.getErrorMessage(error);
      }
    });
  }

  onVerifyEmail(): void {
    if (this.verificationCode.length !== 6) {
      this.errorMessage = 'Please enter a 6-digit verification code';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.apiService.verifyEmail(this.signupForm.email, this.verificationCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.currentStep = 'success';
          this.clearCountdown();
        } else {
          this.errorMessage = response.error || 'Verification failed';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.apiService.getErrorMessage(error);
      }
    });
  }

  resendVerificationCode(): void {
    if (this.countdown > 0) return;

    this.isLoading = true;
    this.apiService.resendVerificationCode(this.signupForm.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'New verification code sent';
          this.startCountdown();
        } else {
          this.errorMessage = response.error || 'Failed to resend verification code';
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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }
}