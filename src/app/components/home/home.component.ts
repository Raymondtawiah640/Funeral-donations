import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Statistics } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span class="block">Welcome to</span>
            <span class="block text-primary-600">Legacy Donation</span>
          </h2>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Making a difference, one donation at a time. Help us support families during their most difficult times.
          </p>
          <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div class="rounded-md shadow">
              <a routerLink="/donate" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10">
                Start Donating
              </a>
            </div>
            <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a routerLink="/about" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                Learn More
              </a>
            </div>
          </div>
        </div>
        
        <!-- Live Statistics -->
        <div class="mt-20">
          <div class="bg-primary-600 rounded-lg px-6 py-12">
            <div class="text-center">
              <h3 class="text-2xl font-extrabold text-white">Our Impact</h3>
              <p class="mt-2 text-primary-200">Real-time statistics from our community</p>
            </div>
            <div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div class="text-center">
                <div class="flex items-center justify-center">
                  <div class="rounded-full bg-primary-500 p-3">
                    <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="mt-4">
                  <div class="text-3xl font-extrabold text-white">{{ totalDonations }}+</div>
                  <div class="text-base text-primary-200">Total Donations</div>
                </div>
              </div>
              
              <div class="text-center">
                <div class="flex items-center justify-center">
                  <div class="rounded-full bg-primary-500 p-3">
                    <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div class="mt-4">
                  <div class="text-3xl font-extrabold text-white">{{ totalAmountText }}</div>
                  <div class="text-base text-primary-200">Total Raised</div>
                </div>
              </div>
              
              <div class="text-center">
                <div class="flex items-center justify-center">
                  <div class="rounded-full bg-primary-500 p-3">
                    <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                <div class="mt-4">
                  <div class="text-3xl font-extrabold text-white">Families Helped</div>
                  <div class="text-base text-primary-200">Making a Difference</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mission Statement -->
        <div class="mt-20">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div class="text-center">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Support Families</h3>
              <p class="mt-2 text-base text-gray-500">
                Provide financial assistance to families during their time of loss.
              </p>
            </div>
            
            <div class="text-center">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Community Care</h3>
              <p class="mt-2 text-base text-gray-500">
                Build a supportive community that understands and helps one another.
              </p>
            </div>
            
            <div class="text-center">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Transparency</h3>
              <p class="mt-2 text-base text-gray-500">
                Every donation is tracked and used responsibly to help those in need.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  title = 'Legacy Donation - Home';
  statistics: Statistics | null = null;
  loading = true;
  totalDonations = 0;
  totalAmountText = '0';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStatistics();
  }

  private loadStatistics() {
    this.apiService.getStatistics().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.statistics = response.data;
          this.totalDonations = response.data.total_donations || 0;
          this.totalAmountText = '$' + (response.data.total_amount || 0).toLocaleString();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load statistics:', error);
        // Keep default values or handle error gracefully
      }
    });
  }
}