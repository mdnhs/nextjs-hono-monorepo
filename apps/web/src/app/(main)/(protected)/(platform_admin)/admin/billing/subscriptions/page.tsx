import { PlatformSubscriptions } from '@/features/platform-admin/components';

export default async function AdminSubscriptionsPage(props: { searchParams: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams;
  return <PlatformSubscriptions status={searchParams.status} />;
}
