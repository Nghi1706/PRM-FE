import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../services/error-handler.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private errorService: ErrorHandlerService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.status === 401) {
          // Unauthorized, redirect to login
          this.toastr.error(
            'Your session has expired. Please log in again.',
            'Authentication Error'
          );
          this.router.navigate(['/auth/login']);
        } else {
          // Use error handler service to get the error message
          const errorObj = error.error || {};
          errorMessage = errorObj.message || error.message || 'An unexpected error occurred';
          this.toastr.error(errorMessage, 'Error');

          // Let the error handler service handle the error for logging
          this.errorService.handleError(error);
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
