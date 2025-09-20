export interface DishEntity {
  m07Id: number;
  m07Name: string;
  m07Description: string;
  m07Price: number;
  m07Image: string;
  m07IsActive: boolean;
  m07CategoryId: number;
  m07RestaurantId: string;
  m07CreatedAt: string;
  m07CreatedBy: string | null;
  m07UpdatedAt: string | null;
  m07UpdatedBy: string | null;
}

export interface DishCreateDialogResult {
  action: 'created';
  dish: DishEntity;
}

export interface CreateDishRequest {
  m07Name: string;
  m07Description: string;
  m07Price: number;
  m07Image: string;
  m07CategoryId: number;
  m07RestaurantId: string;
  m07IsActive: boolean;
  m07CreatedBy: string;
}
