import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CreateTableRequest, TableEntity } from '../../../interface/table';
import { PermissionService } from '../../../services/permission.service';
import { RepositoryService } from '../../../services/repository.service';

@Component({
  selector: 'app-table-create-dialog',
  templateUrl: './table-create-dialog.component.html',
  styleUrls: ['./table-create-dialog.component.scss'],
})
export class TableCreateDialogComponent implements OnInit {
  tableForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TableCreateDialogComponent>,
    private repositoryService: RepositoryService,
    private permissionService: PermissionService,
    private toastr: ToastrService
  ) {
    // Create form with validators
    this.tableForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      totalSeats: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      isActive: [true],
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.tableForm.controls;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.tableForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.tableForm.controls).forEach(key => {
        this.tableForm.get(key)?.markAsTouched();
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

      const createTableData: CreateTableRequest = {
        m08Name: this.tableForm.value.name,
        m08TotalSeats: this.tableForm.value.totalSeats,
        m08IsActive: this.tableForm.value.isActive,
        m08RestaurantId: userInfo.restaurantId,
        m08StatusId: 1, // Default status
        m08CreatedBy: userInfo.userId,
      };

      this.repositoryService
        .post<TableEntity>('api/tables', createTableData)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: response => {
            if (response.isSuccess && response.data) {
              this.toastr.success(
                `Table ${createTableData.m08Name} created successfully`,
                'Success'
              );
              this.dialogRef.close({
                action: 'created',
                table: response.data,
              });
            } else {
              this.toastr.error(response.message || 'Failed to create table', 'Error');
            }
          },
          error: error => {
            console.error('Table creation error:', error);
            this.toastr.error('Failed to create table', 'Error');
          },
        });
    } catch (error) {
      console.error('Error creating table:', error);
      this.toastr.error('Failed to create table', 'Error');
      this.loading = false;
    }
  }
}
