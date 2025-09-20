import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ROLE_INFO, UserRole } from '../../../constants/roles';
import { UserEntity } from '../../../interface/user';
import { PermissionService } from '../../../services/permission.service';
import { RepositoryService } from '../../../services/repository.service';
import { UserService } from '../../../services/user.service';

interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

interface CreateUserRequest {
  m05Name: string;
  m05Password: string;
  m05Email: string;
  m05Phone: string;
  m05Avatar: string;
  m05RoleId: number;
  m05RestaurantId: string;
  m05IsActive: boolean;
  m05CreatedBy: string;
}

@Component({
  selector: 'app-user-create-dialog',
  templateUrl: './user-create-dialog.component.html',
  styleUrls: ['./user-create-dialog.component.scss'],
})
export class UserCreateDialogComponent implements OnInit {
  userForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  availableRoles = Object.values(UserRole).filter(role => typeof role === 'number') as UserRole[];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserCreateDialogComponent>,
    private repositoryService: RepositoryService,
    private userService: UserService,
    private permissionService: PermissionService,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.Employee, [Validators.required]],
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.userForm.controls;
  }

  getRoleName(roleId: UserRole): string {
    return ROLE_INFO[roleId]?.name || 'Unknown';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file', 'Invalid File');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB', 'File Too Large');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private async uploadImage(): Promise<string | undefined> {
    if (!this.selectedFile) return undefined;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('category', 'user');

    try {
      const response = await this.repositoryService
        .post<FileUploadResponse>('api/files/upload', formData)
        .toPromise();

      if (response?.isSuccess && response.data) {
        return response.data.fileUrl;
      } else {
        this.toastr.error('Tải ảnh lên không thành công, vui lòng thử lại sau', 'Upload Failed');
        return undefined;
      }
    } catch (error) {
      console.error('Image upload error:', error);
      this.toastr.error('Tải ảnh lên không thành công, vui lòng thử lại sau', 'Upload Failed');
      return undefined;
    }
  }

  async onCreate(): Promise<void> {
    if (this.userForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    try {
      let avatarUrl: string | undefined;

      // Step 1: Upload image if selected
      if (this.selectedFile) {
        avatarUrl = await this.uploadImage();
        if (avatarUrl === undefined) {
          // Upload failed, stop the process
          this.loading = false;
          return;
        }
      }

      // Step 2: Create user
      const userInfo = this.permissionService.getCurrentUserInfo();

      if (!userInfo.userId || !userInfo.restaurantId) {
        this.toastr.error('Unable to get current user information', 'Error');
        this.loading = false;
        return;
      }

      const createUserData: CreateUserRequest = {
        m05Name: this.userForm.value.name,
        m05Password: this.userForm.value.password,
        m05Email: this.userForm.value.email,
        m05Phone: this.userForm.value.phone,
        m05Avatar: avatarUrl || '', // Use empty string instead of 'default-avatar.svg'
        m05RoleId: this.userForm.value.role,
        m05RestaurantId: userInfo.restaurantId,
        m05IsActive: true,
        m05CreatedBy: userInfo.userId,
      };

      // Use subscribe instead of async/await to avoid promise issues
      this.repositoryService
        .post<UserEntity>('api/users', createUserData)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: response => {
            if (response.isSuccess && response.data) {
              this.toastr.success(`User ${createUserData.m05Name} created successfully`, 'Success');
              // Close dialog and pass the created user data
              this.dialogRef.close({
                action: 'created',
                user: response.data,
              });
            } else {
              this.toastr.error(response.message || 'Failed to create user', 'Error');
            }
          },
          error: error => {
            console.error('User creation error:', error);
            this.toastr.error('Failed to create user', 'Error');
          },
        });
    } catch (error) {
      console.error('Error in user creation process:', error);
      this.toastr.error('An unexpected error occurred', 'Error');
      this.loading = false;
    }
  }
}
