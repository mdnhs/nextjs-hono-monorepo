import { PlatformStores } from '@/features/platform-admin/components';

export default async function AdminStoresPage(props: { searchParams: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams;
  return <PlatformStores status={searchParams.status} />;
}
