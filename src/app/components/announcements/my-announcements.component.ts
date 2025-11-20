import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, FuneralAnnouncement } from '../../services/api.service';

@Component({
  selector: 'app-my-announcements',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">My Announcements</h1>
              <p class="mt-2 text-gray-600">Manage your funeral announcements</p>
            </div>
            <a routerLink="/create-announcement"
               class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Create New Announcement
            </a>
          </div>

          <!-- View Toggle -->
          <div class="mt-6 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <span class="text-sm font-medium text-gray-700">View:</span>
              <div class="flex rounded-md shadow-sm">
                <button
                  (click)="viewMode = 'list'"
                  [class.bg-blue-600]="viewMode === 'list'"
                  [class.text-white]="viewMode === 'list'"
                  [class.bg-gray-200]="viewMode !== 'list'"
                  [class.text-gray-700]="viewMode !== 'list'"
                  class="px-4 py-2 text-sm font-medium rounded-l-md border border-gray-300 hover:bg-blue-700 hover:text-white transition-colors"
                >
                  List View
                </button>
                <button
                  (click)="viewMode = 'timeline'"
                  [class.bg-blue-600]="viewMode === 'timeline'"
                  [class.text-white]="viewMode === 'timeline'"
                  [class.bg-gray-200]="viewMode !== 'timeline'"
                  [class.text-gray-700]="viewMode !== 'timeline'"
                  class="px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b border-gray-300 hover:bg-blue-700 hover:text-white transition-colors"
                >
                  Timeline View
                </button>
              </div>
            </div>

            <!-- Time Period Filters (List View Only) -->
            <div *ngIf="viewMode === 'list'" class="flex flex-wrap gap-2">
              <button
                *ngFor="let filter of timeFilters"
                (click)="setTimeFilter(filter.key)"
                [class.bg-blue-600]="selectedFilter === filter.key"
                [class.text-white]="selectedFilter === filter.key"
                [class.bg-gray-200]="selectedFilter !== filter.key"
                [class.text-gray-700]="selectedFilter !== filter.key"
                class="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 hover:text-white transition-colors"
              >
                {{ filter.label }} ({{ getFilteredCount(filter.key) }})
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-12">
          <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-gray-600">Loading your announcements...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !isLoading" class="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
          <div class="text-red-600 text-sm">{{ error }}</div>
        </div>

        <!-- List View -->
        <div *ngIf="viewMode === 'list' && !isLoading && filteredAnnouncements.length > 0" class="space-y-6">
          <div *ngFor="let announcement of filteredAnnouncements" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex flex-col lg:flex-row lg:items-start">
                <div class="flex-1 lg:mr-6">
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

                  <p class="text-gray-600 mb-4">{{ getMessagePreview(announcement) }}</p>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div *ngIf="announcement.deceased_death_date">
                      <span class="font-medium text-gray-500">Passed:</span>
                      <span class="ml-1 text-gray-900">{{ announcement.deceased_death_date | date:'longDate' }}</span>
                    </div>

                    <div *ngIf="announcement.funeral_date">
                      <span class="font-medium text-gray-500">Funeral:</span>
                      <span class="ml-1 text-gray-900">{{ announcement.funeral_date | date:'mediumDate' }}</span>
                    </div>

                    <div *ngIf="announcement.announcement_end_date">
                      <span class="font-medium text-gray-500">Ends:</span>
                      <span class="ml-1 text-gray-900">{{ announcement.announcement_end_date | date:'longDate' }}</span>
                    </div>
                  </div>

                  <div class="mt-4 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div *ngIf="announcement.goal_amount">
                        <span class="text-sm text-gray-500">Goal:</span>
                        <span class="ml-1 font-medium text-gray-900">{{ formatCurrency(announcement.goal_amount) }}</span>
                      </div>
                    </div>

                    <div class="flex items-center space-x-3">
                      <a [routerLink]="['/announcements', announcement.id]"
                         class="text-blue-600 hover:text-blue-800 font-medium">
                        View
                      </a>

                      <button
                        *ngIf="announcement.status === 'active' && !announcement.is_closed"
                        (click)="closeAnnouncement(announcement.id)"
                        class="text-red-600 hover:text-red-800 font-medium"
                        [disabled]="isClosing">
                        Close
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Thumbnail Image -->
                <div *ngIf="getThumbnailImage(announcement)" class="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0 mx-auto lg:mx-0">
                  <img [src]="getThumbnailImage(announcement)"
                       [alt]="announcement.deceased_name"
                       class="h-24 w-24 lg:h-32 lg:w-32 object-contain rounded-lg shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline View -->
        <div *ngIf="viewMode === 'timeline' && !isLoading && announcements.length > 0" class="relative">
          <!-- Timeline line -->
          <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          <div class="space-y-8">
            <div *ngFor="let group of groupedAnnouncements" class="relative">
              <!-- Timeline dot and date header -->
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                  {{ getGroupIcon(group.period) }}
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">{{ group.period }}</h3>
                  <p class="text-sm text-gray-500">{{ group.count }} announcement{{ group.count > 1 ? 's' : '' }}</p>
                </div>
              </div>

              <!-- Announcements in this group -->
              <div class="ml-20 space-y-4">
                <div *ngFor="let announcement of group.announcements" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div class="p-4">
                    <div class="flex items-start space-x-4">
                      <!-- Timeline connector -->
                      <div class="flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full mt-2"></div>

                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center space-x-3">
                            <h4 class="text-lg font-semibold text-gray-900">{{ announcement.deceased_name }}</h4>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                  [ngClass]="{
                                    'bg-green-100 text-green-800': announcement.status === 'active',
                                    'bg-yellow-100 text-yellow-800': announcement.status === 'grace_period',
                                    'bg-red-100 text-red-800': announcement.status === 'closed' || announcement.status === 'expired'
                                  }">
                              {{ announcement.status | titlecase }}
                            </span>
                          </div>
                          <span class="text-sm text-gray-500">{{ getTimeAgo(announcement.announcement_start_date) }}</span>
                        </div>

                        <p class="text-gray-600 mb-3">{{ getMessagePreview(announcement) }}</p>

                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-4 text-sm">
                            <div *ngIf="announcement.deceased_death_date">
                              <span class="font-medium text-gray-500">Passed:</span>
                              <span class="ml-1 text-gray-900">{{ announcement.deceased_death_date | date:'longDate' }}</span>
                            </div>

                            <div *ngIf="announcement.funeral_date">
                              <span class="font-medium text-gray-500">Funeral:</span>
                              <span class="ml-1 text-gray-900">{{ announcement.funeral_date | date:'mediumDate' }}</span>
                            </div>

                            <div *ngIf="announcement.goal_amount">
                              <span class="font-medium text-gray-500">Goal:</span>
                              <span class="ml-1 text-gray-900">{{ formatCurrency(announcement.goal_amount) }}</span>
                            </div>
                          </div>

                          <div class="flex items-center space-x-3">
                            <a [routerLink]="['/announcements', announcement.id]"
                               class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                              View Details
                            </a>

                            <button
                              *ngIf="announcement.status === 'active' && !announcement.is_closed"
                              (click)="closeAnnouncement(announcement.id)"
                              class="text-red-600 hover:text-red-800 font-medium text-sm"
                              [disabled]="isClosing">
                              Close
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Thumbnail Image -->
                      <div *ngIf="getThumbnailImage(announcement)" class="flex-shrink-0">
                        <img [src]="getThumbnailImage(announcement)"
                             [alt]="announcement.deceased_name"
                             class="h-16 w-16 object-contain rounded-lg shadow-sm" />
                      </div>
                    </div>
                  </div>
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
          <h3 class="mt-4 text-lg font-medium text-gray-900">
            {{ viewMode === 'timeline' ? 'Your announcement timeline is empty' : 'No announcements yet' }}
          </h3>
          <p class="mt-2 text-gray-500">
            {{ viewMode === 'timeline' ? 'Start creating announcements to see your history unfold over time.' : 'Create your first funeral announcement to get started.' }}
          </p>

          <div class="mt-6">
            <a routerLink="/create-announcement"
               class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              {{ viewMode === 'timeline' ? 'Create Your First Announcement' : 'Create Your First Announcement' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyAnnouncementsComponent implements OnInit {
  announcements: FuneralAnnouncement[] = [];
  isLoading = true;
  error = '';
  isClosing = false;
  selectedFilter = 'all';
  viewMode: 'list' | 'timeline' = 'timeline';
  timeFilters = [
    { key: 'all', label: 'All Time' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
    { key: 'older', label: 'Older' }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.error = '';

    this.apiService.getUserAnnouncements().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.announcements = response.data;
        } else {
          this.error = response.error || 'Failed to load your announcements';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = this.apiService.getErrorMessage(error);
      }
    });
  }

  closeAnnouncement(id: number): void {
    if (!confirm('Are you sure you want to close this announcement? This action cannot be undone.')) {
      return;
    }

    this.isClosing = true;
    this.apiService.closeAnnouncement(id).subscribe({
      next: (response) => {
        this.isClosing = false;
        if (response.success) {
          // Update the announcement status locally
          const announcement = this.announcements.find(a => a.id === id);
          if (announcement) {
            announcement.status = 'closed';
            announcement.is_closed = true;
          }
        } else {
          this.error = response.error || 'Failed to close announcement';
        }
      },
      error: (error) => {
        this.isClosing = false;
        this.error = this.apiService.getErrorMessage(error);
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

  getMessagePreview(announcement: FuneralAnnouncement): string {
    const message = announcement.family_message || '';
    return message.length > 150 ? message.substring(0, 150) + '...' : message;
  }

  setTimeFilter(filter: string): void {
    this.selectedFilter = filter;
  }

  get filteredAnnouncements(): FuneralAnnouncement[] {
    if (this.selectedFilter === 'all') {
      return this.announcements;
    }

    const now = new Date();
    return this.announcements.filter(announcement => {
      const createdDate = new Date(announcement.announcement_start_date);

      switch (this.selectedFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return createdDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return createdDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return createdDate >= yearAgo;
        case 'older':
          const yearAgo2 = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return createdDate < yearAgo2;
        default:
          return true;
      }
    });
  }

  getFilteredCount(filter: string): number {
    if (filter === 'all') {
      return this.announcements.length;
    }

    const now = new Date();
    return this.announcements.filter(announcement => {
      const createdDate = new Date(announcement.announcement_start_date);

      switch (filter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return createdDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return createdDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return createdDate >= yearAgo;
        case 'older':
          const yearAgo2 = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return createdDate < yearAgo2;
        default:
          return true;
      }
    }).length;
  }

  get groupedAnnouncements() {
    const now = new Date();
    const groups: { [key: string]: FuneralAnnouncement[] } = {};

    this.announcements.forEach(announcement => {
      const createdDate = new Date(announcement.announcement_start_date);
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let period = '';

      if (diffDays === 0) {
        period = 'Today';
      } else if (diffDays === 1) {
        period = 'Yesterday';
      } else if (diffDays <= 7) {
        period = 'This Week';
      } else if (diffDays <= 30) {
        period = 'This Month';
      } else if (diffDays <= 365) {
        period = 'This Year';
      } else {
        const years = Math.floor(diffDays / 365);
        period = `${years} Year${years > 1 ? 's' : ''} Ago`;
      }

      if (!groups[period]) {
        groups[period] = [];
      }
      groups[period].push(announcement);
    });

    // Sort groups by recency
    const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'This Year'];
    const sortedGroups = Object.keys(groups)
      .sort((a, b) => {
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        } else if (aIndex !== -1) {
          return -1;
        } else if (bIndex !== -1) {
          return 1;
        } else {
          // Both are "X Years Ago" - sort by year descending
          const aYears = parseInt(a.split(' ')[0]);
          const bYears = parseInt(b.split(' ')[0]);
          return aYears - bYears;
        }
      })
      .map(period => ({
        period,
        announcements: groups[period].sort((a, b) =>
          new Date(b.announcement_start_date).getTime() - new Date(a.announcement_start_date).getTime()
        ),
        count: groups[period].length
      }));

    return sortedGroups;
  }

  getGroupIcon(period: string): string {
    switch (period) {
      case 'Today': return '📅';
      case 'Yesterday': return '📆';
      case 'This Week': return '📊';
      case 'This Month': return '📈';
      case 'This Year': return '🎯';
      default: return '📚';
    }
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }
}