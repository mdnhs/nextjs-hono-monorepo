import { PlatformOrders } from '@/features/platform-admin/components';

export default async function AdminOrdersPage(props: { searchParams: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams;
  return <PlatformOrders status={searchParams.status} />;
}
