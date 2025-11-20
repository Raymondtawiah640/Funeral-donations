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

        <!-- Donation Section - Only show if announcement is not closed -->
        <div *ngIf="!isLoading && announcement && !announcement.is_closed && announcement.status !== 'closed'">
          <div class="text-center">
            <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Make a Donation
            </h2>
            <p class="mt-4 text-lg text-gray-500">
              Your contribution helps provide support to families during their most difficult times.
            </p>
          </div>

          <div class="mt-12 bg-white shadow-lg rounded-lg p-8">
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
                    <span *ngIf="copiedMessage" class="ml-2 text-sm text-green-600">{{ copiedMessage }}</span>
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
                    <span *ngIf="copiedMessage" class="ml-2 text-sm text-green-600">{{ copiedMessage }}</span>
                  </div>
                </div>
              </div>
            </div>
    
            <!-- Closed Announcement Message -->
            <div *ngIf="!isLoading && announcement && (announcement.is_closed || announcement.status === 'closed')" class="mt-12 bg-white shadow-lg rounded-lg p-8 text-center">
              <div class="max-w-md mx-auto">
                <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Donations Closed</h3>
                <p class="mt-2 text-sm text-gray-500">
                  This announcement is no longer accepting donations. The fundraising period has ended.
                </p>
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
  
  isLoading = true;
  copiedMessage = '';

  constructor(
    public apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.announcementId = parseInt(this.route.snapshot.paramMap.get('announcementId') || '0');
    if (this.announcementId > 0) {
      this.loadAnnouncement(this.announcementId);
    } else {
      this.isLoading = false;
      console.error('Invalid announcement ID');
    }
  }

  loadAnnouncement(id: number): void {
    this.apiService.getAnnouncement(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.announcement = response.data;
          
          if (this.announcement.status !== 'active' && this.announcement.status !== 'grace_period') {
            console.error('This announcement is no longer accepting donations.');
          }
        } else {
          console.error(response.error || 'Failed to load announcement details');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(this.apiService.getErrorMessage(error));
      }
    });
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
        this.copiedMessage = 'Copied!';
        setTimeout(() => {
          this.copiedMessage = '';
        }, 2000);
      });
    }
  }

}