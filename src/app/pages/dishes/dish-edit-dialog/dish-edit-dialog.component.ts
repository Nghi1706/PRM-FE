import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CategoryEntity } from '../../../interface/category';
import { DishEntity } from '../../../interface/dish';
import { PermissionService } from '../../../services/permission.service';
import { RepositoryService } from '../../../services/repository.service';

interface UpdateDishRequest {
  m07Name: string;
  m07Description: string;
  m07Price: number;
  m07Image: string;
  m07CategoryId: string;
  m07IsActive: boolean;
  m07UpdatedBy: string;
}

interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface DishEditDialogResult {
  action: 'updated';
  dish: DishEntity;
}

@Component({
  selector: 'app-dish-edit-dialog',
  templateUrl: './dish-edit-dialog.component.html',
  styleUrls: ['./dish-edit-dialog.component.scss'],
})
export class DishEditDialogComponent implements OnInit {
  dishForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  categories: CategoryEntity[] = [];
  loading = false;
  currentImageUrl: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DishEditDialogComponent>,
    private repositoryService: RepositoryService,
    private permissionService: PermissionService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { dish: DishEntity; categories: CategoryEntity[] }
  ) {
    this.categories = data.categories;
    this.currentImageUrl = data.dish.m07Image || '';
    
    // Create form with validators and pre-fill with existing data
    this.dishForm = this.fb.group({
      name: [data.dish.m07Name, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: [data.dish.m07Description || '', [Validators.maxLength(500)]],
      price: [data.dish.m07Price, [Validators.required, Validators.min(0)]],
      categoryId: [data.dish.m07CategoryId, [Validators.required]],
      isActive: [data.dish.m07IsActive],
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.dishForm.controls;
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
    formData.append('category', 'dish');

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
    if (this.dishForm.invalid) {
      Object.keys(this.dishForm.controls).forEach(key => {
        this.dishForm.get(key)?.markAsTouched();
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
        await this.uploadImageAndUpdateDish(userInfo);
      } else {
        this.updateDishWithCurrentImage(userInfo);
      }
    } catch (error) {
      console.error('Update error:', error);
      this.toastr.error('An error occurred while updating', 'Error');
      this.loading = false;
    }
  }

  private async uploadImageAndUpdateDish(userInfo: any): Promise<void> {
    try {
      const imageUrl = await this.uploadImage();
      
      if (imageUrl === undefined) {
        this.loading = false;
        return;
      }

      this.updateDish(userInfo, imageUrl || this.currentImageUrl);
    } catch (error) {
      console.error('Image upload error:', error);
      this.toastr.error('Failed to upload image', 'Error');
      this.loading = false;
    }
  }

  private updateDishWithCurrentImage(userInfo: any): void {
    this.updateDish(userInfo, this.currentImageUrl);
  }

  private updateDish(userInfo: any, imageUrl: string): void {
    const updateDishData: UpdateDishRequest = {
      m07Name: this.dishForm.value.name,
      m07Description: this.dishForm.value.description || '',
      m07Price: this.dishForm.value.price,
      m07Image: imageUrl,
      m07CategoryId: this.dishForm.value.categoryId,
      m07IsActive: this.dishForm.value.isActive,
      m07UpdatedBy: userInfo.userId,
    };

    this.repositoryService
      .put<DishEntity>('api/dishes', this.data.dish.m07Id.toString(), updateDishData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess && response.data) {
            this.toastr.success(`Dish ${updateDishData.m07Name} updated successfully`, 'Success');
            this.dialogRef.close({
              action: 'updated',
              dish: response.data,
            });
          } else {
            this.toastr.error(response.message || 'Failed to update dish', 'Error');
          }
        },
        error: error => {
          console.error('Dish update error:', error);
          this.toastr.error('Failed to update dish', 'Error');
        },
      });
  }
}
