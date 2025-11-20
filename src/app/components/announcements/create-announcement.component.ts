import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, CreateAnnouncementRequest, FuneralAnnouncement } from '../../services/api.service';

interface UploadedFile {
  file: File;
  purpose: string;
  preview?: string;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
}

@Component({
  selector: 'app-create-announcement',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Create Funeral Announcement</h1>
            
            <form [formGroup]="announcementForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Basic Information Section -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Deceased Information</h2>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label for="deceased_name" class="block text-sm font-medium text-gray-700">
                      Name of Deceased *
                    </label>
                    <input
                      type="text"
                      id="deceased_name"
                      formControlName="deceased_name"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      placeholder="Enter full name"
                    />
                    <div *ngIf="announcementForm.get('deceased_name')?.invalid && announcementForm.get('deceased_name')?.touched" 
                         class="text-red-500 text-sm mt-1">
                      Name is required
                    </div>
                  </div>

                  <div>
                    <label for="deceased_birth_date" class="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="deceased_birth_date"
                      formControlName="deceased_birth_date"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    />
                  </div>

                  <div>
                    <label for="deceased_death_date" class="block text-sm font-medium text-gray-700">
                      Date of Death
                    </label>
                    <input
                      type="date"
                      id="deceased_death_date"
                      formControlName="deceased_death_date"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    />
                  </div>

                  <div>
                    <label for="funeral_date" class="block text-sm font-medium text-gray-700">
                      Funeral Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="funeral_date"
                      formControlName="funeral_date"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    />
                  </div>

                  <div>
                    <label for="ceremony_type" class="block text-sm font-medium text-gray-700">
                      Ceremony Type
                    </label>
                    <select
                      id="ceremony_type"
                      formControlName="ceremony_type"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                    >
                      <option value="burial">Burial</option>
                      <option value="cremation">Cremation</option>
                      <option value="memorial">Memorial Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div class="sm:col-span-2">
                    <label for="funeral_location" class="block text-sm font-medium text-gray-700">
                      Funeral Location
                    </label>
                    <input
                      type="text"
                      id="funeral_location"
                      formControlName="funeral_location"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      placeholder="Enter venue name and address"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label for="family_message" class="block text-sm font-medium text-gray-700">
                      Family Message *
                    </label>
                    <textarea
                      id="family_message"
                      formControlName="family_message"
                      rows="4"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-none"
                      placeholder="Share a message about your loved one..."
                    ></textarea>
                    <div *ngIf="announcementForm.get('family_message')?.invalid && announcementForm.get('family_message')?.touched" 
                         class="text-red-500 text-sm mt-1">
                      Family message is required
                    </div>
                  </div>

                  <div>
                    <label for="goal_amount" class="block text-sm font-medium text-gray-700">
                      Goal Amount (USD)
                    </label>
                    <input
                      type="number"
                      id="goal_amount"
                      formControlName="goal_amount"
                      min="0"
                      step="0.01"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      placeholder="0.00"
                    />
                    <p class="mt-1 text-sm text-gray-500">Optional - Set a donation goal</p>
                  </div>
                </div>
              </div>

              <!-- Beneficiary Information Section -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Beneficiary Information</h2>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label for="beneficiary_name" class="block text-sm font-medium text-gray-700">
                      Beneficiary Name *
                    </label>
                    <input
                      type="text"
                      id="beneficiary_name"
                      formControlName="beneficiary_name"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      placeholder="Enter beneficiary full name"
                    />
                    <div *ngIf="announcementForm.get('beneficiary_name')?.invalid && announcementForm.get('beneficiary_name')?.touched" 
                         class="text-red-500 text-sm mt-1">
                      Beneficiary name is required
                    </div>
                  </div>

                  <div>
                    <label for="beneficiary_account_type" class="block text-sm font-medium text-gray-700">
                      Account Type *
                    </label>
                    <select
                      id="beneficiary_account_type"
                      formControlName="beneficiary_account_type"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                      (change)="onAccountTypeChange()"
                    >
                      <option value="bank">Bank Account</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>

                  <div *ngIf="announcementForm.get('beneficiary_account_type')?.value === 'bank'">
                    <label for="beneficiary_bank_account" class="block text-sm font-medium text-gray-700">
                      Bank Account Number *
                    </label>
                    <input
                      type="text"
                      id="beneficiary_bank_account"
                      formControlName="beneficiary_bank_account"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      placeholder="Enter account number"
                    />
                  </div>

                  <div *ngIf="announcementForm.get('beneficiary_account_type')?.value === 'mobile_money'">
                    <label for="beneficiary_mobile_money" class="block text-sm font-medium text-gray-700">
                      Mobile Money Number *
                    </label>
                    <input
                      type="text"
                      id="beneficiary_mobile_money"
                      formControlName="beneficiary_mobile_money"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      placeholder="Enter mobile money number"
                    />
                  </div>
                </div>
              </div>

              <!-- Announcement Period Section -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Announcement Period</h2>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label for="announcement_start_date" class="block text-sm font-medium text-gray-700">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="announcement_start_date"
                      formControlName="announcement_start_date"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      [min]="today"
                    />
                    <div *ngIf="announcementForm.get('announcement_start_date')?.invalid && announcementForm.get('announcement_start_date')?.touched" 
                         class="text-red-500 text-sm mt-1">
                      Start date is required
                    </div>
                  </div>

                  <div>
                    <label for="announcement_end_date" class="block text-sm font-medium text-gray-700">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="announcement_end_date"
                      formControlName="announcement_end_date"
                      class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      [min]="announcementForm.get('announcement_start_date')?.value || today"
                    />
                    <p class="mt-1 text-sm text-gray-500">
                      Announcement will remain open for 5 days after the end date
                    </p>
                    <div *ngIf="announcementForm.get('announcement_end_date')?.invalid && announcementForm.get('announcement_end_date')?.touched" 
                         class="text-red-500 text-sm mt-1">
                      End date is required and must be after start date
                    </div>
                  </div>
                </div>
              </div>

              <!-- File Upload Section -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Upload Photos & Documents</h2>
                
                <!-- Deceased Photo/Flyer -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Deceased Photo/Flyer (Optional)
                  </label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div class="text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="mt-4">
                        <label for="deceased-photo" class="cursor-pointer">
                          <span class="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload deceased photo or flyer
                          </span>
                          <span class="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </span>
                        </label>
                        <input
                          type="file"
                          id="deceased-photo"
                          class="sr-only"
                          accept="image/*"
                          (change)="onFileSelected($event, 'deceased_photo')"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <!-- Uploaded Deceased Photo Preview -->
                  <div *ngFor="let file of getFilesByPurpose('deceased_photo'); let i = index" class="mt-4">
                    <div class="flex items-center p-3 bg-white border rounded-lg">
                      <img *ngIf="file.preview" [src]="file.preview" class="h-16 w-16 object-cover rounded mr-3" />
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">{{ file.file.name }}</p>
                        <p class="text-xs text-gray-500">{{ (file.file.size / 1024 / 1024).toFixed(2) }} MB</p>
                        <div *ngIf="file.uploading" class="flex items-center mt-1">
                          <svg class="animate-spin h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span class="text-xs text-blue-500">Uploading...</span>
                        </div>
                        <div *ngIf="file.uploaded" class="flex items-center mt-1">
                          <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-xs text-green-500">Uploaded successfully</span>
                        </div>
                        <div *ngIf="file.error" class="flex items-center mt-1">
                          <svg class="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-xs text-red-500">{{ file.error }}</span>
                        </div>
                      </div>
                      <button
                        *ngIf="!file.uploading && !file.uploaded"
                        type="button"
                        (click)="removeFile(i)"
                        class="ml-3 text-red-500 hover:text-red-700"
                      >
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Additional Photos & Documents -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Additional Photos & Documents (Optional)
                  </label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div class="text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="mt-4">
                        <label for="additional-files" class="cursor-pointer">
                          <span class="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload additional photos or documents
                          </span>
                          <span class="mt-1 block text-sm text-gray-500">
                            Images, PDF, DOC, DOCX up to 10MB each
                          </span>
                        </label>
                        <input
                          type="file"
                          id="additional-files"
                          class="sr-only"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          (change)="onFileSelected($event, 'other')"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <!-- Uploaded Additional Files -->
                  <div *ngFor="let file of getFilesByPurpose('other'); let i = index" class="mt-4">
                    <div class="flex items-center p-3 bg-white border rounded-lg">
                      <img *ngIf="file.preview" [src]="file.preview" class="h-16 w-16 object-cover rounded mr-3" />
                      <div *ngIf="!file.preview" class="h-16 w-16 bg-gray-100 rounded mr-3 flex items-center justify-center">
                        <svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">{{ file.file.name }}</p>
                        <p class="text-xs text-gray-500">{{ (file.file.size / 1024 / 1024).toFixed(2) }} MB</p>
                        <div *ngIf="file.uploading" class="flex items-center mt-1">
                          <svg class="animate-spin h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span class="text-xs text-blue-500">Uploading...</span>
                        </div>
                        <div *ngIf="file.uploaded" class="flex items-center mt-1">
                          <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-xs text-green-500">Uploaded successfully</span>
                        </div>
                        <div *ngIf="file.error" class="flex items-center mt-1">
                          <svg class="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-xs text-red-500">{{ file.error }}</span>
                        </div>
                      </div>
                      <button
                        *ngIf="!file.uploading && !file.uploaded"
                        type="button"
                        (click)="removeFile(i)"
                        class="ml-3 text-red-500 hover:text-red-700"
                      >
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Error Messages -->
              <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4">
                <div class="text-red-600 text-sm">{{ errorMessage }}</div>
              </div>

              <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
                <div class="text-green-600 text-sm">{{ successMessage }}</div>
              </div>

              <!-- Form Actions -->
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  (click)="cancel()"
                  class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="announcementForm.invalid || isLoading"
                  class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <span *ngIf="!isLoading">Create Announcement</span>
                  <span *ngIf="isLoading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreateAnnouncementComponent implements OnInit {
  announcementForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  today = new Date().toISOString().split('T')[0];
  uploadedFiles: UploadedFile[] = [];
  isAuthenticated = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.announcementForm = this.fb.group({
      deceased_name: ['', Validators.required],
      deceased_birth_date: [''],
      deceased_death_date: [''],
      funeral_date: [''],
      funeral_location: [''],
      ceremony_type: ['burial'],
      family_message: ['', Validators.required],
      goal_amount: [''],
      beneficiary_name: ['', Validators.required],
      beneficiary_bank_account: [''],
      beneficiary_mobile_money: [''],
      beneficiary_account_type: ['bank', Validators.required],
      announcement_start_date: [this.today, Validators.required],
      announcement_end_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check authentication status
    this.isAuthenticated = this.apiService.isLoggedIn();
    
    if (!this.isAuthenticated) {
      // Redirect to login page with return URL
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/create-announcement' }
      });
      return;
    }

    // Set minimum end date to start date + 1 day
    this.announcementForm.get('announcement_start_date')?.valueChanges.subscribe(startDate => {
      if (startDate) {
        const minEndDate = new Date(startDate);
        minEndDate.setDate(minEndDate.getDate() + 1);
        this.announcementForm.get('announcement_end_date')?.setValidators([
          Validators.required,
          (control: any) => {
            const endDate = new Date(control.value);
            return endDate > minEndDate ? null : { minEndDate: true };
          }
        ]);
      }
    });
  }

  onAccountTypeChange(): void {
    const accountType = this.announcementForm.get('beneficiary_account_type')?.value;
    if (accountType === 'bank') {
      this.announcementForm.get('beneficiary_bank_account')?.setValidators([Validators.required]);
      this.announcementForm.get('beneficiary_mobile_money')?.clearValidators();
    } else {
      this.announcementForm.get('beneficiary_mobile_money')?.setValidators([Validators.required]);
      this.announcementForm.get('beneficiary_bank_account')?.clearValidators();
    }
    
    this.announcementForm.get('beneficiary_bank_account')?.updateValueAndValidity();
    this.announcementForm.get('beneficiary_mobile_money')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.announcementForm.invalid) {
      this.markFormGroupTouched(this.announcementForm);
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    const formData = this.announcementForm.value;
    
    // Clean up the data
    const announcementData: CreateAnnouncementRequest = {
      deceased_name: formData.deceased_name,
      deceased_birth_date: formData.deceased_birth_date || undefined,
      deceased_death_date: formData.deceased_death_date || undefined,
      funeral_date: formData.funeral_date || undefined,
      funeral_location: formData.funeral_location || undefined,
      ceremony_type: formData.ceremony_type || 'burial',
      family_message: formData.family_message,
      goal_amount: formData.goal_amount ? parseFloat(formData.goal_amount) : undefined,
      beneficiary_name: formData.beneficiary_name,
      beneficiary_bank_account: formData.beneficiary_account_type === 'bank' ? formData.beneficiary_bank_account : undefined,
      beneficiary_mobile_money: formData.beneficiary_account_type === 'mobile_money' ? formData.beneficiary_mobile_money : undefined,
      beneficiary_account_type: formData.beneficiary_account_type,
      announcement_start_date: formData.announcement_start_date,
      announcement_end_date: formData.announcement_end_date
    };

    this.apiService.createAnnouncement(announcementData).subscribe({
      next: async (response) => {
        this.isLoading = false;
        if (response.success) {
          const announcementId = response.data.announcement_id;
          
          // Upload files if any
          if (this.uploadedFiles.length > 0) {
            this.successMessage = 'Creating announcement... Uploading files...';
            
            const uploadSuccess = await this.uploadFiles(announcementId);
            if (uploadSuccess) {
              this.successMessage = 'Announcement created successfully with files uploaded!';
            } else {
              this.errorMessage = 'Announcement created but some files failed to upload. You can try uploading them later from the announcement detail page.';
            }
          } else {
            this.successMessage = 'Announcement created successfully!';
          }
          
          // Wait 2 seconds before navigating to allow files to be processed
          setTimeout(() => {
            this.router.navigate(['/announcements', announcementId]);
          }, 2000);
        } else {
          this.errorMessage = response.error || 'Failed to create announcement';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.apiService.getErrorMessage(error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/my-announcements']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // File upload methods
  onFileSelected(event: Event, purpose: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (this.validateFile(file)) {
        const uploadedFile: UploadedFile = {
          file: file,
          purpose: purpose,
          uploading: false,
          uploaded: false
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadedFile.preview = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }

        this.uploadedFiles.push(uploadedFile);
      }
    }
    
    // Reset input
    input.value = '';
  }

  validateFile(file: File): boolean {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = `File "${file.name}" is too large. Maximum size is 10MB.`;
      return false;
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = `File "${file.name}" is not a supported format. Allowed: Images (JPEG, PNG, GIF, WebP) and Documents (PDF, DOC, DOCX).`;
      return false;
    }

    return true;
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  getFilesByPurpose(purpose: string): UploadedFile[] {
    return this.uploadedFiles.filter(f => f.purpose === purpose);
  }

  async uploadFiles(announcementId: number): Promise<boolean> {
    if (this.uploadedFiles.length === 0) {
      return true; // No files to upload
    }

    console.log('Starting file upload for announcement:', announcementId);
    console.log('Number of files to upload:', this.uploadedFiles.length);

    try {
      for (let i = 0; i < this.uploadedFiles.length; i++) {
        const fileData = this.uploadedFiles[i];
        fileData.uploading = true;

        console.log(`Uploading file ${i + 1}:`, fileData.file.name, 'Purpose:', fileData.purpose);

        try {
          const response = await this.apiService.uploadFile(announcementId, fileData.file, fileData.purpose).toPromise();
          console.log('Upload response:', response);
          fileData.uploaded = true;
          fileData.uploading = false;
        } catch (error) {
          fileData.error = 'Failed to upload file';
          fileData.uploading = false;
          console.error('File upload error for', fileData.file.name, ':', error);
          return false;
        }
      }
      console.log('All files uploaded successfully');
      return true;
    } catch (error) {
      console.error('File upload error:', error);
      return false;
    }
  }
}