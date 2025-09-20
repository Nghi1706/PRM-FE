import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ROLE_PAGE_PERMISSIONS, UserRole } from '../constants/roles';
import { AuthService } from './auth.service';
import { JwtHelperService } from './jwt-helper.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(
    private authService: AuthService,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {}

  /**
   * Get current user's role from token
   */
  getCurrentUserRole(): UserRole | null {
    const [accessToken] = this.authService.getToken();
    if (!accessToken) return null;

    return this.jwtHelper.getUserRole(accessToken);
  }

  /**
   * Check if current user can access a specific page
   */
  canAccessPage(pageName: string): boolean {
    const userRole = this.getCurrentUserRole();
    console.log('Current user role:', userRole);
    if (!userRole) return false;

    const permissions = ROLE_PAGE_PERMISSIONS[userRole];
    return permissions.pages.includes(pageName);
  }

  /**
   * Get all accessible pages for current user
   */
  getAccessiblePages(): string[] {
    const userRole = this.getCurrentUserRole();
    if (!userRole) return [];

    return ROLE_PAGE_PERMISSIONS[userRole].pages;
  }

  /**
   * Get default page for current user's role
   */
  getDefaultPage(): string {
    const userRole = this.getCurrentUserRole();
    if (!userRole) return 'menu'; // Default fallback for guests

    return ROLE_PAGE_PERMISSIONS[userRole].defaultPage;
  }

  /**
   * Redirect to default page if current page is not accessible
   */
  redirectToDefaultPageIfNeeded(currentPage: string): boolean {
    if (!this.canAccessPage(currentPage)) {
      const defaultPage = this.getDefaultPage();
      this.router.navigate([`/${defaultPage}`]);
      return true;
    }
    return false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const userRole = this.getCurrentUserRole();
    return userRole === role;
  }

  /**
   * Check if user has minimum required role (hierarchy aware)
   * Lower numbers = higher permissions (Develop=1, Admin=2, etc.)
   */
  // hasMinimumRole(requiredRole: UserRole): boolean {
  //   const userRole = this.getCurrentUserRole();
  //   if (!userRole) return false;

  //   // User role must be equal or lower number (higher permission) than required
  //   return userRole <= requiredRole;
  // }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getCurrentUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Get current user info from JWT token
   */
  getCurrentUserInfo(): {
    userId: string | null;
    restaurantId: string | null;
    role: UserRole | null;
  } {
    const [accessToken] = this.authService.getToken();
    if (!accessToken) return { userId: null, restaurantId: null, role: null };

    return {
      userId: this.jwtHelper.getUserId(accessToken),
      restaurantId: this.jwtHelper.getRestaurantId(accessToken),
      role: this.jwtHelper.getUserRole(accessToken),
    };
  }

  /**
   * Check if user is restaurant staff (Admin, Manager, Employee, Chef)
   */
  isRestaurantStaff(): boolean {
    return this.hasAnyRole([UserRole.Admin, UserRole.Manager, UserRole.Employee, UserRole.Chef]);
  }

  /**
   * Check if user can manage restaurant (Admin, Manager)
   */
  canManageRestaurant(): boolean {
    return this.hasAnyRole([UserRole.Admin, UserRole.Manager, UserRole.Develop]);
  }

  /**
   * Check if user is system admin (Develop)
   */
  isSystemAdmin(): boolean {
    return this.hasRole(UserRole.Develop);
  }
}
