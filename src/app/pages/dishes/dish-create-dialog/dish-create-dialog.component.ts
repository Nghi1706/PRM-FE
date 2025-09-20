import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CategoryEntity } from '../../../interface/category';
import { CreateDishRequest, DishEntity } from '../../../interface/dish';
import { PermissionService } from '../../../services/permission.service';
import { RepositoryService } from '../../../services/repository.service';

interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

@Component({
  selector: 'app-dish-create-dialog',
  templateUrl: './dish-create-dialog.component.html',
  styleUrls: ['./dish-create-dialog.component.scss'],
})
export class DishCreateDialogComponent implements OnInit {
  dishForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  categories: CategoryEntity[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DishCreateDialogComponent>,
    private repositoryService: RepositoryService,
    private permissionService: PermissionService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { categories: CategoryEntity[]; selectedCategoryId: number | null }
  ) {
    this.categories = data.categories;
    
    // Create form with validators
    this.dishForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: [data.selectedCategoryId, [Validators.required]],
      isActive: [true],
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
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select an image file', 'Invalid File');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size must be less than 5MB', 'File Too Large');
        return;
      }

      this.selectedFile = file;

      // Create preview URL
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

  onCreate(): void {
    if (this.dishForm.invalid) {
      Object.keys(this.dishForm.controls).forEach(key => {
        this.dishForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    try {
      const userInfo = this.permissionService.getCurrentUserInfo();

      if (!userInfo.userId || !userInfo.restaurantId) {
        this.toastr.error('Unable to get current user information', 'Error');
        this.loading = false;
        return;
      }

      // If there's a file, upload it first
      if (this.selectedFile) {
        this.uploadImageAndCreateDish(userInfo);
      } else {
        this.createDishWithoutImage(userInfo);
      }
    } catch (error) {
      console.error('Error in dish creation process:', error);
      this.toastr.error('An unexpected error occurred', 'Error');
      this.loading = false;
    }
  }

  private async uploadImageAndCreateDish(userInfo: any): Promise<void> {
    try {
      const imageUrl = await this.uploadImage();
      
      if (imageUrl === undefined) {
        this.loading = false;
        return;
      }

      this.createDish(userInfo, imageUrl || '');
    } catch (error) {
      console.error('Image upload error:', error);
      this.toastr.error('Failed to upload image', 'Error');
      this.loading = false;
    }
  }

  private createDishWithoutImage(userInfo: any): void {
    this.createDish(userInfo, '');
  }

  private createDish(userInfo: any, imageUrl: string): void {
    const createDishData: CreateDishRequest = {
      m07Name: this.dishForm.value.name,
      m07Description: this.dishForm.value.description || '',
      m07Price: this.dishForm.value.price,
      m07Image: imageUrl,
      m07CategoryId: this.dishForm.value.categoryId,
      m07RestaurantId: userInfo.restaurantId,
      m07IsActive: this.dishForm.value.isActive,
      m07CreatedBy: userInfo.userId,
    };

    this.repositoryService
      .post<DishEntity>('api/dishes', createDishData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess && response.data) {
            this.toastr.success(`Dish ${createDishData.m07Name} created successfully`, 'Success');
            this.dialogRef.close({
              action: 'created',
              dish: response.data,
            });
          } else {
            this.toastr.error(response.message || 'Failed to create dish', 'Error');
          }
        },
        error: error => {
          console.error('Dish creation error:', error);
          this.toastr.error('Failed to create dish', 'Error');
        },
      });
  }
}
