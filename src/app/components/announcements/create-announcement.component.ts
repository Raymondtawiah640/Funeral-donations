import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, CreateAnnouncementRequest, FuneralAnnouncement } from '../../services/api.service';

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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label for="ceremony_type" class="block text-sm font-medium text-gray-700">
                      Ceremony Type
                    </label>
                    <select
                      id="ceremony_type"
                      formControlName="ceremony_type"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Announcement created successfully!';
          // Navigate to the created announcement or to announcements list
          setTimeout(() => {
            this.router.navigate(['/my-announcements']);
          }, 1500);
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
}