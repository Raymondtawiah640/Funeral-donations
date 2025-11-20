import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Admin Password Check -->
        <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Admin Access</h2>
          <p class="text-gray-600 mb-4">Enter admin password to access the dashboard</p>
          <div class="space-y-4">
            <div>
              <label for="adminPassword" class="block text-sm font-medium text-gray-700">Admin Password</label>
              <input
                id="adminPassword"
                type="text"
                [(ngModel)]="adminPassword"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin password"
              />
            </div>
            <div *ngIf="passwordError" class="text-red-600 text-sm">{{ passwordError }}</div>
            <button
              (click)="checkAdminPassword()"
              [disabled]="isAdmin"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ isAdmin ? 'Access Granted' : 'Access Admin Panel' }}
            </button>
          </div>
        </div>

        <!-- Admin Dashboard -->
        <div *ngIf="isAdmin">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p class="mt-2 text-gray-600">Manage contact messages and system administration</p>
          </div>

        <!-- Contact Messages Section -->
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Contact Messages</h2>
            <p class="mt-1 text-sm text-gray-600">View and manage user inquiries</p>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-12">
            <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-4 text-gray-600">Loading messages...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="errorMessage" class="p-6 text-center">
            <div class="bg-red-50 border border-red-200 rounded-md p-4">
              <p class="text-red-800">{{ errorMessage }}</p>
              <button (click)="loadMessages()" class="mt-2 text-red-600 hover:text-red-800 underline">
                Try Again
              </button>
            </div>
          </div>

          <!-- Messages Table -->
          <div *ngIf="!isLoading && !errorMessage" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let message of messages" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ message.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ message.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ message.email }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{{ message.subject }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [ngClass]="{
                            'bg-yellow-100 text-yellow-800': message.status === 'new',
                            'bg-blue-100 text-blue-800': message.status === 'read',
                            'bg-green-100 text-green-800': message.status === 'responded'
                          }">
                      {{ message.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(message.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button (click)="viewMessage(message)" class="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </button>
                    <select (change)="updateStatus(message, $event)" class="text-sm border border-gray-300 rounded px-2 py-1">
                      <option value="new" [selected]="message.status === 'new'">New</option>
                      <option value="read" [selected]="message.status === 'read'">Read</option>
                      <option value="responded" [selected]="message.status === 'responded'">Responded</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div *ngIf="messages.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No messages</h3>
              <p class="mt-1 text-sm text-gray-500">No contact messages have been received yet.</p>
            </div>
          </div>
        </div>

        <!-- Message Detail Modal -->
        <div *ngIf="selectedMessage" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" (click)="closeModal()">
          <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" (click)="$event.stopPropagation()">
            <div class="mt-3">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Message Details</h3>
                <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">From</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedMessage.name }} ({{ selectedMessage.email }})</p>
                </div>

                <div *ngIf="selectedMessage.phone">
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedMessage.phone }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Subject</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedMessage.subject }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Message</label>
                  <div class="mt-1 p-3 bg-gray-50 rounded-md">
                    <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ selectedMessage.message }}</p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedMessage.status }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Received</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedMessage.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminComponent implements OnInit {
  messages: ContactMessage[] = [];
  selectedMessage: ContactMessage | null = null;
  isLoading = true;
  errorMessage = '';
  isAdmin = false;
  adminPassword = '';
  passwordError = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    const user = this.apiService.getCurrentUser();
    if (user && user.role === 'admin') {
      this.isAdmin = true;
      this.loadMessages();
    } else {
      this.isAdmin = false;
    }
  }

  loadMessages(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Try to fetch from API first
    fetch('https://kilnenterprise.com/Donations/contact.php', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      this.isLoading = false;
      if (data.success && data.data) {
        this.messages = data.data;
      } else {
        this.errorMessage = data.error || 'Failed to load messages';
      }
    })
    .catch(error => {
      // Load demo data if API is not available
      this.loadDemoData();
    });
  }

  private loadDemoData(): void {
    this.isLoading = false;
    this.messages = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890',
        subject: 'Question about donation process',
        message: 'Hi, I would like to know more about how the donation process works. Can you provide more details?',
        status: 'new',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+0987654321',
        subject: 'Support for funeral announcement',
        message: 'I need help creating a funeral announcement for my family. Could you guide me through the process?',
        status: 'read',
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob.johnson@email.com',
        subject: 'Technical issue with login',
        message: 'I am having trouble logging into my account. The login button doesn\'t seem to work.',
        status: 'responded',
        created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];
  }

  viewMessage(message: ContactMessage): void {
    this.selectedMessage = message;
  }

  closeModal(): void {
    this.selectedMessage = null;
  }

  updateStatus(message: ContactMessage, event: any): void {
    const newStatus = event.target.value;

    // Try API first, fall back to local update for demo
    fetch(`https://kilnenterprise.com/Donations/contact.php/${message.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        message.status = newStatus;
      } else {
        // Fall back to local update for demo
        message.status = newStatus;
      }
    })
    .catch(error => {
      // API not available, update locally for demo
      message.status = newStatus;
    });
  }

  checkAdminPassword(): void {
    if (this.adminPassword === 'lastbutone@12345') {
      this.isAdmin = true;
      this.passwordError = '';
      this.loadMessages();
    } else {
      this.passwordError = 'Invalid admin password';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}