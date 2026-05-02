// lib/permission/server-utils.ts
import { ROUTE_PERMISSIONS } from '@/lib/permission/route-permissions';
import {
  type CompressedPermissions,
  createPermissionChecker,
  decompressPermissions,
  type PermissionChecker,
  type PermissionValue,
} from './utils';

// TODO: adjust this to match your actual auth utility location
type MinimalSession = { user: { compressedPermissions: string } } | null;
// import { auth } from '../../../auth';
const auth = async () => null as MinimalSession;

// Server-side permission helpers
export const getCompressedPermissionsFromSession = async (): Promise<CompressedPermissions | null> => {
  try {
    const session = await auth();
    return session?.user?.compressedPermissions || null;
  } catch {
    return null;
  }
};

export const getServerPermissionChecker = async (): Promise<PermissionChecker | null> => {
  const compressedPermissions = await getCompressedPermissionsFromSession();
  return compressedPermissions ? createPermissionChecker(compressedPermissions) : null;
};

export const getDecompressedPermissions = async (): Promise<PermissionValue[]> => {
  const compressedPermissions = await getCompressedPermissionsFromSession();
  return compressedPermissions ? decompressPermissions(compressedPermissions) : [];
};

export function getRequiredPermissions(pathname: string): PermissionValue[] {
  // Exact match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Pattern matching for dynamic routes
  for (const [routePattern, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    if (matchesPattern(pathname, routePattern)) {
      return permissions;
    }
  }

  return [];
}

function matchesPattern(pathname: string, pattern: string): boolean {
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+') // :id -> [^/]+
    .replace(/\*/g, '.*'); // * -> .*

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

// Permission validation helpers
export const validateRouteAccess = (compressedPermissions: CompressedPermissions, pathname: string): boolean => {
  const trimmedPathname = pathname.split('?')[0] || pathname;

  const requiredPermissions = getRequiredPermissions(trimmedPathname);
  if (requiredPermissions.length === 0) return true; // No permissions required

  const checker = createPermissionChecker(compressedPermissions);
  return checker.hasAnyPermissionByValues(requiredPermissions);
};
