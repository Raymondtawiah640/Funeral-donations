import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, FuneralAnnouncement } from '../../services/api.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Funeral Announcements</h1>
          <p class="mt-2 text-gray-600">Support families during their time of need</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-12">
          <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-gray-600">Loading announcements...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !isLoading" class="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
          <div class="text-red-600 text-sm">{{ error }}</div>
        </div>

        <!-- Announcements List -->
        <div *ngIf="!isLoading && announcements.length > 0" class="space-y-6">
          <div *ngFor="let announcement of announcements" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <h2 class="text-xl font-semibold text-gray-900">{{ announcement.deceased_name }}</h2>
                    <span class="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800': announcement.status === 'active',
                            'bg-yellow-100 text-yellow-800': announcement.status === 'grace_period',
                            'bg-red-100 text-red-800': announcement.status === 'closed' || announcement.status === 'expired'
                          }">
                      {{ announcement.status | titlecase }}
                    </span>
                  </div>
                  
                  <p class="text-gray-600 mb-4 line-clamp-3">{{ announcement.family_message }}</p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div *ngIf="announcement.deceased_death_date">
                      <span class="font-medium text-gray-500">Passed:</span>
                      <span class="ml-1 text-gray-900">{{ announcement.deceased_death_date | date:'longDate' }}</span>
                    </div>
                    
                    <div *ngIf="announcement.funeral_date">
                      <span class="font-medium text-gray-500">Funeral:</span>
                      <span class="ml-1 text-gray-900">{{ announcement.funeral_date | date:'mediumDate' }}</span>
                    </div>
                    
                    <div *ngIf="announcement.funeral_location">
                      <span class="font-medium text-gray-500">Location:</span>
                      <span class="ml-1 text-gray-900">{{ announcement.funeral_location }}</span>
                    </div>
                  </div>
                  
                  <div class="mt-4 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div *ngIf="announcement.goal_amount">
                        <span class="text-sm text-gray-500">Goal:</span>
                        <span class="ml-1 font-medium text-gray-900">GH₵{{ announcement.goal_amount | number:'1.2-2' }}</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-3">
                      <a [routerLink]="['/announcements', announcement.id]" 
                         class="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </a>
                      
                      <a *ngIf="announcement.status === 'active' || announcement.status === 'grace_period'" 
                         [routerLink]="['/donate', announcement.id]"
                         class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Donate
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- Thumbnail Image -->
                <div *ngIf="getThumbnailImage(announcement)" class="ml-6 flex-shrink-0">
                  <img [src]="getThumbnailImage(announcement)" 
                       [alt]="announcement.deceased_name"
                       class="h-24 w-24 object-cover rounded-lg shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && announcements.length === 0" class="text-center py-12">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m10-4h.01M16 5h.01"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No announcements available</h3>
          <p class="mt-2 text-gray-500">Be the first to create a funeral announcement.</p>
          
          <div class="mt-6">
            <a routerLink="/create-announcement" 
               class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Create Announcement
            </a>
          </div>
        </div>

        <!-- Create Button (when there are announcements) -->
        <div *ngIf="!isLoading && announcements.length > 0" class="text-center mt-8">
          <a routerLink="/create-announcement" 
             class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Create New Announcement
          </a>
        </div>
      </div>
    </div>
  `
})
export class AnnouncementsComponent implements OnInit {
  announcements: FuneralAnnouncement[] = [];
  isLoading = true;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.error = '';

    this.apiService.getAnnouncements().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.announcements = response.data;
        } else {
          this.error = response.error || 'Failed to load announcements';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = this.apiService.getErrorMessage(error);
      }
    });
  }

  getThumbnailImage(announcement: FuneralAnnouncement): string | null {
    const deceasedPhoto = announcement.files?.find(file => file.upload_purpose === 'deceased_photo');
    if (deceasedPhoto && deceasedPhoto.file_type === 'image') {
      // Return the full URL to the uploaded image
      return `https://kilnenterprise.com/Donations/${deceasedPhoto.file_path}`;
    }
    return null;
  }
}