import { UserRole } from '../constants/roles';

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  roleId?: UserRole; // Add role ID from JWT
  restaurantId?: string; // Add restaurant ID from JWT
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
