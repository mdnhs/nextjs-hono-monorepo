'use client';
import { useMemo } from 'react';
import { createPermissionChecker, type PermissionKey, type PermissionValue } from '@/lib/permission/utils';

export function usePermissions() {
  // TODO: implement actual session retrieval (e.g. from next-auth/react)
  type MinimalSession = { user: { compressedPermissions: string } } | null;
  const session = null as MinimalSession;
  const status = 'unauthenticated' as string;

  const checker = useMemo(() => {
    if (status !== 'authenticated' || !session?.user?.compressedPermissions) {
      return null;
    }
    return createPermissionChecker(session.user.compressedPermissions);
  }, [session?.user?.compressedPermissions, status]);

  const hasPermission = (permission: PermissionValue): boolean => {
    return checker?.hasPermissionByValue(permission) ?? false;
  };

  const hasPermissionByKey = (permissionKey: PermissionKey): boolean => {
    return checker?.hasPermissionByKey(permissionKey) ?? false;
  };

  const hasAnyPermission = (permissions: PermissionValue[]): boolean => {
    return checker?.hasAnyPermissionByValues(permissions) ?? false;
  };

  const hasAllPermissions = (permissions: PermissionValue[]): boolean => {
    return checker?.hasAllPermissionsByValues(permissions) ?? false;
  };

  const getAllPermissions = (): PermissionValue[] => {
    return checker?.getAllPermissions() ?? [];
  };

  const getPermissionCount = (): number => {
    return checker?.getPermissionCount() ?? 0;
  };

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  return {
    hasPermission,
    hasPermissionByKey,
    hasAnyPermission,
    hasAllPermissions,
    getAllPermissions,
    getPermissionCount,
    isLoading,
    isAuthenticated,
  };
}
