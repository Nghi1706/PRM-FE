import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '../interface/auth';
import { ApiResponse } from '../interface/api-response';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LS_KEYS } from '../constants/const';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authSubject = new BehaviorSubject<boolean>(this.isLoggedIn());

  public isAuthenticated$ = this.authSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/api/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.isSuccess && response.data) {
            this.saveToken(response.data.access_token, response.data.refresh_token);
            this.saveUser(response.data.user);
            this.authSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(LS_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LS_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LS_KEYS.USER);
    this.authSubject.next(false);
    this.router.navigate(['/login']);
  }

  saveToken(access_token: string, refresh_token: string): void {
    localStorage.setItem(LS_KEYS.ACCESS_TOKEN, access_token);
    localStorage.setItem(LS_KEYS.REFRESH_TOKEN, refresh_token);
  }

  getToken(): [string | null, string | null] {
    return [localStorage.getItem(LS_KEYS.ACCESS_TOKEN), localStorage.getItem(LS_KEYS.REFRESH_TOKEN)];
  }

  saveUser(user: User): void {
    localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem(LS_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    console.log('Checking if user is logged in...');
    console.log(this.getToken());
    return this.getToken()[0] !== null && this.getToken()[0] !== null;
  }
}
