export interface CategoryEntity {
  m06Id: number;
  m06Name: string;
  m06Description: string;
  m06IsActive: boolean;
  m06RestaurantId: string;
  m06CreatedAt: string;
  m06CreatedBy: string | null;
  m06UpdatedAt: string | null;
  m06UpdatedBy: string | null;
  m06CreatedByName?: string; // Future support
  m06UpdatedByName?: string; // Future support
}

export interface CategoryCreateDialogResult {
  action: 'created';
  category: CategoryEntity;
}

export interface CategoryEditDialogResult {
  action: 'updated';
  category: CategoryEntity;
}

export interface CategoryDeleteDialogResult {
  action: 'deleted';
  category: CategoryEntity;
}

export interface CreateCategoryRequest {
  m06Name: string;
  m06Description: string;
  m06RestaurantId: string;
  m06IsActive: boolean;
  m06CreatedBy: string;
}
