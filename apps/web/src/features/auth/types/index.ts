export type UserRole = 'PLATFORM_ADMIN' | 'SELLER' | 'STORE_ADMIN' | 'BUYER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

// Login endpoint returns this shape (non-standard — not wrapped in data)
export interface LoginApiResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}
