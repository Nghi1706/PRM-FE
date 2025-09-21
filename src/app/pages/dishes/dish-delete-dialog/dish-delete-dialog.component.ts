import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { DishEntity } from '../../../interface/dish';
import { DishService } from '../../../services/dish.service';

export interface DishDeleteDialogResult {
  action: 'deleted';
  dish: DishEntity;
}

@Component({
  selector: 'app-dish-delete-dialog',
  templateUrl: './dish-delete-dialog.component.html',
  styleUrls: ['./dish-delete-dialog.component.scss'],
})
export class DishDeleteDialogComponent implements OnInit {
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<DishDeleteDialogComponent>,
    private dishService: DishService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { dish: DishEntity }
  ) {}

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.loading = true;

    this.dishService
      .deleteDish(this.data.dish.m07Id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.toastr.success(
              `Dish ${this.data.dish.m07Name} has been deactivated successfully`,
              'Dish Deactivated'
            );
            this.dialogRef.close({
              action: 'deleted',
              dish: this.data.dish,
            });
          } else {
            this.toastr.error(response.message || 'Failed to deactivate dish', 'Error');
          }
        },
        error: error => {
          console.error('Dish deactivation error:', error);
          this.toastr.error('Failed to deactivate dish', 'Error');
        },
      });
  }
}
