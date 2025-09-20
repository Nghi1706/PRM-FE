import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  // Auth routes (không dùng layout)
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule),
  },
  // Protected routes (dùng layout) - tất cả đều dùng AuthGuard với permission check
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      // System Management (Develop role)
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'restaurants',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./pages/restaurants/restaurants.module').then(m => m.RestaurantsModule),
      },
      {
        path: 'system-management',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./pages/system-management/system-management.module').then(
            m => m.SystemManagementModule
          ),
      },

      // Restaurant Management
      {
        path: 'orders',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/orders/orders.module').then(m => m.OrdersModule),
      },
      {
        path: 'menu',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/menu/menu.module').then(m => m.MenuModule),
      },
      {
        path: 'tables',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/tables/tables.module').then(m => m.TablesModule),
      },
      {
        path: 'table-orders',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./pages/table-orders/table-orders.module').then(m => m.TableOrdersModule),
      },
      {
        path: 'inventory',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./pages/inventory/inventory.module').then(m => m.InventoryModule),
      },
      {
        path: 'users',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/users/users.module').then(m => m.UsersModule),
      },
      {
        path: 'categories',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./pages/categories/categories.module').then(m => m.CategoriesModule),
      },
      {
        path: 'dishes',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/dishes/dishes.module').then(m => m.DishesModule),
      },
      {
        path: 'reports',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/reports/reports.module').then(m => m.ReportsModule),
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule),
      },

      // Kitchen Management (Chef role)
      {
        path: 'kitchen',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/kitchen/kitchen.module').then(m => m.KitchenModule),
      },

      // Guest/Customer
      {
        path: 'cart',
        canActivate: [AuthGuard],
        loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule),
      },

      {
        path: '',
        redirectTo: 'dashboard', // Will be handled by AuthGuard to redirect to appropriate default page
        pathMatch: 'full',
      },
    ],
  },
  // Redirect old auth routes
  {
    path: 'login',
    redirectTo: 'auth/login',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
