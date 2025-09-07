import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const [accessToken] = this.authService.getToken();

    if (accessToken && accessToken !== 'null') {
      // Clone the request and add the token to the authorization header
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return next.handle(authRequest);
    }

    // If no token, proceed with the original request
    return next.handle(request);
  }
}
