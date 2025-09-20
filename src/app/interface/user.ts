export interface UserEntity {
  m05Id: string;
  m05Name: string;
  m05Email: string;
  m05Phone: string;
  m05Avatar: string;
  m05RoleId: number;
  m05RestaurantId: string;
  m05IsActive: boolean;
  m05CreatedAt: string;
  m05CreatedBy: string | null;
  m05UpdatedAt: string | null;
  m05UpdatedBy: string | null;
}

export interface UserListResponse {
  data: UserEntity[];
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

export interface UserCreateDialogResult {
  action: 'created';
  user: UserEntity;
}
