// src/lib/permission/permissions.ts
export const PERMISSIONS = {
  // USER MANAGEMENT
  USER_MANAGEMENT_USER_VIEW_LIST: 'user_management.user.view_list',
  USER_MANAGEMENT_USER_CREATE: 'user_management.user.create',
  USER_MANAGEMENT_USER_EDIT: 'user_management.user.edit',
  USER_MANAGEMENT_USER_DISABLE: 'user_management.user.disable',
  USER_MANAGEMENT_USER_ENABLE: 'user_management.user.enable',
  USER_MANAGEMENT_ROLE_VIEW_LIST: 'user_management.role.view_list',
  USER_MANAGEMENT_ROLE_CREATE: 'user_management.role.create',
  USER_MANAGEMENT_ROLE_EDIT: 'user_management.role.edit',
  USER_MANAGEMENT_PERMISSION_VIEW: 'user_management.permission.view',
} as const;
