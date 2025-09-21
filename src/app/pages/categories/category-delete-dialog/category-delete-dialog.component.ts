import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CategoryEntity } from '../../../interface/category';
import { CategoryService } from '../../../services/category.service';

export interface CategoryDeleteDialogResult {
  action: 'deleted';
  category: CategoryEntity;
}

@Component({
  selector: 'app-category-delete-dialog',
  templateUrl: './category-delete-dialog.component.html',
  styleUrls: ['./category-delete-dialog.component.scss'],
})
export class CategoryDeleteDialogComponent implements OnInit {
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<CategoryDeleteDialogComponent>,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { category: CategoryEntity }
  ) {}

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.loading = true;

    this.categoryService
      .deleteCategory(this.data.category.m06Id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.toastr.success(
              `Category ${this.data.category.m06Name} has been deactivated successfully`,
              'Category Deactivated'
            );
            this.dialogRef.close({
              action: 'deleted',
              category: this.data.category,
            });
          } else {
            this.toastr.error(response.message || 'Failed to deactivate category', 'Error');
          }
        },
        error: error => {
          console.error('Category deactivation error:', error);
          this.toastr.error('Failed to deactivate category', 'Error');
        },
      });
  }
}
