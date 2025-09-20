import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interface/api-response';
import { TableEntity } from '../interface/table';
import { PermissionService } from './permission.service';
import { RepositoryService } from './repository.service';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  constructor(
    private repositoryService: RepositoryService,
    private permissionService: PermissionService
  ) {}

  /**
   * Get tables for current restaurant
   */
  getTables(): Observable<ApiResponse<TableEntity[]>> {
    const userInfo = this.permissionService.getCurrentUserInfo();
    if (!userInfo.restaurantId) {
      throw new Error('Restaurant ID not found');
    }
    return this.repositoryService.get<TableEntity[]>(
      `api/tables/restaurant/${userInfo.restaurantId}`
    );
  }

  /**
   * Get table by ID
   */
  getTableById(id: number): Observable<ApiResponse<TableEntity>> {
    return this.repositoryService.get<TableEntity>(`api/tables/${id}`);
  }

  /**
   * Create new table
   */
  createTable(table: Partial<TableEntity>): Observable<ApiResponse<TableEntity>> {
    return this.repositoryService.post<TableEntity>('api/tables', table);
  }

  /**
   * Update table
   */
  updateTable(id: number, table: Partial<TableEntity>): Observable<ApiResponse<TableEntity>> {
    return this.repositoryService.put<TableEntity>('api/tables', id.toString(), table);
  }

  /**
   * Delete table
   */
  deleteTable(id: number): Observable<ApiResponse<boolean>> {
    return this.repositoryService.delete<boolean>('api/tables', id.toString());
  }
}
