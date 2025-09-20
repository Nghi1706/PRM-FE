export interface TableEntity {
  m08Id: number;
  m08Name: string;
  m08TotalSeats: number;
  m08IsActive: boolean;
  m08RestaurantId: string;
  m08StatusId: number;
  m08CreatedAt: string;
  m08CreatedBy: string | null;
  m08UpdatedAt: string | null;
  m08UpdatedBy: string | null;
  m02Name: string;
}

export interface TableCreateDialogResult {
  action: 'created';
  table: TableEntity;
}

export interface CreateTableRequest {
  m08Name: string;
  m08TotalSeats: number;
  m08IsActive: boolean;
  m08RestaurantId: string;
  m08StatusId: number;
  m08CreatedBy: string;
}
