/**
 * Legacy Donation API Service
 * Production API endpoints for Kiln Enterprise
 * Handles all HTTP communication with the backend
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

// ========================
// INTERFACES & TYPES
// ========================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export interface Donation {
  id?: number;
  amount: number;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  donation_type: 'one-time' | 'monthly';
  status?: 'pending' | 'completed' | 'failed';
  created_at?: string;
}

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: 'new' | 'read' | 'responded';
  created_at?: string;
}

export interface Statistics {
  total_donations: number;
  total_amount: number;
  recent_donations: Donation[];
}

// ========================
// API ENDPOINTS
// ========================

class LegacyDonationAPI {
  private static readonly BASE_URL = 'https://kilnenterprise.com/api';

  // Health Check Endpoints
  static readonly HEALTH = `${this.BASE_URL}/health`;

  // Donation Endpoints
  static readonly DONATIONS = `${this.BASE_URL}/donations`;
  static readonly DONATION_STATISTICS = `${this.BASE_URL}/statistics`;

  // Contact Endpoints
  static readonly CONTACT = `${this.BASE_URL}/contact`;

  // Utility method to build URL
  static getUrl(endpoint: string): string {
    return `${this.BASE_URL}/${endpoint}`;
  }
}

// ========================
// MAIN API SERVICE
// ========================

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'https://kilnenterprise.com/api';

  constructor(private http: HttpClient) {}

  // ========================
  // HEALTH CHECK METHODS
  // ========================

  /**
   * Check API health and database connection
   * Endpoint: GET /api/health
   */
  checkHealth(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(LegacyDonationAPI.HEALTH)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Get comprehensive API and system health
   * Endpoint: GET /api/health
   */
  getSystemHealth(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(LegacyDonationAPI.HEALTH)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // ========================
  // DONATION METHODS
  // ========================

  /**
   * Create a new donation
   * Endpoint: POST /api/donations
   */
  createDonation(donation: Omit<Donation, 'id' | 'status' | 'created_at'>): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApiResponse>(LegacyDonationAPI.DONATIONS, donation, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all donations (admin purposes)
   * Endpoint: GET /api/donations
   */
  getDonations(): Observable<ApiResponse<Donation[]>> {
    return this.http.get<ApiResponse<Donation[]>>(LegacyDonationAPI.DONATIONS)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Get donation by ID
   * Endpoint: GET /api/donations/{id}
   */
  getDonation(id: number): Observable<ApiResponse<Donation>> {
    return this.http.get<ApiResponse<Donation>>(`${LegacyDonationAPI.DONATIONS}/${id}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Update donation status
   * Endpoint: PUT /api/donations/{id}
   */
  updateDonation(id: number, updates: Partial<Donation>): Observable<ApiResponse<Donation>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<ApiResponse<Donation>>(`${LegacyDonationAPI.DONATIONS}/${id}`, updates, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete donation
   * Endpoint: DELETE /api/donations/{id}
   */
  deleteDonation(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${LegacyDonationAPI.DONATIONS}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get donation statistics
   * Endpoint: GET /api/statistics
   */
  getStatistics(): Observable<ApiResponse<Statistics>> {
    return this.http.get<ApiResponse<Statistics>>(LegacyDonationAPI.DONATION_STATISTICS)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // ========================
  // CONTACT METHODS
  // ========================

  /**
   * Submit contact form
   * Endpoint: POST /api/contact
   */
  submitContactForm(message: Omit<ContactMessage, 'id' | 'status' | 'created_at'>): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApiResponse>(LegacyDonationAPI.CONTACT, message, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all contact messages (admin purposes)
   * Endpoint: GET /api/contact
   */
  getContactMessages(): Observable<ApiResponse<ContactMessage[]>> {
    return this.http.get<ApiResponse<ContactMessage[]>>(LegacyDonationAPI.CONTACT)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Update contact message status
   * Endpoint: PUT /api/contact/{id}
   */
  updateContactMessage(id: number, updates: Partial<ContactMessage>): Observable<ApiResponse<ContactMessage>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<ApiResponse<ContactMessage>>(`${LegacyDonationAPI.CONTACT}/${id}`, updates, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get contact message by ID
   * Endpoint: GET /api/contact/{id}
   */
  getContactMessage(id: number): Observable<ApiResponse<ContactMessage>> {
    return this.http.get<ApiResponse<ContactMessage>>(`${LegacyDonationAPI.CONTACT}/${id}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // ========================
  // UTILITY METHODS
  // ========================

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Format error message for user display
   */
  getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error && error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Check if API is reachable
   */
  isApiReachable(): Observable<boolean> {
    return this.checkHealth().pipe(
      map((response: ApiResponse) => response.success),
      catchError(() => {
        return throwError(() => new Error('API is not reachable'));
      })
    );
  }

  /**
   * Get API base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}