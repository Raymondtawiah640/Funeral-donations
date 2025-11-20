import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService, FuneralAnnouncement } from '../../services/api.service';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="py-20">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-12">
          <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-gray-600">Loading announcement details...</p>
        </div>

        <!-- Announcement Information -->
        <div *ngIf="announcement && !isLoading" class="mb-8 bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <img *ngIf="getThumbnailImage(announcement)" 
                   [src]="getThumbnailImage(announcement)" 
                   [alt]="announcement.deceased_name"
                   class="h-16 w-16 object-cover rounded-lg shadow-md" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900">{{ announcement.deceased_name }}</h2>
              <p class="text-gray-600">{{ getMessagePreview() }}</p>
              <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span *ngIf="announcement.goal_amount">Goal: {{ formatCurrency(announcement.goal_amount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center" *ngIf="!isLoading">
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
                Notification Sent!
              </h3>
              <p class="mt-2 text-sm text-green-700">
                Thank you for notifying the family of your donation. They will appreciate your thoughtfulness!
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
                Error
              </h3>
              <p class="mt-2 text-sm text-red-700">
                {{errorMessage}}
              </p>
            </div>
          </div>
        </div>
        
        <div *ngIf="!isLoading" class="mt-12 bg-white shadow-lg rounded-lg p-8">
          <!-- Donation Instructions -->
          <div *ngIf="announcement" class="mb-8">
            <h3 class="text-lg font-medium text-gray-900 mb-6">How to Donate</h3>
            <p class="text-gray-600 mb-6">
              Please send your donation directly to the beneficiary's account using the details below.
            </p>

            <!-- Payment Details -->
            <div class="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 class="text-md font-medium text-gray-900 mb-4">Payment Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-500">Beneficiary</label>
                  <p class="mt-1 text-sm text-gray-900 font-medium">{{ announcement.beneficiary_name }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-500">Account Type</label>
                  <p class="mt-1 text-sm text-gray-900">{{ announcement.beneficiary_account_type === 'bank' ? 'Bank Account' : 'Mobile Money' }}</p>
                </div>
                
                <div *ngIf="announcement.beneficiary_account_type === 'bank'" class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-500">Bank Account Number</label>
                  <div class="flex items-center mt-1">
                    <p class="text-sm text-gray-900 font-mono text-lg">{{ announcement.beneficiary_bank_account }}</p>
                    <button type="button" (click)="copyToClipboard(announcement.beneficiary_bank_account || '')" class="ml-3 text-blue-600 hover:text-blue-800">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div *ngIf="announcement.beneficiary_account_type === 'mobile_money'" class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-500">Mobile Money Number</label>
                  <div class="flex items-center mt-1">
                    <p class="text-sm text-gray-900 font-mono text-lg">{{ announcement.beneficiary_mobile_money }}</p>
                    <button type="button" (click)="copyToClipboard(announcement.beneficiary_mobile_money || '')" class="ml-3 text-blue-600 hover:text-blue-800">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Thank You Message -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 class="text-md font-medium text-green-900 mb-2">Thank You</h4>
              <p class="text-sm text-green-700">
                After making your donation, the family will be notified and the donation amount will be updated on this page.
                Please keep your transaction receipt for your records.
              </p>
            </div>
          </div>

          <!-- Contact Form (Optional) -->
          <div class="border-t border-gray-200 pt-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Notify the Family (Optional)</h3>
            <p class="text-gray-600 mb-6">
              Let the family know you've made a donation by filling out the form below.
            </p>
            
            <form (ngSubmit)="onNotifyFamily()" #notificationForm="ngForm">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input type="text" name="donorName" required [(ngModel)]="donorInfo.firstName" 
                         class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-900 placeholder-gray-500 sm:text-sm"
                         placeholder="Enter your full name">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input type="email" name="donorEmail" required [(ngModel)]="donorInfo.email" 
                         class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-900 placeholder-gray-500 sm:text-sm"
                         placeholder="Enter your email address">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                  <textarea name="donorMessage" [(ngModel)]="donorInfo.phone" rows="4"
                            class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-900 placeholder-gray-500 sm:text-sm resize-none"
                            placeholder="Share a message of support..."></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Your Name *</label>
                  <input type="text" name="donorName" required [(ngModel)]="donorInfo.firstName" 
                         class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" name="donorEmail" required [(ngModel)]="donorInfo.email" 
                         class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Message (Optional)</label>
                  <textarea name="donorMessage" [(ngModel)]="donorInfo.phone" rows="3"
                            class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="Share a message of support..."></textarea>
                </div>
              </div>
              
              <div class="mt-6">
                <button type="submit" [disabled]="!notificationForm.valid || isSubmitting"
                        class="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                  {{ isSubmitting ? 'Sending...' : 'Send Notification' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DonateComponent implements OnInit {
  title = 'Donate - Legacy Donation';
  
  announcement: FuneralAnnouncement | null = null;
  announcementId: number | null = null;
  
  donorInfo = {
    firstName: '',
    email: '',
    phone: ''
  };
  
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.announcementId = parseInt(this.route.snapshot.paramMap.get('announcementId') || '0');
    if (this.announcementId > 0) {
      this.loadAnnouncement(this.announcementId);
    } else {
      this.isLoading = false;
      this.showError('Invalid announcement ID');
    }
  }

  loadAnnouncement(id: number): void {
    this.apiService.getAnnouncement(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.announcement = response.data;
          
          if (this.announcement.status !== 'active' && this.announcement.status !== 'grace_period') {
            this.showError('This announcement is no longer accepting donations.');
          }
        } else {
          this.showError(response.error || 'Failed to load announcement details');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(this.apiService.getErrorMessage(error));
      }
    });
  }

  onNotifyFamily() {
    if (!this.donorInfo.firstName || !this.donorInfo.email) {
      this.showError('Please fill in all required fields.');
      return;
    }

    if (!this.announcementId) {
      this.showError('Announcement ID is missing.');
      return;
    }

    this.isSubmitting = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;

    this.apiService.sendDonationNotification(
      this.announcementId,
      this.donorInfo.firstName,
      this.donorInfo.email,
      this.donorInfo.phone
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showSuccessMessage = true;
          this.resetForm();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.showError(response.error || 'Failed to send notification.');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showError(this.apiService.getErrorMessage(error));
      }
    });
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.showErrorMessage = true;
    this.showSuccessMessage = false;
  }

  private resetForm() {
    this.donorInfo = {
      firstName: '',
      email: '',
      phone: ''
    };
  }

  getThumbnailImage(announcement: FuneralAnnouncement): string | null {
    const deceasedPhoto = announcement.files?.find(file => file.upload_purpose === 'deceased_photo');
    if (deceasedPhoto && deceasedPhoto.file_type === 'image') {
      return `https://kilnenterprise.com/Donations/${deceasedPhoto.file_path}`;
    }
    return null;
  }

  formatCurrency(amount: number | string | null | undefined): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return `GH₵${numAmount.toFixed(2)}`;
  }

  getMessagePreview(): string {
    const message = this.announcement?.family_message || '';
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
      });
    }
  }
}