import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { PermissionService } from '../../services/permission.service';

interface NavItem {
  route: string;
  icon: string;
  label: string;
  page: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Input() collapsed = false;

  availableMenuItems: NavItem[] = [];

  allMenuItems: NavItem[] = [
    // System Management (Develop only)
    { route: '/dashboard', icon: 'dashboard', label: 'Dashboard', page: 'dashboard' },
    { route: '/restaurants', icon: 'store', label: 'Restaurants', page: 'restaurants' },
    {
      route: '/system-management',
      icon: 'admin_panel_settings',
      label: 'System Management',
      page: 'system-management',
    },

    // Restaurant Management (Admin, Manager)
    { route: '/orders', icon: 'receipt_long', label: 'Orders', page: 'orders' },
    { route: '/menu', icon: 'restaurant_menu', label: 'Menu', page: 'menu' },
    { route: '/categories', icon: 'category', label: 'Categories', page: 'categories' },
    { route: '/dishes', icon: 'dining', label: 'Dishes', page: 'dishes' },

    // Tables Management (Admin only)
    { route: '/tables', icon: 'table_restaurant', label: 'Tables Management', page: 'tables' },

    // Table Orders (Employee and above)
    {
      route: '/table-orders',
      icon: 'restaurant_menu',
      label: 'Table Orders',
      page: 'table-orders',
    },

    { route: '/inventory', icon: 'inventory', label: 'Inventory', page: 'inventory' },
    { route: '/users', icon: 'people', label: 'Staff', page: 'users' },
    { route: '/reports', icon: 'analytics', label: 'Reports', page: 'reports' },
    { route: '/settings', icon: 'settings', label: 'Settings', page: 'settings' },

    // Kitchen Management (Chef)
    { route: '/kitchen', icon: 'kitchen', label: 'Kitchen Dashboard', page: 'kitchen' },

    // Guest/Customer
    { route: '/cart', icon: 'shopping_cart', label: 'Cart', page: 'cart' },
  ];

  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAvailableMenuItems();
  }

  private loadAvailableMenuItems() {
    const accessiblePages = this.permissionService.getAccessiblePages();
    this.availableMenuItems = this.allMenuItems.filter(item => accessiblePages.includes(item.page));
  }
}
