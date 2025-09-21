import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ROLE_INFO, UserRole } from '../../../constants/roles';
import { UserEntity } from '../../../interface/user';
import { PermissionService } from '../../../services/permission.service';
import { RepositoryService } from '../../../services/repository.service';

interface UpdateUserRequest {
  m05Name: string;
  m05Email: string;
  m05Phone: string;
  m05Avatar: string;
  m05RoleId: UserRole;
  m05IsActive: boolean;
  m05UpdatedBy: string;
}

interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface UserEditDialogResult {
  action: 'updated';
  user: UserEntity;
}

@Component({
  selector: 'app-user-edit-dialog',
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.scss'],
})
export class UserEditDialogComponent implements OnInit {
  userForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  availableRoles = Object.values(UserRole).filter(role => typeof role === 'number') as UserRole[];
  loading = false;
  currentAvatarUrl: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    private repositoryService: RepositoryService,
    private permissionService: PermissionService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserEntity }
  ) {
    this.currentAvatarUrl = data.user.m05Avatar || '';
    
    // Create form with validators and pre-fill with existing data
    this.userForm = this.fb.group({
      name: [data.user.m05Name, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: [data.user.m05Email, [Validators.required, Validators.email]],
      phone: [data.user.m05Phone, [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      roleId: [data.user.m05RoleId, [Validators.required]],
      isActive: [data.user.m05IsActive],
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
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB', 'Error');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file', 'Error');
        return;
      }
      
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
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
        this.toastr.error('Failed to upload image, please try again', 'Upload Failed');
        return undefined;
      }
    } catch (error) {
      console.error('Image upload error:', error);
      this.toastr.error('Failed to upload image, please try again', 'Upload Failed');
      return undefined;
    }
  }

  async onUpdate(): Promise<void> {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    try {
      const userInfo = this.permissionService.getCurrentUserInfo();

      if (!userInfo.userId) {
        this.toastr.error('Unable to get current user information', 'Error');
        this.loading = false;
        return;
      }

      // If there's a new file, upload it first
      if (this.selectedFile) {
        await this.uploadImageAndUpdateUser(userInfo);
      } else {
        this.updateUserWithCurrentAvatar(userInfo);
      }
    } catch (error) {
      console.error('Update error:', error);
      this.toastr.error('An error occurred while updating', 'Error');
      this.loading = false;
    }
  }

  private async uploadImageAndUpdateUser(userInfo: any): Promise<void> {
    try {
      const imageUrl = await this.uploadImage();
      
      if (imageUrl === undefined) {
        this.loading = false;
        return;
      }

      this.updateUser(userInfo, imageUrl || this.currentAvatarUrl);
    } catch (error) {
      console.error('Image upload error:', error);
      this.toastr.error('Failed to upload image', 'Error');
      this.loading = false;
    }
  }

  private updateUserWithCurrentAvatar(userInfo: any): void {
    this.updateUser(userInfo, this.currentAvatarUrl);
  }

  private updateUser(userInfo: any, avatarUrl: string): void {
    const updateUserData: UpdateUserRequest = {
      m05Name: this.userForm.value.name,
      m05Email: this.userForm.value.email,
      m05Phone: this.userForm.value.phone,
      m05Avatar: avatarUrl,
      m05RoleId: this.userForm.value.roleId,
      m05IsActive: this.userForm.value.isActive,
      m05UpdatedBy: userInfo.userId,
    };

    this.repositoryService
      .put<UserEntity>('api/users', this.data.user.m05Id.toString(), updateUserData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess && response.data) {
            this.toastr.success(`User ${updateUserData.m05Name} updated successfully`, 'Success');
            this.dialogRef.close({
              action: 'updated',
              user: response.data,
            });
          } else {
            this.toastr.error(response.message || 'Failed to update user', 'Error');
          }
        },
        error: error => {
          console.error('User update error:', error);
          this.toastr.error('Failed to update user', 'Error');
        },
      });
  }
}
