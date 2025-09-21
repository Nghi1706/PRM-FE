import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { TableCreateDialogResult, TableEntity } from '../../interface/table';
import { PermissionService } from '../../services/permission.service';
import { TableService } from '../../services/table.service';
import { TableCreateDialogComponent } from './table-create-dialog/table-create-dialog.component';
import { TableDeleteDialogComponent, TableDeleteDialogResult } from './table-delete-dialog/table-delete-dialog.component';
import { TableEditDialogComponent, TableEditDialogResult } from './table-edit-dialog/table-edit-dialog.component';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
})
export class TablesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  displayedColumns: string[] = [
    'name',
    'totalSeats',
    'status',
    'statusName',
    'createdDate',
    'updatedDate',
    'actions',
  ];

  dataSource = new MatTableDataSource<TableEntity>();
  loading = false;
  tables: TableEntity[] = [];
  pageSizeOptions: number[] = [5, 10, 25, 50];

  constructor(
    private tableService: TableService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadTables();

    // Custom sorting function to handle m08_ prefixed properties
    this.dataSource.sortingDataAccessor = (item: TableEntity, property: string) => {
      switch (property) {
        case 'name':
          return item.m08Name?.toLowerCase() || '';
        case 'totalSeats':
          return item.m08TotalSeats || 0;
        case 'status':
          return item.m08IsActive ? 1 : 0;
        case 'statusName':
          return item.m02Name?.toLowerCase() || '';
        case 'createdDate':
          return item.m08CreatedAt ? new Date(item.m08CreatedAt).getTime() : 0;
        case 'updatedDate':
          return item.m08UpdatedAt ? new Date(item.m08UpdatedAt).getTime() : 0;
        default:
          return (item as any)[property];
      }
    };
  }

  ngAfterViewInit(): void {
    // Increase timeout to ensure all ViewChild elements are initialized
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }

      if (this.sort) {
        this.dataSource.sort = this.sort;
        this.sort.active = 'name';
        this.sort.direction = 'asc';
      }
    }, 500);
  }

  /**
   * Load tables from API
   */
  loadTables(): void {
    this.loading = true;
    this.tableService
      .getTables()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.tables = response.data || [];
            this.dataSource.data = this.tables;
            console.log('Loaded tables:', this.tables.length);

            if (this.tables.length === 0) {
              this.toastr.info('No tables found', 'Info');
            } else {
              this.toastr.success(`Loaded ${this.tables.length} tables`, 'Success');
            }
          } else {
            this.toastr.error(response.message, 'Error');
            this.tables = [];
            this.dataSource.data = [];
          }
        },
        error: error => {
          console.error('Error loading tables:', error);
          this.toastr.error('Failed to load tables', 'Error');
          this.tables = [];
          this.dataSource.data = [];
        },
      });
  }

  /**
   * Apply filter to table
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Check if user can manage tables (Admin role and above)
   */
  canManageTables(): boolean {
    return this.permissionService.canManageRestaurant();
  }

  /**
   * Edit table
   */
  editTable(table: TableEntity): void {
    const dialogRef = this.dialog.open(TableEditDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        table: table,
      },
    });

    dialogRef.afterClosed().subscribe((result: TableEditDialogResult | undefined) => {
      if (result && result.action === 'updated') {
        console.log('Table updated successfully:', result.table);

        // Update the table in current data
        const currentData = this.dataSource.data;
        const index = currentData.findIndex(t => t.m08Id === result.table.m08Id);
        if (index !== -1) {
          currentData[index] = result.table;
          this.dataSource.data = [...currentData];
          this.tables = [...currentData];
        }

        this.toastr.success(`Table ${result.table.m08Name} updated successfully`, 'Table Updated');
      }
    });
  }

  /**
   * Delete table
   */
  deleteTable(table: TableEntity): void {
    const dialogRef = this.dialog.open(TableDeleteDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        table: table,
      },
    });

    dialogRef.afterClosed().subscribe((result: TableDeleteDialogResult | undefined) => {
      if (result && result.action === 'deleted') {
        console.log('Table deleted successfully:', result.table);
        
        // Remove from local data
        const currentData = this.dataSource.data;
        const filteredData = currentData.filter(t => t.m08Id !== result.table.m08Id);
        this.dataSource.data = filteredData;
        this.tables = filteredData;

        // Note: API should return updated table with isActive: false instead of removing
        // For now, we're removing from local data to match expected behavior
      }
    });
  }

  /**
   * Add new table
   */
  addTable(): void {
    const dialogRef = this.dialog.open(TableCreateDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result: TableCreateDialogResult | undefined) => {
      if (result && result.action === 'created') {
        console.log('Table created successfully:', result.table);

        // Add new table to the beginning of the current data
        const currentData = this.dataSource.data;
        this.dataSource.data = [result.table, ...currentData];

        // Update tables array as well
        this.tables = [result.table, ...this.tables];

        // Optional: Scroll to top to show the new table
        if (this.paginator) {
          this.paginator.firstPage();
        }

        this.toastr.success(`Table ${result.table.m08Name} added to the list`, 'Table Added');
      }
    });
  }
}
