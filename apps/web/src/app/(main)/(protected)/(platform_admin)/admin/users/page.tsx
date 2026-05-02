import { PlatformUsers } from '@/features/platform-admin/components';

export default async function AdminUsersPage(props: { searchParams: Promise<{ role?: string }> }) {
  const searchParams = await props.searchParams;
  return <PlatformUsers role={searchParams.role} />;
}
