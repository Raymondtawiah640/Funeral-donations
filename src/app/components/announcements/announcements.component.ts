import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m10-4h.01M16 5h.01"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Funeral Announcements System</h3>
          <p class="mt-2 text-gray-500">This system allows families to create funeral announcements and accept donations.</p>
          
          <div class="mt-6 space-x-4">
            <a routerLink="/create-announcement" 
               class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Create Announcement
            </a>
            <a routerLink="/signup" 
               class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnnouncementsComponent {
  constructor() {}
}