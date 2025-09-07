export enum UserRole {
  Develop = 1, // Management - app level
  Admin = 2, // Admin - restaurant level
  Manager = 3, // Manager - restaurant level
  Employee = 4, // Employee - restaurant level
  Chef = 5, // Chef - restaurant level
  Guest = 6, // Guest - can scan QR and order
}

export interface RoleInfo {
  id: UserRole;
  name: string;
  description: string;
}

export const ROLE_INFO: Record<UserRole, RoleInfo> = {
  [UserRole.Develop]: {
    id: UserRole.Develop,
    name: 'Developer',
    description: 'System developer with full access to all restaurants and management features',
  },
  [UserRole.Admin]: {
    id: UserRole.Admin,
    name: 'Admin',
    description: 'Restaurant administrator with full access to restaurant management',
  },
  [UserRole.Manager]: {
    id: UserRole.Manager,
    name: 'Manager',
    description: 'Restaurant manager with operational access',
  },
  [UserRole.Employee]: {
    id: UserRole.Employee,
    name: 'Employee',
    description: 'Restaurant employee with limited access',
  },
  [UserRole.Chef]: {
    id: UserRole.Chef,
    name: 'Chef',
    description: 'Kitchen chef with menu and order management access',
  },
  [UserRole.Guest]: {
    id: UserRole.Guest,
    name: 'Guest',
    description: 'Customer guest with ordering access via QR code',
  },
};

// Page permissions for each role
export interface RolePagePermissions {
  roleId: UserRole;
  pages: string[];
  defaultPage: string;
}

export const ROLE_PAGE_PERMISSIONS: Record<UserRole, RolePagePermissions> = {
  [UserRole.Develop]: {
    roleId: UserRole.Develop,
    pages: ['dashboard', 'restaurants', 'users', 'reports', 'settings', 'system-management'],
    defaultPage: 'dashboard',
  },
  [UserRole.Admin]: {
    roleId: UserRole.Admin,
    pages: ['dashboard', 'orders', 'menu', 'users', 'reports', 'settings', 'tables'],
    defaultPage: 'dashboard',
  },
  [UserRole.Manager]: {
    roleId: UserRole.Manager,
    pages: ['dashboard', 'orders', 'menu', 'reports', 'tables', 'inventory'],
    defaultPage: 'dashboard',
  },
  [UserRole.Employee]: {
    roleId: UserRole.Employee,
    pages: ['orders', 'tables', 'menu'],
    defaultPage: 'orders',
  },
  [UserRole.Chef]: {
    roleId: UserRole.Chef,
    pages: ['kitchen', 'orders', 'menu'],
    defaultPage: 'kitchen',
  },
  [UserRole.Guest]: {
    roleId: UserRole.Guest,
    pages: ['menu', 'cart', 'orders'],
    defaultPage: 'menu',
  },
};
