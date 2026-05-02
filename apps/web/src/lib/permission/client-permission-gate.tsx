'use client';
import { type ReactNode } from 'react';
import { usePermissions } from '@/lib/permission/usePermissions';
import { type PermissionValue } from '@/lib/permission/utils';

interface ClientPermissionGateProps {
  permissions: PermissionValue[];
  requireAll?: boolean;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  children: ReactNode;
}

export function ClientPermissionGate({
  permissions,
  requireAll = false,
  fallback = null,
  loadingFallback = null,
  children,
}: ClientPermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
