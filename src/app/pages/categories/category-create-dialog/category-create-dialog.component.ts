import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CategoryEntity, CreateCategoryRequest } from '../../../interface/category';
import { PermissionService } from '../../../services/permission.service';
import { RepositoryService } from '../../../services/repository.service';

@Component({
  selector: 'app-category-create-dialog',
  templateUrl: './category-create-dialog.component.html',
  styleUrls: ['./category-create-dialog.component.scss'],
})
export class CategoryCreateDialogComponent implements OnInit {
  categoryForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryCreateDialogComponent>,
    private repositoryService: RepositoryService,
    private permissionService: PermissionService,
    private toastr: ToastrService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true],
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.categoryForm.controls;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.categoryForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
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

      const createCategoryData: CreateCategoryRequest = {
        m06Name: this.categoryForm.value.name,
        m06Description: this.categoryForm.value.description || '',
        m06RestaurantId: userInfo.restaurantId,
        m06IsActive: this.categoryForm.value.isActive,
        m06CreatedBy: userInfo.userId,
      };

      // Use subscribe instead of async/await to avoid promise issues
      this.repositoryService
        .post<CategoryEntity>('api/categories', createCategoryData)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: response => {
            if (response.isSuccess && response.data) {
              this.toastr.success(
                `Category ${createCategoryData.m06Name} created successfully`,
                'Success'
              );
              // Close dialog and pass the created category data
              this.dialogRef.close({
                action: 'created',
                category: response.data,
              });
            } else {
              this.toastr.error(response.message || 'Failed to create category', 'Error');
            }
          },
          error: error => {
            console.error('Category creation error:', error);
            this.toastr.error('Failed to create category', 'Error');
          },
        });
    } catch (error) {
      console.error('Error in category creation process:', error);
      this.toastr.error('An unexpected error occurred', 'Error');
      this.loading = false;
    }
  }
}
