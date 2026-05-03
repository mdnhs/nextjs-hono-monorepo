// Standard service layer response
export interface ServiceResponse<T> {
  error: boolean;
  message: string;
  data: T | null;
  pagination?: PaginationType;
  status?: number;
}

// Mapped camelCase version used in app code
export interface PaginationType {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'BUYER' | 'STORE_ADMIN' | 'SELLER' | 'PLATFORM_ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  customDomain: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceCents: number;
  currency: string;
  images: string[];
  sku: string;
  isActive: boolean;
  storeId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  store?: Partial<Store>;
  category?: { id: string; name: string; slug: string };
  rating?: { average: number; count: number };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  total: number;
  totalCents: number;
  currency: string;
  userId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
  store?: Partial<Store>;
  user?: Partial<User>;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  priceCents: number;
  productId: string;
  variantId: string | null;
  product?: Partial<Product>;
}

export interface ShippingAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

