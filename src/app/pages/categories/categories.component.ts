import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CategoryCreateDialogResult, CategoryEntity } from '../../interface/category';
import { CategoryService } from '../../services/category.service';
import { CategoryCreateDialogComponent } from './category-create-dialog/category-create-dialog.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  displayedColumns: string[] = [
    'name',
    'description',
    'status',
    'createdDate',
    'updatedDate',
    'actions',
  ];

  dataSource = new MatTableDataSource<CategoryEntity>();
  loading = false;
  categories: CategoryEntity[] = [];

  constructor(
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    // Custom sorting function to handle m06_ prefixed properties
    this.dataSource.sortingDataAccessor = (item: CategoryEntity, property: string) => {
      switch (property) {
        case 'name':
          return item.m06Name?.toLowerCase() || '';
        case 'description':
          return item.m06Description?.toLowerCase() || '';
        case 'status':
          return item.m06IsActive ? 1 : 0;
        case 'createdDate':
          return item.m06CreatedAt ? new Date(item.m06CreatedAt).getTime() : 0;
        case 'updatedDate':
          return item.m06UpdatedAt ? new Date(item.m06UpdatedAt).getTime() : 0;
        default:
          return (item as any)[property];
      }
    };
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.paginator) this.dataSource.paginator = this.paginator;
      if (this.sort) {
        this.dataSource.sort = this.sort;
        this.sort.active = 'name';
        this.sort.direction = 'asc';
      }
    }, 500);
  }

  /**
   * Load categories from API
   */
  loadCategories(): void {
    this.loading = true;
    this.categoryService
      .getCategories()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.categories = response.data;
            this.dataSource.data = this.categories;
            this.toastr.success(`Loaded ${this.categories.length} categories`, 'Success');
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: error => {
          console.error('Error loading categories:', error);
          this.toastr.error('Failed to load categories', 'Error');
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
   * Edit category
   */
  editCategory(category: CategoryEntity): void {
    console.log('Edit category:', category);
    this.toastr.info(`Edit category: ${category.m06Name}`, 'Action');
    // TODO: Implement edit dialog
  }

  /**
   * Delete category
   */
  deleteCategory(category: CategoryEntity): void {
    console.log('Delete category:', category);
    if (confirm(`Are you sure you want to delete category: ${category.m06Name}?`)) {
      this.categoryService.deleteCategory(category.m06Id).subscribe({
        next: response => {
          if (response.isSuccess) {
            this.toastr.success(`Category ${category.m06Name} deleted successfully`, 'Success');
            this.loadCategories(); // Reload the list
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: error => {
          console.error('Error deleting category:', error);
          this.toastr.error('Failed to delete category', 'Error');
        },
      });
    }
  }

  /**
   * Add new category
   */
  addCategory(): void {
    const dialogRef = this.dialog.open(CategoryCreateDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result: CategoryCreateDialogResult | undefined) => {
      if (result && result.action === 'created') {
        console.log('Category created successfully:', result.category);

        // Add new category to the beginning of the current data
        const currentData = this.dataSource.data;
        this.dataSource.data = [result.category, ...currentData];

        // Update categories array as well
        this.categories = [result.category, ...this.categories];

        // Optional: Scroll to top to show the new category
        if (this.paginator) {
          this.paginator.firstPage();
        }

        this.toastr.success(
          `Category ${result.category.m06Name} added to the list`,
          'Category Added'
        );
      }
    });
  }
}
