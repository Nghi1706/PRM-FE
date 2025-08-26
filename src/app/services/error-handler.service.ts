import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor() {}

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          break;
        case 401:
          errorMessage = 'Unauthorized access. Please login again';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later';
          break;
        default:
          errorMessage = `Error Code: ${error.status}, Message: ${error.error?.message || error.message}`;
      }
    }

    console.error('API Error:', error);

    // Return a new error observable with the formatted message
    return throwError(() => new Error(errorMessage));
  }
}
