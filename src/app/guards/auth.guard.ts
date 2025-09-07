import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // First check if user is logged in
    console.log('AuthGuard#canActivate called for URL:', state.url);
    console.log('Is user logged in?', this.authService.isLoggedIn());
    if (!this.authService.isLoggedIn()) {
      const currentUrl = state.url;
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: currentUrl } });
      return false;
    }

    // Extract page name from URL
    const urlParts = state.url.split('/').filter(part => part);
    const pageName = urlParts[0] || 'dashboard';

    // Special handling for root path redirect
    if (state.url === '/' || (pageName === 'dashboard' && urlParts.length === 1)) {
      const defaultPage = this.permissionService.getDefaultPage();
      if (defaultPage !== 'dashboard') {
        this.router.navigate([`/${defaultPage}`]);
        return false;
      }
    }

    // Check if user can access this page
    if (!this.permissionService.canAccessPage(pageName)) {
      console.warn(`User attempted to access unauthorized page: ${pageName}`);

      // Redirect to user's default page
      const defaultPage = this.permissionService.getDefaultPage();
      this.router.navigate([`/${defaultPage}`]);
      return false;
    }

    return true;
  }
}
