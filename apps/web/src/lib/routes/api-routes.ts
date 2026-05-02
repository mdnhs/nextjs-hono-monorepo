export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
    register: '/auth/register',
  },
  admin: {
    dashboard: '/admin/dashboard',
  },
} as const;
