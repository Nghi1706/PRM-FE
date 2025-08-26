import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Output() toggleNav = new EventEmitter<void>();

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'restaurant', label: 'Restaurants', route: '/restaurants' },
    { icon: 'people', label: 'Users', route: '/users' },
    { icon: 'settings', label: 'Settings', route: '/settings' },
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  onNavItemClick(): void {
    // Close navbar on mobile after navigation
    this.toggleNav.emit();
  }
}
