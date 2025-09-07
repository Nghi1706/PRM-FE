import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { UserEntity } from '../../interface/user';
import { UserService } from '../../services/user.service';

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
    private toastr: ToastrService
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
    });
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
      return `/assets/avatars/${avatar}`;
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
    console.log('Edit user:', user);
    this.toastr.info(`Edit user: ${user.m05Name}`, 'Action');
    // TODO: Implement edit dialog
  }

  /**
   * Delete user
   */
  deleteUser(user: UserEntity): void {
    console.log('Delete user:', user);
    if (confirm(`Are you sure you want to delete user: ${user.m05Name}?`)) {
      this.userService.deleteUser(user.m05Id).subscribe({
        next: response => {
          if (response.isSuccess) {
            this.toastr.success(`User ${user.m05Name} deleted successfully`, 'Success');
            this.loadUsers(); // Reload the list
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: error => {
          console.error('Error deleting user:', error);
          this.toastr.error('Failed to delete user', 'Error');
        },
      });
    }
  }

  /**
   * Add new user
   */
  addUser(): void {
    console.log('Add new user');
    this.toastr.info('Add new user', 'Action');
    // TODO: Implement add dialog
  }
}
