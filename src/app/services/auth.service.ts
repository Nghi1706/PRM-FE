import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LS_KEYS } from '../constants/const';
import { UserRole } from '../constants/roles';
import { ApiResponse } from '../interface/api-response';
import { LoginRequest, LoginResponse, User } from '../interface/auth';
import { JwtHelperService } from './jwt-helper.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authSubject = new BehaviorSubject<boolean>(false);

  public isAuthenticated$ = this.authSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    // Check auth status after constructor completes to avoid circular dependency
    setTimeout(() => {
      this.checkAuthStatus();
    }, 0);
  }

  private checkAuthStatus(): void {
    try {
      const isLoggedIn = this.isLoggedIn();
      this.authSubject.next(isLoggedIn);

      if (!isLoggedIn) {
        this.clearStorageIfCorrupted();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      this.authSubject.next(false);
    }
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/api/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (response.isSuccess && response.data) {
            console.log('Login data:', response.data);
            this.saveToken(response.data.accessToken, response.data.refreshToken);
            this.saveUser(response.data.user);
            this.authSubject.next(true);

            // Navigate after successful login
            this.navigateAfterLogin();
          }
        })
      );
  }

  private navigateAfterLogin(): void {
    // Small delay to ensure JWT is processed and services are ready
    setTimeout(() => {
      // Check for returnUrl in query params
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');

      console.log('Return URL from query params:', returnUrl);

      if (returnUrl && returnUrl !== '/' && returnUrl !== '/dashboard') {
        console.log('Navigating to return URL:', returnUrl);
        this.router.navigate([returnUrl]);
      } else {
        // Navigate to dashboard as default
        console.log('Navigating to dashboard');
        this.router.navigate(['/dashboard']);
      }
    }, 100);
  }

  logout(): void {
    localStorage.removeItem(LS_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LS_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LS_KEYS.USER);
    this.authSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  clearStorageIfCorrupted(): void {
    try {
      // Kiểm tra xem localStorage có dữ liệu bị lỗi không
      const user = localStorage.getItem(LS_KEYS.USER);
      if (user && (user === 'undefined' || user === 'null')) {
        console.warn('Corrupted user data found in localStorage, clearing...');
        this.logout();
      }
    } catch (error) {
      console.error('Error checking localStorage:', error);
      this.logout();
    }
  }

  saveToken(access_token: string, refresh_token: string): void {
    // Validate tokens before saving
    if (!access_token || access_token === 'undefined' || access_token === 'null') {
      console.error('Invalid access token provided');
      return;
    }

    if (!refresh_token || refresh_token === 'undefined' || refresh_token === 'null') {
      console.error('Invalid refresh token provided');
      return;
    }

    localStorage.setItem(LS_KEYS.ACCESS_TOKEN, access_token);
    localStorage.setItem(LS_KEYS.REFRESH_TOKEN, refresh_token);
    console.log('Tokens saved successfully');
  }

  getToken(): [string | null, string | null] {
    const accessToken = localStorage.getItem(LS_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(LS_KEYS.REFRESH_TOKEN);

    // Handle string "undefined" and "null" values
    const validAccessToken =
      accessToken && accessToken !== 'undefined' && accessToken !== 'null' ? accessToken : null;
    const validRefreshToken =
      refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null' ? refreshToken : null;

    return [validAccessToken, validRefreshToken];
  }

  saveUser(user: User): void {
    localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem(LS_KEYS.USER);
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem(LS_KEYS.USER);
      return null;
    }
  }

  isLoggedIn(): boolean {
    try {
      console.log('Checking if user is logged in...');
      const [accessToken, refreshToken] = this.getToken();
      console.log('Tokens:', {
        accessToken: accessToken ? 'EXISTS' : 'NULL',
        refreshToken: refreshToken ? 'EXISTS' : 'NULL',
      });

      if (!accessToken || !refreshToken) {
        console.log('Missing tokens');
        return false;
      }

      // Check if token is expired
      if (this.jwtHelper.isTokenExpired(accessToken)) {
        console.warn('Access token is expired');
        this.logout();
        return false;
      }

      console.log('User is logged in');
      return true;
    } catch (error) {
      console.error('Error checking login status:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Get current user's role from JWT token
   */
  getCurrentUserRole(): UserRole | null {
    const [accessToken] = this.getToken();
    if (!accessToken) return null;

    return this.jwtHelper.getUserRole(accessToken);
  }

  /**
   * Get current user's restaurant ID from JWT token
   */
  getCurrentUserRestaurantId(): string | null {
    const [accessToken] = this.getToken();
    if (!accessToken) return null;

    return this.jwtHelper.getRestaurantId(accessToken);
  }
}
