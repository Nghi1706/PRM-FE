import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interface/api-response';
import { CategoryEntity } from '../interface/category';
import { PermissionService } from './permission.service';
import { RepositoryService } from './repository.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(
    private repositoryService: RepositoryService,
    private permissionService: PermissionService
  ) {}

  /**
   * Get categories for current restaurant
   */
  getCategories(): Observable<ApiResponse<CategoryEntity[]>> {
    const userInfo = this.permissionService.getCurrentUserInfo();
    if (!userInfo.restaurantId) {
      throw new Error('Restaurant ID not found');
    }
    return this.repositoryService.get<CategoryEntity[]>(
      `api/categories/restaurant/${userInfo.restaurantId}`
    );
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: number): Observable<ApiResponse<CategoryEntity>> {
    return this.repositoryService.get<CategoryEntity>(`api/categories/${id}`);
  }

  /**
   * Create new category
   */
  createCategory(category: Partial<CategoryEntity>): Observable<ApiResponse<CategoryEntity>> {
    return this.repositoryService.post<CategoryEntity>('api/categories', category);
  }

  /**
   * Update category
   */
  updateCategory(
    id: number,
    category: Partial<CategoryEntity>
  ): Observable<ApiResponse<CategoryEntity>> {
    return this.repositoryService.put<CategoryEntity>('api/categories', id.toString(), category);
  }

  /**
   * Delete category
   */
  deleteCategory(id: number): Observable<ApiResponse<boolean>> {
    return this.repositoryService.delete<boolean>('api/categories', id.toString());
  }
}
