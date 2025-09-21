import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CategoryEntity } from '../../../interface/category';
import { PermissionService } from '../../../services/permission.service';
import { RepositoryService } from '../../../services/repository.service';

interface UpdateCategoryRequest {
  m06Name: string;
  m06Description: string;
  m06IsActive: boolean;
  m06UpdatedBy: string;
}

export interface CategoryEditDialogResult {
  action: 'updated';
  category: CategoryEntity;
}

@Component({
  selector: 'app-category-edit-dialog',
  templateUrl: './category-edit-dialog.component.html',
  styleUrls: ['./category-edit-dialog.component.scss'],
})
export class CategoryEditDialogComponent implements OnInit {
  categoryForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryEditDialogComponent>,
    private repositoryService: RepositoryService,
    private permissionService: PermissionService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { category: CategoryEntity }
  ) {
    // Pre-fill form with existing category data
    this.categoryForm = this.fb.group({
      name: [data.category.m06Name, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: [data.category.m06Description, [Validators.maxLength(500)]],
      isActive: [data.category.m06IsActive],
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.categoryForm.controls;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpdate(): void {
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

      if (!userInfo.userId) {
        this.toastr.error('Unable to get current user information', 'Error');
        this.loading = false;
        return;
      }

      const updateCategoryData: UpdateCategoryRequest = {
        m06Name: this.categoryForm.value.name,
        m06Description: this.categoryForm.value.description || '',
        m06IsActive: this.categoryForm.value.isActive,
        m06UpdatedBy: userInfo.userId,
      };

      this.repositoryService
        .put<CategoryEntity>('api/categories', this.data.category.m06Id.toString(), updateCategoryData)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: response => {
            if (response.isSuccess) {
              this.toastr.success(
                `Category ${updateCategoryData.m06Name} updated successfully`,
                'Success'
              );

              // Create updated category object for return
              const updatedCategory: CategoryEntity = {
                ...this.data.category,
                m06Name: updateCategoryData.m06Name,
                m06Description: updateCategoryData.m06Description,
                m06IsActive: updateCategoryData.m06IsActive,
                m06UpdatedBy: updateCategoryData.m06UpdatedBy,
                m06UpdatedAt: new Date().toISOString(),
              };

              // Close dialog and pass the updated category data
              this.dialogRef.close({
                action: 'updated',
                category: updatedCategory,
              });
            } else {
              this.toastr.error(response.message || 'Failed to update category', 'Error');
            }
          },
          error: error => {
            console.error('Category update error:', error);
            this.toastr.error('Failed to update category', 'Error');
          },
        });
    } catch (error) {
      console.error('Error in category update process:', error);
      this.toastr.error('An unexpected error occurred', 'Error');
      this.loading = false;
    }
  }
}
