# PRM Frontend - AI Coding Agent Instructions

## Project Overview
This is an Angular 17 SSR-enabled application named "PRM01" for restaurant management. The app uses standalone components with module-based routing, Angular Material UI, and includes real-time features via SignalR.

## Architecture Patterns

### Module Structure
- **Core/Shared Pattern**: `CoreModule` (singleton services, interceptors) and `SharedModule` (reusable components, Material modules)
- **Feature Modules**: Lazy-loaded with child routing (e.g., `AuthModule`, `DashboardModule`)
- **Routing**: Main routes in `app-routing.module.ts` with lazy loading pattern

### Service Layer
- **Repository Pattern**: `RepositoryService` provides generic CRUD operations with consistent `ApiResponse<T>` wrapper
- **Authentication**: `AuthService` manages JWT tokens in localStorage with `BehaviorSubject` for auth state
- **API Response**: All API calls return `ApiResponse<T>` with `{ data, isSuccess, message, statusCode }`

### HTTP Architecture
Three interceptors registered in `CoreModule`:
- `AuthInterceptor`: Adds Bearer token to requests
- `LoadingInterceptor`: Manages global loading state with ngx-spinner
- `ErrorInterceptor`: Centralized error handling with toastr notifications

### Constants & Types
- `LS_KEYS`: Centralized localStorage key constants in `src/app/constants/const.ts`
- `SCREENS`: Screen name constants for navigation
- Strong typing with interfaces in `src/app/interface/` for API contracts

## Key Development Patterns

### Authentication Flow
```typescript
// Login flow always follows this pattern:
this.authService.login(credentials).subscribe({
  next: (response) => {
    if (response.isSuccess) {
      // Navigation handled by service
    }
  }
});
```

### API Service Usage
```typescript
// Always use RepositoryService for API calls:
this.repositoryService.get<User[]>('users').subscribe(response => {
  if (response.isSuccess) {
    this.users = response.data;
  }
});
```

### Guard Implementation
- `AuthGuard`: Protects routes, redirects to `/login` with `returnUrl` query param
- `RoleGuard`: Available for role-based access control

## Development Workflow

### Commands
- `npm start` or `ng serve`: Development server (port 4200)
- `npm run serve:ssr:PRM01`: SSR production server
- `npm test`: Unit tests with Karma
- `ng generate`: Use for scaffolding with SCSS styling default

### Styling
- SCSS architecture in `src/styles/`: `_variables.scss`, `_mixins.scss`, `_themes.scss`
- Angular Material theming in `custom-theme.scss`
- Component styles use SCSS by default (configured in `angular.json`)

### Third-party Integration
- **UI**: Angular Material (comprehensive module in `MaterialModule`)
- **Notifications**: ngx-toastr (configured globally in `AppModule`)
- **Loading**: ngx-spinner (ball-scale-multiple type)
- **Charts**: @swimlane/ngx-charts for data visualization
- **Real-time**: @microsoft/signalr for live updates

## Code Conventions

### File Organization
- Services in `src/app/services/`
- Guards in `src/app/guards/`
- Interfaces in `src/app/interface/`
- Constants in `src/app/constants/`
- Feature pages in `src/app/pages/[feature]/`

### Error Handling
- Use `ErrorInterceptor` for global HTTP error handling
- Component-level errors use toastr service
- Console logging includes context (see `AuthService.isLoggedIn()`)

### State Management
- Local component state with RxJS observables
- Authentication state via `AuthService.isAuthenticated$`
- No global state management library (NgRx, etc.)

## Environment Configuration
- `environment.ts`: Development API URL (`https://localhost:7134`)
- `environment.prod.ts`: Production configuration
- API base URL configured in environment files, used by `RepositoryService`
