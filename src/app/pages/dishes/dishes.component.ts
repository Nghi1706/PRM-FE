import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CategoryEntity } from '../../interface/category';
import { DishEntity, DishCreateDialogResult } from '../../interface/dish';
import { CategoryService } from '../../services/category.service';
import { DishService } from '../../services/dish.service';
import { DishCreateDialogComponent } from './dish-create-dialog/dish-create-dialog.component';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.scss'],
})
export class DishesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  displayedColumns: string[] = [
    'image',
    'name',
    'description',
    'price',
    'category',
    'status',
    'createdDate',
    'updatedDate',
    'actions',
  ];

  dataSource = new MatTableDataSource<DishEntity>();
  loading = false;
  loadingCategories = false;
  dishes: DishEntity[] = [];
  categories: CategoryEntity[] = [];
  selectedCategoryId: number | null = null;

  constructor(
    private dishService: DishService,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCategories();

    // Custom sorting function to handle m07_ prefixed properties
    this.dataSource.sortingDataAccessor = (item: DishEntity, property: string) => {
      switch (property) {
        case 'name':
          return item.m07Name?.toLowerCase() || '';
        case 'description':
          return item.m07Description?.toLowerCase() || '';
        case 'price':
          return item.m07Price || 0;
        case 'status':
          return item.m07IsActive ? 1 : 0;
        case 'createdDate':
          return item.m07CreatedAt ? new Date(item.m07CreatedAt).getTime() : 0;
        case 'updatedDate':
          return item.m07UpdatedAt ? new Date(item.m07UpdatedAt).getTime() : 0;
        default:
          return (item as any)[property];
      }
    };
  }

  ngAfterViewInit(): void {
    // Increase timeout to ensure all ViewChild elements are initialized
    setTimeout(() => {
      this.initializePaginatorAndSort();
    }, 200);
  }

  /**
   * Initialize paginator and sort for the table
   */
  private initializePaginatorAndSort(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      console.log('Paginator initialized:', this.paginator);
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.sort.active = 'name';
      this.sort.direction = 'asc';
      console.log('Sort initialized:', this.sort);
    }
  }

  /**
   * Load categories from API
   */
  loadCategories(): void {
    this.loadingCategories = true;
    this.categoryService
      .getCategories()
      .pipe(finalize(() => (this.loadingCategories = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.categories = response.data || [];
            if (this.categories.length > 0) {
              // Select first category by default
              this.selectedCategoryId = this.categories[0].m06Id;
              // Load dishes for the first category
              setTimeout(() => {
                this.loadDishes();
              }, 50);
            } else {
              this.toastr.info('No categories found', 'Info');
            }
          } else {
            this.toastr.error(response.message, 'Error');
            this.categories = [];
          }
        },
        error: error => {
          console.error('Error loading categories:', error);
          this.toastr.error('Failed to load categories', 'Error');
          this.categories = [];
        },
      });
  }

  /**
   * Load dishes by selected category
   */
  loadDishes(): void {
    if (!this.selectedCategoryId) {
      this.dishes = [];
      this.dataSource.data = [];
      return;
    }

    this.loading = true;
    this.dishService
      .getDishesByCategory(this.selectedCategoryId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.dishes = response.data || [];
            this.dataSource.data = this.dishes;

            console.log('Loaded dishes:', this.dishes.length);
            console.log('DataSource data:', this.dataSource.data.length);

            // Re-initialize paginator after data is loaded with a small delay
            setTimeout(() => {
              this.initializePaginatorAndSort();

              // Reset to first page if paginator exists
              if (this.paginator && this.paginator.pageIndex > 0) {
                this.paginator.firstPage();
              }
            }, 50);

            if (this.dishes.length === 0) {
              this.toastr.info('No dishes found for this category', 'Info');
            } else {
              this.toastr.success(`Loaded ${this.dishes.length} dishes`, 'Success');
            }
          } else {
            this.toastr.error(response.message, 'Error');
            this.dishes = [];
            this.dataSource.data = [];
          }
        },
        error: error => {
          console.error('Error loading dishes:', error);
          this.toastr.error('Failed to load dishes', 'Error');
          this.dishes = [];
          this.dataSource.data = [];
        },
      });
  }

  /**
   * Handle category selection change
   */
  onCategoryChange(): void {
    console.log('Category changed to:', this.selectedCategoryId);
    if (this.selectedCategoryId) {
      this.loadDishes();
    } else {
      this.dishes = [];
      this.dataSource.data = [];
    }
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
   * Get category name by ID
   */
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.m06Id === categoryId);
    return category?.m06Name || 'Unknown';
  }

  /**
   * Get dish image URL or placeholder
   */
  getDishImageUrl(image: string): string {
    if (image && image !== 'noimage' && image !== 'no_image') {
      return image;
    }
    return '/assets/images/default-dish.svg';
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
   * Format price for display
   */
  formatPrice(price: number): string {
    return this.dishService.formatPrice(price);
  }

  /**
   * Add new dish
   */
  addDish(): void {
    const dialogRef = this.dialog.open(DishCreateDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        categories: this.categories,
        selectedCategoryId: this.selectedCategoryId,
      },
    });

    dialogRef.afterClosed().subscribe((result: DishCreateDialogResult | undefined) => {
      if (result && result.action === 'created') {
        console.log('Dish created successfully:', result.dish);

        // If the new dish belongs to current selected category, add it to the list
        if (result.dish.m07CategoryId === this.selectedCategoryId) {
          const currentData = this.dataSource.data;
          this.dataSource.data = [result.dish, ...currentData];
          this.dishes = [result.dish, ...this.dishes];

          if (this.paginator) {
            this.paginator.firstPage();
          }
        }
      }
    });
  }

  /**
   * Edit dish
   */
  editDish(dish: DishEntity): void {
    console.log('Edit dish:', dish);
    this.toastr.info(`Edit dish: ${dish.m07Name}`, 'Action');
    // TODO: Implement edit dialog
  }

  /**
   * Delete dish
   */
  deleteDish(dish: DishEntity): void {
    console.log('Delete dish:', dish);
    if (confirm(`Are you sure you want to delete dish: ${dish.m07Name}?`)) {
      this.dishService.deleteDish(dish.m07Id).subscribe({
        next: response => {
          if (response.isSuccess) {
            this.toastr.success(`Dish ${dish.m07Name} deleted successfully`, 'Success');
            this.loadDishes(); // Reload the list
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: error => {
          console.error('Error deleting dish:', error);
          this.toastr.error('Failed to delete dish', 'Error');
        },
      });
    }
  }
}
