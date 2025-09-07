import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interface/api-response';
import { UserEntity } from '../interface/user';
import { RepositoryService } from './repository.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private repositoryService: RepositoryService) {}

  /**
   * Get all users
   */
  getUsers(): Observable<ApiResponse<UserEntity[]>> {
    return this.repositoryService.get<UserEntity[]>('api/users');
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<ApiResponse<UserEntity>> {
    return this.repositoryService.getById<UserEntity>('api/users', id);
  }

  /**
   * Create new user
   */
  createUser(user: Partial<UserEntity>): Observable<ApiResponse<UserEntity>> {
    return this.repositoryService.post<UserEntity>('api/users', user);
  }

  /**
   * Update user
   */
  updateUser(id: string, user: Partial<UserEntity>): Observable<ApiResponse<UserEntity>> {
    return this.repositoryService.put<UserEntity>('api/users', id, user);
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<ApiResponse<boolean>> {
    return this.repositoryService.delete<boolean>('api/users', id);
  }

  /**
   * Get role name by role ID
   */
  getRoleName(roleId: number): string {
    const roleNames: { [key: number]: string } = {
      1: 'Developer',
      2: 'Admin',
      3: 'Manager',
      4: 'Employee',
      5: 'Chef',
      6: 'Guest',
    };
    return roleNames[roleId] || 'Unknown';
  }

  /**
   * Get role badge color
   */
  getRoleBadgeColor(roleId: number): string {
    const colors: { [key: number]: string } = {
      1: 'primary', // Developer
      2: 'accent', // Admin
      3: 'warn', // Manager
      4: '', // Employee - default
      5: 'primary', // Chef
      6: '', // Guest - default
    };
    return colors[roleId] || '';
  }
}
