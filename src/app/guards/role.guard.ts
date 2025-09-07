import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // First check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Get roles from route data
    const requiredRoles = route.data['roles'] as Array<string>;

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from auth service
    const user = this.authService.getUser();

    // Check if user has required role
    const hasRole = user && user.roles && requiredRoles.some(role => user.roles.includes(role));

    if (hasRole) {
      return true;
    }

    // If user doesn't have required role
    this.toastr.error('You do not have permission to access this resource', 'Access Denied');
    this.router.navigate(['/']);
    return false;
  }
}
