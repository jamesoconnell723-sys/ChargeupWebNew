
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
export interface ChangePasswordRequest {
  userId: number;
  currentPassword?: string | null; // optional if you require current password check
  newPassword: string;
}
@Injectable({
  providedIn: 'root'
})
export class Auth {
  // private apiUrl = 'http://localhost:5000/api/Login';
  private apiUrl = `${environment.apiUrl}/Login`;

  // constructor(private http: HttpClient) { }
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) { }

  // login(email: string, password: string): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/Login`, {
  //     email: email,
  //     password: password
  //   });
  // }
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  postApi(url: any, body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${url}`, body);
  }

  changePassword(payload: ChangePasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ChangePassword`, payload);
  }

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/Login`, body);
  }

  saveSession(userData: any) {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  getSession() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  logout() {
    localStorage.clear();
  }

  // saveSession(data: any) {
  //   localStorage.setItem('token', data.token);
  //   localStorage.setItem('roleName', data.roleName);
  //   localStorage.setItem('email', data.email);
  //   localStorage.setItem('username', data.username);
  //   localStorage.setItem('userId', data.username);
  //   localStorage.setItem('roleId', data.roleId.toString());
  //   sessionStorage.setItem('balance', data.balance?.toString() || '0');
  // }


  getRoleName(): string {
    return localStorage.getItem('roleName')?.toLowerCase() || '';
  }

  // logout() {
  //   localStorage.clear();
  //   sessionStorage.clear();
  // }

  getRoleId(): number {
    if (!this.isBrowser()) return 0;
    return Number(localStorage.getItem('roleId')) || 0;
  }


  get token(): string | null {
    // return sessionStorage.getItem('token');
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem('token');
    }
    return null;
  }

  get email(): string | null {
    // return sessionStorage.getItem('email');
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem('email');
    }
    return null;
  }

  get userId(): string | null {
    // return sessionStorage.getItem('userId');
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem('userId');
    }
    return null;
  }

  get username(): string | null {
    // return sessionStorage.getItem('username');
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem('username');
    }
    return null;
  }

  get userType(): string | null {
    // return sessionStorage.getItem('userType');
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem('userType');
    }
    return null;
  }

  // logout(): void {
  //   sessionStorage.clear();
  // }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  getMenusByRole(roleId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetMenusByRole/${roleId}`);
  }

  getMenusForCurrentRole(): Observable<any> {
    const roleId = localStorage.getItem('roleId');
    return this.http.get(`${this.apiUrl}/GetMenusByRole/${roleId}`);
  }
}
