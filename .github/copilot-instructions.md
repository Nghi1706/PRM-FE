# PRM Frontend - AI Coding Agent Instructions

## Project Overview

Angular 17 SSR-enabled restaurant management system "PRM01" with role-based access control (6 user roles from Developer to Guest), featuring standalone components mixed with module-based routing, Angular Material UI, and real-time SignalR integration.

## Architecture Patterns

### Module Structure

- **Core/Shared Pattern**: `CoreModule` (singleton services, interceptors) + `SharedModule` (MaterialModule, reactive forms)
- **Feature Modules**: Lazy-loaded with child routing - standard pattern `[CommonModule, MaterialModule, RouterModule.forChild(routes)]`
- **Routing**: Protected routes use `LayoutComponent` wrapper + `AuthGuard`, auth routes bypass layout

### Service Layer

- **Repository Pattern**: `RepositoryService` provides generic CRUD (`get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()`) with `ApiResponse<T>` wrapper
- **API Response**: ALL API calls return `ApiResponse<T>` with `{ data, isSuccess, message, statusCode }` - always check `response.isSuccess` before accessing data
- **Authentication**: JWT tokens in localStorage via `LS_KEYS` constants, `BehaviorSubject` auth state management

### HTTP Architecture

Three interceptors in `CoreModule` providers array:

- `LoadingInterceptor`: Auto-manages ngx-spinner (skip with `skipLoading` header)
- `AuthInterceptor`: Injects Bearer tokens
- `ErrorInterceptor`: Global error handling with toastr notifications

### Role-Based Access Control

- **UserRole enum**: 6 roles (Develop=1, Admin=2, Manager=3, Employee=4, Chef=5, Guest=6)
- **ROLE_INFO object**: Maps role IDs to `{ name, description }` - use for display
- **Permission patterns**: `PermissionService.getCurrentUserInfo()`, role-specific page access

## Key Development Patterns

### Angular Material Dialog Pattern

```typescript
// Standard dialog opening pattern with consistent configuration:
const dialogRef = this.dialog.open(UserCreateDialogComponent, {
  width: '600px', maxWidth: '95vw', disableClose: false, autoFocus: true
});
dialogRef.afterClosed().subscribe(result => {
  if (result) { /* handle form data */ }
});

// Dialog component pattern - always inject MatDialogRef<ComponentType>:
constructor(private dialogRef: MatDialogRef<UserCreateDialogComponent>) {}
```

### Form Validation Patterns

```typescript
// Standard form setup with reactive forms:
this.userForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(2)]],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]]
});

// Always use convenience getter for form controls:
get f() { return this.userForm.controls; }

// Template error handling pattern:
<mat-error *ngIf="f['name'].hasError('required')">Name is required</mat-error>
```

### MatTable Data Management

```typescript
// Standard table setup with sorting and pagination:
dataSource = new MatTableDataSource<EntityType>();
@ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild(MatSort) sort!: MatSort;

// Custom sorting for prefixed properties (m05Name, m05Email pattern):
this.dataSource.sortingDataAccessor = (item, property) => {
  switch (property) {
    case 'name': return item.m05Name?.toLowerCase() || '';
    // ... handle other prefixed properties
  }
};
```

### API Service Usage

```typescript
// Always use RepositoryService with finalize for loading states:
this.repositoryService
  .get<User[]>('users')
  .pipe(finalize(() => (this.loading = false)))
  .subscribe({
    next: response => {
      if (response.isSuccess) {
        this.users = response.data;
        this.toastr.success(`Loaded ${this.users.length} users`);
      }
    },
  });
```

## Development Workflow

### Commands & SSR Setup

- `npm start` / `ng serve`: Development server (port 4200)
- `npm run serve:ssr:PRM01`: SSR production server using Express
- `npm test`: Karma unit tests
- `npm run lint:fix`: ESLint with auto-fix
- `npm run format`: Prettier formatting for `src/**/*.{ts,html,scss,json}`

### UI Component Standards

- **Form Fields**: Always use `appearance="outline"` for mat-form-field
- **Icons**: Use Material icons with `matSuffix` positioning in form fields
- **Loading**: Global loading via LoadingInterceptor, component-level with `mat-spinner`
- **Notifications**: Use ToastrService (`this.toastr.success/error/info`) for user feedback

### File Structure Conventions

```
src/app/pages/[feature]/
├── [feature].component.ts/html/scss  # Main component
├── [feature].module.ts               # Feature module with routing
└── [feature-dialog]/                 # Dialog components in subdirectory
    ├── [feature-dialog].component.ts
    └── [feature-dialog].component.html
```

## Data Entity Conventions

### Backend Model Mapping

Entity properties use prefixed naming from backend (e.g., `UserEntity`):

```typescript
// User data structure from backend:
user.m05Name; // maps to display name
user.m05Email; // maps to email field
user.m05RoleId; // maps to UserRole enum
user.m05IsActive; // maps to status
```

### Component ViewChild Patterns

```typescript
// Standard Material table setup with delayed initialization:
@ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild(MatSort, { static: false }) sort!: MatSort;

ngAfterViewInit(): void {
  setTimeout(() => {  // Required timeout for proper initialization
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.sort.active = 'name';
      this.sort.direction = 'asc';
    }
  }, 500);
}
```

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
