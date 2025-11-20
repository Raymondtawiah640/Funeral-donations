import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ContactMessage } from '../../services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Contact Us
          </h2>
          <p class="mt-4 text-lg text-gray-500">
            Get in touch with us. We're here to help and answer any question you might have.
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
                Message Sent Successfully!
              </h3>
              <p class="mt-2 text-sm text-green-700">
                Thank you for contacting us. We'll get back to you as soon as possible.
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
                Message Failed to Send
              </h3>
              <p class="mt-2 text-sm text-red-700">
                {{errorMessage}}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Loading State -->
        <div *ngIf="isSubmitting" class="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">
                Sending Message...
              </h3>
              <p class="mt-2 text-sm text-blue-700">
                Please wait while we send your message.
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <!-- Contact Information -->
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
            <div class="space-y-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h4 class="text-lg font-medium text-gray-900">Office Address</h4>
                  <p class="mt-1 text-base text-gray-500">
                    123 Charity Lane<br>
                    Suite 100<br>
                    Help City, HC 12345
                  </p>
                </div>
              </div>
              
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h4 class="text-lg font-medium text-gray-900">Phone</h4>
                  <p class="mt-1 text-base text-gray-500">
                    <a href="tel:+15551234567" class="hover:text-primary-600">(555) 123-4567</a>
                  </p>
                </div>
              </div>
              
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h4 class="text-lg font-medium text-gray-900">Email</h4>
                  <p class="mt-1 text-base text-gray-500">
                    <a href="mailto:melakahinfotechsolutions&#64;gmail.com" class="hover:text-primary-600">melakahinfotechsolutions&#64;gmail.com</a>
                  </p>
                </div>
              </div>
              
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h4 class="text-lg font-medium text-gray-900">Business Hours</h4>
                  <p class="mt-1 text-base text-gray-500">
                    Monday - Friday: 9:00 AM - 6:00 PM<br>
                    Saturday: 10:00 AM - 4:00 PM<br>
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Contact Form -->
          <div *ngIf="!showSuccessMessage">
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            <form (ngSubmit)="onSubmit()" #contactForm="ngForm" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name *</label>
                <input type="text"
                       name="name"
                       required
                       [(ngModel)]="contactFormData.name"
                       class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Email Address *</label>
                <input type="email"
                       name="email"
                       required
                       [(ngModel)]="contactFormData.email"
                       class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel"
                       name="phone"
                       [(ngModel)]="contactFormData.phone"
                       class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Subject *</label>
                <select name="subject"
                        required
                        [(ngModel)]="contactFormData.subject"
                        class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="donation">Donation Question</option>
                  <option value="assistance">Request Assistance</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="volunteer">Volunteer Information</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Message *</label>
                <textarea name="message"
                          rows="4"
                          required
                          [(ngModel)]="contactFormData.message"
                          class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="Tell us how we can help you..."></textarea>
              </div>
              
              <div>
                <button type="submit"
                        [disabled]="!contactForm.valid || isSubmitting"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                  <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                </button>
              </div>

              <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800">
                      Important Notice
                    </h3>
                    <div class="mt-2 text-sm text-yellow-700">
                      <p>
                        While we strive to respond to all messages promptly, please note that email delivery may occasionally be delayed or fail due to technical issues. If you don't hear back within 48 hours, we recommend reaching out through our social media channels or calling our support line for immediate assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ContactComponent {
  title = 'Contact - Legacy Donation';
  
  contactFormData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  // API interaction states
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}
  
  onSubmit() {
    if (!this.isFormValid()) {
      this.showError('Please fill in all required fields.');
      return;
    }

    this.isSubmitting = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;

    const message: Omit<ContactMessage, 'id' | 'status' | 'created_at'> = {
      name: this.contactFormData.name,
      email: this.contactFormData.email,
      phone: this.contactFormData.phone || '',
      subject: this.contactFormData.subject,
      message: this.contactFormData.message
    };

    this.apiService.submitContactForm(message).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showSuccessMessage = true;
          this.resetForm();
          // Scroll to top to show success message
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Hide success message after 2 seconds and show form again
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 2000);
        } else {
          this.showError(response.message || 'An error occurred while sending your message.');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMsg = this.apiService.getErrorMessage(error);
        this.showError(errorMsg);
      }
    });
  }

  private isFormValid(): boolean {
    return !!(
      this.contactFormData.name &&
      this.contactFormData.email &&
      this.contactFormData.subject &&
      this.contactFormData.message
    );
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.showErrorMessage = true;
    this.showSuccessMessage = false;
  }

  private resetForm() {
    this.contactFormData = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  }
}