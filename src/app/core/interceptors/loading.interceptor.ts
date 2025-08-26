import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;

  constructor(private spinner: NgxSpinnerService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Check if the request has the 'skipLoading' flag
    if (request.headers.has('skipLoading')) {
      // Remove the custom header to avoid issues with backend
      const headers = request.headers.delete('skipLoading');
      const newRequest = request.clone({ headers });
      return next.handle(newRequest);
    }

    this.totalRequests++;
    this.spinner.show();

    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.spinner.hide();
        }
      })
    );
  }
}
