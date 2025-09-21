import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { UserCreateDialogResult, UserEntity } from '../../interface/user';
import { UserService } from '../../services/user.service';
import { UserCreateDialogComponent } from './user-create-dialog/user-create-dialog.component';
import { UserDeleteDialogComponent, UserDeleteDialogResult } from './user-delete-dialog/user-delete-dialog.component';
import { UserEditDialogComponent, UserEditDialogResult } from './user-edit-dialog/user-edit-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  displayedColumns: string[] = [
    'avatar',
    'name',
    'email',
    'phone',
    'role',
    'status',
    'createdDate',
    'updatedDate',
    'actions',
  ];

  dataSource = new MatTableDataSource<UserEntity>();
  loading = false;
  users: UserEntity[] = [];

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    // Custom sorting function to handle m05_ prefixed properties
    this.dataSource.sortingDataAccessor = (item: UserEntity, property: string) => {
      switch (property) {
        case 'name':
          return item.m05Name?.toLowerCase() || '';
        case 'email':
          return item.m05Email?.toLowerCase() || '';
        case 'role':
          return item.m05RoleId || 0;
        case 'status':
          return item.m05IsActive ? 1 : 0;
        case 'createdDate':
          return item.m05CreatedAt ? new Date(item.m05CreatedAt).getTime() : 0;
        case 'updatedDate':
          return item.m05UpdatedAt ? new Date(item.m05UpdatedAt).getTime() : 0;
        default:
          return (item as any)[property];
      }
    };
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
        this.sort.active = 'name';
        this.sort.direction = 'asc';
        this.sort.sortChange.emit();
      }
    }, 500);
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;

    // // Set default sort
    // this.sort.active = 'name';
    // this.sort.direction = 'asc';
    // this.sort.sortChange.emit();
  }

  /**
   * Load users from API
   */
  loadUsers(): void {
    this.loading = true;
    this.userService
      .getUsers()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.users = response.data;
            this.dataSource.data = this.users;
            this.toastr.success(`Loaded ${this.users.length} users`, 'Success');
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: error => {
          console.error('Error loading users:', error);
          this.toastr.error('Failed to load users', 'Error');
        },
      });
  }

  /**
   * Apply filter to table
   */
  applyFilter(event: Event): void {
    console.log(event);
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Get role name by role ID
   */
  getRoleName(roleId: number): string {
    return this.userService.getRoleName(roleId);
  }

  /**
   * Get role badge color
   */
  getRoleBadgeColor(roleId: number): string {
    return this.userService.getRoleBadgeColor(roleId);
  }

  /**
   * Get avatar URL or placeholder
   */
  getAvatarUrl(avatar: string): string {
    if (avatar && avatar !== 'noname' && avatar !== 'no_avata') {
      return avatar;
    }
    return '/assets/images/default-avatar.svg';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Edit user
   */
  editUser(user: UserEntity): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        user: user,
      },
    });

    dialogRef.afterClosed().subscribe((result: UserEditDialogResult | undefined) => {
      if (result && result.action === 'updated') {
        console.log('User updated successfully:', result.user);

        // Update the user in current data
        const currentData = this.dataSource.data;
        const index = currentData.findIndex(u => u.m05Id === result.user.m05Id);
        if (index !== -1) {
          currentData[index] = result.user;
          this.dataSource.data = [...currentData];
          this.users = [...currentData];
        }

        this.toastr.success(`User ${result.user.m05Name} updated successfully`, 'User Updated');
      }
    });
  }

  /**
   * Delete user
   */
  deleteUser(user: UserEntity): void {
    const dialogRef = this.dialog.open(UserDeleteDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        user: user,
      },
    });

    dialogRef.afterClosed().subscribe((result: UserDeleteDialogResult | undefined) => {
      if (result && result.action === 'deleted') {
        console.log('User deleted successfully:', result.user);
        
        // Remove from local data
        const currentData = this.dataSource.data;
        const filteredData = currentData.filter(u => u.m05Id !== result.user.m05Id);
        this.dataSource.data = filteredData;
        this.users = filteredData;

        // Note: API should return updated user with isActive: false instead of removing
        // For now, we're removing from local data to match expected behavior
      }
    });
  }

  /**
   * Add new user
   */
  addUser(): void {
    const dialogRef = this.dialog.open(UserCreateDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result: UserCreateDialogResult | undefined) => {
      if (result && result.action === 'created') {
        console.log('User created successfully:', result.user);

        // Add new user to the beginning of the current data
        const currentData = this.dataSource.data;
        this.dataSource.data = [result.user, ...currentData];

        // Update users array as well
        this.users = [result.user, ...this.users];

        // Optional: Scroll to top to show the new user
        if (this.paginator) {
          this.paginator.firstPage();
        }

        this.toastr.success(`User ${result.user.m05Name} added to the list`, 'User Added');
      }
    });
  }
}
