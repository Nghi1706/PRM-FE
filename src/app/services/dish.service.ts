import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interface/api-response';
import { DishEntity } from '../interface/dish';
import { RepositoryService } from './repository.service';

@Injectable({
  providedIn: 'root',
})
export class DishService {
  constructor(private repositoryService: RepositoryService) {}

  /**
   * Get dishes by category ID
   */
  getDishesByCategory(categoryId: number): Observable<ApiResponse<DishEntity[]>> {
    return this.repositoryService.get<DishEntity[]>(`api/dishes/category/${categoryId}`);
  }

  /**
   * Get dish by ID
   */
  getDishById(id: number): Observable<ApiResponse<DishEntity>> {
    return this.repositoryService.getById<DishEntity>('api/dishes', id.toString());
  }

  /**
   * Create new dish
   */
  createDish(dish: Partial<DishEntity>): Observable<ApiResponse<DishEntity>> {
    return this.repositoryService.post<DishEntity>('api/dishes', dish);
  }

  /**
   * Update dish
   */
  updateDish(id: number, dish: Partial<DishEntity>): Observable<ApiResponse<DishEntity>> {
    return this.repositoryService.put<DishEntity>('api/dishes', id.toString(), dish);
  }

  /**
   * Delete dish
   */
  deleteDish(id: number): Observable<ApiResponse<boolean>> {
    return this.repositoryService.delete<boolean>('api/dishes', id.toString());
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }
}
