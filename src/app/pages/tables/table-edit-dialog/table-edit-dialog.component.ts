import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { TableEntity } from '../../../interface/table';
import { PermissionService } from '../../../services/permission.service';
import { RepositoryService } from '../../../services/repository.service';

interface UpdateTableRequest {
  m08Name: string;
  m08TotalSeats: number;
  m08IsActive: boolean;
  m08UpdatedBy: string;
}

export interface TableEditDialogResult {
  action: 'updated';
  table: TableEntity;
}

@Component({
  selector: 'app-table-edit-dialog',
  templateUrl: './table-edit-dialog.component.html',
  styleUrls: ['./table-edit-dialog.component.scss'],
})
export class TableEditDialogComponent implements OnInit {
  tableForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TableEditDialogComponent>,
    private repositoryService: RepositoryService,
    private permissionService: PermissionService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { table: TableEntity }
  ) {
    // Create form with validators and pre-fill with existing data
    this.tableForm = this.fb.group({
      name: [data.table.m08Name, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      totalSeats: [data.table.m08TotalSeats, [Validators.required, Validators.min(1), Validators.max(20)]],
      isActive: [data.table.m08IsActive],
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.tableForm.controls;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpdate(): void {
    if (this.tableForm.invalid) {
      Object.keys(this.tableForm.controls).forEach(key => {
        this.tableForm.get(key)?.markAsTouched();
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

      const updateTableData: UpdateTableRequest = {
        m08Name: this.tableForm.value.name,
        m08TotalSeats: this.tableForm.value.totalSeats,
        m08IsActive: this.tableForm.value.isActive,
        m08UpdatedBy: userInfo.userId,
      };

      this.repositoryService
        .put<TableEntity>('api/tables', this.data.table.m08Id.toString(), updateTableData)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: response => {
            if (response.isSuccess && response.data) {
              this.toastr.success(`Table ${updateTableData.m08Name} updated successfully`, 'Success');
              this.dialogRef.close({
                action: 'updated',
                table: response.data,
              });
            } else {
              this.toastr.error(response.message || 'Failed to update table', 'Error');
            }
          },
          error: error => {
            console.error('Table update error:', error);
            this.toastr.error('Failed to update table', 'Error');
          },
        });
    } catch (error) {
      console.error('Update error:', error);
      this.toastr.error('An error occurred while updating', 'Error');
      this.loading = false;
    }
  }
}
