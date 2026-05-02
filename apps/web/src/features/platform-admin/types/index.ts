export interface PlatformDashboardApiResponse {
  stores: {
    total: number;
    pending: number;
    approved: number;
  };
  users: {
    total: number;
    sellers: number;
  };
  products: number;
  orders: number;
  revenue: number;
}

export interface PlatformDashboard {
  stores: {
    total: number;
    pending: number;
    approved: number;
  };
  users: {
    total: number;
    sellers: number;
  };
  products: number;
  orders: number;
  revenue: number;
}
