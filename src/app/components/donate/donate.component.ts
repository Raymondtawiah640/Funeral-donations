import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Donation } from '../../services/api.service';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="py-20">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Make a Donation
          </h2>
          <p class="mt-4 text-lg text-gray-500">
            Your contribution helps provide support to families during their most difficult times.
          </p>
        </div>
        
        <!-- Success Message -->
        <div *ngIf="showSuccessMessage" class="mt-8 bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Donation Successful!
              </h3>
              <p class="mt-2 text-sm text-green-700">
                Thank you for your {{donationType}} donation. We appreciate your support!
              </p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="showErrorMessage" class="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Donation Failed
              </h3>
              <p class="mt-2 text-sm text-red-700">
                {{errorMessage}}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Loading State -->
        <div *ngIf="isSubmitting" class="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">
                Processing Donation...
              </h3>
              <p class="mt-2 text-sm text-blue-700">
                Please wait while we process your donation.
              </p>
            </div>
          </div>
        </div>
        
        <div *ngIf="!showSuccessMessage" class="mt-12 bg-white shadow-lg rounded-lg p-8">
          <form (ngSubmit)="onSubmit()" #donationForm="ngForm">
            <!-- Donation Amount -->
            <div class="mb-8">
              <label class="text-base font-medium text-gray-900">Donation Amount</label>
              <fieldset class="mt-4">
                <legend class="sr-only">Donation amount</legend>
                <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  <label *ngFor="let amount of donationAmounts" 
                         [class]="'relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 cursor-pointer ' + 
                                (selectedAmount === amount ? 'border-primary-600 ring-2 ring-primary-600' : 'border-gray-300')">
                    <input type="radio" name="amount" [value]="amount" 
                           [(ngModel)]="selectedAmount" 
                           class="sr-only" 
                           (change)="onAmountChange(amount)">
                    <span>\${{amount}}</span>
                  </label>
                </div>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700">
                    Custom Amount
                  </label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input type="number" 
                           name="customAmount"
                           class="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md" 
                           placeholder="0.00"
                           [(ngModel)]="customAmount"
                           (input)="onCustomAmountChange()"
                           min="1">
                  </div>
                </div>
              </fieldset>
            </div>
            
            <!-- Donor Information -->
            <div class="mb-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Donor Information</h3>
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">First Name *</label>
                  <input type="text" 
                         name="firstName"
                         required
                         [(ngModel)]="donorInfo.firstName"
                         class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input type="text" 
                         name="lastName"
                         required
                         [(ngModel)]="donorInfo.lastName"
                         class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" 
                         name="email"
                         required
                         [(ngModel)]="donorInfo.email"
                         class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" 
                         name="phone"
                         [(ngModel)]="donorInfo.phone"
                         class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>
            </div>
            
            <!-- Donation Type -->
            <div class="mb-8">
              <label class="text-base font-medium text-gray-900">Donation Type</label>
              <div class="mt-4 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                <div class="flex items-center">
                  <input id="one-time" 
                         name="donationType" 
                         type="radio" 
                         checked
                         [(ngModel)]="donationType"
                         value="one-time"
                         class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300">
                  <label for="one-time" class="ml-3 block text-sm font-medium text-gray-700">
                    One-time Donation
                  </label>
                </div>
                <div class="flex items-center">
                  <input id="monthly" 
                         name="donationType" 
                         type="radio" 
                         [(ngModel)]="donationType"
                         value="monthly"
                         class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300">
                  <label for="monthly" class="ml-3 block text-sm font-medium text-gray-700">
                    Monthly Donation
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Submit Button -->
            <div>
              <button type="submit" 
                      [disabled]="!donationForm.valid || isSubmitting"
                      class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                {{ isSubmitting ? 'Processing...' : 'Donate Now - $' + getDonationAmount() }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DonateComponent {
  title = 'Donate - Legacy Donation';
  
  donationAmounts = [25, 50, 100, 250, 500];
  selectedAmount = 50;
  customAmount: number | null = null;
  donationType = 'one-time';
  donorInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };
  
  // API interaction states
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  onAmountChange(amount: number) {
    this.selectedAmount = amount;
    this.customAmount = null;
  }
  
  onCustomAmountChange() {
    if (this.customAmount && this.customAmount > 0) {
      this.selectedAmount = 0; // Use custom amount
    }
  }
  
  getDonationAmount(): number {
    return this.customAmount || this.selectedAmount;
  }
  
  onSubmit() {
    if (!this.isFormValid()) {
      this.showError('Please fill in all required fields.');
      return;
    }

    this.isSubmitting = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;

    const donation: Omit<Donation, 'id' | 'status' | 'created_at'> = {
      amount: this.getDonationAmount(),
      donor_name: `${this.donorInfo.firstName} ${this.donorInfo.lastName}`.trim(),
      donor_email: this.donorInfo.email,
      donor_phone: this.donorInfo.phone || '',
      donation_type: this.donationType as 'one-time' | 'monthly'
    };

    this.apiService.createDonation(donation).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showSuccessMessage = true;
          this.resetForm();
          // Scroll to top to show success message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.showError(response.message || 'An error occurred while processing your donation.');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMsg = this.apiService.getErrorMessage(error);
        this.showError(errorMsg);
      }
    });
  }

  private isFormValid(): boolean {
    return !!(
      this.donorInfo.firstName &&
      this.donorInfo.lastName &&
      this.donorInfo.email &&
      this.getDonationAmount() > 0
    );
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.showErrorMessage = true;
    this.showSuccessMessage = false;
  }

  private resetForm() {
    this.selectedAmount = 50;
    this.customAmount = null;
    this.donationType = 'one-time';
    this.donorInfo = {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    };
  }
}