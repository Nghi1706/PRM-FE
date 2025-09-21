import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { TableEntity } from '../../../interface/table';
import { TableService } from '../../../services/table.service';

export interface TableDeleteDialogResult {
  action: 'deleted';
  table: TableEntity;
}

@Component({
  selector: 'app-table-delete-dialog',
  templateUrl: './table-delete-dialog.component.html',
  styleUrls: ['./table-delete-dialog.component.scss'],
})
export class TableDeleteDialogComponent implements OnInit {
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<TableDeleteDialogComponent>,
    private tableService: TableService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { table: TableEntity }
  ) {}

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.loading = true;

    this.tableService
      .deleteTable(this.data.table.m08Id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.toastr.success(
              `Table ${this.data.table.m08Name} has been deactivated successfully`,
              'Table Deactivated'
            );
            this.dialogRef.close({
              action: 'deleted',
              table: this.data.table,
            });
          } else {
            this.toastr.error(response.message || 'Failed to deactivate table', 'Error');
          }
        },
        error: error => {
          console.error('Table deactivation error:', error);
          this.toastr.error('Failed to deactivate table', 'Error');
        },
      });
  }
}
