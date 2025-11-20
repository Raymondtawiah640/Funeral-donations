import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Statistics {
  total_donations: number;
  total_amount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Donation {
  id?: number;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  amount: number;
  message?: string;
  donation_type?: 'one-time' | 'monthly';
  status?: string;
  created_at?: string;
}

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: string;
  created_at?: string;
}

// User Authentication interfaces
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_verified: boolean;
}

export interface LoginCredentials {
  email: string;
  verification_code?: string;
  login_code?: string;
}

// Funeral Announcement interfaces
export interface FuneralAnnouncement {
  id: number;
  creator_user_id: number;
  deceased_name: string;
  deceased_birth_date?: string;
  deceased_death_date?: string;
  funeral_date?: string;
  funeral_location?: string;
  ceremony_type: string;
  family_message: string;
  goal_amount?: number;
  raised_amount: number;
  beneficiary_name: string;
  beneficiary_bank_account?: string;
  beneficiary_mobile_money?: string;
  beneficiary_account_type: string;
  announcement_start_date: string;
  announcement_end_date: string;
  is_closed: boolean;
  closed_at?: string;
  status?: string;
  creator_name?: string;
  donation_count?: number;
  total_raised?: number;
  files?: AnnouncementFile[];
  recent_donations?: Donation[];
}

export interface AnnouncementFile {
  id: number;
  announcement_id: number;
  file_name: string;
  original_name: string;
  file_type: string;
  file_path: string;
  file_size: number;
  upload_purpose: string;
  uploaded_at: string;
}

export interface CreateAnnouncementRequest {
  deceased_name: string;
  deceased_birth_date?: string;
  deceased_death_date?: string;
  funeral_date?: string;
  funeral_location?: string;
  ceremony_type?: string;
  family_message: string;
  goal_amount?: number;
  beneficiary_name: string;
  beneficiary_bank_account?: string;
  beneficiary_mobile_money?: string;
  beneficiary_account_type: string;
  announcement_start_date: string;
  announcement_end_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://kilnenterprise.com/Donations';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Authentication methods
  signup(email: string, fullName: string, phone?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth.php?action=signup`, {
      email, full_name: fullName, phone
    }).pipe(catchError(this.handleError));
  }

  verifyEmail(email: string, verificationCode: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth.php?action=verify`, {
      email, verification_code: verificationCode
    }).pipe(catchError(this.handleError));
  }

  requestLoginCode(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth.php?action=request-login`, {
      email
    }).pipe(catchError(this.handleError));
  }

  loginWithCode(email: string, loginCode: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth.php?action=login`, {
      email, login_code: loginCode
    }).pipe(catchError(this.handleError));
  }

  resendVerificationCode(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth.php?action=resend-verification`, {
      email
    }).pipe(catchError(this.handleError));
  }

  // Funeral announcements methods
  getAnnouncements(): Observable<ApiResponse<FuneralAnnouncement[]>> {
    return this.http.get<ApiResponse<FuneralAnnouncement[]>>(`${this.baseUrl}/funeral.php`).pipe(
      catchError(this.handleError)
    );
  }

  getAnnouncement(id: number): Observable<ApiResponse<FuneralAnnouncement>> {
    return this.http.get<ApiResponse<FuneralAnnouncement>>(`${this.baseUrl}/funeral.php?id=${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createAnnouncement(announcement: CreateAnnouncementRequest): Observable<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/funeral.php`, announcement, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateAnnouncement(id: number, announcement: Partial<CreateAnnouncementRequest>): Observable<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/funeral.php?id=${id}`, announcement, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  closeAnnouncement(id: number): Observable<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/funeral.php?action=close&id=${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getUserAnnouncements(): Observable<ApiResponse<FuneralAnnouncement[]>> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<FuneralAnnouncement[]>>(`${this.baseUrl}/funeral.php?action=user-announcements`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Donation methods
  createDonation(donation: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/donations.php`, donation).pipe(
      catchError(this.handleError)
    );
  }

  getDonations(announcementId: number, limit = 20, offset = 0): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/donations.php?announcement_id=${announcementId}&limit=${limit}&offset=${offset}`).pipe(
      catchError(this.handleError)
    );
  }

  getDonationStats(announcementId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/donations.php?action=stats&announcement_id=${announcementId}`).pipe(
      catchError(this.handleError)
    );
  }

  sendDonationNotification(announcementId: number, donorName: string, donorEmail: string, message: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/donations.php?action=notify`, {
      announcement_id: announcementId,
      donor_name: donorName,
      donor_email: donorEmail,
      message: message
    }).pipe(
      catchError(this.handleError)
    );
  }

  // File upload methods
  uploadFile(announcementId: number, file: File, uploadPurpose: string): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('announcement_id', announcementId.toString());
    formData.append('upload_purpose', uploadPurpose);
    formData.append('file', file);

    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/upload.php`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getFiles(announcementId: number): Observable<ApiResponse<AnnouncementFile[]>> {
    return this.http.get<ApiResponse<AnnouncementFile[]>>(`${this.baseUrl}/donations.php?action=files&announcement_id=${announcementId}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteFile(fileId: number): Observable<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/donations.php?action=file&file_id=${fileId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Contact form (existing)
  submitContactForm(message: Omit<ContactMessage, 'id' | 'status' | 'created_at'>): Observable<ApiResponse<ContactMessage>> {
    return this.http.post<ApiResponse<ContactMessage>>(`${this.baseUrl}/contact.php`, message).pipe(
      catchError(this.handleError)
    );
  }

  // Utility methods
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User | null) {
    this.currentUserSubject.next(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  logout(): void {
    this.setCurrentUser(null);
    this.setAuthToken('');
  }

  getErrorMessage(error: any): string {
    if (error.error && error.error.error) {
      return error.error.error;
    }
    if (error.error && error.error.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Server Error: ${error.status} ${error.statusText}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}

