import { PERMISSIONS } from './permissions';

type RoutePermissionConfig = Record<string, PermissionValue[]>;

// Types
type PermissionKey = keyof typeof PERMISSIONS;
type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

export const ROUTE_PERMISSIONS: RoutePermissionConfig = {
  // USER MANAGEMENT
  '/users': ['user_management.user.view_list'],
  '/users/create': ['user_management.user.create'],
  '/users/:id/edit': ['user_management.user.edit'],
  '/roles': ['user_management.role.view_list'],
  '/roles/create': ['user_management.role.create'],
  '/roles/:id/edit': ['user_management.role.edit'],
};
