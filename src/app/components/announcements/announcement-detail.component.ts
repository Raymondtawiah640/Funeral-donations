import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, FuneralAnnouncement, AnnouncementFile } from '../../services/api.service';

@Component({
  selector: 'app-announcement-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12" *ngIf="announcement">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Back Button -->
        <div class="mb-6">
          <a routerLink="/announcements" class="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Announcements
          </a>
        </div>

        <!-- Announcement Header -->
        <div class="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h1 class="text-3xl font-bold text-white">{{ announcement.deceased_name }}</h1>
            <p class="mt-2 text-blue-100">Funeral Announcement</p>
          </div>

          <!-- Status Badge -->
          <div class="px-6 py-4 border-b border-gray-200">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  [ngClass]="{
                    'bg-green-100 text-green-800': announcement.status === 'active',
                    'bg-yellow-100 text-yellow-800': announcement.status === 'grace_period',
                    'bg-red-100 text-red-800': announcement.status === 'closed' || announcement.status === 'expired'
                  }">
              {{ announcement.status | titlecase }}
            </span>
          </div>
        </div>

        <!-- Deceased Information & Photos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <!-- Deceased Details -->
          <div class="lg:col-span-2">
            <div class="bg-white shadow rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Deceased Information</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngIf="announcement.deceased_birth_date">
                  <label class="block text-sm font-medium text-gray-500">Date of Birth</label>
                  <p class="mt-1 text-sm text-gray-900">{{ announcement.deceased_birth_date | date:'longDate' }}</p>
                </div>
                
                <div *ngIf="announcement.deceased_death_date">
                  <label class="block text-sm font-medium text-gray-500">Date of Death</label>
                  <p class="mt-1 text-sm text-gray-900">{{ announcement.deceased_death_date | date:'longDate' }}</p>
                </div>
                
                <div *ngIf="announcement.funeral_date">
                  <label class="block text-sm font-medium text-gray-500">Funeral Date & Time</label>
                  <p class="mt-1 text-sm text-gray-900">{{ announcement.funeral_date | date:'medium' }}</p>
                </div>
                
                <div *ngIf="announcement.ceremony_type">
                  <label class="block text-sm font-medium text-gray-500">Ceremony Type</label>
                  <p class="mt-1 text-sm text-gray-900">{{ announcement.ceremony_type | titlecase }}</p>
                </div>
                
                <div *ngIf="announcement.funeral_location" class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-500">Funeral Location</label>
                  <p class="mt-1 text-sm text-gray-900">{{ announcement.funeral_location }}</p>
                </div>
              </div>

              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-500 mb-2">Family Message</label>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-gray-900 whitespace-pre-wrap">{{ announcement.family_message }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Deceased Photos/Flyers -->
          <div class="lg:col-span-1">
            <div class="bg-white shadow rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Photos & Flyers</h2>
              
              <div *ngIf="getFilesByPurpose('deceased_photo').length === 0" class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="mt-2 text-sm text-gray-500">No photos uploaded</p>
              </div>

              <div class="space-y-4">
                <div *ngFor="let file of getFilesByPurpose('deceased_photo')" class="group">
                  <div class="relative">
                    <img 
                      [src]="getFileUrl(file)" 
                      [alt]="file.original_name"
                      class="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow cursor-pointer"
                      (click)="openImageModal(file)"
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Files & Documents -->
        <div *ngIf="getFilesByPurpose('other').length > 0" class="bg-white shadow rounded-lg p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Additional Photos & Documents</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let file of getFilesByPurpose('other')" class="group">
              <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <!-- Image Preview -->
                <div *ngIf="file.file_type === 'image'" class="relative">
                  <img 
                    [src]="getFileUrl(file)" 
                    [alt]="file.original_name"
                    class="w-full h-40 object-cover cursor-pointer"
                    (click)="openImageModal(file)"
                  />
                </div>
                
                <!-- Document Preview -->
                <div *ngIf="file.file_type === 'document'" class="p-4 flex items-center">
                  <svg class="h-8 w-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"></path>
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ file.original_name }}</p>
                    <p class="text-xs text-gray-500">{{ (file.file_size / 1024 / 1024).toFixed(2) }} MB</p>
                  </div>
                  <a 
                    [href]="getFileUrl(file)" 
                    download 
                    class="ml-3 text-blue-600 hover:text-blue-800"
                    title="Download file"
                  >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Donation Information -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Donation Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500">Beneficiary</label>
              <p class="mt-1 text-lg text-gray-900">{{ announcement.beneficiary_name }}</p>
            </div>
            
            <div *ngIf="announcement.goal_amount">
              <label class="block text-sm font-medium text-gray-500">Goal Amount</label>
              <p class="mt-1 text-lg text-gray-900">\${{ announcement.goal_amount | number:'1.2-2' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500">Raised Amount</label>
              <p class="mt-1 text-lg text-gray-900">\${{ announcement.total_raised || 0 | number:'1.2-2' }}</p>
              <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full" 
                  [style.width.%]="getProgressPercentage()"
                ></div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ getProgressPercentage() | number:'1.0-0' }}% of goal reached
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500">Payment Details</label>
              <div class="mt-1 text-sm text-gray-900">
                <p *ngIf="announcement.beneficiary_account_type === 'bank'">
                  Bank Account: ****{{ announcement.beneficiary_bank_account?.slice(-4) }}
                </p>
                <p *ngIf="announcement.beneficiary_account_type === 'mobile_money'">
                  Mobile Money: {{ announcement.beneficiary_mobile_money }}
                </p>
              </div>
            </div>
          </div>

          <!-- Donation Period -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500">Announcement Period</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ announcement.announcement_start_date | date:'longDate' }} - 
                  {{ announcement.announcement_end_date | date:'longDate' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Donate Button -->
          <div class="mt-6" *ngIf="announcement.status === 'active' || announcement.status === 'grace_period'">
            <a 
              [routerLink]="['/donate', announcement.id]"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Donate Now
            </a>
          </div>
          
          <div class="mt-6" *ngIf="announcement.status === 'closed' || announcement.status === 'expired'">
            <div class="bg-gray-100 border border-gray-200 rounded-md p-4">
              <p class="text-gray-600 text-sm">
                This announcement is no longer accepting donations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Modal -->
      <div *ngIf="selectedImage" class="fixed inset-0 z-50 overflow-y-auto" (click)="closeImageModal()">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <img 
                    [src]="getFileUrl(selectedImage)" 
                    [alt]="selectedImage.original_name"
                    class="w-full h-auto max-h-96 object-contain"
                  />
                  <div class="mt-4">
                    <h3 class="text-lg font-medium text-gray-900">{{ selectedImage.original_name }}</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      {{ (selectedImage.file_size / 1024 / 1024).toFixed(2) }} MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <a 
                [href]="getFileUrl(selectedImage)" 
                download
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Download
              </a>
              <button 
                type="button" 
                (click)="closeImageModal()"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="isLoading" class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-600">Loading announcement...</p>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="error && !isLoading" class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Error loading announcement</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <a routerLink="/announcements" class="text-blue-600 hover:text-blue-500">Back to announcements</a>
        </div>
      </div>
    </div>
  `
})
export class AnnouncementDetailComponent implements OnInit {
  announcement: FuneralAnnouncement | null = null;
  isLoading = true;
  error = '';
  selectedImage: AnnouncementFile | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAnnouncement(parseInt(id));
    }
  }

  loadAnnouncement(id: number): void {
    this.isLoading = true;
    this.error = '';

    this.apiService.getAnnouncement(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.announcement = response.data;
        } else {
          this.error = response.error || 'Failed to load announcement';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = this.apiService.getErrorMessage(error);
      }
    });
  }

  getFilesByPurpose(purpose: string): AnnouncementFile[] {
    return this.announcement?.files?.filter(file => file.upload_purpose === purpose) || [];
  }

  getFileUrl(file: AnnouncementFile): string {
    // Return the full URL to the uploaded file using the files.php endpoint
    return `https://kilnenterprise.com/Donations/api/files.php?file_id=${file.id}`;
  }

  getProgressPercentage(): number {
    if (!this.announcement?.goal_amount || this.announcement.goal_amount === 0) {
      return 0;
    }
    
    const raised = this.announcement.total_raised || 0;
    return Math.min((raised / this.announcement.goal_amount) * 100, 100);
  }

  openImageModal(file: AnnouncementFile): void {
    this.selectedImage = file;
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }
}